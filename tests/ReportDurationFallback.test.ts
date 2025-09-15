import { describe, it, expect } from "vitest";
import { TimeManager } from "../src/TimeManager";
import type { Company, Employee, Project, TimeEntry } from "../src/types";

describe("Report reduce fallback duration calculation", () => {
  it("computes duration via calculateDuration when entry.duration is undefined", () => {
    const tm = new TimeManager();
    const c: Company = { id: "c1", name: "Acme" };
    const e: Employee = { id: "e1", companyId: "c1", name: "John", email: "j@x.com", role: "Dev" };
    const p: Project = { id: "p1", companyId: "c1", name: "P", clientId: "cl", status: "active" };
    tm.addCompany(c);
    tm.addEmployee(e);
    tm.addProject(p);

    // Bypass addTimeEntry to keep duration undefined
    const raw: TimeEntry = {
      id: "raw1",
      companyId: "c1",
      employeeId: "e1",
      projectId: "p1",
      description: "x",
      startTime: new Date("2025-09-14T09:00:00Z"),
      endTime: new Date("2025-09-14T09:30:00Z"),
    };
    tm.entries.add(raw);

    const r = tm.generateReport({});
    expect(r.entries.find((x) => x.id === "raw1")).toBeTruthy();
    expect(r.totalHours).toBeCloseTo(0.5);
  });
});
