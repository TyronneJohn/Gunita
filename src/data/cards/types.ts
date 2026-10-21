import type { Localized } from '@/i18n/types';

export type Depth = 'light' | 'deeper' | 'deepest';

export type Card = {
  id: string;
  deckId: string;
  depth: Depth;
  question: Localized;
  /** Shown when the card is flipped after reading the question. */
  reflection: Localized;
};

export const depthLabels: Record<Depth, string> = {
  light: 'Light',
  deeper: 'Deeper',
  deepest: 'Deepest',
};

type CardContent = Omit<Card, 'id' | 'deckId'>;

/** Gives each card an id like "sarili-01" based on its position in the list. */
export function defineCards(deckId: string, cards: CardContent[]): Card[] {
  return cards.map((card, i) => ({
    id: `${deckId}-${String(i + 1).padStart(2, '0')}`,
    deckId,
    ...card,
  }));
}
