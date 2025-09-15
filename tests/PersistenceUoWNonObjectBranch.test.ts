import { describe, it, expect } from 'vitest'
import { InMemoryUnitOfWork } from '../src/managers/PersistenceManager'

describe('InMemoryUnitOfWork non-object snapshot branch', () => {
  it('copies non-object values without spreading', () => {
    const values: unknown[] = [1, 'x']
    const fakeRepo = {
      list: () => values,
      clear: () => { values.length = 0 },
      upsert: (e: unknown) => { values.push(e) }
    }
    const uow = new InMemoryUnitOfWork({ any: fakeRepo as any })
    const snap = uow.begin()
    // mutate after snapshot
    values.push(true)
    // rollback should restore to initial [1,'x']
    uow.rollback(snap)
    expect(values).toEqual([1,'x'])
  })
})
