import { describe, it, expect } from "vitest";
import { TimeManager } from "../src/TimeManager";
import type { Company, Employee, Project, TimeEntry } from "../src/types";

describe("TimeManager coverage extras", () => {
  it("rounding mode 'down' on duration", () => {
    const tm = new TimeManager();
    const c: Company = {
      id: "c1",
      name: "Acme",
      policy: { rounding: { stepMinutes: 15, mode: "down", applyOn: "duration" } },
    };
    const e: Employee = { id: "e1", companyId: "c1", name: "John", email: "j@x.com", role: "Dev" };
    const p: Project = { id: "p1", companyId: "c1", name: "P", clientId: "cl", status: "active" };
    tm.addCompany(c);
    tm.addEmployee(e);
    tm.addProject(p);
    const entry: TimeEntry = {
      id: "t1",
      companyId: "c1",
      employeeId: "e1",
      projectId: "p1",
      description: "x",
      startTime: new Date("2025-09-14T09:00:00"),
      endTime: new Date("2025-09-14T10:13:00"),
    };
    tm.addTimeEntry(entry);
    const r = tm.generateReport({ companyId: "c1" });
    expect(r.entries[0].duration).toBe(60); // 73 -> down to 60
  });

  it("public isPeriodClosed returns expected values", () => {
    const tm = new TimeManager();
    const c: Company = { id: "c1", name: "Acme" };
    tm.addCompany(c);
    const start = new Date("2025-09-14T00:00:00Z");
    const end = new Date("2025-09-15T00:00:00Z");
    expect(tm.isPeriodClosed("c1", start, end)).toBe(false);
    tm.closePeriod("c1", start, end);
    expect(
      tm.isPeriodClosed("c1", new Date("2025-09-14T12:00:00Z"), new Date("2025-09-14T13:00:00Z"))
    ).toBe(true);
  });
});
