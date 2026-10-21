import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import type { Mood } from '@/data/moods';
import { mergeNewer } from '@/lib/merge';

const STORAGE_KEY = 'gunita:journal';

export type JournalEntry = {
  id: string;
  questionId: string;
  answer: string;
  mood: Mood | null;
  createdAt: number;
  updatedAt: number;
  /** True while the entry is auto-saved but not yet saved on purpose. */
  draft: boolean;
  /**
   * Set when the entry is deleted. The entry is kept (with its text cleared)
   * so the delete can sync to the cloud and other phones.
   */
  deletedAt: number | null;
};

type EntryInput = Pick<JournalEntry, 'id' | 'questionId' | 'answer' | 'mood' | 'draft'>;

type JournalContextValue = {
  loaded: boolean;
  /** Entries that aren't deleted, newest first. */
  entries: JournalEntry[];
  getEntry: (id: string) => JournalEntry | undefined;
  getEntriesForQuestion: (questionId: string) => JournalEntry[];
  /** Creates the entry, or updates it if the id already exists. */
  saveEntry: (entry: EntryInput) => void;
  deleteEntry: (id: string) => void;
  answeredToday: (questionId: string) => boolean;
  /** Every entry including deleted ones, for syncing. */
  allEntries: JournalEntry[];
  /** Applies entries from the cloud, keeping whichever version is newer. */
  mergeRemote: (incoming: JournalEntry[]) => void;
  /** Clears the journal on this phone (used when a different account signs in). */
  resetLocal: () => void;
};

const JournalContext = createContext<JournalContextValue | null>(null);

export function newEntryId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function isToday(timestamp: number) {
  return new Date(timestamp).toDateString() === new Date().toDateString();
}

export function JournalProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[] | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        // Older saves had no deletedAt field.
        setEntries(
          Array.isArray(parsed)
            ? (parsed as JournalEntry[]).map((entry) => ({
                ...entry,
                deletedAt: entry.deletedAt ?? null,
              }))
            : [],
        );
      })
      .catch(() => setEntries([]));
  }, []);

  useEffect(() => {
    if (entries) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries)).catch(() => {});
  }, [entries]);

  // Stable so screens can auto-save without re-triggering their own effects.
  const saveEntry = useCallback((input: EntryInput) => {
    setEntries((prev) => {
      const current = prev ?? [];
      const now = Date.now();
      const existing = current.find((entry) => entry.id === input.id);
      if (existing) {
        return current.map((entry) =>
          entry.id === input.id ? { ...entry, ...input, updatedAt: now, deletedAt: null } : entry,
        );
      }
      return [{ ...input, createdAt: now, updatedAt: now, deletedAt: null }, ...current];
    });
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) =>
      (prev ?? []).map((entry) => {
        if (entry.id !== id) return entry;
        const now = Date.now();
        // Clear the words right away; only the marker stays for syncing.
        return { ...entry, answer: '', mood: null, updatedAt: now, deletedAt: now };
      }),
    );
  }, []);

  const mergeRemote = useCallback((incoming: JournalEntry[]) => {
    setEntries((prev) => mergeNewer(prev ?? [], incoming, (entry) => entry.id));
  }, []);

  const resetLocal = useCallback(() => setEntries([]), []);

  const all = entries ?? [];
  const visible = all
    .filter((entry) => entry.deletedAt === null)
    .sort((a, b) => b.createdAt - a.createdAt);

  const value: JournalContextValue = {
    loaded: entries !== null,
    entries: visible,
    getEntry: (id) => visible.find((entry) => entry.id === id),
    getEntriesForQuestion: (questionId) =>
      visible.filter((entry) => entry.questionId === questionId),
    saveEntry,
    deleteEntry,
    answeredToday: (questionId) =>
      visible.some(
        (entry) => entry.questionId === questionId && !entry.draft && isToday(entry.createdAt),
      ),
    allEntries: all,
    mergeRemote,
    resetLocal,
  };

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
}

export function useJournal() {
  const context = useContext(JournalContext);
  if (!context) throw new Error('useJournal must be used inside JournalProvider');
  return context;
}
