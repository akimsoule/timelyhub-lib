import { describe, it, expect } from "vitest";
import { TimeManager } from "../src/TimeManager";
import type { Company, Employee, Project, TimeEntry } from "../src/types";

describe("Email error branches (catch paths)", () => {
  it("swallows errors from email sending in submit/approve/reject/closePeriod", () => {
    const tm = new TimeManager();
    const c: Company = { id: "c1", name: "Acme" };
    const mgr: Employee = {
      id: "m1",
      companyId: "c1",
      name: "Manager",
      email: "m@x.com",
      role: "manager",
    };
    const emp: Employee = {
      id: "e1",
      companyId: "c1",
      name: "Alice",
      email: "a@x.com",
      role: "employee",
    };
    const p: Project = { id: "p1", companyId: "c1", name: "P", clientId: "cl", status: "active" };
    tm.addCompany(c);
    tm.addEmployee(mgr);
    tm.addEmployee(emp);
  tm.addProject(p);
  // Force email sending to throw
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (tm.emails as any).send = () => { throw new Error('boom') }

    // submit
    const t1: TimeEntry = {
      id: "t1",
      companyId: "c1",
      employeeId: "e1",
      projectId: "p1",
      description: "x",
      startTime: new Date("2025-01-01T09:00:00Z"),
      endTime: new Date("2025-01-01T10:00:00Z"),
    };
    tm.addTimeEntry(t1);
    expect(() => tm.submitEntry("t1")).not.toThrow();

    // approve
    tm.access.setUserRole("c1", "m1", "manager");
    tm.access.allow("c1", "approve", "manager");
    expect(() => tm.approveEntryAs("m1", "t1")).not.toThrow();

    // reject
    const t2: TimeEntry = {
      id: "t2",
      companyId: "c1",
      employeeId: "e1",
      projectId: "p1",
      description: "y",
      startTime: new Date("2025-01-02T09:00:00Z"),
      endTime: new Date("2025-01-02T10:00:00Z"),
    };
    tm.addTimeEntry(t2);
    tm.submitEntry("t2");
    tm.access.allow("c1", "reject", "manager");
    expect(() => tm.rejectEntryAs("m1", "t2", "nope")).not.toThrow();

    // close period
    tm.access.allow("c1", "closePeriod", "manager");
    expect(() =>
      tm.closePeriodAs(
        "m1",
        "c1",
        new Date("2025-02-01T00:00:00Z"),
        new Date("2025-03-01T00:00:00Z")
      )
    ).not.toThrow();
  });
});
