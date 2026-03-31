import * as api from '../api.js';
import { sendAuditLog } from '../utils/auditLogger.js';

const SUCCESS_MESSAGE = 'Completed Rename {Username} to {Server Profile Name}.';
const FAIL_MESSAGE = 'Cannot rename {Username}. Make sure the bot has Manage Nicknames permission and its role is above theirs.';

export async function run(interaction, client, actionContext = null) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }
  const fromSlash = interaction.options != null;
  let member = fromSlash
    ? interaction.options.get('target')?.member ?? interaction.member
    : (actionContext?.targetId
        ? await guild.members.fetch(actionContext.targetId).catch(() => null)
        : null) ?? interaction.member;
  const setname =
    interaction.options?.get('setname')?.value ?? actionContext?.modalValues?.setname ?? null;
  if (!setname?.trim()) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Enter new name (setname).'));
    return;
  }
  const name = String(setname).trim().slice(0, 32);
  const renameError = await member.setNickname(name).then(() => null).catch((e) => e);
  if (renameError) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent(api.replacePlaceholders(FAIL_MESSAGE, { Username: member.user.username })));
    return;
  }
  const displayName = member.displayName ?? member.user.username;
  const content = api.formatEphemeralContent(api.replacePlaceholders(SUCCESS_MESSAGE, { Username: member.user.username, 'Server Profile Name': name }));
  await api.replyOrEdit(interaction, content);

  await sendAuditLog(guild, {
    action: 'Member Renamed',
    executor: interaction.user,
    target: member.user,
    color: '#f1c40f',
    fields: [{ name: 'New Name', value: name }]
  });
}
