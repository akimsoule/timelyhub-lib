import { describe, it, expect } from 'vitest'
import { TimeManager } from '../src/TimeManager'
import type { Company, Employee, Project, TimeEntry, Holiday, Leave } from '../src/types'

describe('Policies: holidays and leaves', () => {
  it('blocks entry on company holiday when policy enabled', () => {
    const tm = new TimeManager()
    const company: Company = { id: 'c1', name: 'Acme', policy: { disallowEntriesOnHolidays: true } }
    const emp: Employee = { id: 'e1', companyId: 'c1', name: 'John', email: 'j@x.com', role: 'employee' }
    const proj: Project = { id: 'p1', companyId: 'c1', name: 'P', clientId: 'cl', status: 'active' }
    tm.addCompany(company)
    tm.addEmployee(emp)
    tm.addProject(proj)
    const hol: Holiday = { id: 'h1', companyId: 'c1', date: new Date('2025-12-25T00:00:00Z'), name: 'Xmas' }
    tm.holidays.add(hol)

    const entry: TimeEntry = { id: 't1', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'x', startTime: new Date('2025-12-25T09:00:00Z'), endTime: new Date('2025-12-25T10:00:00Z') }
    expect(() => tm.addTimeEntry(entry)).toThrow('Time entries are not allowed on holidays')
  })

  it('blocks entry during approved leave when policy enabled', () => {
    const tm = new TimeManager()
    const company: Company = { id: 'c1', name: 'Acme', policy: { disallowEntriesOnApprovedLeave: true } }
    const emp: Employee = { id: 'e1', companyId: 'c1', name: 'John', email: 'j@x.com', role: 'employee' }
    const proj: Project = { id: 'p1', companyId: 'c1', name: 'P', clientId: 'cl', status: 'active' }
    tm.addCompany(company)
    tm.addEmployee(emp)
    tm.addProject(proj)

    const leave: Leave = { id: 'lv1', companyId: 'c1', employeeId: 'e1', start: new Date('2025-09-14T08:00:00Z'), end: new Date('2025-09-14T12:00:00Z'), status: 'approved' }
    tm.leaves.add(leave)

    const entry: TimeEntry = { id: 't1', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'x', startTime: new Date('2025-09-14T09:00:00Z'), endTime: new Date('2025-09-14T10:00:00Z') }
    expect(() => tm.addTimeEntry(entry)).toThrow('Time entries are not allowed during approved leave')
  })
})
