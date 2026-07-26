const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

export function isRecentlyActive(lastActiveAt: string | null): boolean {
  if (!lastActiveAt) return false;
  return Date.now() - new Date(lastActiveAt).getTime() < ONLINE_THRESHOLD_MS;
}
