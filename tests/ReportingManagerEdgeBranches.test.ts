import { describe, it, expect } from 'vitest'
import { ReportingManager } from '../src/managers/ReportingManager'
import type { TimeEntry, AggregationQuery } from '../src/types'

const base = (id: string, overrides: Partial<TimeEntry> = {}): TimeEntry => ({
  id,
  companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'd',
  startTime: new Date('2025-01-10T09:00:00Z'), endTime: new Date('2025-01-10T10:00:00Z'),
  ...overrides,
})

describe('ReportingManager edge branches', () => {
  it('handles no filters and missing tag/status groupBy', () => {
    const rm = new ReportingManager()
    const entries: TimeEntry[] = [
      base('a', { status: undefined, tags: undefined }),
    ]
    const q: AggregationQuery = { groupBy: ['status','tag'], rollup: 'hours' }
    const buckets = rm.aggregate(entries, q)
    expect(buckets[0].key.status).toBe('draft')
    expect(buckets[0].key.tag).toBe('')
  })

  it('treats empty tags filter as no-op', () => {
    const rm = new ReportingManager()
    const entries: TimeEntry[] = [ base('a') ]
    const q: AggregationQuery = { groupBy: ['companyId'], filters: { tags: [] } }
    const buckets = rm.aggregate(entries, q)
    expect(buckets.length).toBe(1)
  })
})
