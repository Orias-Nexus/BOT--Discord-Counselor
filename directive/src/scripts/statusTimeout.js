import * as api from '../api.js';
import { sendAuditLog } from '../utils/auditLogger.js';

const SUCCESS_MESSAGE = 'Updated Status Timeout: \\n Warn: {time_warn} \\n Mute: {time_mute} \\n Lock: {time_lock} \\n Newbie: {time_new}.';

/** Parse dd:hh:mm or hh:mm or minutes → total minutes (backend time_warn/time_mute/time_lock). */
function parseToMinutes(str) {
  if (!str || typeof str !== 'string') return null;
  const parts = str.trim().split(':').map(Number);
  if (parts.length === 1) return parts[0] >= 0 ? parts[0] : null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 24 * 60 + parts[1] * 60 + parts[2];
  return null;
}

/** Convert total minutes → dd:hh:mm string. */
function formatMinutesToDDHHMM(totalMinutes) {
  if (totalMinutes == null || totalMinutes < 0) return '0:00:00';
  const d = Math.floor(totalMinutes / (24 * 60));
  const r = totalMinutes % (24 * 60);
  const h = Math.floor(r / 60);
  const m = r % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d)}:${pad(h)}:${pad(m)}`;
}

function getOptionOrModal(interaction, actionContext, key) {
  const fromOptions = interaction.options?.get?.(key)?.value;
  if (fromOptions !== undefined && fromOptions !== null) return fromOptions;
  return actionContext?.modalValues?.[key] ?? null;
}

export async function run(interaction, client, actionContext = {}) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Use in a server only.'));
    return;
  }
  const warn = getOptionOrModal(interaction, actionContext, 'warn');
  const mute = getOptionOrModal(interaction, actionContext, 'mute');
  const lock = getOptionOrModal(interaction, actionContext, 'lock');
  const newbie = getOptionOrModal(interaction, actionContext, 'new');
  const all = getOptionOrModal(interaction, actionContext, 'all');
  let time_warn = parseToMinutes(warn);
  let time_mute = parseToMinutes(mute);
  let time_lock = parseToMinutes(lock);
  let time_new = parseToMinutes(newbie);
  if (all != null) {
    const mins = parseToMinutes(all);
    if (mins != null) time_warn = time_mute = time_lock = time_new = mins;
  }
  const body = {};
  if (time_warn !== undefined && time_warn !== null) body.time_warn = time_warn <= 0 ? 0 : time_warn;
  if (time_mute !== undefined && time_mute !== null) body.time_mute = time_mute <= 0 ? 0 : time_mute;
  if (time_lock !== undefined && time_lock !== null) body.time_lock = time_lock <= 0 ? 0 : time_lock;
  if (time_new !== undefined && time_new !== null) body.time_new = time_new <= 0 ? 0 : time_new;
  await api.ensureServer(guild.id);
  if (Object.keys(body).length > 0) await api.setTimes(guild.id, body);
  const times = await api.getTimes(guild.id);
  const placeholders = {
    time_warn: formatMinutesToDDHHMM(times.time_warn),
    time_mute: formatMinutesToDDHHMM(times.time_mute),
    time_lock: formatMinutesToDDHHMM(times.time_lock),
    time_new: formatMinutesToDDHHMM(times.time_new),
  };
  const content = api.formatEphemeralContent(api.replacePlaceholders(SUCCESS_MESSAGE, placeholders));
  await api.replyOrEdit(interaction, content);

  if (Object.keys(body).length > 0) {
    await sendAuditLog(guild, {
      action: 'Status Timeouts Updated',
      executor: interaction.user,
      color: '#3498db',
      fields: Object.entries(body).map(([k, v]) => ({ name: k, value: formatMinutesToDDHHMM(v), inline: true }))
    });
  }

  const updatedServer = await api.getServer(guild.id).catch(() => null);
  return { server: updatedServer };
}
