import { ChannelType } from 'discord.js';
import * as api from '../api.js';
import { getEmbedBuilder } from '../embedRoutes.js';
import {
  buildServerInfoComponents,
  buildChannelInfoComponents,
  buildCategoryInfoComponents,
  buildMemberInfoComponents,
} from '../utils/components.js';
import { mainImageURL } from '../config.js';

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
 * Lấy targetId từ slash command options (để tìm embed cha cùng kênh).
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
 * Tìm message embed cha trong kênh (có nút chứa targetId) và cập nhật embed + components.
 * Chỉ cập nhật nếu cùng kênh (channel đã truyền vào).
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
    const embed = buildEmbed ? await buildEmbed(guildFetched, { imageURL: mainImageURL }) : null;
    if (!embed) return null;
    const { row, row2 } = buildServerInfoComponents();
    const components = [row, row2].filter(Boolean);
    return {
      content: '',
      embeds: [embed],
      components,
    };
  }

  if (CHANNEL_SCRIPTS.has(scriptName) && targetId) {
    const channel = await guild.channels.fetch(targetId).catch(() => null);
    if (!channel || channel.type === ChannelType.GuildCategory) return null;
    const buildEmbed = getEmbedBuilder('ChanelInfo');
    const embed = buildEmbed ? await buildEmbed(channel, guild, { imageURL: mainImageURL }) : null;
    if (!embed) return null;
    const { row } = buildChannelInfoComponents(channel.id, channel, guild);
    return {
      content: '',
      embeds: [embed],
      components: row ? [row] : [],
    };
  }

  if (CATEGORY_SCRIPTS.has(scriptName) && targetId) {
    const category = await guild.channels.fetch(targetId).catch(() => null);
    if (!category || category.type !== ChannelType.GuildCategory) return null;
    const buildEmbed = getEmbedBuilder('CategoryInfo');
    const embed = buildEmbed ? await buildEmbed(category, guild, { imageURL: mainImageURL }) : null;
    if (!embed) return null;
    const { row } = buildCategoryInfoComponents(category.id, category, guild);
    return {
      content: '',
      embeds: [embed],
      components: row ? [row] : [],
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
    const embed = buildEmbed ? await buildEmbed(member, profile, { imageURL: mainImageURL }) : null;
    if (!embed) return null;
    const { row, row2 } = buildMemberInfoComponents(member.id, profile);
    const components = [row, row2].filter(Boolean);
    return {
      content: '',
      embeds: [embed],
      components: components.length ? components : [],
    };
  }

  return null;
}

/** Payload (embeds + components) cho message Member Info, dùng khi cập nhật từ expiresCheck. */
export async function buildMemberInfoPayload(member, profile) {
  const buildEmbed = getEmbedBuilder('MemberInfo');
  const embed = buildEmbed ? await buildEmbed(member, profile) : null;
  if (!embed) return null;
  const { row, row2 } = buildMemberInfoComponents(member.id, profile);
  const components = [row, row2].filter(Boolean);
  return {
    content: '',
    embeds: [embed],
    components: components.length ? components : [],
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
