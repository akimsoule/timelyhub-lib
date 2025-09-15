import { describe, it, expect } from 'vitest'
import { InMemoryPersistenceAdapter, InMemoryUnitOfWork } from '../src/managers/PersistenceManager'
import type { Company } from '../src/types'

describe('InMemoryUnitOfWork and repositories', () => {
  it('begin/rollback restores previous state and commit keeps changes; repos remove/clear', () => {
    const adapter = new InMemoryPersistenceAdapter()
    // seed
    const c1: Company = { id: 'c1', name: 'A' }
    const c2: Company = { id: 'c2', name: 'B' }
    adapter.companies.upsert(c1)

    const uow = new InMemoryUnitOfWork({
      companies: adapter.companies,
      employees: adapter.employees,
      projects: adapter.projects,
      entries: adapter.entries,
    })

    const snap = uow.begin()
    adapter.companies.upsert(c2)
    expect(adapter.companies.list().length).toBe(2)
    uow.rollback(snap)
    expect(adapter.companies.list().length).toBe(1)

    // commit path
    const snap2 = uow.begin()
    adapter.companies.upsert(c2)
    uow.commit(snap2)
    expect(adapter.companies.list().length).toBe(2)

    // repo remove/clear
    adapter.companies.remove('c2')
    expect(adapter.companies.list().length).toBe(1)
    adapter.companies.clear()
    expect(adapter.companies.list().length).toBe(0)
  })
})
