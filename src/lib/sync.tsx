import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import { getCard, type DepthFilter } from '@/data/cards';
import type { Mood } from '@/data/moods';
import { useAuth } from '@/lib/auth';
import { useFavorites, type FavoriteRecord } from '@/lib/favorites';
import { useJournal, type JournalEntry } from '@/lib/journal';
import { useProgress, type DeckSession } from '@/lib/progress';
import { supabase } from '@/lib/supabase';

/**
 * Keeps the journal, favorites, and deck progress in sync with Supabase while
 * signed in. Everything is saved on the phone first; sync then pulls the cloud
 * copy, keeps the newer version of each item, and uploads what the cloud is
 * missing. Runs on sign in, when the app comes back to the foreground, and a
 * couple of seconds after any change.
 */

/** Which account the data on this phone belongs to. */
const OWNER_KEY = 'gunita:syncOwner';
const CHANGE_DELAY_MS = 2000;

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

type SyncContextValue = {
  status: SyncStatus;
  lastSyncedAt: number | null;
  syncNow: () => void;
  /** Lets the next account adopt this phone's data (after deleting an account). */
  forgetOwner: () => Promise<void>;
};

const SyncContext = createContext<SyncContextValue | null>(null);

// ── Converting between the phone's format and the database rows ──

type JournalRow = {
  user_id: string;
  id: string;
  question_id: string;
  answer: string;
  mood: Mood | null;
  draft: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type FavoriteRow = {
  user_id: string;
  question_id: string;
  updated_at: string;
  deleted_at: string | null;
};

type ProgressRow = {
  user_id: string;
  deck_id: string;
  remaining: string[];
  picked: string[];
  depth: DepthFilter;
  updated_at: string;
};

const toIso = (ms: number) => new Date(ms).toISOString();
const toMs = (iso: string) => Date.parse(iso);

const journalFromRow = (row: JournalRow): JournalEntry => ({
  id: row.id,
  questionId: row.question_id,
  answer: row.answer,
  mood: row.mood,
  draft: row.draft,
  createdAt: toMs(row.created_at),
  updatedAt: toMs(row.updated_at),
  deletedAt: row.deleted_at ? toMs(row.deleted_at) : null,
});

const journalToRow = (entry: JournalEntry, userId: string): JournalRow => ({
  user_id: userId,
  id: entry.id,
  question_id: entry.questionId,
  answer: entry.answer,
  mood: entry.mood,
  draft: entry.draft,
  created_at: toIso(entry.createdAt),
  updated_at: toIso(entry.updatedAt),
  deleted_at: entry.deletedAt ? toIso(entry.deletedAt) : null,
});

const favoriteFromRow = (row: FavoriteRow): FavoriteRecord => ({
  questionId: row.question_id,
  updatedAt: toMs(row.updated_at),
  deletedAt: row.deleted_at ? toMs(row.deleted_at) : null,
});

const favoriteToRow = (record: FavoriteRecord, userId: string): FavoriteRow => ({
  user_id: userId,
  question_id: record.questionId,
  updated_at: toIso(record.updatedAt),
  deleted_at: record.deletedAt ? toIso(record.deletedAt) : null,
});

// Card ids that no longer exist (e.g. after the question list changes) are dropped.
const progressFromRow = (row: ProgressRow): DeckSession => ({
  remaining: row.remaining.filter((id) => getCard(id)),
  picked: row.picked.filter((id) => getCard(id)),
  depth: row.depth,
  updatedAt: toMs(row.updated_at),
});

const progressToRow = (deckId: string, session: DeckSession, userId: string): ProgressRow => ({
  user_id: userId,
  deck_id: deckId,
  remaining: session.remaining,
  picked: session.picked,
  depth: session.depth,
  updated_at: toIso(session.updatedAt),
});

/** Items whose local copy is newer than the cloud's (or missing from the cloud). */
function newerThanRemote<T extends { updatedAt: number }>(
  local: [string, T][],
  remote: Map<string, { updatedAt: number }>,
) {
  return local.filter(([key, item]) => {
    const cloud = remote.get(key);
    return !cloud || item.updatedAt > cloud.updatedAt;
  });
}

export function SyncProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const journal = useJournal();
  const favorites = useFavorites();
  const progress = useProgress();
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  // The latest local data, read by the async sync so it never works on stale copies.
  const latest = useRef({ journal, favorites, progress, userId: user?.id ?? null });
  useEffect(() => {
    latest.current = { journal, favorites, progress, userId: user?.id ?? null };
  });

  const running = useRef(false);
  const runAgain = useRef(false);

  const syncOnce = useCallback(async (userId: string) => {
    if (!supabase) return;
    const { journal: j, favorites: f, progress: p } = latest.current;

    // If a different account used this phone before, don't upload its data here.
    const owner = await AsyncStorage.getItem(OWNER_KEY);
    const otherAccount = owner !== null && owner !== userId;
    if (otherAccount) {
      j.resetLocal();
      f.resetLocal();
      p.resetLocal();
    }
    await AsyncStorage.setItem(OWNER_KEY, userId);

    const localEntries = otherAccount ? [] : j.allEntries;
    const localFavorites = otherAccount ? [] : f.records;
    const localSessions = otherAccount ? {} : p.sessions;

    // 1. Pull everything this account has in the cloud (Row Level Security limits it to theirs).
    const [journalRes, favoritesRes, progressRes] = await Promise.all([
      supabase.from('journal_entries').select('*'),
      supabase.from('favorites').select('*'),
      supabase.from('deck_progress').select('*'),
    ]);
    const pullError = journalRes.error ?? favoritesRes.error ?? progressRes.error;
    if (pullError) throw pullError;

    const remoteEntries = (journalRes.data as JournalRow[]).map(journalFromRow);
    const remoteFavorites = (favoritesRes.data as FavoriteRow[]).map(favoriteFromRow);
    const remoteSessions = Object.fromEntries(
      (progressRes.data as ProgressRow[]).map((row) => [row.deck_id, progressFromRow(row)]),
    );

    // 2. Bring newer cloud items onto the phone.
    j.mergeRemote(remoteEntries);
    f.mergeRemote(remoteFavorites);
    p.mergeRemote(remoteSessions);

    // 3. Upload what's newer on the phone.
    const entriesToPush = newerThanRemote(
      localEntries.map((entry) => [entry.id, entry] as [string, JournalEntry]),
      new Map(remoteEntries.map((entry) => [entry.id, entry])),
    );
    const favoritesToPush = newerThanRemote(
      localFavorites.map((record) => [record.questionId, record] as [string, FavoriteRecord]),
      new Map(remoteFavorites.map((record) => [record.questionId, record])),
    );
    const sessionsToPush = newerThanRemote(
      Object.entries(localSessions),
      new Map(Object.entries(remoteSessions)),
    );

    const uploads = [];
    if (entriesToPush.length > 0) {
      uploads.push(
        supabase.from('journal_entries').upsert(
          entriesToPush.map(([, entry]) => journalToRow(entry, userId)),
          { onConflict: 'user_id,id' },
        ),
      );
    }
    if (favoritesToPush.length > 0) {
      uploads.push(
        supabase.from('favorites').upsert(
          favoritesToPush.map(([, record]) => favoriteToRow(record, userId)),
          { onConflict: 'user_id,question_id' },
        ),
      );
    }
    if (sessionsToPush.length > 0) {
      uploads.push(
        supabase.from('deck_progress').upsert(
          sessionsToPush.map(([deckId, session]) => progressToRow(deckId, session, userId)),
          { onConflict: 'user_id,deck_id' },
        ),
      );
    }
    const results = await Promise.all(uploads);
    const pushError = results.find((result) => result.error)?.error;
    if (pushError) throw pushError;
  }, []);

  const syncNow = useCallback(async () => {
    if (!supabase) return;
    // One sync at a time; if asked again mid-sync, run once more afterwards.
    if (running.current) {
      runAgain.current = true;
      return;
    }
    running.current = true;
    try {
      do {
        runAgain.current = false;
        const userId = latest.current.userId;
        if (!userId) return;
        setStatus('syncing');
        await syncOnce(userId);
      } while (runAgain.current);
      setStatus('synced');
      setLastSyncedAt(Date.now());
    } catch {
      setStatus('error');
    } finally {
      running.current = false;
    }
  }, [syncOnce]);

  const userId = user?.id ?? null;

  // Sync right after signing in; reset the status after signing out.
  useEffect(() => {
    if (userId) syncNow();
    else setStatus('idle');
  }, [userId, syncNow]);

  // Sync a moment after any change, so typing doesn't send a request per keystroke.
  useEffect(() => {
    if (!userId) return;
    const timer = setTimeout(syncNow, CHANGE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [journal.allEntries, favorites.records, progress.sessions, userId, syncNow]);

  // Sync when the app comes back to the foreground.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && latest.current.userId) syncNow();
    });
    return () => subscription.remove();
  }, [syncNow]);

  const value: SyncContextValue = {
    status,
    lastSyncedAt,
    syncNow,
    forgetOwner: async () => {
      await AsyncStorage.removeItem(OWNER_KEY).catch(() => {});
    },
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) throw new Error('useSync must be used inside SyncProvider');
  return context;
}
