import type { GroupedOutput, WorkerRole } from './types'

export function formatOutput(grouped: GroupedOutput, selectedRole?: WorkerRole): string {
  const roles: WorkerRole[] = selectedRole ? [selectedRole] : ['CNA', 'NURSE']
  return roles.filter(role => grouped[role].length).map(role => {
    const facilities = grouped[role].map(group => [group.facility, ...group.entries.map(entry => `${entry.date} - ${entry.shifts.join(', ')}${entry.note ? ` ${entry.note}` : ''}`)].join('\n')).join('\n\n')
    return `${role === 'CNA' ? 'CNA' : 'Nurse'}\n\n${facilities}`
  }).join('\n\n\n')
}
