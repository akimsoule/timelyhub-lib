import { describe, it, expect } from 'vitest'
import { TimeManager } from '../src/TimeManager'
import type { Company, Employee, Project, TimeEntry, RateCard } from '../src/types'

describe('Branch coverage complements for RBAC-as and billing fallback', () => {
  it('approveEntryAs/rejectEntryAs: entry not found branches', () => {
    const tm = new TimeManager()
    // calling on missing entries should throw 'Entry not found'
    expect(() => tm.approveEntryAs('u1','missing')).toThrow('Entry not found')
    expect(() => tm.rejectEntryAs('u1','missing')).toThrow('Entry not found')
  })

  it('generateBillingReport: minutes fallback when duration is undefined', () => {
    const tm = new TimeManager()
    const c: Company = { id: 'c1', name: 'Acme' }
    const e: Employee = { id: 'e1', companyId: 'c1', name: 'Dev', email: 'd@x.com', role: 'dev' }
    const p: Project = { id: 'p1', companyId: 'c1', name: 'P', clientId: 'cl', status: 'active' }
    tm.addCompany(c); tm.addEmployee(e); tm.addProject(p)

    // rate card so it's billable and has a currency
    const rc: RateCard = { id: 'r1', companyId: 'c1', target: 'employee', key: 'e1', billable: true, rate: 60, currency: 'EUR' }
    tm.rates.add(rc)

    // Directly add an approved entry without duration to hit the nullish-coalescing branch
    const raw: TimeEntry = {
      id: 't1', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'no duration',
      startTime: new Date('2025-05-01T10:00:00Z'), endTime: new Date('2025-05-01T11:30:00Z'),
      status: 'approved' // duration intentionally omitted
    }
    tm.entries.add(raw)

    const bill = tm.generateBillingReport({ companyId: 'c1', startDate: new Date('2025-05-01T00:00:00Z'), endDate: new Date('2025-05-02T00:00:00Z') })
    // 90 minutes -> 1.5h * 60 = 90 EUR
    expect(bill.items[0].hours).toBeCloseTo(1.5)
    expect(bill.items[0].amount).toBeCloseTo(90)
    expect(bill.totalsByCurrency['EUR'].amount).toBeCloseTo(90)
  })
})
