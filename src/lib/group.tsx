import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useState, type ReactNode } from 'react';

import { colors } from '@/constants/theme';
import { getDeckCards, type DepthFilter } from '@/data/cards';
import { shuffle } from '@/lib/shuffle';

/**
 * Pass-the-phone group games. A session lives only in memory: it isn't saved
 * to deck progress or synced, so group play never changes your solo progress.
 */

const LAST_PLAYERS_KEY = 'gunita:lastPlayers';

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 10;

/** Each player gets their own color, in this order. */
export const playerColors = [
  colors.sage,
  colors.clay,
  colors.rose,
  colors.dusk,
  colors.mist,
  colors.sand,
  colors.cocoaSoft,
  colors.berry,
  colors.olive,
  colors.peach,
];

export type Player = { id: string; name: string; color: string };

export type GroupConfig = {
  deckId: string;
  depth: DepthFilter;
  players: Player[];
  /** null = keep going until the deck runs out. */
  cardsPerPlayer: number | null;
  shuffleOrder: boolean;
};

export type GroupSession = GroupConfig & {
  /** Player ids in turn order. */
  turnOrder: string[];
  remaining: string[];
  picks: { playerId: string; cardId: string }[];
  totalTurns: number;
};

type GroupContextValue = {
  session: GroupSession | null;
  startGroup: (config: GroupConfig) => void;
  /** Records the current player's card and moves to the next turn. */
  pick: (cardId: string) => void;
  /** Same players and settings, fresh deck. */
  restart: () => void;
};

const GroupContext = createContext<GroupContextValue | null>(null);

function createSession(config: GroupConfig): GroupSession {
  const remaining = getDeckCards(config.deckId, config.depth).map((card) => card.id);
  const ids = config.players.map((player) => player.id);
  const totalTurns =
    config.cardsPerPlayer === null
      ? remaining.length
      : Math.min(config.players.length * config.cardsPerPlayer, remaining.length);
  return {
    ...config,
    turnOrder: config.shuffleOrder ? shuffle(ids) : ids,
    remaining,
    picks: [],
    totalTurns,
  };
}

export function currentPlayer(session: GroupSession): Player | undefined {
  const id = session.turnOrder[session.picks.length % session.turnOrder.length];
  return session.players.find((player) => player.id === id);
}

export function isGroupFinished(session: GroupSession) {
  return session.picks.length >= session.totalTurns || session.remaining.length === 0;
}

export function GroupProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<GroupSession | null>(null);

  const value: GroupContextValue = {
    session,
    startGroup: (config) => {
      setSession(createSession(config));
      saveLastPlayers(config.players.map((player) => player.name));
    },
    pick: (cardId) =>
      setSession((prev) => {
        if (!prev || !prev.remaining.includes(cardId)) return prev;
        const player = currentPlayer(prev);
        if (!player) return prev;
        return {
          ...prev,
          remaining: prev.remaining.filter((id) => id !== cardId),
          picks: [...prev.picks, { playerId: player.id, cardId }],
        };
      }),
    restart: () => setSession((prev) => (prev ? createSession(prev) : prev)),
  };

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
}

export function useGroup() {
  const context = useContext(GroupContext);
  if (!context) throw new Error('useGroup must be used inside GroupProvider');
  return context;
}

/** Remembers player names so the next game starts with them filled in. */
function saveLastPlayers(names: string[]) {
  AsyncStorage.setItem(LAST_PLAYERS_KEY, JSON.stringify(names)).catch(() => {});
}

export async function loadLastPlayers(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(LAST_PLAYERS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((name) => typeof name === 'string') : [];
  } catch {
    return [];
  }
}
