import { describe, it, expect } from 'vitest'
import { TimeManager } from '../src/TimeManager'
import type { Company, Employee, Project, TimeEntry } from '../src/types'

describe('TimeManager getters and helpers coverage', () => {
  it('touches isPeriodClosed and public getters', () => {
    const tm = new TimeManager()
    const c: Company = { id: 'c1', name: 'Acme' }
    const e: Employee = { id: 'e1', companyId: 'c1', name: 'E', email: 'e@x', role: 'employee' }
    const p: Project = { id: 'p1', companyId: 'c1', name: 'P', clientId: 'cl', status: 'active' }
    tm.addCompany(c); tm.addEmployee(e); tm.addProject(p)
    const t: TimeEntry = { id: 't1', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description:'x', startTime: new Date('2025-01-01T10:00:00Z'), endTime: new Date('2025-01-01T11:00:00Z'), duration: 60 }
    tm.addTimeEntry(t)

  // call getters and validate they return instances
  expect(tm.companies).toBeDefined()
  expect(tm.employees).toBeDefined()
  expect(tm.projects).toBeDefined()
  expect(tm.periods).toBeDefined()
  expect(tm.audits).toBeDefined()
  expect(tm.entries).toBeDefined()
  expect(tm.access).toBeDefined()
  expect(tm.leaves).toBeDefined()
  expect(tm.holidays).toBeDefined()
  expect(tm.rates).toBeDefined()
  expect(tm.events).toBeDefined()
  expect(tm.emails).toBeDefined()
  expect(tm.reporting).toBeDefined()
  expect(tm.budgets).toBeDefined()
  expect(tm.notifications).toBeDefined()
  expect(tm.storage).toBeDefined()

  // call some list/all to exercise functions inside
  void tm.companies.list(); void tm.employees.list(); void tm.projects.list(); void tm.entries.list()
  void tm.audits.all(); void tm.periods.list('c1'); void tm.events.all();

  // getX helpers
  expect(tm.getCompany('c1')?.id).toBe('c1')
  expect(tm.getEmployee('e1')?.id).toBe('e1')
  expect(tm.getProject('p1')?.id).toBe('p1')

    // isPeriodClosed false, then close and true
    const start = new Date('2025-01-01T00:00:00Z'), end = new Date('2025-01-02T00:00:00Z')
    expect(tm.isPeriodClosed('c1', start, end)).toBe(false)
    tm.closePeriod('c1', start, end)
    expect(tm.isPeriodClosed('c1', start, end)).toBe(true)
  })
})
