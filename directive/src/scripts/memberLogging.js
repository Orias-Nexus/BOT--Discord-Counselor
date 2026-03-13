import { sendEventMessage } from '../eventMessages.js';

/**
 * Logging event: gửi log message vào kênh đã cấu hình (Messages Logging).
 * Được gọi từ các hành động moderation hoặc audit khi cần ghi log.
 */
export async function run(interaction, client, actionContext) {
  const guild = actionContext?.guild ?? null;
  const member = actionContext?.member ?? null;
  if (!guild || !member) return;
  await sendEventMessage(guild, 'Logging', { member, guild });
}
