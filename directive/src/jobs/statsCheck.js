import { ChannelType } from 'discord.js';
import * as api from '../api.js';
import { digitsFromChannelsIdx, getStatLabelByIndex } from '../config/channelTypes.js';

const INTERVAL_MS = 60 * 1000;

function getStatValue(guild, statIndex) {
  switch (statIndex) {
    case 1:
      return guild.members.cache.filter((m) => !m.user.bot).size;
    case 2:
      return guild.members.cache.filter((m) => m.user.bot).size;
    case 3:
      return guild.roles.cache.size;
    case 4:
      return guild.channels.cache.filter((c) => c.type === ChannelType.GuildCategory).size;
    case 5:
      return guild.channels.cache.filter((c) => c.type !== ChannelType.GuildCategory).size;
    case 6:
      return guild.premiumSubscriptionCount ?? 0;
    default:
      return 0;
  }
}

function formatChannelName(statIndex, value) {
  const label = getStatLabelByIndex(statIndex);
  return `${label}: ${value}`;
}

export function startStatsCheck(client) {
  async function run() {
    try {
      const guilds = client.guilds.cache;
      for (const [, guild] of guilds) {
        let rows = [];
        try {
          rows = await api.getChannels(guild.id, 'Stats');
        } catch {
          continue;
        }
        const statsRows = (rows ?? []).filter((r) => r.category_type === 'Stats');
        if (statsRows.length === 0) continue;

        await guild.members.fetch().catch(() => {});
        for (const row of statsRows) {
          const categoryId = row.category_id;
          const channelsIdx = Number(row.channels_idx) || 0;
          const digits = digitsFromChannelsIdx(channelsIdx);
          if (digits.length === 0) continue;

          const children = guild.channels.cache.filter(
            (c) => c.parentId === categoryId && (c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice)
          );
          const sorted = [...children.values()].sort((a, b) => (a.rawPosition ?? a.position) - (b.rawPosition ?? b.position));

          for (let i = 0; i < sorted.length && i < digits.length; i++) {
            const channel = sorted[i];
            const statIndex = digits[i];
            const value = getStatValue(guild, statIndex);
            const newName = formatChannelName(statIndex, value);
            if (channel.name !== newName) {
              await channel.setName(newName).catch((err) => {
                console.warn(`[statsCheck] setName ${channel.id}:`, err?.message);
              });
            }
          }
        }
      }
    } catch (err) {
      const msg = err?.message ?? String(err);
      if (msg === 'fetch failed' || err?.cause?.code === 'ECONNREFUSED') {
        console.warn('[statsCheck] Backend not responding.');
      } else {
        console.warn('[statsCheck]', msg);
      }
    }
  }
  run();
  setInterval(run, INTERVAL_MS);
}
