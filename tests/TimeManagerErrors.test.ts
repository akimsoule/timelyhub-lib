import { describe, it, expect } from "vitest";
import { TimeManager } from "../src/TimeManager";
import type { Company, Employee, Project, TimeEntry } from "../src/types";

describe("TimeManager errors", () => {
  it("submit/approve/reject entry not found", () => {
    const tm = new TimeManager();
    expect(() => tm.submitEntry("missing")).toThrow("Entry not found");
    expect(() => tm.approveEntry("missing")).toThrow("Entry not found");
    expect(() => tm.rejectEntry("missing")).toThrow("Entry not found");
  });

  it("rounding with stepMinutes=0 does not change values", () => {
    const tm = new TimeManager();
    const c: Company = {
      id: "c1",
      name: "Acme",
      policy: { rounding: { stepMinutes: 0, mode: "nearest", applyOn: "duration" } },
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
    expect(r.entries[0].duration).toBe(73);
  });

  it("generateReport without filters (no date range)", () => {
    const tm = new TimeManager();
    const c: Company = { id: "c1", name: "Acme" };
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
      endTime: new Date("2025-09-14T10:00:00"),
      duration: 60,
    };
    tm.addTimeEntry(entry);
    const r = tm.generateReport({});
    expect(r.entries.length).toBe(1);
    expect(r.totalHours).toBeCloseTo(1);
  });
});
