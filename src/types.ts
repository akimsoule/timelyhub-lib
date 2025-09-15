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
  | 'period.closed';

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
