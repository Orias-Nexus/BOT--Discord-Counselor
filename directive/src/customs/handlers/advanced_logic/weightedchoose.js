/**
 * Advanced logic: {weightedchoose: a%30;b%70} — chọn theo tỉ lệ phần trăm (tổng 100).
 */

export function weightedchoose(ctx, argument) {
  if (!argument || typeof argument !== 'string') return '';
  const parts = argument.split(';').map((s) => s.trim()).filter(Boolean);
  const items = [];
  let total = 0;
  for (const p of parts) {
    const match = p.match(/^(.+?)%(\d+)$/);
    if (match) {
      const weight = parseInt(match[2], 10);
      items.push({ value: match[1].trim(), weight });
      total += weight;
    }
  }
  if (items.length === 0 || total <= 0) return '';
  let r = Math.random() * total;
  for (const { value, weight } of items) {
    r -= weight;
    if (r <= 0) return value;
  }
  return items[items.length - 1]?.value ?? '';
}
