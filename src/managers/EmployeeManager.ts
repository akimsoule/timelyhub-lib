import type { Employee } from '../types'

export class EmployeeManager {
  private employees: Map<string, Employee> = new Map();

  add(employee: Employee): void {
    this.employees.set(employee.id, employee);
  }

  get(id: string): Employee | undefined {
    return this.employees.get(id);
  }

  has(id: string): boolean {
    return this.employees.has(id);
  }

  list(): ReadonlyArray<Employee> {
    return Array.from(this.employees.values());
  }
}
