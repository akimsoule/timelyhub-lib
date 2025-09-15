import { describe, it, expect } from 'vitest'
import { AccessControlManager } from '../src/managers/AccessControlManager'
import { HolidayManager } from '../src/managers/HolidayManager'
import { LeaveManager } from '../src/managers/LeaveManager'
import { RateCardManager } from '../src/managers/RateCardManager'
import type { Leave, Holiday, RateCard } from '../src/types'

describe('Managers extra coverage', () => {
  it('AccessControlManager can/allow/clear and negative paths', () => {
    const ac = new AccessControlManager()
    // user without role
    expect(ac.can('c1', 'u1', 'approve')).toBe(false)
    ac.setUserRole('c1', 'u1', 'manager')
    // role set, but action not allowed
    expect(ac.can('c1', 'u1', 'approve')).toBe(false)
    ac.allow('c1', 'approve', 'manager')
    expect(ac.can('c1', 'u1', 'approve')).toBe(true)
    ac.clear()
    expect(ac.can('c1', 'u1', 'approve')).toBe(false)
  })

  it('HolidayManager list/filter/isHoliday/clear', () => {
    const hm = new HolidayManager()
    const h1: Holiday = { id: 'h1', companyId: 'c1', date: new Date('2025-01-01T00:00:00Z'), name: 'NY' }
    const h2: Holiday = { id: 'h2', companyId: 'c2', date: new Date('2025-12-25T00:00:00Z'), name: 'Xmas' }
    hm.add(h1); hm.add(h2)
    expect(hm.list().length).toBe(2)
    expect(hm.list('c1').length).toBe(1)
    expect(hm.isHoliday('c1', new Date('2025-01-01T09:00:00Z'))).toBe(true)
    expect(hm.isHoliday('c1', new Date('2025-01-02T09:00:00Z'))).toBe(false)
    hm.clear()
    expect(hm.list().length).toBe(0)
  })

  it('LeaveManager list/filter/approvedInRange/clear', () => {
    const lm = new LeaveManager()
    const l1: Leave = { id: 'l1', companyId: 'c1', employeeId: 'e1', start: new Date('2025-02-01T08:00:00Z'), end: new Date('2025-02-01T12:00:00Z'), status: 'approved' }
    const l2: Leave = { id: 'l2', companyId: 'c1', employeeId: 'e2', start: new Date('2025-02-01T08:00:00Z'), end: new Date('2025-02-01T12:00:00Z'), status: 'pending' }
    lm.add(l1); lm.add(l2)
    expect(lm.list().length).toBe(2)
    expect(lm.list('c1','e1').length).toBe(1)
    expect(lm.approvedInRange('c1','e1', new Date('2025-02-01T09:00:00Z'), new Date('2025-02-01T10:00:00Z'))).toBe(true)
    expect(lm.approvedInRange('c1','e1', new Date('2025-02-02T09:00:00Z'), new Date('2025-02-02T10:00:00Z'))).toBe(false)
    lm.clear(); expect(lm.list().length).toBe(0)
  })

  it('RateCardManager resolve priority and validity', () => {
    const rm = new RateCardManager()
    const baseTime = new Date('2025-03-01T00:00:00Z')
    const roleCard: RateCard = { id: 'rr', companyId: 'c1', target: 'role', key: 'employee', billable: true, rate: 50, currency: 'EUR' }
    const projectCard: RateCard = { id: 'rp', companyId: 'c1', target: 'project', key: 'p1', billable: true, rate: 60, currency: 'EUR', validFrom: new Date('2025-02-01T00:00:00Z') }
    const employeeCard: RateCard = { id: 're', companyId: 'c1', target: 'employee', key: 'e1', billable: true, rate: 70, currency: 'EUR', validTo: new Date('2025-12-31T23:59:59Z') }
    rm.add(roleCard); rm.add(projectCard); rm.add(employeeCard)
    // priority employee > project > role
    const r1 = rm.resolve('c1', { employeeId: 'e1', projectId: 'p1', role: 'employee' }, baseTime)
    expect(r1?.id).toBe('re')
    // no employee, use project
    const r2 = rm.resolve('c1', { projectId: 'p1', role: 'employee' }, baseTime)
    expect(r2?.id).toBe('rp')
    // no project, use role
    const r3 = rm.resolve('c1', { role: 'employee' }, baseTime)
    expect(r3?.id).toBe('rr')
    // out of validity window returns undefined
    const r4 = rm.resolve('c1', { employeeId: 'e1' }, new Date('2030-01-01T00:00:00Z'))
    expect(r4).toBeUndefined()
  })
})
