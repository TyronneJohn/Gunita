import type { TranslationKey } from './en';

// Taglish UI text. Every key in en.ts must exist here too.
export const tl: Record<TranslationKey, string> = {
  'common.back': 'Bumalik',
  'common.close': 'Isara',
  'common.deckNotFoundTitle': 'Hindi makita ang deck',
  'common.deckNotFoundBody': 'Hindi namin mahanap ang deck na ito.',
  'common.deckName': '{deck} deck',

  'splash.tagline': 'mga tanong para sa puso',

  'onboarding.skip': 'Skip',
  'onboarding.next': 'Next',
  'onboarding.begin': 'Simulan na',
  'onboarding.welcomeEyebrow': 'Maligayang pagdating',
  'onboarding.welcomeTitle': 'Kumusta ka, talaga?',
  'onboarding.welcomeBody':
    'Ang Gunita ay isang tahimik na lugar para huminto sandali, magtanong, at makinig sa sarili mo.',
  'onboarding.howEyebrow': 'Paano ito gumagana',
  'onboarding.howTitle': 'Draw. Reflect. Share.',
  'onboarding.howBody':
    'Pumili ng deck, bumunot ng card, at i-flip ito para makita ang isang gentle reflection. Sagutin mo mag-isa, o i-share sa taong pinagkakatiwalaan mo.',
  'onboarding.startEyebrow': 'Tara na',
  'onboarding.startTitle': 'Walang maling sagot dito.',
  'onboarding.startBody': "Basta totoo ka lang — that's more than enough. Tara, simulan na natin.",

  'tabs.home': 'Home',
  'tabs.explore': 'Explore',
  'tabs.favorites': 'Favorites',
  'tabs.journal': 'Journal',
  'tabs.profile': 'Profile',

  'greeting.morning': 'Magandang umaga',
  'greeting.noon': 'Magandang tanghali',
  'greeting.afternoon': 'Magandang hapon',
  'greeting.evening': 'Magandang gabi',

  'home.subtitle': 'Kumusta ka today? Huminga muna tayo sandali.',
  'home.profile': 'Profile',
  'home.dailyQuestion': 'Tanong ng araw',
  'home.newTomorrow': 'Bagong tanong bukas',
  'home.startHere': 'Simulan dito',
  'home.continue': 'Ituloy · {progress} napili',
  'home.featured': 'Featured decks',
  'home.seeAll': 'See all',

  'explore.eyebrow': 'Explore',
  'explore.title': 'Pumili ng deck',
  'explore.subtitle':
    'Bawat deck ay ibang klase ng kwentuhan — with yourself, your barkada, or someone you love.',

  'favorites.eyebrow': 'Favorites',
  'favorites.title': 'Mga paborito mo',
  'favorites.emptyTitle': 'Wala pang naka-save',
  'favorites.emptyBody':
    "Kapag may tanong na tumatak sa'yo, i-tap ang heart sa card at dito na siya titira.",

  'journal.eyebrow': 'My journal',
  'journal.title': 'Ang iyong mga gunita',
  'journal.emptyTitle': 'Naghihintay ang journal mo',
  'journal.emptyBody': "Dito mo maisusulat ang mga sagot mo. Private ito — para sa'yo lang.",

  'profile.eyebrow': 'Profile',
  'profile.title': 'Ikaw',
  'profile.subtitle': 'Parating na ang iba pang settings at account options.',
  'profile.account': 'Account',
  'profile.language': 'Wika',
  'profile.sound': 'Sound effects',
  'profile.appearance': 'Appearance',
  'profile.privacy': 'Privacy',
  'profile.soon': 'Soon',
  'profile.replayOnboarding': 'Ipakita ulit ang onboarding',

  'deck.howDeep': 'Gaano kalalim?',
  'deck.cardCount': '{count} cards',
  'deck.next': 'Next',

  'depth.lightLabel': 'Light lang',
  'depth.deeperLabel': 'Light + Deeper',
  'depth.allLabel': 'Lahat',
  'depth.lightDescription': 'Magaan na kwentuhan, pang-warm up',
  'depth.deeperDescription': 'Medyo personal na, pero chill pa rin',
  'depth.allDescription': 'Hanggang sa pinakamalalim na tanong',

  'play.finished': 'Tapos na',
  'play.shuffle': 'I-shuffle ang natitirang cards',
  'play.pickedCount': '{picked} sa {total} ang napili',
  'play.shuffleToBegin': 'I-shuffle ang deck para magsimula',
  'play.shuffleButton': 'Shuffle',
  'play.shuffling': 'Nagsha-shuffle… tap para i-skip',
  'play.pickCard': 'Pumili ng card',
  'play.doneReading': 'Tapos na',
  'play.completeTitle': 'Natapos mo ang deck! 🌿',
  'play.completeBody':
    '{count} cards mula sa {deck} ({depth}). Salamat sa pagbibigay ng oras sa sarili mo.',
  'play.shuffleAgain': 'Shuffle ulit',
  'play.otherDeck': 'Pumili ng ibang deck',

  'card.tapToDraw': 'Tap para bumunot',
  'card.tapForReflection': 'Tap para sa reflection',
  'card.tapForQuestion': 'Tap para bumalik sa tanong',
  'card.reflection': 'Reflection',
  'card.drawLabel': 'Bumunot ng card',
  'card.flipHint': 'I-tap para i-flip ang card',
};
