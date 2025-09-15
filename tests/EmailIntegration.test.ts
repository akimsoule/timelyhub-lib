import { describe, it, expect } from 'vitest'
import { TimeManager } from '../src/TimeManager'
import type { Company, Employee, Project, EmailTemplate, TimeEntry } from '../src/types'

describe('Email integration with TimeManager events', () => {
  it('sends emails on submit/approve/reject and period close; uses templates when available', () => {
    const tm = new TimeManager()
    const c: Company = { id: 'c1', name: 'Acme' }
    const m: Employee = { id: 'm1', companyId: 'c1', name: 'Manager', email: 'm@x.com', role: 'manager' }
    const e: Employee = { id: 'e1', companyId: 'c1', name: 'Alice', email: 'a@x.com', role: 'employee' }
    const p: Project = { id: 'p1', companyId: 'c1', name: 'P', clientId: 'cl', status: 'active' }
    tm.addCompany(c); tm.addEmployee(m); tm.addEmployee(e); tm.addProject(p)

    // Templates
    const t1: EmailTemplate = { id: 't1', name: 'entry_submitted', subject: 'Sub {{entryId}}', body: 'Hi {{employee}}' }
    const t2: EmailTemplate = { id: 't2', name: 'entry_approved', subject: 'Appr {{entryId}}', body: 'Ok {{employee}}' }
    const t3: EmailTemplate = { id: 't3', name: 'entry_rejected', subject: 'Rej {{entryId}}', body: 'Nok {{employee}} {{reason}}' }
    const t4: EmailTemplate = { id: 't4', name: 'period_closed', subject: 'Closed', body: 'From {{start}} to {{end}}' }
    tm.emails.addTemplate(t1); tm.emails.addTemplate(t2); tm.emails.addTemplate(t3); tm.emails.addTemplate(t4)

    const te: TimeEntry = { id: 't1', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'x', startTime: new Date('2025-01-01T09:00:00Z'), endTime: new Date('2025-01-01T10:00:00Z') }
    tm.addTimeEntry(te)

    tm.submitEntry('t1')
    // approve needs submitted status already; set RBAC to bypass via direct approve
    tm.access.setUserRole('c1','m1','manager'); tm.access.allow('c1','approve','manager')
    tm.approveEntryAs('m1','t1')

    // reject flow on another entry
    const te2: TimeEntry = { id: 't2', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'y', startTime: new Date('2025-01-02T09:00:00Z'), endTime: new Date('2025-01-02T10:00:00Z') }
    tm.addTimeEntry(te2); tm.submitEntry('t2'); tm.access.allow('c1','reject','manager'); tm.rejectEntryAs('m1','t2','missing info')

    // close period
    tm.access.allow('c1','closePeriod','manager')
    tm.closePeriodAs('m1','c1', new Date('2025-02-01T00:00:00Z'), new Date('2025-03-01T00:00:00Z'))

    const mails = tm.emails.all()
    // Expect 4 emails: submit t1, approve t1, submit t2, reject t2, + period close (to manager and employee)
    expect(mails.length).toBeGreaterThanOrEqual(5)
    // Check one template content
    const sub = mails.find(m => m.id === 'mail:t1:submitted')!
    expect(sub.subject).toBe('Sub t1')
    expect(sub.body).toBe('Hi Alice')

    const rej = mails.find(m => m.id === 'mail:t2:rejected')!
    expect(rej.subject).toBe('Rej t2')
    expect(rej.body).toContain('missing info')
  })

  it('does not crash when no employee email exists and still keeps 100% coverage', () => {
    const tm = new TimeManager()
    const c: Company = { id: 'c2', name: 'Beta' }
    const e: Employee = { id: 'e2', companyId: 'c2', name: 'Bob', email: '', role: 'employee' }
    const p: Project = { id: 'p2', companyId: 'c2', name: 'P', clientId: 'cl', status: 'active' }
    tm.addCompany(c); tm.addEmployee(e); tm.addProject(p)

    const te: TimeEntry = { id: 'x1', companyId: 'c2', employeeId: 'e2', projectId: 'p2', description: 'x', startTime: new Date('2025-01-01T09:00:00Z'), endTime: new Date('2025-01-01T10:00:00Z') }
    tm.addTimeEntry(te)
    tm.submitEntry('x1')
    // No email should be sent due to empty address
    expect(tm.emails.all().length).toBe(0)
  })
})
