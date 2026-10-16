export function parseWeight(text) {
  const normalized = String(text).trim().replace(',', '.');
  if (!/^(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) && value > 0 && value <= 1000 ? value : null;
}
export function parseRepetitions(text) {
  const normalized = String(text).trim();
  if (!/^\+?\d+$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isInteger(value) && value >= 1 && value <= 30 ? value : null;
}
export function oneRepMax(weight, repetitions) { return weight * (1 + repetitions / 30); }
export function weightForRepetitions(maximum, repetitions) { return repetitions === 1 ? maximum : maximum / (1 + repetitions / 30); }

