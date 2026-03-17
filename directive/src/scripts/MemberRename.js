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
  const setname =
    interaction.options?.get('setname')?.value ?? actionContext?.modalValues?.setname ?? null;
  if (!setname?.trim()) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Cần nhập tên mới (setname).'));
    return;
  }
  const name = String(setname).trim().slice(0, 32);
  await member.setNickname(name).catch(() => {});
  const displayName = member.displayName ?? member.user.username;
  const content = api.formatEphemeralContent(api.replacePlaceholders(
    getEmbedContent('MemberRename') ?? 'Completed Rename {Username} to {Server Profile Name}.',
    { Username: member.user.username, 'Server Profile Name': displayName }
  ));
  await api.replyOrEdit(interaction, content);
}
