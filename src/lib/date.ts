const DAYS = ['Linggo', 'Lunes', 'Martes', 'Miyerkules', 'Huwebes', 'Biyernes', 'Sabado'];
const MONTHS = [
  'Enero',
  'Pebrero',
  'Marso',
  'Abril',
  'Mayo',
  'Hunyo',
  'Hulyo',
  'Agosto',
  'Setyembre',
  'Oktubre',
  'Nobyembre',
  'Disyembre',
];

export function getGreeting(date: Date) {
  const hour = date.getHours();
  if (hour >= 4 && hour < 11) return 'Magandang umaga';
  if (hour >= 11 && hour < 13) return 'Magandang tanghali';
  if (hour >= 13 && hour < 18) return 'Magandang hapon';
  return 'Magandang gabi';
}

/** e.g. "Huwebes, Oktubre 22" */
export function formatLongDate(date: Date) {
  return `${DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
}
