import type { TranslationKey } from '@/i18n/en';

export type Mood = 'calm' | 'hopeful' | 'heavy' | 'grateful';

export const moods: { id: Mood; emoji: string; label: TranslationKey }[] = [
  { id: 'calm', emoji: '🌿', label: 'mood.calm' },
  { id: 'hopeful', emoji: '☀️', label: 'mood.hopeful' },
  { id: 'heavy', emoji: '🌧', label: 'mood.heavy' },
  { id: 'grateful', emoji: '💛', label: 'mood.grateful' },
];

export function getMood(id: Mood | null) {
  return moods.find((mood) => mood.id === id);
}
