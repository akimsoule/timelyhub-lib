import { describe, it, expect } from 'vitest'
import { TimeManager } from '../src/TimeManager'
import type { Company, Employee, Project, TimeEntry } from '../src/types'

describe('Nullish branches in email rendering (emp?.name ?? "")', () => {
  it('covers submit/approve/reject when employee record is missing', () => {
    const tm = new TimeManager()
    const c: Company = { id: 'c1', name: 'Acme' }
    const e: Employee = { id: 'e1', companyId: 'c1', name: 'Alice', email: 'a@x.com', role: 'employee' }
    const p: Project = { id: 'p1', companyId: 'c1', name: 'P', clientId: 'cl', status: 'active' }
    tm.addCompany(c); tm.addEmployee(e); tm.addProject(p)

    // submit path
    const t1: TimeEntry = { id: 't1', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'x', startTime: new Date('2025-01-01T09:00:00Z'), endTime: new Date('2025-01-01T10:00:00Z') }
    tm.addTimeEntry(t1)
    // mutate to non-existent employee to force emp undefined -> uses ''
    t1.employeeId = 'ghost'
    expect(() => tm.submitEntry('t1')).not.toThrow()

    // approve path
    const t2: TimeEntry = { id: 't2', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'y', startTime: new Date('2025-01-02T09:00:00Z'), endTime: new Date('2025-01-02T10:00:00Z') }
    tm.addTimeEntry(t2)
    tm.submitEntry('t2')
    t2.employeeId = 'ghost'
    expect(() => tm.approveEntry('t2')).not.toThrow()

    // reject path
    const t3: TimeEntry = { id: 't3', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'z', startTime: new Date('2025-01-03T09:00:00Z'), endTime: new Date('2025-01-03T10:00:00Z') }
    tm.addTimeEntry(t3)
    tm.submitEntry('t3')
    t3.employeeId = 'ghost'
    expect(() => tm.rejectEntry('t3', 'bad')).not.toThrow()
  })
})
