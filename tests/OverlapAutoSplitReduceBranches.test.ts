import { describe, it, expect } from 'vitest'
import { TimeManager } from '../src/TimeManager'
import type { Company, Employee, Project, TimeEntry } from '../src/types'

describe('Auto-split reduce branches coverage', () => {
  it('covers both outcomes of latestEnd reduce', () => {
    const tm = new TimeManager()
    const company: Company = { id: 'c1', name: 'Acme', policy: { allowOverlappingEntries: true } }
    const employee: Employee = { id: 'e1', companyId: 'c1', name: 'John', email: 'j@x.com', role: 'Dev' }
    const project: Project = { id: 'p1', companyId: 'c1', name: 'P', clientId: 'cl', status: 'active' }
    tm.addCompany(company)
    tm.addEmployee(employee)
    tm.addProject(project)

    const base1: TimeEntry = { id: 'b1', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'b1', startTime: new Date('2025-09-14T09:00:00'), endTime: new Date('2025-09-14T10:00:00'), duration: 60 }
    const base2: TimeEntry = { id: 'b2', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'b2', startTime: new Date('2025-09-14T10:30:00'), endTime: new Date('2025-09-14T11:00:00'), duration: 30 }
    const base3: TimeEntry = { id: 'b3', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'b3', startTime: new Date('2025-09-14T09:15:00'), endTime: new Date('2025-09-14T10:15:00'), duration: 60 }
    tm.addTimeEntry(base1)
    tm.addTimeEntry(base2)
    tm.addTimeEntry(base3)

    // Switch to auto-split for the next addition
    const c = tm.getCompany('c1')!
    c.policy = { overlapHandling: 'auto-split' }

    const newEntry: TimeEntry = { id: 'n1', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'n', startTime: new Date('2025-09-14T09:30:00'), endTime: new Date('2025-09-14T12:00:00') }
    tm.addTimeEntry(newEntry)

    const added = tm.generateReport({ companyId: 'c1' })
    const e = added.entries.find(x => x.id === 'n1')!
    expect(e.startTime.getTime()).toBe(new Date('2025-09-14T11:00:00').getTime())
  })
})
