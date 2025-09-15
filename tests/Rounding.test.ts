import { describe, it, expect } from "vitest";
import { TimeManager } from "../src/TimeManager";
import type { Company, Employee, Project, TimeEntry } from "../src/types";

describe("Rounding both", () => {
  it("applyOn: 'both' affects duration and endTime", () => {
    const tm = new TimeManager();
    const company: Company = {
      id: "c1",
      name: "Acme",
      policy: { rounding: { stepMinutes: 10, mode: "nearest", applyOn: "both" } },
    };
    const employee: Employee = {
      id: "e1",
      companyId: "c1",
      name: "John",
      email: "j@x.com",
      role: "Dev",
    };
    const project: Project = {
      id: "p1",
      companyId: "c1",
      name: "P",
      clientId: "cl",
      status: "active",
    };
    tm.addCompany(company);
    tm.addEmployee(employee);
    tm.addProject(project);
    const entry: TimeEntry = {
      id: "t1",
      companyId: "c1",
      employeeId: "e1",
      projectId: "p1",
      description: "x",
      startTime: new Date("2025-09-14T09:00:00"),
      endTime: new Date("2025-09-14T10:07:00"),
      duration: undefined,
    };
    tm.addTimeEntry(entry);
    const r = tm.generateReport({ companyId: "c1" });
    const e = r.entries[0];
    expect(e.duration).toBeDefined();
    // @ts-expect-error duration verified above
    expect(e.duration % 10).toBe(0);
    expect(e.endTime.getMinutes() % 10).toBe(0);
  });
});
