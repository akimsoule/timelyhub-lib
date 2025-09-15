import type { Leave } from '../types'

export class LeaveManager {
  private leaves: Leave[] = []

  add(l: Leave) { this.leaves.push(l) }
  list(companyId?: string, employeeId?: string): ReadonlyArray<Leave> {
    return this.leaves.filter(l => (
      (!companyId || l.companyId === companyId) && (!employeeId || l.employeeId === employeeId)
    ))
  }
  approvedInRange(companyId: string, employeeId: string, start: Date, end: Date): boolean {
    return this.leaves.some(l => l.companyId === companyId && l.employeeId === employeeId && l.status === 'approved' && start < l.end && l.start < end)
  }
  clear() { this.leaves = [] }
}
