import { sendEventMessage } from '../eventMessages.js';

/**
 * Leveling event: gửi tin nhắn level-up vào kênh đã cấu hình (Messages Leveling).
 * Được gọi từ hệ thống level khi member đạt level mới.
 */
export async function run(interaction, client, actionContext) {
  const guild = actionContext?.guild ?? null;
  const member = actionContext?.member ?? null;
  if (!guild || !member) return;
  await sendEventMessage(guild, 'Leveling', { member, guild });
}
