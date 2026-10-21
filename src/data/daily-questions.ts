export type DailyQuestion = {
  text: string;
  deckId: string;
};

// Sample daily questions for Phase 1.
export const dailyQuestions: DailyQuestion[] = [
  { text: "Ano ang maliit na bagay na nagpasaya sa'yo this week?", deckId: 'sarili' },
  { text: "What's something you're proud of but rarely talk about?", deckId: 'sarili' },
  { text: 'Sino ang taong gusto mong pasalamatan ngayon, at bakit?', deckId: 'pamilya' },
  { text: 'Kung makakausap mo ang batang ikaw, ano ang sasabihin mo sa kanya?', deckId: 'alaala' },
  { text: 'What does rest look like for you lately?', deckId: 'sarili' },
  { text: 'Anong alaala ang lagi mong binabalikan kapag pagod ka?', deckId: 'alaala' },
  { text: "What's one thing you're slowly learning to let go of?", deckId: 'moving-on' },
];

/** Same question for everyone on the same day, changes at local midnight. */
export function getDailyQuestion(date: Date): DailyQuestion {
  const localDay = Math.floor(
    (date.getTime() - date.getTimezoneOffset() * 60_000) / 86_400_000,
  );
  return dailyQuestions[localDay % dailyQuestions.length];
}
