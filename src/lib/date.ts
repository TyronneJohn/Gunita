import type { TranslationKey } from '@/i18n/en';
import type { Language } from '@/i18n/types';

const DAYS: Record<Language, string[]> = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  tl: ['Linggo', 'Lunes', 'Martes', 'Miyerkules', 'Huwebes', 'Biyernes', 'Sabado'],
};

const MONTHS: Record<Language, string[]> = {
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  tl: [
    'Enero',
    'Pebrero',
    'Marso',
    'Abril',
    'Mayo',
    'Hunyo',
    'Hulyo',
    'Agosto',
    'Setyembre',
    'Oktubre',
    'Nobyembre',
    'Disyembre',
  ],
};

export function getGreetingKey(date: Date): TranslationKey {
  const hour = date.getHours();
  if (hour >= 4 && hour < 11) return 'greeting.morning';
  if (hour >= 11 && hour < 13) return 'greeting.noon';
  if (hour >= 13 && hour < 18) return 'greeting.afternoon';
  return 'greeting.evening';
}

/** Short pieces for a calendar-style date block, e.g. { month: "OCT", day: "22", weekday: "Thu" }. */
export function getDateParts(date: Date, language: Language) {
  return {
    month: MONTHS[language][date.getMonth()].slice(0, 3).toUpperCase(),
    day: String(date.getDate()),
    weekday: DAYS[language][date.getDay()].slice(0, 3),
  };
}

/** e.g. "October 2026" or "Oktubre 2026" */
export function formatMonthYear(date: Date, language: Language) {
  return `${MONTHS[language][date.getMonth()]} ${date.getFullYear()}`;
}

/** e.g. "Thursday, October 22" or "Huwebes, Oktubre 22" */
export function formatLongDate(date: Date, language: Language) {
  return `${DAYS[language][date.getDay()]}, ${MONTHS[language][date.getMonth()]} ${date.getDate()}`;
}
