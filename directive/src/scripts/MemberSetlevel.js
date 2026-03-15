import * as api from '../api.js';
import { getEmbedContent } from '../embedDefaults.js';

export async function run(interaction, client, actionContext = null) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Chỉ dùng trong server.'));
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
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Cần nhập level (setlevel).'));
    return;
  }
  const level = Number(setlevelRaw);
  const range = await api.getLevelRange().catch(() => ({ min: 0, max: 999 }));
  if (Number.isNaN(level) || level < range.min || level > range.max) {
    await api.replyOrEdit(
      interaction,
      api.formatEphemeralContent(`Level phải trong khoảng ${range.min} - ${range.max}.`)
    );
    return;
  }
  await api.ensureMember(guild.id, member.id, member.user.username);
  const updated = await api.setMemberLevel(guild.id, member.id, level);
  const displayName = member.displayName ?? member.user.username;
  const content = api.formatEphemeralContent(api.replacePlaceholders(
    getEmbedContent('MemberSetlevel') ?? 'Completed Set Level {Server Profile Name}: {member_level}.',
    { 'Server Profile Name': displayName, member_level: updated?.member_level ?? level }
  ));
  await api.replyOrEdit(interaction, content);
}
