import { describe, it, expect } from "vitest";
import { TimeManager } from "../src/TimeManager";
import type { Company, Employee, Project, TimeEntry } from "../src/types";

describe("Public manager getters", () => {
  it("expose managers and allow listing", () => {
    const tm = new TimeManager();
    const company: Company = { id: "c1", name: "Acme" };
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
      endTime: new Date("2025-09-14T10:00:00"),
      duration: 60,
    };
    tm.addTimeEntry(entry);

    expect(tm.companies.list().length).toBe(1);
    expect(tm.employees.list().length).toBe(1);
    expect(tm.projects.list().length).toBe(1);
    expect(tm.entries.list().length).toBe(1);

    // periods & audits
    tm.closePeriod("c1", new Date("2025-09-14T00:00:00Z"), new Date("2025-09-15T00:00:00Z"));
    expect(tm.periods.list("c1").length).toBe(1);
    tm.submitEntry("t1", "submit");
    expect(tm.audits.all().length).toBeGreaterThan(0);
  });
});
