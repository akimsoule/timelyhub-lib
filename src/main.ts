// Exemple complet d'utilisation de la librairie
// Exécution conseillée: npx tsx src/main.ts

import { TimeManager } from './TimeManager'
import type { Company, Employee, Project, TimeEntry, RateCard } from './types'

async function main() {
  const tm = new TimeManager()

  // 1) Données de base
  const company: Company = {
    id: 'c1',
    name: 'Acme',
    policy: { rounding: { stepMinutes: 15, mode: 'nearest', applyOn: 'duration' } }
  }
  const manager: Employee = { id: 'm1', companyId: 'c1', name: 'Manager Mia', email: 'manager@acme.io', role: 'manager' }
  const dev: Employee = { id: 'e1', companyId: 'c1', name: 'Dev Dan', email: 'dev@acme.io', role: 'employee' }
  const project: Project = { id: 'p1', companyId: 'c1', name: 'Client Project', clientId: 'client-42', status: 'active' }

  tm.addCompany(company)
  tm.addEmployee(manager)
  tm.addEmployee(dev)
  tm.addProject(project)

  // 2) RBAC: donner les droits au manager
  tm.access.setUserRole('c1','m1','manager')
  ;['approve','reject','closePeriod'].forEach(a => tm.access.allow('c1', a as any, 'manager'))

  // 3) Tarifs: 100 EUR/h pour l'employé
  const rate: RateCard = { id: 'r1', companyId: 'c1', target: 'employee', key: 'e1', billable: true, rate: 100, currency: 'EUR' }
  tm.rates.add(rate)

  // 4) Ajout de deux saisies de temps
  const t1: TimeEntry = {
    id: 't1', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'Feature A',
    startTime: new Date('2025-09-14T09:00:00Z'), endTime: new Date('2025-09-14T11:00:00Z')
  }
  const t2: TimeEntry = {
    id: 't2', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'Feature B',
    startTime: new Date('2025-09-14T12:00:00Z'), endTime: new Date('2025-09-14T13:00:00Z')
  }
  tm.addTimeEntry(t1)
  tm.addTimeEntry(t2)

  // 5) Workflow: soumettre puis approuver/rejeter
  tm.submitEntry('t1')
  tm.submitEntry('t2')
  tm.approveEntryAs('m1','t1')
  tm.rejectEntryAs('m1','t2','incomplete details')

  // 6) Rapports
  const report = tm.generateReport({ companyId: 'c1', status: 'all', startDate: new Date('2025-09-14T00:00:00Z'), endDate: new Date('2025-09-15T00:00:00Z') })
  const billing = tm.generateBillingReport({ companyId: 'c1', startDate: new Date('2025-09-14T00:00:00Z'), endDate: new Date('2025-09-15T00:00:00Z') })
  const csv = tm.exportReportToCSV(report)

  // 7) Clôture de période
  tm.closePeriodAs('m1','c1', new Date('2025-09-01T00:00:00Z'), new Date('2025-10-01T00:00:00Z'))

  // 8) Affichages
  console.log('--- EVENTS ---')
  console.log(tm.events.all().map(e => e.name))

  console.log('\n--- AUDIT LOG ---')
  console.table(tm.getAuditLog())

  console.log('\n--- REPORT (all statuses) ---')
  console.log({ totalHours: report.totalHours, count: report.entries.length })

  console.log('\n--- BILLING ---')
  console.table(billing.items)
  console.log('Totals by currency:', billing.totalsByCurrency)

  console.log('\n--- CSV (first lines) ---')
  console.log(csv.split('\n').slice(0, 3).join('\n'))

  console.log('\n--- EMAILS OUTBOX ---')
  console.table(tm.emails.all())
}

main().catch(err => {
  console.error(err)
  process.exitCode = 1
})
