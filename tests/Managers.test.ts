import { describe, it, expect } from "vitest";
import { CompanyManager } from "../src/managers/CompanyManager";
import { EmployeeManager } from "../src/managers/EmployeeManager";
import { ProjectManager } from "../src/managers/ProjectManager";
import { PeriodManager } from "../src/managers/PeriodManager";
import { TimeEntryManager } from "../src/managers/TimeEntryManager";
import type { Company, Employee, Project } from "../src/types";

describe("Managers", () => {
  it("CompanyManager: add/get/has/list", () => {
    const m = new CompanyManager();
    const c1: Company = { id: "c1", name: "Acme" };
    const c2: Company = { id: "c2", name: "Globex" };
    m.add(c1);
    m.add(c2);
    expect(m.has("c1")).toBe(true);
    expect(m.get("c1")).toEqual(c1);
    expect(m.list()).toHaveLength(2);
  });

  it("EmployeeManager: add/get/has/list", () => {
    const m = new EmployeeManager();
    const e1: Employee = { id: "e1", companyId: "c1", name: "John", email: "j@x.com", role: "Dev" };
    const e2: Employee = { id: "e2", companyId: "c1", name: "Jane", email: "j2@x.com", role: "PM" };
    m.add(e1);
    m.add(e2);
    expect(m.has("e1")).toBe(true);
    expect(m.get("e2")).toEqual(e2);
    expect(m.list()).toHaveLength(2);
  });

  it("ProjectManager: add/get/has/list", () => {
    const m = new ProjectManager();
    const p1: Project = {
      id: "p1",
      companyId: "c1",
      name: "P1",
      clientId: "cl1",
      status: "active",
    };
    const p2: Project = {
      id: "p2",
      companyId: "c1",
      name: "P2",
      clientId: "cl2",
      status: "on-hold",
    };
    m.add(p1);
    m.add(p2);
    expect(m.has("p1")).toBe(true);
    expect(m.get("p2")).toEqual(p2);
    expect(m.list()).toHaveLength(2);
  });

  it("PeriodManager: close/isClosed/list and invalid period", () => {
    const m = new PeriodManager();
    const start = new Date("2025-09-14T00:00:00Z");
    const end = new Date("2025-09-15T00:00:00Z");
    m.close("c1", start, end);
    expect(
      m.isClosed("c1", new Date("2025-09-14T12:00:00Z"), new Date("2025-09-14T13:00:00Z"))
    ).toBe(true);
    expect(
      m.isClosed("c1", new Date("2025-09-16T00:00:00Z"), new Date("2025-09-17T00:00:00Z"))
    ).toBe(false);
    expect(m.list("c1")).toHaveLength(1);
    expect(m.list()).toHaveLength(1);
    // invalid: end <= start
    expect(() => m.close("c1", end, start)).toThrow("Invalid period");
  });

  it("TimeEntryManager: add/list/clear, helpers", () => {
    const m = new TimeEntryManager();
    const start = new Date("2025-09-14T09:00:00Z");
    const end = new Date("2025-09-14T10:07:00Z");
    // helpers
    expect(m.calculateDuration(start, end)).toBe(67);
    expect(
      m.intervalsOverlap(
        start,
        end,
        new Date("2025-09-14T09:30:00Z"),
        new Date("2025-09-14T09:45:00Z")
      )
    ).toBe(true);
    expect(
      m.intervalsOverlap(
        start,
        end,
        new Date("2025-09-14T10:07:00Z"),
        new Date("2025-09-14T11:00:00Z")
      )
    ).toBe(false);
    expect(m.applyRounding(67, 0, "nearest")).toBe(67);
    expect(m.applyRounding(67, 15, "nearest")).toBe(60);
    expect(m.applyRounding(61, 15, "up")).toBe(75);
    expect(m.applyRounding(61, 15, "down")).toBe(60);

    // add/list/clear
    m.add({
      id: "t1",
      companyId: "c1",
      employeeId: "e1",
      projectId: "p1",
      description: "x",
      startTime: start,
      endTime: end,
      duration: 67,
    });
    expect(m.list().length).toBe(1);
    m.clear();
    expect(m.list().length).toBe(0);
  });
});
