export type RoundingMode = "nearest" | "up" | "down";

export interface CompanyPolicy {
  rounding?: {
    stepMinutes: number; // e.g. 5, 10, 15
    mode: RoundingMode;
    applyOn: "duration" | "endTime" | "both";
  };
  allowOverlappingEntries?: boolean; // default false
  overlapHandling?: "reject" | "allow" | "auto-split"; // precedence over allowOverlappingEntries
  disallowEntriesOnHolidays?: boolean;
  disallowEntriesOnApprovedLeave?: boolean;
}

export interface Company {
  id: string;
  name: string;
  address?: string;
  policy?: CompanyPolicy;
}

export interface TimeEntry {
  id: string;
  companyId: string;
  employeeId: string;
  projectId: string;
  description: string;
  startTime: Date;
  endTime: Date;
  duration?: number; // in minutes
  tags?: string[];
  status?: EntryStatus; // default 'draft'
  billable?: boolean; // computed via rate cards / project policy
}

export interface Employee {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: string;
  hourlyRate?: number;
}

export interface Project {
  id: string;
  companyId: string;
  name: string;
  clientId: string;
  budget?: number;
  status: "active" | "completed" | "on-hold";
}

export type EntryStatus = "draft" | "submitted" | "approved" | "rejected";

export interface Period {
  companyId: string;
  start: Date;
  end: Date;
}

export interface AuditRecord {
  id: string;
  entryId: string;
  action: "submit" | "approve" | "reject";
  reason?: string;
  at: Date;
}

export interface TimeReport {
  companyId?: string | undefined;
  employeeId?: string | undefined;
  projectId?: string | undefined;
  status?: EntryStatus | "all";
  startDate: Date;
  endDate: Date;
  totalHours: number;
  entries: TimeEntry[];
}

// RBAC
export type Role = 'employee' | 'manager' | 'admin';
export type PermissionAction = 'addEntry' | 'submit' | 'approve' | 'reject' | 'closePeriod';

// Absences
export interface Leave {
  id: string;
  companyId: string;
  employeeId: string;
  start: Date;
  end: Date;
  status: 'approved' | 'pending' | 'rejected';
}

// Jours fériés
export interface Holiday {
  id: string;
  companyId: string;
  date: Date; // jour entier
  name: string;
}

// Tarification
export type RateTarget = 'employee' | 'role' | 'project';
export interface RateCard {
  id: string;
  companyId: string;
  target: RateTarget;
  key: string; // employeeId | role | projectId
  billable: boolean;
  rate: number; // par heure
  currency: string;
  validFrom?: Date;
  validTo?: Date;
}

// Événements
export type EventName =
  | 'entry.added'
  | 'entry.submitted'
  | 'entry.approved'
  | 'entry.rejected'
  | 'period.closed'
  | 'budget.threshold';

export interface DomainEvent {
  name: EventName;
  at: Date;
  payload: Record<string, unknown>;
}

// Emailing
export interface EmailMessage {
  id: string;
  to: string[]; // destinataires
  subject: string;
  body: string; // texte simple pour simplicité
  meta?: Record<string, unknown>;
}

export interface EmailTemplate {
  id: string;
  name: 'entry_submitted' | 'entry_approved' | 'entry_rejected' | 'period_closed';
  subject: string;
  body: string; // peut contenir des tokens {{var}}
}

// Persistence (Ports/Adapters)
export interface Repository<T extends { id: string }> {
  getById(id: string): T | undefined;
  list(): ReadonlyArray<T>;
  upsert(entity: T): void;
  remove(id: string): void;
  clear(): void;
}

export interface UnitOfWorkSnapshot {
  // opaque marker for rollback
  id: string;
}

export interface UnitOfWork {
  begin(): UnitOfWorkSnapshot;
  commit(snapshot: UnitOfWorkSnapshot): void;
  rollback(snapshot: UnitOfWorkSnapshot): void;
}

export interface PersistenceAdapter {
  companies: Repository<Company>;
  employees: Repository<Employee>;
  projects: Repository<Project>;
  entries: Repository<TimeEntry>;
}

// Reporting
export type GroupByField = 'companyId' | 'employeeId' | 'projectId' | 'status' | 'tag' | 'day' | 'week' | 'month';
export interface ReportFilter {
  companyId?: string;
  employeeId?: string;
  projectId?: string;
  status?: EntryStatus;
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
}
export interface AggregationQuery {
  groupBy: GroupByField[];
  filters?: ReportFilter;
  rollup?: 'hours' | 'cost';
}
export interface AggregationBucket {
  key: Record<string, string>;
  hours: number;
  cost?: { amount: number; currency: string };
  count: number;
}

// Budgets
export type BudgetScope = 'project' | 'team' | 'phase';
export interface BudgetDefinition {
  id: string;
  companyId: string;
  scope: BudgetScope;
  key: string; // projectId | teamId | phaseId
  limitHours?: number;
  limitAmount?: { amount: number; currency: string };
  alertThresholds?: number[]; // e.g., [0.8, 1.0]
}
export interface BudgetConsumption {
  hours: number;
  amount?: { amount: number; currency: string };
}

// Notifications / Webhooks / Slack
export type NotificationChannel = 'webhook' | 'slack';
export interface WebhookSubscription {
  id: string;
  url: string; // No network calls here; stored for reference
  events: string[]; // interested events
}
export interface SlackSubscription {
  id: string;
  channel: string; // e.g., #timesheets
  events: string[];
}
export interface OutboundNotification {
  id: string;
  channel: NotificationChannel;
  event: DomainEvent;
  target: string; // url or channel
  payload: Record<string, unknown>;
}

// Holiday provider
export interface HolidayProvider {
  fetch(country: string, year: number): Holiday[];
}
