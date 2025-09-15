import { describe, it, expect } from "vitest";
import { TimeManager } from "../src/TimeManager";
import type { Company, Employee, Project, TimeEntry } from "../src/types";

describe("Overlap auto-split edge cases", () => {
  it("rejects when overlap fully covers new interval in auto-split", () => {
    const tm = new TimeManager();
    const company: Company = { id: "c1", name: "Acme", policy: { overlapHandling: "auto-split" } };
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

    const base: TimeEntry = {
      id: "b",
      companyId: "c1",
      employeeId: "e1",
      projectId: "p1",
      description: "x",
      startTime: new Date("2025-09-14T09:00:00"),
      endTime: new Date("2025-09-14T10:00:00"),
      duration: 60,
    };
    tm.addTimeEntry(base);

    const fullCovered: TimeEntry = {
      id: "c",
      companyId: "c1",
      employeeId: "e1",
      projectId: "p1",
      description: "y",
      startTime: new Date("2025-09-14T09:10:00"),
      endTime: new Date("2025-09-14T09:20:00"),
      duration: 10,
    };
    expect(() => tm.addTimeEntry(fullCovered)).toThrow("Overlapping time entries are not allowed");
  });
});
