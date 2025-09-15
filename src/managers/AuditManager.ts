export type AuditAction = 'submit' | 'approve' | 'reject'
import type { AuditRecord } from '../types'

export class AuditManager {
  private records: AuditRecord[] = [];

  add(record: AuditRecord): void {
    this.records.push(record);
  }

  all(): ReadonlyArray<AuditRecord> {
    return this.records;
  }
}
