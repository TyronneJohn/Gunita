import type { TranslationKey } from '@/i18n/en';

import { alaalaCards } from './alaala';
import { barkadaCards } from './barkada';
import { movingOnCards } from './moving-on';
import { pagIbigCards } from './pag-ibig';
import { pamilyaCards } from './pamilya';
import { sariliCards } from './sarili';
import type { Card, Depth } from './types';

export * from './types';

// Sample cards for Phase 2. Replace with the final question list later.
const allCards: Card[] = [
  ...sariliCards,
  ...barkadaCards,
  ...pamilyaCards,
  ...pagIbigCards,
  ...alaalaCards,
  ...movingOnCards,
];

const cardsById = new Map(allCards.map((card) => [card.id, card]));

/** Which depths a player wants to include when drawing from a deck. */
export type DepthFilter = 'light' | 'deeper' | 'all';

const allowedDepths: Record<DepthFilter, Depth[]> = {
  light: ['light'],
  deeper: ['deeper'],
  all: ['light', 'deeper', 'deepest'],
};

/** Translation keys for each filter's label and description. */
export const depthFilterText: Record<
  DepthFilter,
  { label: TranslationKey; description: TranslationKey }
> = {
  light: { label: 'depth.lightLabel', description: 'depth.lightDescription' },
  deeper: { label: 'depth.deeperLabel', description: 'depth.deeperDescription' },
  all: { label: 'depth.allLabel', description: 'depth.allDescription' },
};

export function getCard(id: string) {
  return cardsById.get(id);
}

export function getDeckCards(deckId: string, filter: DepthFilter = 'all') {
  return allCards.filter(
    (card) => card.deckId === deckId && allowedDepths[filter].includes(card.depth),
  );
}
