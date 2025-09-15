import type { Company } from '../types'

export class CompanyManager {
  private companies: Map<string, Company> = new Map();

  add(company: Company): void {
    this.companies.set(company.id, company);
  }

  get(id: string): Company | undefined {
    return this.companies.get(id);
  }

  has(id: string): boolean {
    return this.companies.has(id);
  }

  list(): ReadonlyArray<Company> {
    return Array.from(this.companies.values());
  }
}
