/** TNG-era stardate: map Earth year +338 so 2026 reads as 2364 (SD 41xxx.x). */
const TNG_YEAR_OFFSET = 338;
const TNG_EPOCH_YEAR = 2364;
const TNG_EPOCH_SD = 41000;

export function toStardate(date: Date = new Date()): number {
  const tngYear = date.getFullYear() + TNG_YEAR_OFFSET;
  const start = Date.UTC(date.getFullYear(), 0, 1);
  const now = date.getTime();
  const dayFraction = (now - start) / (365.25 * 24 * 3600 * 1000);
  return TNG_EPOCH_SD + (tngYear - TNG_EPOCH_YEAR) * 1000 + dayFraction * 1000;
}

export function formatStardate(date: Date = new Date()): string {
  return toStardate(date).toFixed(1);
}

export function formatShipTime(date: Date = new Date()): string {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${hh}${mm}.${ss}`;
}

export function formatEarthDate(date: Date = new Date()): string {
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
