import { ChannelType } from 'discord.js';
import * as api from '../api.js';
import { buildServerInfoEmbed, buildChannelInfoEmbed, buildCategoryInfoEmbed, buildMemberInfoEmbed } from '../utils/embedBuilders.js';
import {
  buildServerInfoComponents,
  buildChannelInfoComponents,
  buildCategoryInfoComponents,
  buildMemberInfoComponents,
} from '../utils/components.js';

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
  'StatusTimeout', 'StatusRole', 'StatusUnrole',
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
      return;
    }
  }
}

/**
 * Trả về payload { embeds, components } để cập nhật message sau action (embed mới + nút toggle đúng trạng thái).
 * Trả về null nếu script không thuộc nhóm cập nhật embed hoặc thiếu context.
 */
export async function getEmbedUpdatePayload(scriptName, interaction, actionContext) {
  const guild = interaction.guild;
  if (!guild) return null;

  const targetId = actionContext?.targetId ?? null;

  if (SERVER_SCRIPTS.has(scriptName)) {
    const guildFetched = await guild.fetch().catch(() => guild);
    const embed = buildServerInfoEmbed(guildFetched);
    const { row } = buildServerInfoComponents();
    return {
      content: '',
      embeds: [embed],
      components: row ? [row] : [],
    };
  }

  if (CHANNEL_SCRIPTS.has(scriptName) && targetId) {
    const channel = await guild.channels.fetch(targetId).catch(() => null);
    if (!channel || channel.type === ChannelType.GuildCategory) return null;
    const embed = buildChannelInfoEmbed(channel, guild);
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
    const embed = buildCategoryInfoEmbed(category, guild);
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
    let profile = null;
    try {
      profile = await api.getMember(guild.id, member.id);
    } catch {
      // ignore
    }
    const embed = buildMemberInfoEmbed(member, profile);
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
