import { describe, it, expect } from 'vitest'
import { TimeManager } from '../src/TimeManager'
import type { Company, Employee, Project, TimeEntry } from '../src/types'

describe('TimeManager persistence integration', () => {
  it('saveToPersistence/loadFromPersistence roundtrip', () => {
    const tm = new TimeManager()
    const c: Company = { id: 'c1', name: 'Acme' }
    const e: Employee = { id: 'e1', companyId: 'c1', name: 'A', email: 'a@x', role: 'employee' }
    const p: Project = { id: 'p1', companyId: 'c1', name: 'P', clientId: 'cl', status: 'active' }
    const t: TimeEntry = { id: 't1', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'x', startTime: new Date('2025-01-01T09:00:00Z'), endTime: new Date('2025-01-01T10:00:00Z') }

    tm.addCompany(c); tm.addEmployee(e); tm.addProject(p); tm.addTimeEntry(t)
    tm.saveToPersistence()

    // new manager, empty state
    const tm2 = new TimeManager()
    // load from tm1 storage
    const snapshot = tm.storage.loadAll()
    tm2.storage.saveAll(snapshot.companies, snapshot.employees, snapshot.projects, snapshot.entries)

    // now load into tm2 managers
    tm2.loadFromPersistence()

    expect(tm2.companies.list().length).toBe(1)
    expect(tm2.employees.list().length).toBe(1)
    expect(tm2.projects.list().length).toBe(1)
    expect(tm2.entries.list().length).toBe(1)
  })
})
