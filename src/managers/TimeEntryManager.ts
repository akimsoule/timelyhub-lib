import type { TimeEntry, RoundingMode } from '../types'

export class TimeEntryManager {
  private entries: TimeEntry[] = [];

  add(entry: TimeEntry): void {
    this.entries.push(entry);
  }

  list(): ReadonlyArray<TimeEntry> { return this.entries }

  clear(): void { this.entries = [] }

  calculateDuration(start: Date, end: Date): number {
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  }

  intervalsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
    return aStart < bEnd && bStart < aEnd;
  }

  applyRounding(valueMinutes: number, step: number, mode: RoundingMode): number {
    if (step <= 0) return valueMinutes;
    const ratio = valueMinutes / step;
    const rounded = mode === 'nearest' ? Math.round(ratio) : mode === 'up' ? Math.ceil(ratio) : Math.floor(ratio);
    return rounded * step;
  }
}
