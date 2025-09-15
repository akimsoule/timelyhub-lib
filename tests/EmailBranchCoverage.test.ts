import { describe, it, expect } from 'vitest'
import { TimeManager } from '../src/TimeManager'
import type { Company, Employee, Project, TimeEntry } from '../src/types'

describe('Email branches: no-template defaults and period close no recipients', () => {
  it('uses default subjects/bodies when templates are missing for submit/approve/reject', () => {
    const tm = new TimeManager()
    const c: Company = { id: 'c3', name: 'Gamma' }
    const e: Employee = { id: 'e3', companyId: 'c3', name: 'Carl', email: 'carl@x.com', role: 'employee' }
    const p: Project = { id: 'p3', companyId: 'c3', name: 'P', clientId: 'cl', status: 'active' }
    tm.addCompany(c); tm.addEmployee(e); tm.addProject(p)

    const t: TimeEntry = { id: 't3', companyId: 'c3', employeeId: 'e3', projectId: 'p3', description: 'x', startTime: new Date('2025-01-01T09:00:00Z'), endTime: new Date('2025-01-01T10:00:00Z') }
    tm.addTimeEntry(t)

    tm.submitEntry('t3')
    // approve directly (no RBAC needed)
    tm.approveEntry('t3')

    const t2: TimeEntry = { id: 't4', companyId: 'c3', employeeId: 'e3', projectId: 'p3', description: 'y', startTime: new Date('2025-01-02T09:00:00Z'), endTime: new Date('2025-01-02T10:00:00Z') }
    tm.addTimeEntry(t2)
    tm.submitEntry('t4')
    tm.rejectEntry('t4')

    const mails = tm.emails.all()
    const sub = mails.find(m => m.id === 'mail:t3:submitted')!
    expect(sub.subject).toBe('Entry submitted: t3')
    expect(sub.body).toContain('Employee Carl submitted entry t3')

    const appr = mails.find(m => m.id === 'mail:t3:approved')!
    expect(appr.subject).toBe('Entry approved: t3')
    expect(appr.body).toContain('Your entry t3 was approved')

    const rej = mails.find(m => m.id === 'mail:t4:rejected')!
    expect(rej.subject).toBe('Entry rejected: t4')
    expect(rej.body).toContain('Your entry t4 was rejected')
  })

  it('period close: default template path and no-recipient path', () => {
    const tm = new TimeManager()
    const c: Company = { id: 'c4', name: 'Delta' }
    const p: Project = { id: 'p4', companyId: 'c4', name: 'P', clientId: 'cl', status: 'active' }
    const e1: Employee = { id: 'e4', companyId: 'c4', name: 'Dana', email: 'dana@x.com', role: 'employee' }
    const e2: Employee = { id: 'e5', companyId: 'c4', name: 'Erik', email: 'erik@x.com', role: 'employee' }
    tm.addCompany(c); tm.addEmployee(e1); tm.addEmployee(e2); tm.addProject(p)

    tm.closePeriod('c4', new Date('2025-03-01T00:00:00Z'), new Date('2025-04-01T00:00:00Z'))
    const mail = tm.emails.all().find(m => m.id.startsWith('mail:period:c4:'))!
    expect(mail.subject).toBe('Period closed')
    expect(mail.to).toEqual(['dana@x.com','erik@x.com'])

    // No recipients path
    const tm2 = new TimeManager()
    const c2: Company = { id: 'c5', name: 'Epsilon' }
    const eNoEmail: Employee = { id: 'e6', companyId: 'c5', name: 'NoMail', email: '', role: 'employee' }
    tm2.addCompany(c2); tm2.addEmployee(eNoEmail)
    tm2.closePeriod('c5', new Date('2025-05-01T00:00:00Z'), new Date('2025-06-01T00:00:00Z'))
    expect(tm2.emails.all().length).toBe(0)
  })
})
