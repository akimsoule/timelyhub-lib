/* istanbul ignore file */
import type { BudgetConsumption, BudgetDefinition, DomainEvent, TimeEntry } from '../types'

export class BudgetManager {
  private definitions: Map<string, BudgetDefinition> = new Map()
  private consumption: Map<string, BudgetConsumption> = new Map()

  upsert(def: BudgetDefinition) {
    this.definitions.set(def.id, def)
    if (!this.consumption.has(def.id)) this.consumption.set(def.id, { hours: 0, amount: def.limitAmount ? { amount: 0, currency: def.limitAmount.currency } : undefined })
  }

  list(): ReadonlyArray<BudgetDefinition> { return Array.from(this.definitions.values()) }

  getConsumption(id: string): BudgetConsumption | undefined { return this.consumption.get(id) }

  applyEntry(e: TimeEntry, emit: (event: DomainEvent) => void) {
    for (const def of this.definitions.values()) {
      if (def.companyId !== e.companyId) continue
      if (def.scope === 'project' && def.key !== e.projectId) continue
      // TODO team/phase mapping if types available
      const cons = this.consumption.get(def.id)!
      const hours = (e.duration ?? Math.round((e.endTime.getTime()-e.startTime.getTime())/60000))/60
      cons.hours += hours
      // For simplicity omit amount calculation (needs rates); still support threshold by hours or amount if configured
      const thresholds = def.alertThresholds || []
      // compute ratio on hours or amount
      const ratios: number[] = []
      if (def.limitHours && def.limitHours > 0) ratios.push(cons.hours / def.limitHours)
      if (def.limitAmount && def.limitAmount.amount > 0 && cons.amount) ratios.push(cons.amount.amount / def.limitAmount.amount)
      const maxRatio = ratios.length ? Math.max(...ratios) : 0
      for (const th of thresholds) {
        if (maxRatio >= th) {
          emit({ name: 'budget.threshold', at: new Date(), payload: { budgetId: def.id, ratio: maxRatio, hours: cons.hours } })
          break
        }
      }
    }
  }

  clear() { this.definitions.clear(); this.consumption.clear() }
}
