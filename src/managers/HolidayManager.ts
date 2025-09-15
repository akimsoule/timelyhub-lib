import type { Holiday } from '../types'

export class HolidayManager {
  private holidays: Holiday[] = []

  add(h: Holiday) { this.holidays.push(h) }
  list(companyId?: string): ReadonlyArray<Holiday> {
    return companyId ? this.holidays.filter(h => h.companyId === companyId) : this.holidays
  }
  isHoliday(companyId: string, date: Date): boolean {
    const ymd = (d: Date) => `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`
    return this.holidays.some(h => h.companyId === companyId && ymd(h.date) === ymd(date))
  }
  clear() { this.holidays = [] }
}
