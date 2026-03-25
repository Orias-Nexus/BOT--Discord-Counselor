import { ChannelType, MessageFlags, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } from '../discord.js';
import * as api from '../api.js';
import { getStatLabelByIndex } from '../config/channelTypes.js';

const SERVER_STATS_SELECT_PREFIX = 'serverstats_';
const STAT_OPTIONS = [
  { label: 'Members', value: '1' },
  { label: 'Bots', value: '2' },
  { label: 'Roles', value: '3' },
  { label: 'Categories', value: '4' },
  { label: 'Channels', value: '5' },
  { label: 'Boosts', value: '6' },
];

export function isServerStatsSelectId(customId) {
  return typeof customId === 'string' && customId.startsWith(SERVER_STATS_SELECT_PREFIX);
}

export function buildServerStatsSelectMenu(guildId) {
  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`${SERVER_STATS_SELECT_PREFIX}${guildId}`)
      .setPlaceholder('Select stats to display (order = channel order)')
      .setMinValues(1)
      .setMaxValues(6)
      .addOptions(STAT_OPTIONS)
  );
  return row;
}

export async function run(interaction, client, _actionContext) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }

  if (!interaction.deferred) await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  await interaction.editReply({
    content: api.formatEphemeralContent('Select stats to display (selection order = channel order in category):'),
    components: [buildServerStatsSelectMenu(guild.id)],
  }).catch(() => {});
}

function formatStatChannelName(index, value = 0) {
  const label = getStatLabelByIndex(index);
  return `${label}: ${value}`;
}

/**
 * Gọi sau khi user chọn xong từ select menu. values = ['3','1','2'] (thứ tự chọn).
 */
export async function doSetServerStats(interaction, channelsIdx) {
  const guild = interaction.guild;
  if (!guild) return;

  const digits = channelsIdx === 0 ? [] : String(channelsIdx).replace(/\D/g, '').split('').map((d) => parseInt(d, 10)).filter((n) => n >= 1 && n <= 6);
  const count = digits.length;
  if (count === 0) {
    await interaction.editReply({ content: api.formatEphemeralContent('Select at least one stat.'), components: [] }).catch(() => {});
    return;
  }

  try {
    await api.ensureServer(guild.id);
  } catch (err) {
    console.warn('[SetServerStats] ensureServer:', err?.message);
    await interaction.editReply({ content: api.formatEphemeralContent('Could not reach backend.'), components: [] }).catch(() => {});
    return;
  }

  let list = [];
  try {
    list = await api.getChannels(guild.id, 'Stats');
  } catch (err) {
    console.warn('[SetServerStats] getChannels:', err?.message);
    await interaction.editReply({ content: api.formatEphemeralContent('Could not fetch channels.'), components: [] }).catch(() => {});
    return;
  }

  const existing = (list ?? []).find((r) => r.category_type === 'Stats');

  if (!existing) {
    const category = await guild.channels.create({
      name: 'server stats',
      type: ChannelType.GuildCategory,
      reason: 'SetServerStats: Stats category',
      position: 0,
      permissionOverwrites: [
        {
          id: guild.id,
          allow: [PermissionFlagsBits.ViewChannel],
          deny: [
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.Connect,
            PermissionFlagsBits.Speak,
            PermissionFlagsBits.SendMessagesInThreads,
            PermissionFlagsBits.CreatePublicThreads,
            PermissionFlagsBits.CreatePrivateThreads,
          ],
        },
      ],
    }).catch((err) => {
      console.warn('[SetServerStats] create category:', err?.message);
      return null;
    });
    if (!category) {
      await interaction.editReply({ content: api.formatEphemeralContent('Failed to create category.'), components: [] }).catch(() => {});
      return;
    }
    for (let i = 0; i < count; i++) {
      const statIndex = digits[i];
      const name = formatStatChannelName(statIndex);
      await guild.channels.create({
        name,
        type: ChannelType.GuildVoice,
        parent: category.id,
        reason: 'SetServerStats: stat channel',
        permissionOverwrites: [
          {
            id: guild.id,
            allow: [PermissionFlagsBits.ViewChannel],
            deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
          },
        ],
      }).catch((err) => console.warn('[SetServerStats] create channel:', err?.message));
    }
    await category.setPosition(0).catch(() => {});
    await api.upsertChannel(guild.id, category.id, 'Stats', channelsIdx);
    await interaction.editReply({
      content: api.formatEphemeralContent(`Created **server stats** category with ${count} channel(s). Stats will update every minute.`),
      components: [],
    }).catch(() => {});
    return;
  }

  const categoryId = existing.category_id;
  const category = await guild.channels.fetch(categoryId).catch(() => null);
  if (!category || category.type !== ChannelType.GuildCategory) {
    await interaction.editReply({ content: api.formatEphemeralContent('Category not found.'), components: [] }).catch(() => {});
    return;
  }

  const children = guild.channels.cache.filter((c) => c.parentId === categoryId && (c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice));
  const sorted = [...children.values()].sort((a, b) => (a.rawPosition ?? a.position) - (b.rawPosition ?? b.position));
  const currentCount = sorted.length;

  const statsCategoryOverwrites = [
    {
      id: guild.id,
      type: 0,
      allow: [PermissionFlagsBits.ViewChannel],
      deny: [
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.Speak,
        PermissionFlagsBits.SendMessagesInThreads,
        PermissionFlagsBits.CreatePublicThreads,
        PermissionFlagsBits.CreatePrivateThreads,
      ],
    },
  ];
  const statsVoiceOverwrites = [
    { id: guild.id, type: 0, allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak] },
  ];

  if (currentCount < count) {
    for (let i = currentCount; i < count; i++) {
      const statIndex = digits[i];
      const name = formatStatChannelName(statIndex);
      await guild.channels.create({
        name,
        type: ChannelType.GuildVoice,
        parent: categoryId,
        reason: 'SetServerStats: thêm kênh stat',
        permissionOverwrites: statsVoiceOverwrites,
      }).catch((err) => console.warn('[SetServerStats] create channel:', err?.message));
    }
  } else if (currentCount > count) {
    const toDelete = sorted.slice(count);
    for (const ch of toDelete) {
      await ch.delete('SetServerStats: reduce stat channels').catch((err) => console.warn('[SetServerStats] delete:', err?.message));
    }
  }

  await category.permissionOverwrites.set(statsCategoryOverwrites).catch(() => {});
  const childrenAfter = guild.channels.cache.filter((c) => c.parentId === categoryId && (c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice));
  for (const ch of childrenAfter.values()) {
    await ch.permissionOverwrites.set(statsVoiceOverwrites).catch(() => {});
  }
  await category.setPosition(0).catch(() => {});

  await api.upsertChannel(guild.id, categoryId, 'Stats', channelsIdx);
  await interaction.editReply({
    content: api.formatEphemeralContent(`Updated server stats: ${count} channel(s). Names will update every minute.`),
    components: [],
  }).catch(() => {});
}
