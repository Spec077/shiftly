import type { WorkerRole } from './types'

export function parseRole(line: string): WorkerRole | null {
  const role = line.trim().replace(/:$/, '').toUpperCase()
  if (role === 'CNA') return 'CNA'
  if (['NURSE', 'NURSES', 'RN', 'RNS'].includes(role)) return 'NURSE'
  return null
}
