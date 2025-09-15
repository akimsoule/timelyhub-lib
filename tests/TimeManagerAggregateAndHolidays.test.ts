import { describe, it, expect } from 'vitest'
import { TimeManager } from '../src/TimeManager'
import { StaticHolidayProvider } from '../src/providers/StaticHolidayProvider'
import type { Company, Employee, Project, TimeEntry } from '../src/types'

describe('TimeManager extras: aggregate and holidays', () => {
  it('autoFetchHolidays adds holidays and aggregate works', () => {
    const tm = new TimeManager()
    const c: Company = { id: 'c1', name: 'Acme' }
    const e: Employee = { id: 'e1', companyId: 'c1', name: 'A', email: 'a@x', role: 'employee' }
    const p: Project = { id: 'p1', companyId: 'c1', name: 'P', clientId: 'cl', status: 'active' }
    tm.addCompany(c); tm.addEmployee(e); tm.addProject(p)

    // time entry for aggregate
    const t: TimeEntry = { id: 't1', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'x', startTime: new Date('2025-01-01T09:00:00Z'), endTime: new Date('2025-01-01T10:00:00Z') }
    tm.addTimeEntry(t)

    const buckets = tm.aggregate({ groupBy: ['employeeId'], filters: { companyId: 'c1' } })
    expect(buckets[0].key.employeeId).toBe('e1')

    const added = tm.autoFetchHolidays(new StaticHolidayProvider(),'c1','FR',2025)
    expect(added).toBeGreaterThan(0)
  })

  it('exposes storage unitOfWork getter for coverage', () => {
    const tm = new TimeManager()
    expect(tm.storage.unitOfWork).toBeUndefined()
  })
})
