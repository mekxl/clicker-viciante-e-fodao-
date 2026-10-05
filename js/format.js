// Formatação de números grandes (HUD, floaters).
const SUF = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
export function fmt(n) {
  if (!isFinite(n)) return '∞';
  const a = Math.abs(n);
  if (a < 1000) return String(Math.round(n));
  const i = Math.floor(Math.log10(a) / 3);
  if (i >= SUF.length) return n.toExponential(2).replace('+', '');
  const v = n / Math.pow(10, i * 3);
  return (v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : v.toFixed(0)) + SUF[i];
}
