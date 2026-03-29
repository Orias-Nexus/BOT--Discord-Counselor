import * as api from '../api.js';
import { sendAuditLog } from '../utils/auditLogger.js';

const SUCCESS_MESSAGE = 'Completed Set Level {Server Profile Name}: {member_level}.';

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
  const setlevelRaw =
    interaction.options?.get('setlevel')?.value ?? actionContext?.modalValues?.setlevel ?? null;
  if (setlevelRaw == null || setlevelRaw === '') {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Enter level (setlevel).'));
    return;
  }
  const level = Number(setlevelRaw);
  const range = await api.getLevelRange().catch(() => ({ min: 0, max: 999 }));
  if (Number.isNaN(level) || level < range.min || level > range.max) {
    await api.replyOrEdit(
      interaction,
      api.formatEphemeralContent(`Level must be between ${range.min} and ${range.max}.`)
    );
    return;
  }
  await api.ensureMember(guild.id, member.id, member.user.username);
  const updated = await api.setMemberLevel(guild.id, member.id, level);
  const displayName = member.displayName ?? member.user.username;
  const content = api.formatEphemeralContent(api.replacePlaceholders(SUCCESS_MESSAGE, { 'Server Profile Name': displayName, member_level: updated?.member_level ?? level }));
  await api.replyOrEdit(interaction, content);

  await sendAuditLog(guild, {
    action: 'Member Level Changed',
    executor: interaction.user,
    target: member.user,
    color: '#3498db',
    fields: [{ name: 'New Level', value: (updated?.member_level ?? level).toString() }]
  });
}
