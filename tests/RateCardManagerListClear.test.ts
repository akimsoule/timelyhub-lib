import { describe, it, expect } from 'vitest'
import { RateCardManager } from '../src/managers/RateCardManager'
import type { RateCard } from '../src/types'

describe('RateCardManager list & clear', () => {
  it('lists by company and clears', () => {
    const rm = new RateCardManager()
    const r1: RateCard = { id: 'r1', companyId: 'c1', target: 'role', key: 'employee', billable: true, rate: 10, currency: 'EUR' }
    const r2: RateCard = { id: 'r2', companyId: 'c2', target: 'project', key: 'p1', billable: false, rate: 0, currency: 'USD' }
    rm.add(r1); rm.add(r2)
    expect(rm.list().length).toBe(2)
    expect(rm.list('c1').length).toBe(1)
    rm.clear()
    expect(rm.list().length).toBe(0)
  })
})
