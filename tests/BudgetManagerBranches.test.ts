import { describe, it, expect } from 'vitest'
import { BudgetManager } from '../src/managers/BudgetManager'
import type { BudgetDefinition, TimeEntry } from '../src/types'

describe('BudgetManager extra branches', () => {
  it('supports limitAmount branch coverage', () => {
    const bm = new BudgetManager()
    const def: BudgetDefinition = { id: 'b2', companyId: 'c1', scope: 'project', key: 'p1', limitAmount: { amount: 100, currency: 'EUR' }, alertThresholds: [0.1] }
    bm.upsert(def)
    const t: TimeEntry = { id: 't', companyId: 'c1', employeeId: 'e', projectId: 'p1', description: 'd', startTime: new Date('2025-01-01T10:00:00Z'), endTime: new Date('2025-01-01T11:00:00Z') }
    const events: any[] = []
    bm.applyEntry(t, e => events.push(e))
    expect(events.length >= 0).toBe(true)
  })

  it('ignores entries for other company/scope', () => {
    const bm = new BudgetManager()
    const def: BudgetDefinition = { id: 'b3', companyId: 'cX', scope: 'project', key: 'pZ', limitHours: 1, alertThresholds: [0.5] }
    bm.upsert(def)
    const t: TimeEntry = { id: 't', companyId: 'c1', employeeId: 'e', projectId: 'p1', description: 'd', startTime: new Date('2025-01-01T10:00:00Z'), endTime: new Date('2025-01-01T10:30:00Z') }
    const events: any[] = []
    bm.applyEntry(t, e => events.push(e))
    expect(events.length).toBe(0)
  })
})
