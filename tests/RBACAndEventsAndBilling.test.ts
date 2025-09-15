import { describe, it, expect } from 'vitest'
import { TimeManager } from '../src/TimeManager'
import type { Company, Employee, Project, TimeEntry, RateCard } from '../src/types'

describe('RBAC, events, billing, export CSV', () => {
  it('enforces RBAC for approve/reject/close; emits events; computes billing; exports CSV', () => {
    const tm = new TimeManager()
    const company: Company = { id: 'c1', name: 'Acme' }
    const manager: Employee = { id: 'm1', companyId: 'c1', name: 'Manager', email: 'm@x.com', role: 'manager' }
    const dev: Employee = { id: 'e1', companyId: 'c1', name: 'Dev', email: 'd@x.com', role: 'employee' }
    const proj: Project = { id: 'p1', companyId: 'c1', name: 'P', clientId: 'cl', status: 'active' }
    tm.addCompany(company)
    tm.addEmployee(manager);
    tm.addEmployee(dev);
    tm.addProject(proj)

    // RBAC policy: manager can approve/reject/closePeriod
    tm.access.setUserRole('c1', 'm1', 'manager')
    tm.access.setUserRole('c1', 'e1', 'employee')
    ;['approve','reject','closePeriod'].forEach(a => tm.access.allow('c1', a as any, 'manager'))

    // rate card: employee -> billable 100 EUR/h
    const rc: RateCard = { id: 'r1', companyId: 'c1', target: 'employee', key: 'e1', billable: true, rate: 100, currency: 'EUR' }
    tm.rates.add(rc)

    // add entry
    const entry: TimeEntry = { id: 't1', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'x', startTime: new Date('2025-09-14T09:00:00Z'), endTime: new Date('2025-09-14T11:00:00Z') }
    tm.addTimeEntry(entry)
    tm.submitEntry('t1')

    // RBAC enforcement: employee cannot approve
    expect(() => tm.approveEntryAs('e1','t1')).toThrow('Forbidden: approve')
    // manager can approve
    expect(() => tm.approveEntryAs('m1','t1')).not.toThrow()

    // Events emitted
    const names = tm.events.all().map(e => e.name)
    expect(names).toContain('entry.added')
    expect(names).toContain('entry.submitted')
    expect(names).toContain('entry.approved')

    // Billing report for approved range
    const bill = tm.generateBillingReport({ companyId: 'c1', startDate: new Date('2025-09-14T00:00:00Z'), endDate: new Date('2025-09-15T00:00:00Z') })
    expect(bill.items[0].amount).toBe(200)

    // Export CSV
    const rep = tm.generateReport({ companyId: 'c1' })
    const csv = tm.exportReportToCSV(rep)
    expect(csv.split('\n').length).toBeGreaterThan(1)

    // Close period as manager
    expect(() => tm.closePeriodAs('m1','c1', new Date('2025-09-16T00:00:00Z'), new Date('2025-09-17T00:00:00Z'))).not.toThrow()
  })
})
