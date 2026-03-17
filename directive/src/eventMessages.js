/**
 * Gửi tin nhắn sự kiện (Greeting, Leaving, Boosting) vào kênh đã cấu hình.
 * Chỉ gửi khi đã cấu hình channel_id và embed_id (embed do người dùng tự đặt).
 */
import * as api from './api.js';
import { resolveEmbed } from './embeds/embedContext.js';

/**
 * Gửi tin nhắn embed vào kênh theo cấu hình Messages (channel_id, embed_id).
 * Cần có embed_id trong config thì mới gửi (không fallback embed mặc định).
 * @param {import('discord.js').Guild} guild
 * @param {'Greeting'|'Leaving'|'Boosting'} messagesType
 * @param {{ member?: import('discord.js').GuildMember|null, guild?: import('discord.js').Guild|null, channel?: import('discord.js').Channel|null }} meta - member có thể partial (Leaving)
 * @returns {Promise<boolean>} true nếu đã gửi, false nếu bỏ qua (không cấu hình / lỗi)
 */
export async function sendEventMessage(guild, messagesType, meta = {}) {
  if (!guild?.id) return false;
  let config;
  try {
    config = await api.getMessageByType(guild.id, messagesType);
  } catch (err) {
    return false;
  }
  if (!config) return false;
  const channelId = config.channel_id ?? null;
  if (!channelId || channelId === '0') return false;
  const channel = await guild.channels.fetch(channelId).catch(() => null);
  if (!channel) return false;

  const resolvedMeta = { ...meta, guild: meta.guild ?? guild, channel };

  let embedData;
  if (config.embed_id) {
    const row = await api.getEmbed(guild.id, config.embed_id).catch(() => null);
    if (row?.embed) {
      embedData = await resolveEmbed(row.embed, resolvedMeta);
    }
  }
  if (!embedData) return false;

  try {
    await channel.send({ embeds: [embedData] });
    return true;
  } catch (err) {
    return false;
  }
}
