import { describe, it, expect } from 'vitest'
import { TimeManager } from '../src/TimeManager'
import type { Company, Employee, Project, TimeEntry } from '../src/types'

describe('TimeManager billing/export branches', () => {
  it('handles non-billable and N/A currency totals', () => {
    const tm = new TimeManager()
    const c: Company = { id: 'c1', name: 'Acme' }
    const e: Employee = { id: 'e1', companyId: 'c1', name: 'John', email: 'j@x.com', role: 'employee' }
    const p: Project = { id: 'p1', companyId: 'c1', name: 'P', clientId: 'cl', status: 'active' }
    tm.addCompany(c); tm.addEmployee(e); tm.addProject(p)

    const a: TimeEntry = { id: 'a', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'x', startTime: new Date('2025-01-01T09:00:00Z'), endTime: new Date('2025-01-01T10:00:00Z') }
    const b: TimeEntry = { id: 'b', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'y', startTime: new Date('2025-01-02T09:00:00Z'), endTime: new Date('2025-01-02T10:30:00Z') }
  tm.addTimeEntry(a); tm.addTimeEntry(b)
  tm.submitEntry('a'); tm.submitEntry('b')
  // Approve only 'a' so billing report has one item without currency -> 'N/A'
  tm.approveEntry('a')
    const bill = tm.generateBillingReport({ companyId: 'c1', startDate: new Date('2025-01-01T00:00:00Z'), endDate: new Date('2025-01-03T00:00:00Z') })
    expect(Object.keys(bill.totalsByCurrency)).toContain('N/A')

    // Export CSV smoke
    const rep = tm.generateReport({ companyId: 'c1' })
    const csv = tm.exportReportToCSV(rep)
    expect(csv.startsWith('entryId,companyId')).toBe(true)
  })
})
