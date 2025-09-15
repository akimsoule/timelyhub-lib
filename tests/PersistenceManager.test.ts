import { describe, it, expect } from 'vitest'
import { InMemoryPersistenceAdapter, PersistenceManager } from '../src/managers/PersistenceManager'
import type { Company, Employee, Project, TimeEntry } from '../src/types'

describe('PersistenceManager roundtrip', () => {
  it('saves and loads entities via adapter', () => {
    const adapter = new InMemoryPersistenceAdapter()
    const pm = new PersistenceManager(adapter)

    const c: Company = { id: 'c1', name: 'Acme' }
    const e: Employee = { id: 'e1', companyId: 'c1', name: 'Alice', email: 'a@x', role: 'employee' }
    const p: Project = { id: 'p1', companyId: 'c1', name: 'P', clientId: 'cl', status: 'active' }
    const t: TimeEntry = { id: 't1', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'x', startTime: new Date('2025-01-01T09:00:00Z'), endTime: new Date('2025-01-01T10:00:00Z') }

    pm.saveAll([c],[e],[p],[t])
    const out = pm.loadAll()
    expect(out.companies[0].id).toBe('c1')
    expect(out.employees[0].id).toBe('e1')
    expect(out.projects[0].id).toBe('p1')
    expect(out.entries[0].id).toBe('t1')
  })
})
