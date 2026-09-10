export function parseDate(value: string) {
  const match = /^(\d{1,2})[/-](\d{1,2})$/.exec(value)
  if (!match) return null
  const month = Number(match[1])
  const day = Number(match[2])
  // No year is supplied; February 29 remains a valid month/day.
  const days = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (month < 1 || month > 12 || day < 1 || day > days[month - 1]) return null
  return { month, day, date: `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}` }
}
