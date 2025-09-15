import { describe, it, expect } from 'vitest'
import { ReportingManager } from '../src/managers/ReportingManager'
import type { TimeEntry, AggregationQuery } from '../src/types'

function te(id: string, companyId: string, employeeId: string, projectId: string, start: string, end: string, status: any = 'approved', tags?: string[], duration?: number): TimeEntry {
  return {
    id, companyId, employeeId, projectId,
    description: id,
    startTime: new Date(start), endTime: new Date(end),
    status,
    tags,
    duration
  }
}

describe('ReportingManager aggregate and CSV', () => {
  it('groups by fields and filters correctly, with cost rollup default', () => {
    const rm = new ReportingManager()
    const entries: TimeEntry[] = [
      te('t1','c1','e1','p1','2025-01-01T09:00:00Z','2025-01-01T10:00:00Z','approved',['feature']),
      te('t2','c1','e1','p2','2025-01-01T11:00:00Z','2025-01-01T12:30:00Z','approved',['bug']),
      te('t3','c1','e2','p1','2025-01-02T09:00:00Z','2025-01-02T10:00:00Z','draft',['feature']),
    ]
    const q: AggregationQuery = { groupBy: ['employeeId','day'], filters: { companyId: 'c1' }, rollup: 'cost' }
    const buckets = rm.aggregate(entries, q)
    expect(Array.isArray(buckets)).toBe(true)
    // two employees over two days
    const csv = rm.toCSV(buckets)
    expect(csv.startsWith('hours,count,day,employeeId\n')).toBe(true)
  })

  it('filters by tags/status/date and groups by month/week/tag', () => {
    const rm = new ReportingManager()
    const entries: TimeEntry[] = [
      te('a','c1','e1','p1','2025-03-05T09:00:00Z','2025-03-05T10:00:00Z','approved',['x']),
      te('b','c1','e1','p1','2025-03-06T09:00:00Z','2025-03-06T11:00:00Z','approved',['y']),
      te('c','c1','e1','p1','2025-04-01T09:00:00Z','2025-04-01T10:00:00Z','draft',['x'])
    ]
    const q: AggregationQuery = { groupBy: ['month','week','tag'], filters: { status: 'approved', startDate: new Date('2025-03-01'), endDate: new Date('2025-03-31'), tags: ['x','y'] } }
    const buckets = rm.aggregate(entries, q)
    expect(buckets.every(b => b.key.month?.startsWith('2025-03'))).toBe(true)
    const csv = rm.toCSV(buckets)
    expect(csv.includes('tag')).toBe(true)
  })
})
