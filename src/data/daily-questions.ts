import type { Localized } from '@/i18n/types';

export type DailyQuestion = {
  text: Localized;
  deckId: string;
};

// Sample daily questions.
export const dailyQuestions: DailyQuestion[] = [
  {
    text: {
      en: 'What small thing made you happy this week?',
      tl: "Ano ang maliit na bagay na nagpasaya sa'yo this week?",
    },
    deckId: 'sarili',
  },
  {
    text: {
      en: "What's something you're proud of but rarely talk about?",
      tl: 'Ano ang isang bagay na proud ka pero bihira mong pag-usapan?',
    },
    deckId: 'sarili',
  },
  {
    text: {
      en: 'Who do you want to thank today, and why?',
      tl: 'Sino ang taong gusto mong pasalamatan ngayon, at bakit?',
    },
    deckId: 'pamilya',
  },
  {
    text: {
      en: 'If you could talk to your younger self, what would you say?',
      tl: 'Kung makakausap mo ang batang ikaw, ano ang sasabihin mo sa kanya?',
    },
    deckId: 'alaala',
  },
  {
    text: {
      en: 'What does rest look like for you lately?',
      tl: "Ano ang itsura ng pahinga para sa'yo nitong mga nakaraang araw?",
    },
    deckId: 'sarili',
  },
  {
    text: {
      en: 'Which memory do you keep going back to when you are tired?',
      tl: 'Anong alaala ang lagi mong binabalikan kapag pagod ka?',
    },
    deckId: 'alaala',
  },
  {
    text: {
      en: "What's one thing you're slowly learning to let go of?",
      tl: 'Ano ang isang bagay na dahan-dahan mong natututunang bitawan?',
    },
    deckId: 'moving-on',
  },
];

/** Same question for everyone on the same day, changes at local midnight. */
export function getDailyQuestion(date: Date): DailyQuestion {
  const localDay = Math.floor(
    (date.getTime() - date.getTimezoneOffset() * 60_000) / 86_400_000,
  );
  return dailyQuestions[localDay % dailyQuestions.length];
}
