export function pnlPct(side: 'long' | 'short', entry: number, current: number) {
  if (!entry || !current) return 0;
  const base = ((current - entry) / entry) * 100;
  return side === 'long' ? base : -base;
}
export function pnlAbsFromPct(pct: number, size: number) {
  return (pct / 100) * size;
}
