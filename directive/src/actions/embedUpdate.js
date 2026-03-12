import { ChannelType } from 'discord.js';
import * as api from '../api.js';
import { getEmbedBuilder } from '../embedRoutes.js';
import {
  buildServerInfoComponents,
  buildChannelInfoComponents,
  buildCategoryInfoComponents,
  buildMemberInfoComponents,
} from '../utils/components.js';
import { mainImageUrl } from '../config.js';

const CHANNEL_SCRIPTS = new Set([
  'ChannelPrivate', 'ChannelPublic', 'ChannelSync', 'ChannelSFW', 'ChannelNSFW', 'ChannelClone',
]);
const CATEGORY_SCRIPTS = new Set([
  'CategoryPrivate', 'CategoryPublic', 'CategoryClone',
]);
const MEMBER_SCRIPTS = new Set([
  'MemberWarn', 'MemberMute', 'MemberLock', 'MemberReset', 'MemberRename', 'MemberSetlevel', 'MemberMove', 'MemberKick',
]);
const SERVER_SCRIPTS = new Set([
  'StatusTimeout', 'StatusRole', 'StatusUnrole', 'SetVoiceCreator', 'SetServerStats',
]);

export const SCRIPTS_WITH_PARENT_EMBED = new Set([
  ...CHANNEL_SCRIPTS,
  ...CATEGORY_SCRIPTS,
  ...MEMBER_SCRIPTS,
  ...SERVER_SCRIPTS,
]);

/**
 * Get targetId from slash command options (to find parent embed in same channel).
 */
export function getTargetIdFromSlash(interaction, scriptName) {
  if (!interaction.isChatInputCommand() || !interaction.options) return null;
  if (SERVER_SCRIPTS.has(scriptName)) return 'server';
  const optTarget = interaction.options.get('target');
  const optChannel = interaction.options.get('channel');
  if (optTarget?.user) return optTarget.user.id;
  if (optTarget?.member?.id) return optTarget.member.id;
  if (optTarget?.channel?.id) return optTarget.channel.id;
  if (optChannel?.channel?.id) return optChannel.channel.id;
  return null;
}

/**
 * Find parent embed message in channel (button contains targetId) and update embed + components.
 * Only updates if same channel (channel passed in).
 */
export async function findAndUpdateParentMessage(channel, botUserId, targetId, payload) {
  if (!channel || !botUserId || targetId == null || !payload) return;
  const suffix = `_${targetId}`;
  const messages = await channel.messages.fetch({ limit: 50 }).catch(() => new Map());
  for (const msg of messages.values()) {
    if (msg.author?.id !== botUserId) continue;
    const rows = msg.components ?? [];
    const hasMatch = rows.some((row) =>
      row.components?.some((c) => c.customId && typeof c.customId === 'string' && c.customId.endsWith(suffix))
    );
    if (hasMatch) {
      await msg.edit(payload).catch(() => {});
      return true;
    }
  }
  return false;
}

/**
 * Trả về payload { embeds, components } để cập nhật message sau action (embed mới + nút toggle đúng trạng thái).
 * scriptResult: kết quả từ script (có thể chứa updatedProfile để tránh embed dùng profile cũ).
 */
export async function getEmbedUpdatePayload(scriptName, interaction, actionContext, scriptResult = null) {
  const guild = interaction.guild;
  if (!guild) return null;

  const targetId = actionContext?.targetId ?? scriptResult?.targetId ?? null;

  if (SERVER_SCRIPTS.has(scriptName)) {
    const guildFetched = await guild.fetch().catch(() => guild);
    const buildEmbed = getEmbedBuilder('ServerInfo');
    const embed = buildEmbed ? await buildEmbed(guildFetched, { imageURL: mainImageUrl }) : null;
    if (!embed) return null;
    const components = buildServerInfoComponents();
    return {
      content: '',
      embeds: [embed],
      components,
    };
  }

  if (CHANNEL_SCRIPTS.has(scriptName) && targetId) {
    const channel = await guild.channels.fetch(targetId).catch(() => null);
    if (!channel || channel.type === ChannelType.GuildCategory) return null;
    const buildEmbed = getEmbedBuilder('ChannelInfo');
    const embed = buildEmbed ? await buildEmbed(channel, guild, { imageURL: mainImageUrl }) : null;
    if (!embed) return null;
    const components = buildChannelInfoComponents(channel.id, channel, guild);
    return {
      content: '',
      embeds: [embed],
      components,
    };
  }

  if (CATEGORY_SCRIPTS.has(scriptName) && targetId) {
    const category = await guild.channels.fetch(targetId).catch(() => null);
    if (!category || category.type !== ChannelType.GuildCategory) return null;
    const buildEmbed = getEmbedBuilder('CategoryInfo');
    const embed = buildEmbed ? await buildEmbed(category, guild, { imageURL: mainImageUrl }) : null;
    if (!embed) return null;
    const components = buildCategoryInfoComponents(category.id, category, guild);
    return {
      content: '',
      embeds: [embed],
      components,
    };
  }

  if (MEMBER_SCRIPTS.has(scriptName) && targetId) {
    const member = await guild.members.fetch(targetId).catch(() => null);
    if (!member) return null;
    const profile =
      scriptResult?.updatedProfile && String(scriptResult.targetId || scriptResult.updatedProfile?.user_id) === String(member.id)
        ? scriptResult.updatedProfile
        : await api.getMember(guild.id, member.id).catch(() => null);
    const buildEmbed = getEmbedBuilder('MemberInfo');
    const embed = buildEmbed ? await buildEmbed(member, profile, { imageURL: mainImageUrl }) : null;
    if (!embed) return null;
    const components = buildMemberInfoComponents(member.id, profile);
    return {
      content: '',
      embeds: [embed],
      components,
    };
  }

  return null;
}

/** Payload (embeds + components) for Member Info message; used when updating from expiresCheck. */
export async function buildMemberInfoPayload(member, profile) {
  const buildEmbed = getEmbedBuilder('MemberInfo');
  const embed = buildEmbed ? await buildEmbed(member, profile) : null;
  if (!embed) return null;
  const components = buildMemberInfoComponents(member.id, profile);
  return {
    content: '',
    embeds: [embed],
    components,
  };
}

const TEXT_CHANNEL_TYPES = [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildForum];
const MAX_CHANNELS_TO_SCAN = 30;

/**
 * Tìm message Member Info có nút trỏ tới userId trong guild và cập nhật bằng payload.
 * Dùng khi expires tự đặt Good để embed hiển thị đúng.
 */
export async function findAndUpdateMemberInfoInGuild(client, guildId, userId, payload) {
  const guild = client.guilds.cache.get(guildId);
  if (!guild || !client.user?.id || !payload) return;
  const channels = guild.channels.cache.filter((c) => TEXT_CHANNEL_TYPES.includes(c.type));
  let scanned = 0;
  for (const channel of channels.values()) {
    if (scanned >= MAX_CHANNELS_TO_SCAN) break;
    const edited = await findAndUpdateParentMessage(channel, client.user.id, userId, payload);
    if (edited) return;
    scanned += 1;
  }
}
