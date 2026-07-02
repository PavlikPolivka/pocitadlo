const PREFIX = "pocitadlo_best_";

export function getBestTime(levelId: string): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PREFIX + levelId);
  if (raw === null) return null;
  const val = parseInt(raw, 10);
  return isNaN(val) ? null : val;
}

export function saveBestTime(levelId: string, seconds: number): boolean {
  const current = getBestTime(levelId);
  if (current === null || seconds < current) {
    localStorage.setItem(PREFIX + levelId, String(seconds));
    return true;
  }
  return false;
}
