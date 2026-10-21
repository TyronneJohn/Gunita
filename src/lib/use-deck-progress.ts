import { isSessionActive, sessionTotal, useProgress } from '@/lib/progress';

/** Returns a "3/12" (picked / total) label for decks that are in progress. */
export function useDeckProgressLabel() {
  const { getSession } = useProgress();
  return (deckId: string) => {
    const session = getSession(deckId);
    return isSessionActive(session)
      ? `${session.picked.length}/${sessionTotal(session)}`
      : undefined;
  };
}
