import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { getQuestion } from '@/data/questions';

const STORAGE_KEY = 'gunita:favorites';

type FavoritesContextValue = {
  loaded: boolean;
  /** Question ids, most recently saved first. */
  favorites: string[];
  isFavorite: (questionId: string) => boolean;
  toggleFavorite: (questionId: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[] | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        const ids: unknown = raw ? JSON.parse(raw) : [];
        // Skip questions that no longer exist (e.g. after the question list changes).
        setFavorites(Array.isArray(ids) ? ids.filter((id) => getQuestion(id)) : []);
      })
      .catch(() => setFavorites([]));
  }, []);

  useEffect(() => {
    if (favorites) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)).catch(() => {});
  }, [favorites]);

  const list = favorites ?? [];

  const value: FavoritesContextValue = {
    loaded: favorites !== null,
    favorites: list,
    isFavorite: (questionId) => list.includes(questionId),
    toggleFavorite: (questionId) =>
      setFavorites((prev) => {
        const current = prev ?? [];
        return current.includes(questionId)
          ? current.filter((id) => id !== questionId)
          : [questionId, ...current];
      }),
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used inside FavoritesProvider');
  return context;
}
