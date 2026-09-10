import { extractNote } from './extractNote'
import { isIgnoredDocumentLine, normalizeInput, normalizeLine } from './normalizeInput'
import { parseDate } from './parseDate'
import { parseRole } from './parseRole'
import { parseShift } from './parseShift'
import type { ParseResult, WorkerRole } from './types'

export function isShiftLine(line: string): boolean {
  return /^\d{1,4}\s*[/-]\s*\d/.test(line) || /\b\d+\s*[ap](?:m)?\s*-/i.test(line)
}

function isFacilityCandidate(line: string): boolean {
  return Boolean(line) && !parseRole(line) && !isShiftLine(line) && !isIgnoredDocumentLine(line)
    && !/^(?:LPNs?|LVNs?|RPNs?|staff|needs|shifts):?$/i.test(line)
    && !/[?()[\]=]/.test(line) && !/\b(?:needed|shift|unknown|tbd)\b/i.test(line)
}

export function parseStaffingInput(input: string): ParseResult {
  const lines = normalizeInput(input)
  const result: ParseResult = { records: [], reviewLines: [] }
  let currentFacility: string | null = null
  let currentRole: WorkerRole | null = null

  lines.forEach((originalLine, index) => {
    const line = normalizeLine(originalLine)
    if (!line || isIgnoredDocumentLine(line)) return
    const role = parseRole(line)
    if (role) { currentRole = role; return }

    if (isShiftLine(line)) {
      const row = /^(\d{1,2}[/-]\d{1,2})\s*-\s*(.+)$/.exec(line)
      const date = row && parseDate(row[1])
      // Extract notes from the original to preserve punctuation and wording.
      const rawRow = /^(\d{1,2}[/-]\d{1,2})\s*[-\u2010-\u2015\u2212]\s*(.+)$/.exec(originalLine)
      const details = rawRow && extractNote(rawRow[2])
      const shifts = details && currentRole ? parseShift(details.rawShift, currentRole) : null
      if (!currentFacility || !currentRole || !date || !details || !shifts) {
        result.reviewLines.push(originalLine)
        return
      }
      // All-zero rows are recognized, but have no available shifts to publish.
      if (shifts.length) result.records.push({ facility: currentFacility, role: currentRole, ...date, shifts, note: details.note, originalLine })
      else if (details.note) result.reviewLines.push(originalLine)
      return
    }

    const next = lines.slice(index + 1).find(candidate => candidate && !isIgnoredDocumentLine(candidate))
    if (isFacilityCandidate(line) && next && (parseRole(normalizeLine(next)) || (currentRole && isShiftLine(normalizeLine(next))))) {
      currentFacility = originalLine.replace(/:$/, '').trim()
      return
    }
    // Unknown headings (including parent companies) are visible for review.
    // Clear context so subsequent rows cannot silently inherit a wrong facility.
    result.reviewLines.push(originalLine)
    currentFacility = null
    currentRole = null
  })
  return result
}
