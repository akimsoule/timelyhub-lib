import { describe, it, expect } from 'vitest'
import { StaticHolidayProvider } from '../src/providers/StaticHolidayProvider'

describe('StaticHolidayProvider', () => {
  it('returns known holidays per country/year', () => {
    const hp = new StaticHolidayProvider()
    const fr = hp.fetch('FR', 2025)
    expect(fr.some(h => h.name.includes('Jour'))).toBe(true)
    const us = hp.fetch('US', 2025)
    expect(us.length).toBeGreaterThan(0)
  })
})
