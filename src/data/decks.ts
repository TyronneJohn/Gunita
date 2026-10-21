import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import { colors } from '@/constants/theme';
import type { Localized } from '@/i18n/types';

export type Deck = {
  id: string;
  /** Deck names stay in Filipino in every language — they're part of Gunita's character. */
  title: string;
  tagline: Localized;
  description: Localized;
  icon: ComponentProps<typeof Ionicons>['name'];
  color: string;
};

// Sample decks. Real names and questions will replace these later.
export const decks: Deck[] = [
  {
    id: 'sarili',
    title: 'Sarili',
    tagline: {
      en: 'For you, about you',
      tl: "Para sa'yo, tungkol sa'yo",
    },
    description: {
      en: 'Questions to help you get to know yourself again — your dreams, your fears, and the small things that make you, you.',
      tl: 'Mga tanong para kilalanin ulit ang sarili mo — your dreams, your fears, and the small things that make you, you.',
    },
    icon: 'leaf-outline',
    color: colors.sage,
  },
  {
    id: 'barkada',
    title: 'Barkada',
    tagline: {
      en: 'Conversations with your people',
      tl: 'Kwentuhan with your people',
    },
    description: {
      en: 'Light to deep questions for late-night talks with friends. Perfect for road trips, sleepovers, and hangouts.',
      tl: 'Light to deep questions for late-night kwentuhan with friends. Perfect for road trips, sleepovers, at inuman sessions.',
    },
    icon: 'people-outline',
    color: colors.clay,
  },
  {
    id: 'pamilya',
    title: 'Pamilya',
    tagline: {
      en: 'Questions for home',
      tl: 'Mga tanong para sa tahanan',
    },
    description: {
      en: 'Get to know your family beyond the usual "Have you eaten?" — stories, lessons, and memories worth passing on.',
      tl: 'Get to know your family beyond the usual "Kumain ka na?" — stories, lessons, and memories worth passing on.',
    },
    icon: 'home-outline',
    color: colors.sand,
  },
  {
    id: 'pag-ibig',
    title: 'Pag-ibig',
    tagline: {
      en: 'For partners and the heart',
      tl: 'Para sa magkasintahan at sa puso',
    },
    description: {
      en: 'Questions for couples — from giddy beginnings to the quiet, steady kind of love. To help you know each other even more.',
      tl: 'Questions for couples — from kilig beginnings to the quiet, steady kind of love. Para mas lalo kayong magkakilala.',
    },
    icon: 'heart-outline',
    color: colors.rose,
  },
  {
    id: 'alaala',
    title: 'Alaala',
    tagline: {
      en: 'Revisit your memories',
      tl: 'Balikan ang mga gunita',
    },
    description: {
      en: "Revisit the moments that shaped you — childhood, first times, and the people you'll never forget.",
      tl: 'Revisit the moments that shaped you — childhood, first times, at mga taong hindi mo makakalimutan.',
    },
    icon: 'time-outline',
    color: colors.dusk,
  },
  {
    id: 'moving-on',
    title: 'Moving On',
    tagline: {
      en: 'Healing, letting go, and rising again',
      tl: 'Healing, letting go, at pagbangon',
    },
    description: {
      en: "Gentle questions for when you're learning to let go, forgive, or start again. Take it slow — no pressure.",
      tl: 'Gentle questions for when you are learning to let go, forgive, or start again. Dahan-dahan lang, walang pressure.',
    },
    icon: 'sunny-outline',
    color: colors.mist,
  },
];

export function getDeck(id: string) {
  return decks.find((deck) => deck.id === id);
}
