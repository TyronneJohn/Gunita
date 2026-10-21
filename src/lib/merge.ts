/**
 * Last-write-wins merge: for each key, keep whichever item has the newer
 * updatedAt. Returns `current` itself when nothing changed, so React state
 * doesn't update (and sync doesn't loop) when there is nothing new.
 */
export function mergeNewer<T extends { updatedAt: number }>(
  current: T[],
  incoming: T[],
  keyOf: (item: T) => string,
): T[] {
  const byKey = new Map(current.map((item) => [keyOf(item), item]));
  let changed = false;
  for (const item of incoming) {
    const key = keyOf(item);
    const existing = byKey.get(key);
    if (!existing || item.updatedAt > existing.updatedAt) {
      byKey.set(key, item);
      changed = true;
    }
  }
  return changed ? Array.from(byKey.values()) : current;
}
