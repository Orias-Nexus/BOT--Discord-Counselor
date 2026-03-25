/**
 * Advanced logic: {range: min-max}. Tạo số ngẫu nhiên trong khoảng (bao gồm min, max).
 */

export function range(ctx, argument) {
  if (!argument || typeof argument !== 'string') return '';
  const parts = argument.split('-').map((s) => parseInt(s.trim(), 10));
  if (parts.length !== 2 || parts.some(Number.isNaN)) return '';
  const [min, max] = parts[0] <= parts[1] ? [parts[0], parts[1]] : [parts[1], parts[0]];
  const n = Math.floor(Math.random() * (max - min + 1)) + min;
  return String(n);
}
