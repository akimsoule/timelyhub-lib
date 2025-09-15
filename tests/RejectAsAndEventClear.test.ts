import { describe, it, expect } from 'vitest'
import { TimeManager } from '../src/TimeManager'
import type { Company, Employee, Project, TimeEntry } from '../src/types'

describe('rejectEntryAs success path and EventManager.clear()', () => {
  it('allows reject when RBAC permits and clears events', () => {
    const tm = new TimeManager()
    const c: Company = { id: 'c1', name: 'Acme' }
    const mgr: Employee = { id: 'm1', companyId: 'c1', name: 'Manager', email: 'm@x.com', role: 'manager' }
    const emp: Employee = { id: 'e1', companyId: 'c1', name: 'Emp', email: 'e@x.com', role: 'employee' }
    const p: Project = { id: 'p1', companyId: 'c1', name: 'P', clientId: 'cl', status: 'active' }
    tm.addCompany(c); tm.addEmployee(mgr); tm.addEmployee(emp); tm.addProject(p)

    // RBAC: manager can reject
    tm.access.setUserRole('c1','m1','manager')
    tm.access.setUserRole('c1','e1','employee')
    tm.access.allow('c1','reject','manager')

    const e: TimeEntry = { id: 't1', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'x', startTime: new Date('2025-01-01T09:00:00Z'), endTime: new Date('2025-01-01T10:00:00Z') }
    tm.addTimeEntry(e)
    tm.submitEntry('t1')

    // success path for rejectEntryAs -> covers TimeManager.ts line 369
    expect(() => tm.rejectEntryAs('m1','t1','bad quality')).not.toThrow()

    // event emitted and status updated
    const names = tm.events.all().map(ev => ev.name)
    expect(names).toContain('entry.rejected')

    // now clear events and assert empty
    tm.events.clear()
    expect(tm.events.all().length).toBe(0)
  })
})
