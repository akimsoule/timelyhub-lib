# timelyhub-lib

Bibliothèque TypeScript de gestion du temps (timesheets) pour PME: multi-entreprise, workflow d’approbation, politiques (arrondis, chevauchements, jours fériés, congés), audit, clôtures de période, tarification et facturation, exports CSV, événements et emailing en mémoire.

## Installation

```bash
npm i timelyhub-lib
```

Prérequis: Node.js ≥ 18, TypeScript ≥ 5.

## Démarrage rapide (TypeScript)

```ts
import { TimeManager } from 'timelyhub-lib'
import type { Company, Employee, Project, TimeEntry, RateCard } from 'timelyhub-lib/dist/index'

const tm = new TimeManager()

// 1) Référentiel
const company: Company = { id: 'c1', name: 'Acme', policy: { rounding: { stepMinutes: 15, mode: 'nearest', applyOn: 'duration' } } }
const manager: Employee = { id: 'm1', companyId: 'c1', name: 'Manager Mia', email: 'manager@acme.io', role: 'manager' }
const dev: Employee = { id: 'e1', companyId: 'c1', name: 'Dev Dan', email: 'dev@acme.io', role: 'employee' }
const project: Project = { id: 'p1', companyId: 'c1', name: 'Client Project', clientId: 'client-42', status: 'active' }

tm.addCompany(company)
tm.addEmployee(manager)
tm.addEmployee(dev)
tm.addProject(project)

// 2) RBAC
tm.access.setUserRole('c1', 'm1', 'manager')
;['approve','reject','closePeriod'].forEach(a => tm.access.allow('c1', a as any, 'manager'))

// 3) Tarification
const rate: RateCard = { id: 'r1', companyId: 'c1', target: 'employee', key: 'e1', billable: true, rate: 100, currency: 'EUR' }
tm.rates.add(rate)

// 4) Saisies
const t1: TimeEntry = { id: 't1', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'Feature A', startTime: new Date('2025-09-14T09:00:00Z'), endTime: new Date('2025-09-14T11:00:00Z') }
const t2: TimeEntry = { id: 't2', companyId: 'c1', employeeId: 'e1', projectId: 'p1', description: 'Feature B', startTime: new Date('2025-09-14T12:00:00Z'), endTime: new Date('2025-09-14T13:00:00Z') }

tm.addTimeEntry(t1)
tm.addTimeEntry(t2)

tm.submitEntry('t1')
tm.submitEntry('t2')
tm.approveEntryAs('m1', 't1')
tm.rejectEntryAs('m1', 't2', 'incomplete details')

// 5) Rapports
const report = tm.generateReport({ companyId: 'c1', status: 'all', startDate: new Date('2025-09-14T00:00:00Z'), endDate: new Date('2025-09-15T00:00:00Z') })
const billing = tm.generateBillingReport({ companyId: 'c1', startDate: new Date('2025-09-14T00:00:00Z'), endDate: new Date('2025-09-15T00:00:00Z') })
const csv = tm.exportReportToCSV(report)

console.log(report.totalHours)
console.log(billing.totalsByCurrency)
console.log(csv.split('\n')[0]) // entêtes CSV

// 6) Clôture
tm.closePeriodAs('m1', 'c1', new Date('2025-09-01T00:00:00Z'), new Date('2025-10-01T00:00:00Z'))

// 7) Emails (outbox en mémoire)
console.log(tm.emails.all())
```

## Exemple exécutable (dans ce repo)

- Un exemple complet existe dans `src/main.ts`.
- Exécution avec tsx:

```bash
npm i
npm run start
```

## Surfaces d’API utiles
- Référentiels: `tm.companies`, `tm.employees`, `tm.projects` (add/get/has/list)
- Saisies: `tm.addTimeEntry`, `tm.generateReport`, `tm.exportReportToCSV`
- Workflow: `tm.submitEntry`, `tm.approveEntry(As)`, `tm.rejectEntry(As)` + `tm.getAuditLog()`
- Périodes: `tm.closePeriod(As)`, `tm.isPeriodClosed`
- RBAC: `tm.access.setUserRole(companyId, userId, role)`, `tm.access.allow(companyId, action, role)`
- Politiques jours fériés/congés: `tm.holidays`, `tm.leaves`
- Tarification: `tm.rates.add(...)`, `tm.generateBillingReport(...)`
- Événements: `tm.events.all()`
- Emailing: `tm.emails.addTemplate(...)`, `tm.emails.all()`, `tm.emails.clear()`

## Tests et qualité
- Vitest avec couverture 100% (statements/branches/functions/lines).
- Lint/format via ESLint + Prettier.

## Licence
ISC
