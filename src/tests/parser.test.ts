import { describe, expect, it } from 'vitest'
import { example } from '../example'
import { parseStaffingInput } from '../parser/parseStaffingInput'
import { parseShift } from '../parser/parseShift'
import { parseDate } from '../parser/parseDate'
import { parseRole } from '../parser/parseRole'
import { groupByRoleAndFacility } from '../parser/groupResults'
import { formatOutput } from '../parser/formatOutput'

describe('shift formats', () => {
  it.each([
    ['1/0/0', ['AM']], ['0/1/0', ['PM']], ['0/0/1', ['NOC']],
    ['1/1/0', ['AM', 'PM']], ['1/0/1', ['AM', 'NOC']], ['0/1/1', ['PM', 'NOC']],
    ['1/1/1', ['AM', 'PM', 'NOC']], ['3/2/0', ['AM', 'PM']], ['0/5/2', ['PM', 'NOC']],
    ['0/0/0', []], ['2 / 3 / 1', ['AM', 'PM', 'NOC']],
  ])('%s removes counts', (input, expected) => expect(parseShift(input as string, 'CNA')).toEqual(expected))
  it.each([['1/0', ['AM']], ['0/1', ['PM']], ['1/1', ['AM', 'PM']]])('%s nurse format', (input, expected) => {
    expect(parseShift(input as string, 'NURSE')).toEqual(expected)
    expect(parseShift(input as string, 'CNA')).toBeNull()
  })
  it.each([
    ['7am-3pm', 'AM'], ['7a-3p', 'AM'], ['7a-3pm', 'AM'], ['7 AM - 3 PM', 'AM'],
    ['3pm-11pm', 'PM'], ['3p-11p', 'PM'], ['3 PM – 11 PM', 'PM'],
    ['11pm-7am', 'NOC'], ['11p-7a', 'NOC'], ['11 PM - 7 AM', 'NOC'],
  ])('%s explicit time', (input, expected) => expect(parseShift(input, 'CNA')).toEqual([expected]))
  it.each(['-1/0/0', '1/2/3/4', '1.5/0/0', '?', '7p-7a', '1/0/0 urgent', '7am-3pm unknown'])('rejects ambiguous %s', input => expect(parseShift(input, 'NURSE')).toBeNull())
})

describe('roles and dates', () => {
  it.each(['CNA', 'cna', 'Cna'])('recognizes %s', value => expect(parseRole(value)).toBe('CNA'))
  it.each(['Nurse', 'Nurses', 'nurse', 'nurses', 'RN', 'RNs'])('recognizes %s', value => expect(parseRole(value)).toBe('NURSE'))
  it('does not fuzzy match roles', () => expect(parseRole('Nurse home')).toBeNull())
  it.each(['09/11', '9/11', '09-11', '9-11'])('normalizes %s', value => expect(parseDate(value)).toEqual({ date: '09/11', month: 9, day: 11 }))
  it.each(['13/12', '00/10', '2/30', '4/31', '9/0', '2026/09/12'])('rejects %s', value => expect(parseDate(value)).toBeNull())
})

describe('staffing pipeline', () => {
  it('matches the real guide fixture exactly', () => {
    const result = parseStaffingInput(example)
    expect(result.reviewLines).toEqual([])
    expect(formatOutput(groupByRoleAndFacility(result.records))).toBe(`CNA

Niles Nursing & Rehabilitation Center
09/12 - AM
09/13 - AM
09/19 - AM, PM

Pearl of St Charles
09/10 - PM (Female CNA)


Nurse

Niles Nursing & Rehabilitation Center
09/10 - AM
09/14 - AM
09/19 - PM

Parker Nursing and Rehabilitation Center
09/13 - AM
09/17 - PM`)
  })
  it.each(['Niles', 'Oak Lawn', 'POSC', '95th', '123'])('supports facility %s and inherited roles across blanks', facility => {
    const result = parseStaffingInput(`${facility}\n\nCNA\n\n9/12 - 1/0/0\n\nRN\n9/13 - 0/1`)
    expect(result.records.map(row => [row.facility, row.role])).toEqual([[facility, 'CNA'], [facility, 'NURSE']])
  })
  it('merges repeated facilities and sorts by numeric date', () => {
    const result = parseStaffingInput('Niles\nCNA\n10/1 - 1/0/0\n2/2 - 0/1/0\nNiles\nCNA\n1/3 - 0/0/1')
    const groups = groupByRoleAndFacility(result.records)
    expect(groups.CNA).toHaveLength(1)
    expect(groups.CNA[0].entries.map(row => row.date)).toEqual(['01/03', '02/02', '10/01'])
    expect(formatOutput(groups)).not.toContain('Nurse')
    expect(formatOutput(groups, 'NURSE')).toBe('')
  })
  it('preserves notes exactly', () => {
    const result = parseStaffingInput('POSC\nCNA\n09/10 - 0/2/0 (Female CNA)\n09/11 - 2/2/1 (NOC-7p-7a)\n09/12 – 1/0/0 (7p–7a)')
    expect(result.records.map(row => row.note)).toEqual(['(Female CNA)', '(NOC-7p-7a)', '(7p–7a)'])
  })
  it('returns valid entries alongside malformed staffing rows', () => {
    const result = parseStaffingInput('Niles\nCNA\n09/12 - 1/0/0\n09/22 - ?\n13/1 - 1/0/0\n09/23 - 1/0\n09/24 - 1/0/0 (urgent\n09/25 - 0/1/0')
    expect(result.records).toHaveLength(2)
    expect(result.reviewLines).toHaveLength(4)
  })
  it('does not attribute parent-company headings to a facility', () => {
    const result = parseStaffingInput('Example Healthcare Group\nNiles\nCNA\n09/12 - 1/0/0')
    expect(result.records[0].facility).toBe('Niles')
    expect(result.reviewLines).toEqual(['Example Healthcare Group'])
  })
  it('reviews orphan rows, unknown text, and unsupported roles', () => {
    const result = parseStaffingInput('09/12 - 1/0/0\nNiles\nCNA\n09/13 - 1/0/0\nLPN\n09/14 - 1/0/0')
    expect(result.records).toHaveLength(1)
    expect(result.reviewLines).toContain('LPN')
    expect(result.reviewLines).toContain('09/14 - 1/0/0')
  })
  it('handles CRLF and greetings, excludes zero shifts, and retains notes for review', () => {
    const result = parseStaffingInput('Good morning\r\nPlease assist us\r\nNiles\r\nNurses\r\n09/12 - 0/0\r\n09/13 - 0/0 (Call first)\r\nThank you!')
    expect(result.records).toEqual([])
    expect(result.reviewLines).toEqual(['09/13 - 0/0 (Call first)'])
  })
})
