import type { GroupedOutput, ParsedShift, WorkerRole } from './types'
import { normalizeFacility } from './normalizeFacility'

export function groupByRoleAndFacility(records: ParsedShift[]): GroupedOutput {
  const grouped: GroupedOutput = { CNA: [], NURSE: [] }
  for (const record of records) {
    const facility = normalizeFacility(record.facility)
    const key = facility.toLocaleLowerCase()
    let group = grouped[record.role].find(item => item.facility.toLocaleLowerCase().replace(/\s+/g, ' ') === key)
    if (!group) { group = { facility, entries: [] }; grouped[record.role].push(group) }
    group.entries.push({ ...record, facility })
  }
  for (const role of ['CNA', 'NURSE'] as WorkerRole[]) {
    grouped[role].forEach(group => group.entries.sort((a, b) => a.month - b.month || a.day - b.day))
  }
  return grouped
}
