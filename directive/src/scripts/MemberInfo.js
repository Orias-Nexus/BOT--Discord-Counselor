import * as api from '../api.js';
import { buildMemberInfoComponents } from '../utils/components.js';
import { mainImageURL } from '../config.js';
import { getEmbedBuilder } from '../embedRoutes.js';

const DEBUG = process.env.DEBUG_MEMBER_INFO === '1';

export async function run(interaction, client, actionContext = null) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Chỉ dùng trong server.'));
    return;
  }
  if (!interaction.deferred) await interaction.deferReply();
  const fromSlash = interaction.options != null;
  let member = fromSlash
    ? interaction.options.get('target')?.member ?? interaction.options.getUser('target')
    : (actionContext?.targetId ? await guild.members.fetch(actionContext.targetId).catch(() => null) : null);
  if (member?.id && !member.member) member = await guild.members.fetch(member.id).catch(() => null);
  if (!member) member = interaction.member;
  if (typeof member === 'string') member = await guild.members.fetch(member).catch(() => null);
  if (!member) {
    await interaction.editReply({ content: api.formatEphemeralContent('Không tìm thấy thành viên.') });
    return;
  }
  let profile = null;
  try {
    profile = await api.getMember(guild.id, member.id);
    if (DEBUG) console.log('[MemberInfo] profile', { guildId: guild.id, memberId: member.id, profile });
  } catch (err) {
    console.error('[MemberInfo] getMember', err);
    await interaction.editReply({ content: api.formatEphemeralContent('Không lấy được thông tin thành viên.') });
    return;
  }
  const buildEmbed = getEmbedBuilder('MemberInfo');
  const embed = buildEmbed ? await buildEmbed(member, profile, { imageURL: mainImageURL }) : null;
  if (!embed) {
    await interaction.editReply({ content: api.formatEphemeralContent('Không tạo được embed.') }).catch(() => {});
    return;
  }
  const { row, row2 } = buildMemberInfoComponents(member.id, profile);
  const components = [row, row2].filter(Boolean);
  try {
    await interaction.editReply({ embeds: [embed], components: components.length ? components : [] });
  } catch (err) {
    console.error('[MemberInfo] editReply', err);
    await interaction.editReply({ content: api.formatEphemeralContent('Không gửi được embed.') }).catch(() => {});
  }
}
