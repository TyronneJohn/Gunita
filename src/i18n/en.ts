// English UI text. This is the default language and the source of all keys.
// Use {name} placeholders for values filled in at runtime.
export const en = {
  'common.back': 'Go back',
  'common.close': 'Close',
  'common.deckNotFoundTitle': 'Deck not found',
  'common.deckNotFoundBody': "We couldn't find this deck.",
  'common.deckName': '{deck} deck',

  'splash.tagline': 'questions for the heart',

  'onboarding.skip': 'Skip',
  'onboarding.next': 'Next',
  'onboarding.begin': "Let's begin",
  'onboarding.welcomeEyebrow': 'Welcome',
  'onboarding.welcomeTitle': 'How are you, really?',
  'onboarding.welcomeBody': 'Gunita is a quiet place to pause, ask, and listen to yourself.',
  'onboarding.howEyebrow': 'How it works',
  'onboarding.howTitle': 'Draw. Reflect. Share.',
  'onboarding.howBody':
    'Pick a deck, draw a card, and flip it to reveal a gentle reflection. Answer on your own, or share it with someone you trust.',
  'onboarding.startEyebrow': "Let's go",
  'onboarding.startTitle': 'There are no wrong answers here.',
  'onboarding.startBody': "Just be honest — that's more than enough. Let's begin.",

  'tabs.home': 'Home',
  'tabs.explore': 'Explore',
  'tabs.favorites': 'Favorites',
  'tabs.journal': 'Journal',
  'tabs.profile': 'Profile',

  'greeting.morning': 'Good morning',
  'greeting.noon': 'Good afternoon',
  'greeting.afternoon': 'Good afternoon',
  'greeting.evening': 'Good evening',

  'home.subtitle': "How are you today? Let's take a breath first.",
  'home.profile': 'Profile',
  'home.dailyQuestion': 'Question of the day',
  'home.newTomorrow': 'New question tomorrow',
  'home.startHere': 'Start here',
  'home.continue': 'Continue · {progress} picked',
  'home.featured': 'Featured decks',
  'home.seeAll': 'See all',

  'explore.eyebrow': 'Explore',
  'explore.title': 'Choose a deck',
  'explore.subtitle':
    'Each deck is a different kind of conversation — with yourself, your friends, or someone you love.',

  'favorites.eyebrow': 'Favorites',
  'favorites.title': 'Your favorites',
  'favorites.emptyTitle': 'Nothing saved yet',
  'favorites.emptyBody':
    'When a question stays with you, tap the heart on the card and it will live here.',

  'journal.eyebrow': 'My journal',
  'journal.title': 'Your memories',
  'journal.emptyTitle': 'Your journal is waiting',
  'journal.emptyBody': "This is where you'll write your answers. It's private — just for you.",

  'profile.eyebrow': 'Profile',
  'profile.title': 'You',
  'profile.subtitle': 'More settings and account options are on the way.',
  'profile.account': 'Account',
  'profile.language': 'Language',
  'profile.sound': 'Sound effects',
  'profile.appearance': 'Appearance',
  'profile.privacy': 'Privacy',
  'profile.soon': 'Soon',
  'profile.replayOnboarding': 'Show onboarding again',

  'deck.howDeep': 'How deep?',
  'deck.cardCount': '{count} cards',
  'deck.next': 'Next',

  'depth.lightLabel': 'Light only',
  'depth.deeperLabel': 'Light + Deeper',
  'depth.allLabel': 'All',
  'depth.lightDescription': 'Easy conversation, a gentle warm-up',
  'depth.deeperDescription': 'A little more personal, still relaxed',
  'depth.allDescription': 'All the way to the deepest questions',

  'play.finished': 'Done',
  'play.shuffle': 'Shuffle remaining cards',
  'play.pickedCount': '{picked} of {total} picked',
  'play.shuffleToBegin': 'Shuffle the deck to begin',
  'play.shuffleButton': 'Shuffle',
  'play.shuffling': 'Shuffling… tap to skip',
  'play.pickCard': 'Pick a card',
  'play.doneReading': 'Done',
  'play.completeTitle': 'You finished the deck! 🌿',
  'play.completeBody':
    '{count} cards from {deck} ({depth}). Thank you for giving yourself this time.',
  'play.shuffleAgain': 'Shuffle again',
  'play.otherDeck': 'Choose another deck',

  'card.tapToDraw': 'Tap to draw',
  'card.tapForReflection': 'Tap for the reflection',
  'card.tapForQuestion': 'Tap to see the question again',
  'card.reflection': 'Reflection',
  'card.drawLabel': 'Draw card',
  'card.flipHint': 'Tap to flip the card',
};

export type TranslationKey = keyof typeof en;
