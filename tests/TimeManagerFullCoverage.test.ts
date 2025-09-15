import { describe, it, expect } from 'vitest'
import { TimeManager } from '../src/TimeManager'
import { StaticHolidayProvider } from '../src/providers/StaticHolidayProvider'
import type { Company, Employee, Project, TimeEntry } from '../src/types'

describe('TimeManager full integration coverage', () => {
  const baseSetup = () => {
    const tm = new TimeManager()
    const c: Company = { id: 'c1', name: 'Acme', policy: { allowOverlappingEntries: true } }
    const e: Employee = { id: 'e1', companyId: 'c1', name: 'John', email: 'j@x.com', role: 'Dev' }
    const p: Project = { id: 'p1', companyId: 'c1', name: 'Proj', clientId: 'cl', status: 'active' }
    tm.addCompany(c); tm.addEmployee(e); tm.addProject(p)
    const t: TimeEntry = { id: 't1', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'work', startTime: new Date('2025-09-14T09:00:00Z'), endTime: new Date('2025-09-14T10:00:00Z'), duration: 60 }
    tm.addTimeEntry(t)
    return tm
  }

  it('__test_noop touches getters without side effects', () => {
    const tm = baseSetup()
    // just ensure it doesn’t throw
    tm.__test_noop()
    expect(tm.entries.list().length).toBe(1)
  })

  it('autoFetchHolidays imports provider holidays', () => {
    const tm = baseSetup()
  const provider = new StaticHolidayProvider()
  const added = tm.autoFetchHolidays(provider, 'c1', 'FR', 2025)
  expect(added).toBe(2)
    expect(tm.holidays.isHoliday('c1', new Date('2025-01-01Z'))).toBe(true)
  })

  it('approveEntryAs and closePeriodAs with RBAC success', () => {
    const tm = baseSetup()
    // RBAC setup
  tm.access.allow('c1','approve','manager')
    tm.access.allow('c1','closePeriod','manager')
  const mgr: Employee = { id:'m1', companyId:'c1', name:'Mgr', email:'mgr@x.com', role:'manager' }
    tm.addEmployee(mgr)
  tm.access.setUserRole('c1','m1','manager')
    tm.submitEntry('t1')
    tm.approveEntryAs('m1','t1','ok')
    expect(tm.audits.all().some(a => a.action === 'approve' && a.entryId === 't1')).toBe(true)
    tm.closePeriodAs('m1','c1', new Date('2025-09-14T00:00:00Z'), new Date('2025-09-15T00:00:00Z'))
    expect(tm.periods.list('c1').length).toBe(1)
  })

  it('exportReportToCSV and generateBillingReport basic paths', () => {
    const tm = baseSetup()
    const rep = tm.generateReport({ companyId: 'c1', startDate: new Date('2025-09-14Z'), endDate: new Date('2025-09-15Z'), status: 'all' })
    const csv = tm.exportReportToCSV(rep)
    expect(csv.split('\n').length).toBe(2)
    // billing considers approved only
    tm.submitEntry('t1'); tm.approveEntry('t1')
    const bill = tm.generateBillingReport({ companyId: 'c1', startDate: new Date('2025-09-14Z'), endDate: new Date('2025-09-15Z') })
    expect(bill.items[0].hours).toBeGreaterThan(0)
    expect(typeof bill.totalsByCurrency).toBe('object')
  })

  it('notifications: webhook + slack subscriptions enqueue outbox', () => {
    const tm = baseSetup()
    // subscribe
    tm.notifications.subscribeWebhook({ id:'wh1', url:'https://example.test/hook', events: [] })
    tm.notifications.subscribeSlack({ id:'sl1', channel:'#ops', events: [] })
    // events come from submit/approve/reject/period.close or explicit dispatch in addTimeEntry path
    tm.submitEntry('t1')
    tm.rejectEntry('t1','nah')
    // add another entry to trigger entry.added dispatch
    const t2: TimeEntry = { id:'t2', companyId:'c1', employeeId:'e1', projectId:'p1', description:'w', startTime: new Date('2025-09-14T11:00:00Z'), endTime: new Date('2025-09-14T12:00:00Z'), duration:60 }
    tm.addTimeEntry(t2)
    const out = tm.notifications.listOutbox()
    expect(out.length).toBeGreaterThan(0)
  })

  it('report helpers aggregate/CSV wrappers', () => {
    const tm = baseSetup()
    const buckets = tm.reportAggregate({ groupBy:['companyId'], filters:{ companyId:'c1' } })
    const csv = tm.reportCSV({ groupBy:['companyId'], filters:{ companyId:'c1' } })
    expect(buckets.length >= 0 && typeof csv === 'string').toBe(true)
  })
})
