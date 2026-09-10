import { expect, it } from 'vitest'
import { normalizeFacility } from '../parser/normalizeFacility'
import { parseStaffingInput } from '../parser/parseStaffingInput'
import { groupByRoleAndFacility } from '../parser/groupResults'
import { formatOutput } from '../parser/formatOutput'

it.each([
  ['Suburban', 'West Suburban'],
  ['Niles', 'Niles Nursing & Rehabilitation Center'],
  ['POM', 'Pearl of Montclare'],
  ['POFR', 'Pearl of Fox River'],
  ['POE', 'Pearl of Evanston'],
  ['PEG', 'Pearl of Elk Grove'],
  ['Parker', 'Parker Nursing and Rehabilitation Center'],
  ['POSC', 'Pearl of St Charles'],
  ['Belhaven', 'Belhaven Nursing Home'],
  ['Midway', 'Midway Neurological & Rehab'],
  ['Momence', 'Momence Meadows Nursing Center'],
])('expands %s consistently', (alias, fullName) => {
  expect(normalizeFacility(alias)).toBe(fullName)
  expect(normalizeFacility(`  ${alias.toLowerCase()}  `)).toBe(fullName)
  expect(normalizeFacility(fullName)).toBe(fullName)
})

it('normalizes spacing and encoded spaces', () => {
  expect(normalizeFacility('Midway Neurological &Rehab')).toBe('Midway Neurological & Rehab')
  expect(normalizeFacility('Ambassador&#x20;')).toBe('Ambassador')
  expect(normalizeFacility('american house mount prospect')).toBe('American House Mount Prospect')
})

it('preserves unknown names without substring replacements', () => {
  expect(normalizeFacility('95th')).toBe('95th')
  expect(normalizeFacility('Niles Annex')).toBe('Niles Annex')
})

it('merges aliases and full names while preserving role separation and notes', () => {
  const input = 'Suburban\nCNA\n9/12 - 1/0/0 (Suburban contact)\nWest Suburban\nCNA\n9/11 - 0/1/0\nNurse\n9/13 - 1/0'
  const grouped = groupByRoleAndFacility(parseStaffingInput(input).records)
  expect(grouped.CNA).toHaveLength(1)
  expect(grouped.NURSE).toHaveLength(1)
  expect(formatOutput(grouped)).toBe('CNA\n\nWest Suburban\n09/11 - PM\n09/12 - AM (Suburban contact)\n\n\nNurse\n\nWest Suburban\n09/13 - AM')
})
