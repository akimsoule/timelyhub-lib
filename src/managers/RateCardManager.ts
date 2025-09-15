import type { RateCard } from '../types'

export class RateCardManager {
  private rates: RateCard[] = []
  add(r: RateCard) { this.rates.push(r) }
  list(companyId?: string): ReadonlyArray<RateCard> {
    return companyId ? this.rates.filter(r => r.companyId === companyId) : this.rates
  }
  clear() { this.rates = [] }

  // Simplified resolver: pick latest valid card, priority employee > project > role
  resolve(companyId: string, selector: { employeeId?: string; projectId?: string; role?: string }, at: Date): RateCard | undefined {
    const now = at
    const isValid = (r: RateCard) => (!r.validFrom || r.validFrom <= now) && (!r.validTo || now <= r.validTo)
    const pool = this.rates.filter(r => r.companyId === companyId && isValid(r))
    const byKey = (target: string | undefined, kind: RateCard['target']) => target ? pool.filter(r => r.target === kind && r.key === target) : []
    return (
      byKey(selector.employeeId, 'employee')[0] ||
      byKey(selector.projectId, 'project')[0] ||
      byKey(selector.role, 'role')[0]
    )
  }
}
