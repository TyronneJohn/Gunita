import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type { Mood } from '@/data/moods';

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
};

type EntryInput = Pick<JournalEntry, 'id' | 'questionId' | 'answer' | 'mood' | 'draft'>;

type JournalContextValue = {
  loaded: boolean;
  /** All entries, newest first. */
  entries: JournalEntry[];
  getEntry: (id: string) => JournalEntry | undefined;
  getEntriesForQuestion: (questionId: string) => JournalEntry[];
  /** Creates the entry, or updates it if the id already exists. */
  saveEntry: (entry: EntryInput) => void;
  deleteEntry: (id: string) => void;
  answeredToday: (questionId: string) => boolean;
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
        setEntries(Array.isArray(parsed) ? (parsed as JournalEntry[]) : []);
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
          entry.id === input.id ? { ...entry, ...input, updatedAt: now } : entry,
        );
      }
      return [{ ...input, createdAt: now, updatedAt: now }, ...current];
    });
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => (prev ?? []).filter((entry) => entry.id !== id));
  }, []);

  const list = entries ?? [];

  const value: JournalContextValue = {
    loaded: entries !== null,
    entries: list,
    getEntry: (id) => list.find((entry) => entry.id === id),
    getEntriesForQuestion: (questionId) => list.filter((entry) => entry.questionId === questionId),
    saveEntry,
    deleteEntry,
    answeredToday: (questionId) =>
      list.some(
        (entry) => entry.questionId === questionId && !entry.draft && isToday(entry.createdAt),
      ),
  };

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
}

export function useJournal() {
  const context = useContext(JournalContext);
  if (!context) throw new Error('useJournal must be used inside JournalProvider');
  return context;
}
