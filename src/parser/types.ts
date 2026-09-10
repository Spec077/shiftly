export type WorkerRole = 'CNA' | 'NURSE'
export type ShiftCode = 'AM' | 'PM' | 'NOC'
export interface ParsedShift {
  facility: string
  role: WorkerRole
  date: string
  month: number
  day: number
  shifts: ShiftCode[]
  note?: string
  originalLine: string
}
export interface ParseResult {
  records: ParsedShift[]
  reviewLines: string[]
}
export interface FacilityShiftGroup {
  facility: string
  entries: ParsedShift[]
}
export type GroupedOutput = Record<WorkerRole, FacilityShiftGroup[]>
