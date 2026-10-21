import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { getQuestion } from '@/data/questions';
import { mergeNewer } from '@/lib/merge';

const STORAGE_KEY = 'gunita:favorites';

export type FavoriteRecord = {
  questionId: string;
  updatedAt: number;
  /** Set when the heart is removed, so the removal can sync too. */
  deletedAt: number | null;
};

type FavoritesContextValue = {
  loaded: boolean;
  /** Question ids, most recently saved first. */
  favorites: string[];
  isFavorite: (questionId: string) => boolean;
  toggleFavorite: (questionId: string) => void;
  /** Every record including removed hearts, for syncing. */
  records: FavoriteRecord[];
  /** Applies favorites from the cloud, keeping whichever version is newer. */
  mergeRemote: (incoming: FavoriteRecord[]) => void;
  /** Clears favorites on this phone (used when a different account signs in). */
  resetLocal: () => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

/** Reads saved favorites, including the older format that was a plain list of ids. */
function parseStored(raw: string | null): FavoriteRecord[] {
  const parsed: unknown = raw ? JSON.parse(raw) : [];
  if (!Array.isArray(parsed)) return [];
  const now = Date.now();
  const records = parsed.map((item, index): FavoriteRecord =>
    typeof item === 'string'
      ? // Keep the old order: earlier in the list = more recently saved.
        { questionId: item, updatedAt: now - index, deletedAt: null }
      : (item as FavoriteRecord),
  );
  // Skip questions that no longer exist (e.g. after the question list changes).
  return records.filter((record) => getQuestion(record.questionId));
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<FavoriteRecord[] | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => setRecords(parseStored(raw)))
      .catch(() => setRecords([]));
  }, []);

  useEffect(() => {
    if (records) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records)).catch(() => {});
  }, [records]);

  const mergeRemote = useCallback((incoming: FavoriteRecord[]) => {
    setRecords((prev) => mergeNewer(prev ?? [], incoming, (record) => record.questionId));
  }, []);

  const resetLocal = useCallback(() => setRecords([]), []);

  const all = records ?? [];
  const favorites = all
    .filter((record) => record.deletedAt === null && getQuestion(record.questionId))
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((record) => record.questionId);

  const value: FavoritesContextValue = {
    loaded: records !== null,
    favorites,
    isFavorite: (questionId) => favorites.includes(questionId),
    toggleFavorite: (questionId) =>
      setRecords((prev) => {
        const current = prev ?? [];
        const now = Date.now();
        const existing = current.find((record) => record.questionId === questionId);
        const saved = existing ? existing.deletedAt === null : false;
        const next: FavoriteRecord = { questionId, updatedAt: now, deletedAt: saved ? now : null };
        return existing
          ? current.map((record) => (record.questionId === questionId ? next : record))
          : [next, ...current];
      }),
    records: all,
    mergeRemote,
    resetLocal,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used inside FavoritesProvider');
  return context;
}
