import { sendEventMessage } from '../eventMessages.js';

/**
 * Event boost (GuildMemberUpdate khi premium_since thay đổi): gửi tin nhắn Boosting vào kênh đã cấu hình.
 * Embed resolve qua parser (user_name, user_avatar, server_name, ...).
 */
export async function run(interaction, client, actionContext) {
  const guild = actionContext?.guild ?? null;
  const member = actionContext?.member ?? null;
  if (!guild || !member) return;
  await sendEventMessage(guild, 'Boosting', { member, guild });
}
