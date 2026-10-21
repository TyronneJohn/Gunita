import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { getCard, getDeckCards, type DepthFilter } from '@/data/cards';

const STORAGE_KEY = 'gunita:progress';

export type DeckSession = {
  /** Card ids still on the table. They get reshuffled before every pick. */
  remaining: string[];
  /** Card ids already picked and answered, in the order they were picked. */
  picked: string[];
  depth: DepthFilter;
  updatedAt: number;
};

type ProgressData = {
  sessions: Record<string, DeckSession>;
  lastDeckId: string | null;
};

type ProgressContextValue = {
  loaded: boolean;
  lastDeckId: string | null;
  getSession: (deckId: string) => DeckSession | undefined;
  startSession: (deckId: string, depth: DepthFilter) => void;
  /** Moves a card from the table to the picked pile. */
  pickCard: (deckId: string, cardId: string) => void;
  /** Every deck session, for syncing. */
  sessions: Record<string, DeckSession>;
  /** Applies sessions from the cloud, keeping whichever version is newer. */
  mergeRemote: (incoming: Record<string, DeckSession>) => void;
  /** Clears progress on this phone (used when a different account signs in). */
  resetLocal: () => void;
};

const EMPTY: ProgressData = { sessions: {}, lastDeckId: null };

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function isSessionActive(session: DeckSession | undefined): session is DeckSession {
  return !!session && session.remaining.length > 0;
}

export function sessionTotal(session: DeckSession) {
  return session.remaining.length + session.picked.length;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProgressData | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => setData(raw ? sanitize(JSON.parse(raw)) : EMPTY))
      .catch(() => setData(EMPTY));
  }, []);

  useEffect(() => {
    if (data) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [data]);

  const mergeRemote = useCallback((incoming: Record<string, DeckSession>) => {
    setData((prev) => {
      const current = prev ?? EMPTY;
      const sessions = { ...current.sessions };
      let changed = false;
      for (const [deckId, session] of Object.entries(incoming)) {
        const existing = sessions[deckId];
        if (!existing || session.updatedAt > existing.updatedAt) {
          sessions[deckId] = session;
          changed = true;
        }
      }
      // Same object when nothing is newer, so sync doesn't loop.
      return changed ? { ...current, sessions } : current;
    });
  }, []);

  const resetLocal = useCallback(() => setData(EMPTY), []);

  const value: ProgressContextValue = {
    loaded: data !== null,
    lastDeckId: data?.lastDeckId ?? null,
    getSession: (deckId) => data?.sessions[deckId],
    startSession: (deckId, depth) => {
      const remaining = getDeckCards(deckId, depth).map((card) => card.id);
      setData((prev) => {
        const current = prev ?? EMPTY;
        return {
          lastDeckId: deckId,
          sessions: {
            ...current.sessions,
            [deckId]: { remaining, picked: [], depth, updatedAt: Date.now() },
          },
        };
      });
    },
    pickCard: (deckId, cardId) => {
      setData((prev) => {
        const current = prev ?? EMPTY;
        const session = current.sessions[deckId];
        if (!session || !session.remaining.includes(cardId)) return current;
        return {
          lastDeckId: deckId,
          sessions: {
            ...current.sessions,
            [deckId]: {
              ...session,
              remaining: session.remaining.filter((id) => id !== cardId),
              picked: [...session.picked, cardId],
              updatedAt: Date.now(),
            },
          },
        };
      });
    },
    sessions: data?.sessions ?? {},
    mergeRemote,
    resetLocal,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used inside ProgressProvider');
  return context;
}

type StoredSession = Partial<DeckSession> & {
  // Older saves stored a fixed draw order and a position in it.
  order?: string[];
  position?: number;
};

/** Drops card ids that no longer exist and upgrades older saved sessions. */
function sanitize(raw: { sessions?: Record<string, StoredSession>; lastDeckId?: string | null }) {
  const sessions: Record<string, DeckSession> = {};
  for (const [deckId, stored] of Object.entries(raw.sessions ?? {})) {
    let remaining = stored.remaining;
    let picked = stored.picked;
    if (!remaining && stored.order) {
      const position = stored.position ?? 0;
      remaining = stored.order.slice(position);
      picked = stored.order.slice(0, position);
    }
    remaining = (remaining ?? []).filter((id) => getCard(id));
    picked = (picked ?? []).filter((id) => getCard(id));
    if (remaining.length + picked.length === 0) continue;
    sessions[deckId] = {
      remaining,
      picked,
      depth: stored.depth ?? 'all',
      updatedAt: stored.updatedAt ?? Date.now(),
    };
  }
  return { sessions, lastDeckId: raw.lastDeckId ?? null } satisfies ProgressData;
}
