import { describe, it, expect } from 'vitest'
import { TimeManager } from '../src/TimeManager'
import type { Company, Employee, Project, TimeEntry } from '../src/types'

describe('RBAC forbidden and CSV duration fallback', () => {
  it('throws on forbidden reject/closePeriod and CSV falls back to calculateDuration', () => {
    const tm = new TimeManager()
    const c: Company = { id: 'c1', name: 'Acme' }
    const mgr: Employee = { id: 'm1', companyId: 'c1', name: 'M', email: 'm@x.com', role: 'manager' }
    const emp: Employee = { id: 'e1', companyId: 'c1', name: 'E', email: 'e@x.com', role: 'employee' }
    const p: Project = { id: 'p1', companyId: 'c1', name: 'P', clientId: 'cl', status: 'active' }
    tm.addCompany(c); tm.addEmployee(mgr); tm.addEmployee(emp); tm.addProject(p)

    // role config: only approve allowed to manager (not reject/closePeriod)
    tm.access.setUserRole('c1','m1','manager')
    tm.access.allow('c1','approve','manager')

    const e: TimeEntry = { id: 't1', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'x', startTime: new Date('2025-01-01T09:00:00Z'), endTime: new Date('2025-01-01T10:00:00Z') }
    tm.addTimeEntry(e); tm.submitEntry('t1')

    // forbidden reject
    expect(() => tm.rejectEntryAs('m1','t1')).toThrow('Forbidden: reject')
    // forbidden close period
    expect(() => tm.closePeriodAs('m1','c1', new Date('2025-01-01T00:00:00Z'), new Date('2025-01-02T00:00:00Z'))).toThrow('Forbidden: closePeriod')

    // CSV fallback for duration when undefined
    const raw: TimeEntry = { id: 'raw1', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'raw', startTime: new Date('2025-01-02T09:00:00Z'), endTime: new Date('2025-01-02T09:30:00Z') }
    tm.entries.add(raw)
    const rep = tm.generateReport({ companyId: 'c1' })
    const csv = tm.exportReportToCSV(rep)
    // contains computed 30 minutes
    expect(csv).toContain('30')
  })
})
