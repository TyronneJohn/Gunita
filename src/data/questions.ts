import { getCard, type Card } from './cards';
import { dailyCards } from './daily-questions';
import { getDeck, type Deck } from './decks';

const dailyById = new Map(dailyCards.map((card) => [card.id, card]));

/**
 * Finds any question the player can save or answer — deck cards and daily
 * questions alike — together with the deck whose look it uses.
 */
export function getQuestion(id: string): { card: Card; deck: Deck } | undefined {
  const card = getCard(id) ?? dailyById.get(id);
  const deck = card && getDeck(card.deckId);
  return card && deck ? { card, deck } : undefined;
}
