export function normalizeInput(input: string): string[] {
  return input.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n').map(line => line.trim())
}

export function normalizeLine(line: string): string {
  return line.replace(/[\u2010-\u2015\u2212]/g, '-').replace(/\u00a0/g, ' ').trim()
}

export function isIgnoredDocumentLine(line: string): boolean {
  return /^(?:(?:hi|hello|hey)(?:\s+(?:team|all|everyone))?[!,. ]*|good\s+(?:morning|afternoon|evening)[!,. ]*|thank\s+you\b.*|thanks[!,. ]*|(?:please|kindly)\s+(?:assist|help)\b.*|list\s+of\s+needs\b.*)$/i.test(line)
}
