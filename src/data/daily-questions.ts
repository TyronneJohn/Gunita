import { defineCards } from './cards/types';

// Sample daily questions. They behave like regular cards (with ids like
// "daily-01") so they can be saved to favorites and answered in the journal.
const dailyContent = defineCards('daily', [
  {
    depth: 'light',
    question: {
      en: 'What small thing made you happy this week?',
      tl: "Ano ang maliit na bagay na nagpasaya sa'yo this week?",
    },
    reflection: {
      en: 'Noticing small joys is how we learn to hold on to them.',
      tl: 'Ang pagpansin sa maliliit na saya ang paraan para mahawakan natin sila.',
    },
  },
  {
    depth: 'light',
    question: {
      en: "What's something you're proud of but rarely talk about?",
      tl: 'Ano ang isang bagay na proud ka pero bihira mong pag-usapan?',
    },
    reflection: {
      en: "You're allowed to be proud out loud. Your wins matter, even the quiet ones.",
      tl: 'Okay lang maging proud nang malakas. Mahalaga ang mga tagumpay mo, kahit ang mga tahimik.',
    },
  },
  {
    depth: 'light',
    question: {
      en: 'Who do you want to thank today, and why?',
      tl: 'Sino ang taong gusto mong pasalamatan ngayon, at bakit?',
    },
    reflection: {
      en: "Gratitude grows when it's shared. Maybe send them a message today.",
      tl: 'Lumalago ang pasasalamat kapag ibinabahagi. Baka pwede mo silang i-message ngayon.',
    },
  },
  {
    depth: 'light',
    question: {
      en: 'If you could talk to your younger self, what would you say?',
      tl: 'Kung makakausap mo ang batang ikaw, ano ang sasabihin mo sa kanya?',
    },
    reflection: {
      en: "The child you were would be glad you're still listening to them.",
      tl: 'Matutuwa ang batang ikaw na pinakikinggan mo pa rin siya.',
    },
  },
  {
    depth: 'light',
    question: {
      en: 'What does rest look like for you lately?',
      tl: "Ano ang itsura ng pahinga para sa'yo nitong mga nakaraang araw?",
    },
    reflection: {
      en: "Rest isn't a reward you have to earn. It's something you need, and deserve.",
      tl: 'Ang pahinga ay hindi premyo na kailangang paghirapan. Kailangan mo ito, at deserve mo ito.',
    },
  },
  {
    depth: 'light',
    question: {
      en: 'Which memory do you keep going back to when you are tired?',
      tl: 'Anong alaala ang lagi mong binabalikan kapag pagod ka?',
    },
    reflection: {
      en: 'The memories we return to are often the ones that remind us who we are.',
      tl: 'Ang mga alaalang binabalikan natin ay kadalasang nagpapaalala kung sino tayo.',
    },
  },
  {
    depth: 'light',
    question: {
      en: "What's one thing you're slowly learning to let go of?",
      tl: 'Ano ang isang bagay na dahan-dahan mong natututunang bitawan?',
    },
    reflection: {
      en: 'Slowly still counts. Every little bit of letting go makes room to breathe.',
      tl: "Kahit dahan-dahan, binibilang pa rin 'yan. Bawat kaunting pagbitaw ay nagbibigay ng puwang para huminga.",
    },
  },
]);

/** Which deck's colors and icon each daily question borrows. */
const dailyDeckIds = ['sarili', 'sarili', 'pamilya', 'alaala', 'sarili', 'alaala', 'moving-on'];

export const dailyCards = dailyContent.map((card, i) => ({ ...card, deckId: dailyDeckIds[i] }));

/** Same question for everyone on the same day, changes at local midnight. */
export function getDailyQuestion(date: Date) {
  const localDay = Math.floor((date.getTime() - date.getTimezoneOffset() * 60_000) / 86_400_000);
  return dailyCards[localDay % dailyCards.length];
}
