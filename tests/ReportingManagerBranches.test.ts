import { describe, it, expect } from 'vitest'
import { ReportingManager } from '../src/managers/ReportingManager'
import type { TimeEntry, AggregationQuery } from '../src/types'

function E(id: string, opts: Partial<TimeEntry> = {}): TimeEntry {
  const base: TimeEntry = {
    id,
    companyId: 'c1',
    employeeId: 'e1',
    projectId: 'p1',
    description: 'd',
    startTime: new Date('2025-01-10T09:00:00Z'),
    endTime: new Date('2025-01-10T10:00:00Z'),
    status: 'approved',
    tags: ['t1'],
  }
  return { ...base, ...opts }
}

describe('ReportingManager branches', () => {
  it('hits all filter paths and groupBy keys', () => {
    const rm = new ReportingManager()
    const entries: TimeEntry[] = [
      E('a'),
      E('b', { companyId: 'c2' }), // company mismatch
      E('c', { employeeId: 'e2' }), // employee mismatch
      E('d', { projectId: 'p2' }), // project mismatch
      E('e', { status: 'draft' }), // status mismatch
      E('f', { startTime: new Date('2025-02-01T00:00:00Z'), endTime: new Date('2025-02-01T01:00:00Z') }), // outside range
      E('g', { tags: ['x'] }), // tags mismatch
    ]
    const q: AggregationQuery = {
      groupBy: ['companyId','employeeId','projectId','status','tag','day','week','month'],
      filters: {
        companyId: 'c1', employeeId: 'e1', projectId: 'p1', status: 'approved',
        startDate: new Date('2025-01-01T00:00:00Z'), endDate: new Date('2025-01-31T23:59:59Z'), tags: ['t1']
      },
      rollup: 'cost'
    }
    const buckets = rm.aggregate(entries, q)
    expect(buckets.length).toBeGreaterThan(0)
    // CSV empty branch and normal path
    const emptyCsv = rm.toCSV([])
    expect(emptyCsv).toBe('key,hours,count\n')
    const csv = rm.toCSV(buckets)
    expect(csv.includes('companyId')).toBe(true)
  })
})
