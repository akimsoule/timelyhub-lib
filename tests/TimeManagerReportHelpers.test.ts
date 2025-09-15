import { describe, it, expect } from 'vitest'
import { TimeManager } from '../src/TimeManager'
import type { Company, Employee, Project, TimeEntry } from '../src/types'

describe('TimeManager report helpers', () => {
  it('reportAggregate/reportCSV cover helper functions', () => {
    const tm = new TimeManager()
    const c: Company = { id: 'c1', name: 'Acme' }
    const e: Employee = { id: 'e1', companyId: 'c1', name: 'A', email: 'a@x', role: 'employee' }
    const p: Project = { id: 'p1', companyId: 'c1', name: 'P', clientId: 'cl', status: 'active' }
    const t: TimeEntry = { id: 't1', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'x', startTime: new Date('2025-01-01T09:00:00Z'), endTime: new Date('2025-01-01T10:00:00Z') }
    tm.addCompany(c); tm.addEmployee(e); tm.addProject(p); tm.addTimeEntry(t)

    const buckets = tm.reportAggregate({ groupBy: ['companyId'], filters: { companyId: 'c1' } })
    expect(buckets.length).toBe(1)
    const csv = tm.reportCSV({ groupBy: ['companyId'], filters: { companyId: 'c1' } })
    expect(csv.includes('companyId')).toBe(true)
  })
})
