// Explicit aliases only: unknown facilities remain usable without fuzzy guesses.
const facilities: [string, ...string[]][] = [
  ['Ambassador'],
  ['American House Mount Prospect'],
  ['Belhaven Nursing Home', 'Belhaven'],
  ['Downers Grove Senior Living'],
  ['Midway Neurological & Rehab', 'Midway'],
  ['Momence Meadows Nursing Center', 'Momence'],
  ['Niles Nursing & Rehabilitation Center', 'Niles'],
  ['Oak Lawn'],
  ['Parker Nursing and Rehabilitation Center', 'Parker'],
  ['Parkshore'],
  ['Pearl of Orchard Valley'],
  ['Pearl of Crystal Lake'],
  ['Pearl of Elk Grove', 'PEG'],
  ['Pearl of Evanston', 'POE'],
  ['Pearl of Fox River', 'POFR'],
  ['Pearl of Montclare', 'POM'],
  ['Pearl of St Charles', 'POSC'],
  ['Maplecrest'],
  ['West Suburban', 'Suburban'],
]

function cleanName(value: string): string {
  return value.replace(/&(?:#x20|#32|nbsp);/gi, ' ').replace(/&amp;/gi, '&')
    .replace(/\s*&\s*/g, ' & ').replace(/\s+/g, ' ').trim()
}

const aliases = new Map(facilities.flatMap(([name, ...shortNames]) =>
  [name, ...shortNames].map(alias => [cleanName(alias).toLowerCase(), name] as const),
))

export function normalizeFacility(value: string): string {
  const cleaned = cleanName(value)
  return aliases.get(cleaned.toLowerCase()) ?? cleaned
}
