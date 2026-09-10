import { normalizeLine } from './normalizeInput'
import type { ShiftCode, WorkerRole } from './types'

const shiftOrder: ShiftCode[] = ['AM', 'PM', 'NOC']

function parseCounts(value: string, length: number): ShiftCode[] | null {
  const parts = value.split('/').map(part => part.trim())
  if (parts.length !== length || parts.some(part => !/^\d+$/.test(part))) return null
  return shiftOrder.filter((_, index) => index < length && Number(parts[index]) > 0)
}

export function parseThreeShiftCount(value: string) { return parseCounts(value, 3) }
export function parseTwoShiftCount(value: string) { return parseCounts(value, 2) }

export function parseExplicitTime(value: string): ShiftCode[] | null {
  const normalized = normalizeLine(value).toLowerCase().replace(/\s/g, '').replace(/:00/g, '').replace(/([ap])m?/g, '$1m')
  const times: Record<string, ShiftCode> = { '7am-3pm': 'AM', '3pm-11pm': 'PM', '11pm-7am': 'NOC' }
  const segments = normalized.split(/[,;]/)
  if (segments.some(segment => !times[segment])) return null
  return shiftOrder.filter(shift => segments.some(segment => times[segment] === shift))
}

export function parseShift(value: string, role: WorkerRole): ShiftCode[] | null {
  return parseThreeShiftCount(value) ?? (role === 'NURSE' ? parseTwoShiftCount(value) : null) ?? parseExplicitTime(value)
}
