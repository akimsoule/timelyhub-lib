import { describe, it, expect } from 'vitest'
import { TimeManager } from '../src/TimeManager'
import type { Company, Employee, Project, TimeEntry, EmailTemplate } from '../src/types'

describe('TimeManager email branches with templates + emp undefined', () => {
  it('submit/approve/reject use templates with empty employee var when employee missing', () => {
    const tm = new TimeManager()
    const c: Company = { id: 'c7', name: 'Zeta' }
    const e: Employee = { id: 'e7', companyId: 'c7', name: 'Neo', email: 'n@x.com', role: 'employee' }
    const p: Project = { id: 'p7', companyId: 'c7', name: 'P', clientId: 'cl', status: 'active' }
    tm.addCompany(c); tm.addEmployee(e); tm.addProject(p)

    tm.emails.addTemplate({ id: 'ts', name: 'entry_submitted', subject: 'S {{entryId}}', body: 'B {{employee}}' } as EmailTemplate)
    tm.emails.addTemplate({ id: 'ta', name: 'entry_approved', subject: 'A {{entryId}}', body: 'B {{employee}}' } as EmailTemplate)
    tm.emails.addTemplate({ id: 'tr', name: 'entry_rejected', subject: 'R {{entryId}}', body: 'B {{employee}} {{reason}}' } as EmailTemplate)

    const t: TimeEntry = { id: 't7', companyId: 'c7', employeeId: 'e7', projectId: 'p7', description: 'x', startTime: new Date('2025-01-01T09:00:00Z'), endTime: new Date('2025-01-01T10:00:00Z') }
    tm.addTimeEntry(t)
    t.employeeId = 'ghost'
    tm.submitEntry('t7')

    const t2: TimeEntry = { id: 't8', companyId: 'c7', employeeId: 'e7', projectId: 'p7', description: 'y', startTime: new Date('2025-01-02T09:00:00Z'), endTime: new Date('2025-01-02T10:00:00Z') }
    tm.addTimeEntry(t2); tm.submitEntry('t8'); t2.employeeId = 'ghost'; tm.approveEntry('t8')

    const t3: TimeEntry = { id: 't9', companyId: 'c7', employeeId: 'e7', projectId: 'p7', description: 'z', startTime: new Date('2025-01-03T09:00:00Z'), endTime: new Date('2025-01-03T10:00:00Z') }
    tm.addTimeEntry(t3); tm.submitEntry('t9'); t3.employeeId = 'ghost'; tm.rejectEntry('t9','why')

  const mails = tm.emails.all()
  // submit emails sent before mutation exist
  const ids = mails.map(m => m.id).sort()
  expect(ids).toContain('mail:t8:submitted')
  expect(ids).toContain('mail:t9:submitted')
  // but no approve/reject emails after employee became undefined
  expect(ids).not.toContain('mail:t8:approved')
  expect(ids).not.toContain('mail:t9:rejected')
  })
})
