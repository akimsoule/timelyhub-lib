import { describe, it, expect } from 'vitest'
import { BudgetManager } from '../src/managers/BudgetManager'
import type { BudgetDefinition, TimeEntry } from '../src/types'

function te(id: string, companyId: string, projectId: string, start: string, end: string, durationMin?: number): TimeEntry {
  return { id, companyId, employeeId: 'e', projectId, description: id, startTime: new Date(start), endTime: new Date(end), duration: durationMin }
}

describe('BudgetManager thresholds', () => {
  it('emits budget.threshold when crossing thresholds', () => {
    const bm = new BudgetManager()
    const def: BudgetDefinition = { id: 'b1', companyId: 'c1', scope: 'project', key: 'p1', limitHours: 2, alertThresholds: [0.5, 1] }
    bm.upsert(def)
    const events: any[] = []

    // 60min (1h) -> 0.5 => threshold hit
    bm.applyEntry(te('t1','c1','p1','2025-01-01T09:00:00Z','2025-01-01T10:00:00Z',60), e => events.push(e))
    // next 90min -> 2.5h total => >=1 threshold
    bm.applyEntry(te('t2','c1','p1','2025-01-01T10:00:00Z','2025-01-01T11:30:00Z',90), e => events.push(e))

    expect(events.some(e => e.name==='budget.threshold')).toBe(true)
    const cons = bm.getConsumption('b1')!
    expect(cons.hours).toBeGreaterThan(2)
  })
})
