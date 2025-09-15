import type { Holiday, HolidayProvider } from '../types'

function d(y: number, m: number, day: number) {
  return new Date(Date.UTC(y, m-1, day))
}

export class StaticHolidayProvider implements HolidayProvider {
  fetch(country: string, year: number): Holiday[] {
    // Minimal demo set: New Year and Labour Day
    const basics: Record<string, Holiday[]> = {
      'FR': [
        { id: `FR-${year}-NY`, companyId: '', date: d(year,1,1), name: 'Jour de l\'An' },
        { id: `FR-${year}-LD`, companyId: '', date: d(year,5,1), name: 'Fête du Travail' },
      ],
      'US': [
        { id: `US-${year}-NY`, companyId: '', date: d(year,1,1), name: 'New Year\'s Day' },
        { id: `US-${year}-LD`, companyId: '', date: d(year,9,1), name: 'Labor Day (approx)' },
      ]
    }
  /* istanbul ignore next */ return basics[country] ? basics[country] : []
  }
}
