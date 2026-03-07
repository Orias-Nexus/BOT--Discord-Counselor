import * as api from '../api.js';

/** Parse hh:mm:ss or mm or single number -> minutes (for backend time_warn/time_mute/time_lock). */
function parseToMinutes(str) {
  if (!str || typeof str !== 'string') return null;
  const parts = str.trim().split(':').map(Number);
  if (parts.length === 1) return parts[0] >= 0 ? parts[0] : null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return Math.floor((parts[0] * 3600 + parts[1] * 60 + parts[2]) / 60);
  return null;
}

function getOptionOrModal(interaction, actionContext, key) {
  const fromOptions = interaction.options?.get?.(key)?.value;
  if (fromOptions !== undefined && fromOptions !== null) return fromOptions;
  return actionContext?.modalValues?.[key] ?? null;
}

export async function run(interaction, client, actionContext = {}) {
  const guild = interaction.guild;
  if (!guild) {
    await api.replyOrEdit(interaction, api.formatEphemeralContent('Chỉ dùng trong server.'));
    return;
  }
  const warn = getOptionOrModal(interaction, actionContext, 'warn');
  const mute = getOptionOrModal(interaction, actionContext, 'mute');
  const lock = getOptionOrModal(interaction, actionContext, 'lock');
  const all = getOptionOrModal(interaction, actionContext, 'all');
  let time_warn = parseToMinutes(warn);
  let time_mute = parseToMinutes(mute);
  let time_lock = parseToMinutes(lock);
  if (all != null) {
    const mins = parseToMinutes(all);
    if (mins != null) time_warn = time_mute = time_lock = mins;
  }
  const body = {};
  if (time_warn !== undefined && time_warn !== null) body.time_warn = time_warn <= 0 ? 0 : time_warn;
  if (time_mute !== undefined && time_mute !== null) body.time_mute = time_mute <= 0 ? 0 : time_mute;
  if (time_lock !== undefined && time_lock !== null) body.time_lock = time_lock <= 0 ? 0 : time_lock;
  await api.ensureServer(guild.id);
  if (Object.keys(body).length > 0) await api.setTimes(guild.id, body);
  const times = await api.getTimes(guild.id);
  const fn = await api.getFunction('StatusTimeout').catch(() => null);
  const content = api.formatEphemeralContent(api.replacePlaceholders(
    fn?.embed?.content ?? 'Updated Status Timeout: \\n Warn: {time_warn} \\n Mute: {time_mute} \\n Lock: {time_lock}.',
    { time_warn: times.time_warn, time_mute: times.time_mute, time_lock: times.time_lock }
  ));
  await api.replyOrEdit(interaction, content);
}
