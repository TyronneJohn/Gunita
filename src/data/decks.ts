import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import { colors } from '@/constants/theme';

export type Deck = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  color: string;
};

// Sample decks for Phase 1. Real names and questions will replace these later.
export const decks: Deck[] = [
  {
    id: 'sarili',
    title: 'Sarili',
    tagline: "Para sa'yo, tungkol sa'yo",
    description:
      'Mga tanong para kilalanin ulit ang sarili mo — your dreams, your fears, and the small things that make you, you.',
    icon: 'leaf-outline',
    color: colors.sage,
  },
  {
    id: 'barkada',
    title: 'Barkada',
    tagline: 'Kwentuhan with your people',
    description:
      'Light to deep questions for late-night kwentuhan with friends. Perfect for road trips, sleepovers, at inuman sessions.',
    icon: 'people-outline',
    color: colors.clay,
  },
  {
    id: 'pamilya',
    title: 'Pamilya',
    tagline: 'Mga tanong para sa tahanan',
    description:
      'Get to know your family beyond the usual "Kumain ka na?" — stories, lessons, and memories worth passing on.',
    icon: 'home-outline',
    color: colors.sand,
  },
  {
    id: 'pag-ibig',
    title: 'Pag-ibig',
    tagline: 'For partners and the heart',
    description:
      'Questions for couples — from kilig beginnings to the quiet, steady kind of love. Para mas lalo kayong magkakilala.',
    icon: 'heart-outline',
    color: colors.rose,
  },
  {
    id: 'alaala',
    title: 'Alaala',
    tagline: 'Balikan ang mga gunita',
    description:
      'Revisit the moments that shaped you — childhood, first times, at mga taong hindi mo makakalimutan.',
    icon: 'time-outline',
    color: colors.dusk,
  },
  {
    id: 'moving-on',
    title: 'Moving On',
    tagline: 'Healing, letting go, at pagbangon',
    description:
      'Gentle questions for when you are learning to let go, forgive, or start again. Dahan-dahan lang, walang pressure.',
    icon: 'sunny-outline',
    color: colors.mist,
  },
];

export function getDeck(id: string) {
  return decks.find((deck) => deck.id === id);
}
