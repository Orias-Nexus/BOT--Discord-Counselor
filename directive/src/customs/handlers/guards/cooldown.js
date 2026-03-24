/**
 * Guard: {cooldown: seconds}. Inject getCooldownKey(ctx) and setCooldown(key, seconds) / isOnCooldown(key).
 * Mặc định luôn pass (true) nếu chưa inject.
 */

export function cooldown(ctx, argument) {
  const sec = parseInt(argument?.trim(), 10);
  if (Number.isNaN(sec) || sec < 0) return true;
  const key = ctx.meta?.getCooldownKey?.(ctx) ?? ctx.getCooldownKey?.(ctx);
  if (!key) return true;
  const isOn = ctx.meta?.isOnCooldown?.(ctx, key) ?? ctx.isOnCooldown?.(ctx, key);
  if (isOn) return false;
  ctx.meta?.setCooldown?.(ctx, key, sec);
  ctx.setCooldown?.(ctx, key, sec);
  return true;
}
