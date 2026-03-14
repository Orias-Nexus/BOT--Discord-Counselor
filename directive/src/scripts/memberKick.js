import * as api from '../api.js';
import { getEmbedContent } from '../embedDefaults.js';

const SUCCESS_MESSAGE = "{Server Profile Name} has been Kicked.";

export async function run(interaction, client, actionContext) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }
  const fromSlash = interaction.options != null;
  let member = fromSlash
    ? interaction.options.get('target')?.member ?? interaction.options.getUser('target')
    : (actionContext?.targetId ? await guild.members.fetch(actionContext.targetId).catch(() => null) : null);
  if (member?.id && !member.member) member = await guild.members.fetch(member.id).catch(() => null);
  if (!member) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Select a member (target).'));
    return;
  }
  await member.kick().catch(() => {});
  await api.ensureMember(guild.id, member.id, member.user?.username);
  await api.setMemberStatus(guild.id, member.id, 'Kick', null);
  const displayName = member.displayName ?? member.user?.username ?? 'User';
  const content = api.formatEphemeralContent(api.replacePlaceholders(SUCCESS_MESSAGE, { 'Server Profile Name': displayName }));
  await api.replyOrEdit(interaction, content);
}
