import { describe, it, expect } from 'vitest'
import { TimeManager } from '../src/TimeManager'
import type { Company, Employee, Project, TimeEntry, EmailTemplate } from '../src/types'

describe('Reason branch in rejection email', () => {
  it('covers reason undefined and defined via template rendering', () => {
    const tm = new TimeManager()
    const c: Company = { id: 'c1', name: 'Acme' }
    const e: Employee = { id: 'e1', companyId: 'c1', name: 'Alice', email: 'a@x.com', role: 'employee' }
    const p: Project = { id: 'p1', companyId: 'c1', name: 'P', clientId: 'cl', status: 'active' }
    tm.addCompany(c); tm.addEmployee(e); tm.addProject(p)
    tm.emails.addTemplate({ id: 'tr', name: 'entry_rejected', subject: 'R {{entryId}}', body: 'Reason {{reason}}' } as EmailTemplate)

    // case 1: undefined reason
    const t1: TimeEntry = { id: 't1', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'x', startTime: new Date('2025-01-01T09:00:00Z'), endTime: new Date('2025-01-01T10:00:00Z') }
    tm.addTimeEntry(t1); tm.submitEntry('t1'); tm.rejectEntry('t1')

    // case 2: defined reason
    const t2: TimeEntry = { id: 't2', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'y', startTime: new Date('2025-01-02T09:00:00Z'), endTime: new Date('2025-01-02T10:00:00Z') }
    tm.addTimeEntry(t2); tm.submitEntry('t2'); tm.rejectEntry('t2','oops')

    const mails = tm.emails.all()
    const m1 = mails.find(m => m.id==='mail:t1:rejected')!
    const m2 = mails.find(m => m.id==='mail:t2:rejected')!
    expect(m1.body).toBe('Reason ')
    expect(m2.body).toBe('Reason oops')
  })
})
