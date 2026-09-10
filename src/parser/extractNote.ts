export function extractNote(value: string) {
  const start = value.indexOf('(')
  if (start < 0) return { rawShift: value.trim(), note: undefined }
  const note = value.slice(start).trim()
  // Unbalanced or trailing unknown text must be reviewed rather than discarded.
  let depth = 0
  for (const character of note) {
    if (character === '(') depth++
    else if (character === ')') depth--
    else if (depth === 0 && character.trim()) return null
    if (depth < 0) return null
  }
  if (depth !== 0) return null
  return { rawShift: value.slice(0, start).trim(), note }
}
