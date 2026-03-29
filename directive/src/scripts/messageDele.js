import { MessageFlags, PermissionFlagsBits } from '../discord.js';
import * as api from '../api.js';
import { sendAuditLog } from '../utils/auditLogger.js';

const MAX_BULK_DELETE = 100;
const MAX_DELETE_ALL_TOTAL = 5000;

function toUserId(userOrMember) {
  const id = userOrMember?.user?.id ?? userOrMember?.id ?? null;
  return id ? String(id) : null;
}

function isBulkDeletable(message) {
  if (!message?.id) return false;
  if (message.pinned) return false;
  const created = message.createdTimestamp ?? 0;
  const ageMs = Date.now() - created;
  const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
  return ageMs < TWO_WEEKS_MS;
}

export async function run(interaction, client) {
  const guild = interaction?.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }

  const amount = interaction.options?.getInteger('number');
  const requestedLimit = typeof amount === 'number' ? Math.min(Math.max(amount, 1), MAX_BULK_DELETE) : null;

  const role = interaction.options?.getRole('role');
  const member = interaction.options?.getUser('member');

  const channel = interaction.options?.getChannel('channel') ?? interaction.channel;
  if (!channel || !channel.isTextBased?.() || !('bulkDelete' in channel)) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Target channel must be a text channel.'));
    return;
  }

  const me = guild.members.me ?? (await guild.members.fetchMe().catch(() => null));
  const canManage = me?.permissions?.has(PermissionFlagsBits.ManageMessages);
  if (!canManage) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Bot is missing Manage Messages permission.'));
    return;
  }

  if (!interaction.deferred) await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const userId = member ? toUserId(member) : null;
    const roleId = role?.id ? String(role.id) : null;

    const memberCache = new Map();
    const getGuildMember = async (authorId) => {
      if (!authorId) return null;
      if (memberCache.has(authorId)) return memberCache.get(authorId);
      const gm = await guild.members.fetch(authorId).catch(() => null);
      memberCache.set(authorId, gm);
      return gm;
    };

    const matchMessage = async (msg) => {
      if (!isBulkDeletable(msg)) return false;

      if (userId) {
        return String(msg.author?.id ?? '') === userId;
      }

      if (roleId) {
        const authorId = String(msg.author?.id ?? '');
        const gm = msg.member ?? (await getGuildMember(authorId));
        return !!gm?.roles?.cache?.has(roleId);
      }

      return true;
    };

    let deletedCount = 0;
    let before = null;

    while (true) {
      if (requestedLimit != null && deletedCount >= requestedLimit) break;
      if (requestedLimit == null && deletedCount >= MAX_DELETE_ALL_TOTAL) break;

      const fetched = await channel.messages.fetch({ limit: MAX_BULK_DELETE, ...(before ? { before } : {}) }).catch(() => null);
      const all = fetched ? Array.from(fetched.values()) : [];
      if (all.length === 0) break;

      const matchedIds = [];
      for (const msg of all) {
        if (requestedLimit != null && matchedIds.length + deletedCount >= requestedLimit) break;
        // eslint-disable-next-line no-await-in-loop
        if (await matchMessage(msg)) matchedIds.push(msg.id);
      }

      before = all[all.length - 1]?.id ?? null;

      if (matchedIds.length > 0) {
        const deleted = await channel.bulkDelete(matchedIds, true).catch(() => null);
        deletedCount += deleted?.size ?? 0;
      }

      if (all.length < MAX_BULK_DELETE) break;
      if (!before) break;
    }

    if (deletedCount === 0) {
      await interaction.editReply({
        content: api.formatEphemeralContent('No messages matched (or messages are too old/pinned to bulk delete).'),
        flags: MessageFlags.Ephemeral,
      }).catch(() => {});
      return;
    }

    await interaction.editReply({
      content: api.formatEphemeralContent(`Deleted ${deletedCount} message(s).`),
      flags: MessageFlags.Ephemeral,
    }).catch(() => {});

    await sendAuditLog(guild, {
      action: 'Messages Purged',
      executor: interaction.user,
      target: channel.name,
      color: '#e74c3c',
      fields: [
        { name: 'Channel', value: channel.toString(), inline: true },
        { name: 'Amount', value: deletedCount.toString(), inline: true },
        { name: 'Filter Member', value: member ? member.toString() : 'None', inline: true },
        { name: 'Filter Role', value: role ? role.toString() : 'None', inline: true }
      ]
    });
  } catch (err) {
    console.error('[MessageDele]', err);
    await interaction.editReply({
      content: api.formatEphemeralContent('Delete failed.'),
      flags: MessageFlags.Ephemeral,
    }).catch(() => {});
  }
}

