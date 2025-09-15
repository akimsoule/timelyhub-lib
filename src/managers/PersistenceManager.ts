import type { Company, Employee, PersistenceAdapter, Project, TimeEntry, UnitOfWork, UnitOfWorkSnapshot } from '../types'

export class InMemoryRepository<T extends { id: string }> {
  private map = new Map<string, T>()
  getById(id: string) { return this.map.get(id) }
  list(): ReadonlyArray<T> { return Array.from(this.map.values()) }
  upsert(entity: T) { this.map.set(entity.id, entity) }
  remove(id: string) { this.map.delete(id) }
  clear() { this.map.clear() }
}

export class InMemoryUnitOfWork implements UnitOfWork {
  private snapshots: Map<string, Map<string, unknown[]>> = new Map()
  private counter = 0
  constructor(private repos: Record<string, { list(): ReadonlyArray<unknown>, clear(): void, upsert(e: unknown): void }>) {}

  private isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null
  }

  begin(): UnitOfWorkSnapshot {
    const id = `uow:${++this.counter}`
    const snap: Map<string, unknown[]> = new Map()
    for (const [k, repo] of Object.entries(this.repos)) {
      const copy: unknown[] = repo
        .list()
        .map((e) => (this.isRecord(e) ? { ...e } : e))
      snap.set(k, copy)
    }
    this.snapshots.set(id, snap)
    return { id }
  }
  commit(snapshot: UnitOfWorkSnapshot): void {
    this.snapshots.delete(snapshot.id)
  }
  rollback(snapshot: UnitOfWorkSnapshot): void {
    const snap = this.snapshots.get(snapshot.id)
    if (!snap) return
    for (const [k, arr] of snap.entries()) {
      const repo = this.repos[k]
      repo.clear()
      for (const e of arr) repo.upsert(e)
    }
    this.snapshots.delete(snapshot.id)
  }
}

export class InMemoryPersistenceAdapter implements PersistenceAdapter {
  companies = new InMemoryRepository<Company>()
  employees = new InMemoryRepository<Employee>()
  projects = new InMemoryRepository<Project>()
  entries = new InMemoryRepository<TimeEntry>()
}

export class PersistenceManager {
  constructor(private adapter: PersistenceAdapter, private uow?: UnitOfWork) {}

  get unitOfWork(): UnitOfWork | undefined { return this.uow }

  saveAll(
    companies: ReadonlyArray<Company>,
    employees: ReadonlyArray<Employee>,
    projects: ReadonlyArray<Project>,
    entries: ReadonlyArray<TimeEntry>
  ): void {
    for (const c of companies) this.adapter.companies.upsert(c)
    for (const e of employees) this.adapter.employees.upsert(e)
    for (const p of projects) this.adapter.projects.upsert(p)
    for (const t of entries) this.adapter.entries.upsert(t)
  }

  loadAll(): { companies: Company[]; employees: Employee[]; projects: Project[]; entries: TimeEntry[] } {
    return {
      companies: [...this.adapter.companies.list()],
      employees: [...this.adapter.employees.list()],
  /* istanbul ignore next */ projects: [...this.adapter.projects.list()],
      entries: [...this.adapter.entries.list()],
    }
  }
}
