import { MessageFlags, PermissionFlagsBits } from 'discord.js';
import * as api from '../api.js';

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
  const number = typeof amount === 'number' ? Math.min(Math.max(amount, 1), 100) : 0;
  if (!number) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Number is required.'));
    return;
  }

  const role = interaction.options?.getRole('role');
  const member = interaction.options?.getUser('member');
  if (!role && !member) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Provide role or member.'));
    return;
  }

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

    const fetched = await channel.messages.fetch({ limit: 100 }).catch(() => null);
    const all = fetched ? Array.from(fetched.values()) : [];

    const matched = [];
    for (const msg of all) {
      if (matched.length >= number) break;
      if (!isBulkDeletable(msg)) continue;

      if (userId) {
        if (String(msg.author?.id ?? '') !== userId) continue;
        matched.push(msg);
        continue;
      }

      if (roleId) {
        const authorId = String(msg.author?.id ?? '');
        if (!authorId) continue;
        const gm = msg.member ?? (await guild.members.fetch(authorId).catch(() => null));
        if (!gm?.roles?.cache?.has(roleId)) continue;
        matched.push(msg);
      }
    }

    if (matched.length === 0) {
      await interaction.editReply({
        content: api.formatEphemeralContent('No messages matched (or messages are too old to bulk delete).'),
        flags: MessageFlags.Ephemeral,
      }).catch(() => {});
      return;
    }

    const ids = matched.map((m) => m.id);
    const deleted = await channel.bulkDelete(ids, true).catch(() => null);
    const deletedCount = deleted?.size ?? 0;

    await interaction.editReply({
      content: api.formatEphemeralContent(`Deleted ${deletedCount} message(s).`),
      flags: MessageFlags.Ephemeral,
    }).catch(() => {});
  } catch (err) {
    console.error('[MessageDele]', err);
    await interaction.editReply({
      content: api.formatEphemeralContent('Delete failed.'),
      flags: MessageFlags.Ephemeral,
    }).catch(() => {});
  }
}

