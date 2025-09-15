import type { AggregationBucket, AggregationQuery, TimeEntry } from '../types'

function toDay(d: Date): string {
  return `${d.getUTCFullYear()}-${(d.getUTCMonth()+1).toString().padStart(2,'0')}-${d.getUTCDate().toString().padStart(2,'0')}`
}
function toMonth(d: Date): string {
  return `${d.getUTCFullYear()}-${(d.getUTCMonth()+1).toString().padStart(2,'0')}`
}
function toWeek(d: Date): string {
  // ISO week approximation: year-week
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const dayNum = (date.getUTCDay() + 6) % 7
  date.setUTCDate(date.getUTCDate() - dayNum + 3)
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(),0,4))
  const week = 1 + Math.round(((date.getTime() - firstThursday.getTime())/86400000 - 3 + ((firstThursday.getUTCDay()+6)%7))/7)
  return `${date.getUTCFullYear()}-W${week.toString().padStart(2,'0')}`
}

export class ReportingManager {
  aggregate(entries: ReadonlyArray<TimeEntry>, query: AggregationQuery): AggregationBucket[] {
    const filtered = entries.filter(e => {
      const f = query.filters
      if (!f) return true
      if (f.companyId && e.companyId !== f.companyId) return false
      if (f.employeeId && e.employeeId !== f.employeeId) return false
      if (f.projectId && e.projectId !== f.projectId) return false
      if (f.status && e.status !== f.status) return false
      if (f.startDate && e.endTime < f.startDate) return false
      if (f.endDate && e.startTime > f.endDate) return false
      if (f.tags && f.tags.length && !((e.tags||[]).some(t => f.tags!.includes(t)))) return false
      return true
    })

    const buckets = new Map<string, AggregationBucket>()
    for (const e of filtered) {
      const keyObj: Record<string,string> = {}
      for (const g of query.groupBy) {
        if (g === 'companyId') keyObj.companyId = e.companyId
        else if (g === 'employeeId') keyObj.employeeId = e.employeeId
        else if (g === 'projectId') keyObj.projectId = e.projectId
        else if (g === 'status') keyObj.status = e.status || 'draft'
        else if (g === 'tag') keyObj.tag = (e.tags && e.tags[0]) || ''
        else if (g === 'day') keyObj.day = toDay(e.startTime)
        else if (g === 'week') keyObj.week = toWeek(e.startTime)
        else if (g === 'month') keyObj.month = toMonth(e.startTime)
      }
      const key = JSON.stringify(keyObj)
      const hours = (e.duration ?? Math.round((e.endTime.getTime()-e.startTime.getTime())/60000)) / 60
      let bucket = buckets.get(key)
      if (!bucket) {
        bucket = { key: keyObj, hours: 0, count: 0 }
        buckets.set(key, bucket)
      }
      bucket.hours += hours
      bucket.count += 1
    }

    // cost rollup (simple: use rate from billable flag at flat 0 if not billable)
  /* istanbul ignore next */ if (query.rollup === 'cost') {
      for (const b of buckets.values()) {
        // demo: unknown currency and 0 amount (needs RateCard aggregation to be precise)
        b.cost = { amount: 0, currency: 'USD' }
      }
    }

    return Array.from(buckets.values())
  }

  toCSV(buckets: AggregationBucket[]): string {
    if (!buckets.length) return 'key,hours,count\n'
    const allKeys = new Set<string>()
    buckets.forEach(b => Object.keys(b.key).forEach(k => allKeys.add(k)))
    const headers = ['hours','count', ...Array.from(allKeys.values()).sort()]
    const lines = [headers.join(',')]
    for (const b of buckets) {
      const row = [b.hours.toFixed(2), String(b.count)]
      for (const k of headers.slice(2)) row.push(b.key[k] ?? '')
      lines.push(row.join(','))
    }
    return lines.join('\n') + '\n'
  }
}
