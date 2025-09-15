import { describe, it, expect, beforeEach } from "vitest";
import { TimeManager } from "../src/TimeManager";
import type { Employee, Project, TimeEntry, Company } from "../src/types";

describe("TimeManager", () => {
  let timeManager: TimeManager;
  let company: Company;
  let employee: Employee;
  let project: Project;
  let timeEntry: TimeEntry;

  beforeEach(() => {
    timeManager = new TimeManager();

    company = { id: "c1", name: "Acme Corp" };
    timeManager.addCompany(company);

    employee = {
      id: "1",
      companyId: company.id,
      name: "John Doe",
      email: "john@example.com",
      role: "Developer",
      hourlyRate: 50,
    };

    project = {
      id: "1",
      companyId: company.id,
      name: "Test Project",
      clientId: "client1",
      status: "active",
    };

    timeEntry = {
      id: "1",
      companyId: company.id,
      employeeId: "1",
      projectId: "1",
      description: "Development work",
      startTime: new Date("2025-09-14T09:00:00"),
      endTime: new Date("2025-09-14T17:00:00"),
      duration: 480, // 8 hours in minutes
    };
  });

  describe("Company Management", () => {
    it("should add and retrieve a company", () => {
      const retrieved = timeManager.getCompany(company.id);
      expect(retrieved).toEqual(company);
    });
  });

  describe("Employee Management", () => {
    it("should add and retrieve an employee", () => {
      timeManager.addEmployee(employee);
      expect(timeManager.getEmployee(employee.id)).toEqual(employee);
    });

    it("should throw if company not found when adding employee", () => {
      const badEmployee: Employee = { ...employee, id: "e-bad", companyId: "unknown" };
      expect(() => timeManager.addEmployee(badEmployee)).toThrow("Company not found");
    });
  });

  describe("Project Management", () => {
    it("should add and retrieve a project", () => {
      timeManager.addProject(project);
      expect(timeManager.getProject(project.id)).toEqual(project);
    });

    it("should throw if company not found when adding project", () => {
      const badProject: Project = { ...project, id: "p-bad", companyId: "unknown" };
      expect(() => timeManager.addProject(badProject)).toThrow("Company not found");
    });
  });

  describe("Time Entry Management", () => {
    it("should add a time entry", () => {
      timeManager.addEmployee(employee);
      timeManager.addProject(project);
      timeManager.addTimeEntry(timeEntry);

      const report = timeManager.generateReport({
        employeeId: employee.id,
        startDate: new Date("2025-09-14T00:00:00"),
        endDate: new Date("2025-09-14T23:59:59"),
      });

      expect(report.entries).toHaveLength(1);
      expect(report.totalHours).toBe(8);
      expect(report.entries[0].status).toBe("draft");
    });

    it("should throw error if employee not found", () => {
      timeManager.addProject(project);
      expect(() => timeManager.addTimeEntry(timeEntry)).toThrow("Employee not found");
    });

    it("should throw error if project not found", () => {
      timeManager.addEmployee(employee);
      expect(() => timeManager.addTimeEntry(timeEntry)).toThrow("Project not found");
    });

    it("should throw error if company not found", () => {
      const badEntry: TimeEntry = { ...timeEntry, companyId: "unknown" };
      timeManager.addEmployee(employee);
      timeManager.addProject(project);
      expect(() => timeManager.addTimeEntry(badEntry)).toThrow("Company not found");
    });

    it("should prevent cross-company data mix", () => {
      // Create another company and employee/project under it
      const otherCompany: Company = { id: "c2", name: "Globex" };
      timeManager.addCompany(otherCompany);
      const otherEmployee: Employee = {
        ...employee,
        id: "2",
        companyId: otherCompany.id,
        email: "jane@example.com",
        name: "Jane",
      };
      const otherProject: Project = { ...project, id: "2", companyId: otherCompany.id, name: "P2" };
      timeManager.addEmployee(employee);
      timeManager.addProject(project);
      timeManager.addEmployee(otherEmployee);
      timeManager.addProject(otherProject);

      // Try to log time mixing entities from different companies
      const mixedEntryEmp: TimeEntry = { ...timeEntry, employeeId: otherEmployee.id };
      const mixedEntryProj: TimeEntry = { ...timeEntry, projectId: otherProject.id };

      expect(() => timeManager.addTimeEntry(mixedEntryEmp)).toThrow(
        "Cross-company data is not allowed"
      );
      expect(() => timeManager.addTimeEntry(mixedEntryProj)).toThrow(
        "Cross-company data is not allowed"
      );
    });

    it("should calculate duration when not provided", () => {
      timeManager.addEmployee(employee);
      timeManager.addProject(project);

      const entryWithoutDuration = {
        ...timeEntry,
        duration: undefined,
      };

      timeManager.addTimeEntry(entryWithoutDuration);

      const report = timeManager.generateReport({
        employeeId: employee.id,
        startDate: new Date("2025-09-14T00:00:00"),
        endDate: new Date("2025-09-14T23:59:59"),
      });

      expect(report.entries[0].duration).toBe(480); // 8 hours = 480 minutes
    });

    it("should detect overlapping entries and reject by default", () => {
      timeManager.addEmployee(employee);
      timeManager.addProject(project);
      timeManager.addTimeEntry(timeEntry);
      const overlap: TimeEntry = {
        ...timeEntry,
        id: "ov1",
        startTime: new Date("2025-09-14T16:00:00"),
        endTime: new Date("2025-09-14T18:00:00"),
      };
      expect(() => timeManager.addTimeEntry(overlap)).toThrow(
        "Overlapping time entries are not allowed"
      );
    });

    it("should apply rounding policy on duration", () => {
      // Set company policy to round duration to nearest 30 minutes
      const c = timeManager.getCompany(company.id)!;
      c.policy = { rounding: { stepMinutes: 30, mode: "nearest", applyOn: "duration" } };
      timeManager.addEmployee(employee);
      timeManager.addProject(project);
      const entry: TimeEntry = {
        ...timeEntry,
        id: "r1",
        startTime: new Date("2025-09-14T09:00:00"),
        endTime: new Date("2025-09-14T10:13:00"),
        duration: undefined,
      };
      timeManager.addTimeEntry(entry);
      const added = timeManager.generateReport({ companyId: company.id });
      // 73 minutes -> nearest 30 => 60 minutes
      expect(added.entries.find((e) => e.id === "r1")!.duration).toBe(60);
    });

    it("should apply rounding policy on endTime (and duration)", () => {
      // Round endTime up to 15 minutes
      const c = timeManager.getCompany(company.id)!;
      c.policy = { rounding: { stepMinutes: 15, mode: "up", applyOn: "endTime" } };
      timeManager.addEmployee(employee);
      timeManager.addProject(project);
      const entry: TimeEntry = {
        ...timeEntry,
        id: "r2",
        startTime: new Date("2025-09-14T09:00:00"),
        endTime: new Date("2025-09-14T10:01:00"),
        duration: undefined,
      };
      timeManager.addTimeEntry(entry);
      const added = timeManager.generateReport({ companyId: company.id });
      const e = added.entries.find((x) => x.id === "r2")!;
      expect(e.endTime.getMinutes() % 15).toBe(0);
      expect(e.duration).toBe(75); // 61 -> ceil to 75
    });

    it("should allow overlapping when policy permits", () => {
      const c = timeManager.getCompany(company.id)!;
      c.policy = { allowOverlappingEntries: true };
      timeManager.addEmployee(employee);
      timeManager.addProject(project);
      timeManager.addTimeEntry(timeEntry);
      const overlap: TimeEntry = {
        ...timeEntry,
        id: "ov2",
        startTime: new Date("2025-09-14T16:00:00"),
        endTime: new Date("2025-09-14T18:00:00"),
      };
      expect(() => timeManager.addTimeEntry(overlap)).not.toThrow();
    });

    it("should support workflow transitions (submit/approve/reject)", () => {
      timeManager.addEmployee(employee);
      timeManager.addProject(project);
      timeManager.addTimeEntry(timeEntry);
      timeManager.submitEntry(timeEntry.id);
      expect(() => timeManager.approveEntry(timeEntry.id)).not.toThrow();
      // Another entry to test reject path
      const e2: TimeEntry = {
        ...timeEntry,
        id: "wf2",
        startTime: new Date("2025-09-14T18:00:00"),
        endTime: new Date("2025-09-14T19:00:00"),
        status: undefined,
      };
      timeManager.addTimeEntry(e2);
      timeManager.submitEntry("wf2");
      expect(() => timeManager.rejectEntry("wf2")).not.toThrow();
    });

    it("should enforce valid workflow transitions", () => {
      timeManager.addEmployee(employee);
      timeManager.addProject(project);
      timeManager.addTimeEntry(timeEntry);
      expect(() => timeManager.approveEntry(timeEntry.id)).toThrow(
        "Only submitted entries can be approved"
      );
      expect(() => timeManager.rejectEntry(timeEntry.id)).toThrow(
        "Only submitted entries can be rejected"
      );
      timeManager.submitEntry(timeEntry.id);
      expect(() => timeManager.submitEntry(timeEntry.id)).toThrow(
        "Only draft entries can be submitted"
      );
    });

    it("should auto-split when policy is auto-split", () => {
      const c = timeManager.getCompany(company.id)!;
      c.policy = { overlapHandling: "auto-split" };
      timeManager.addEmployee(employee);
      timeManager.addProject(project);
      timeManager.addTimeEntry(timeEntry);
      const overlap: TimeEntry = {
        ...timeEntry,
        id: "ov3",
        startTime: new Date("2025-09-14T16:00:00"),
        endTime: new Date("2025-09-14T18:00:00"),
      };
      expect(() => timeManager.addTimeEntry(overlap)).not.toThrow();
      const added = timeManager.generateReport({ companyId: company.id });
      const e = added.entries.find((x) => x.id === "ov3")!;
      // Compare en temps local pour éviter les décalages de fuseau liés à .toISOString()
      expect(e.startTime.getTime()).toBe(new Date("2025-09-14T17:00:00").getTime());
    });
  });

  describe("Reporting", () => {
    beforeEach(() => {
      timeManager.addEmployee(employee);
      timeManager.addProject(project);
      timeManager.addTimeEntry(timeEntry);
    });

    it("should filter by employee", () => {
      const report = timeManager.generateReport({ companyId: company.id, employeeId: employee.id });
      expect(report.entries).toHaveLength(1);
      expect(report.entries[0].employeeId).toBe(employee.id);
    });

    it("should filter by project", () => {
      const report = timeManager.generateReport({ companyId: company.id, projectId: project.id });
      expect(report.entries).toHaveLength(1);
      expect(report.entries[0].projectId).toBe(project.id);
    });

    it("should filter by date range", () => {
      const report = timeManager.generateReport({
        companyId: company.id,
        startDate: new Date("2025-09-14T00:00:00"),
        endDate: new Date("2025-09-14T23:59:59"),
      });
      expect(report.entries).toHaveLength(1);
    });

    it("should filter by company", () => {
      // Add another company's data
      const otherCompany: Company = { id: "c2", name: "Globex" };
      timeManager.addCompany(otherCompany);
      const otherEmployee: Employee = {
        ...employee,
        id: "2",
        companyId: otherCompany.id,
        email: "jane@example.com",
        name: "Jane",
      };
      const otherProject: Project = { ...project, id: "2", companyId: otherCompany.id, name: "P2" };
      const otherEntry: TimeEntry = {
        ...timeEntry,
        id: "2",
        companyId: otherCompany.id,
        employeeId: otherEmployee.id,
        projectId: otherProject.id,
      };
      timeManager.addEmployee(otherEmployee);
      timeManager.addProject(otherProject);
      timeManager.addTimeEntry(otherEntry);

      const report1 = timeManager.generateReport({ companyId: company.id });
      const report2 = timeManager.generateReport({ companyId: otherCompany.id });
      expect(report1.entries).toHaveLength(1);
      expect(report2.entries).toHaveLength(1);
      expect(report1.entries[0].companyId).toBe(company.id);
      expect(report2.entries[0].companyId).toBe(otherCompany.id);
    });

    it("should filter by status", () => {
      // Autoriser le chevauchement pour ce test spécifique
      const c = timeManager.getCompany(company.id)!;
      c.policy = { allowOverlappingEntries: true };
      const e1: TimeEntry = { ...timeEntry, id: "fs1" };
      const e2: TimeEntry = {
        ...timeEntry,
        id: "fs2",
        startTime: new Date("2025-09-14T18:00:00"),
        endTime: new Date("2025-09-14T19:00:00"),
        status: undefined,
      };
      timeManager.addEmployee(employee);
      timeManager.addProject(project);
      timeManager.addTimeEntry(e1);
      timeManager.addTimeEntry(e2);
      timeManager.submitEntry("fs2");
      const r1 = timeManager.generateReport({ companyId: company.id, status: "draft" });
      const r2 = timeManager.generateReport({ companyId: company.id, status: "submitted" });
      const rAll = timeManager.generateReport({ companyId: company.id, status: "all" });
      expect(r1.entries.find((x) => x.id === "fs1")).toBeTruthy();
      expect(r1.entries.find((x) => x.id === "fs2")).toBeFalsy();
      expect(r2.entries.find((x) => x.id === "fs2")).toBeTruthy();
      expect(rAll.entries.length).toBeGreaterThanOrEqual(2);
    });

    it("should block add in closed period", () => {
      timeManager.addEmployee(employee);
      timeManager.addProject(project);
      // Close the day
      timeManager.closePeriod(
        company.id,
        new Date("2025-09-14T00:00:00Z"),
        new Date("2025-09-15T00:00:00Z")
      );
      const entry: TimeEntry = {
        ...timeEntry,
        id: "closed1",
      };
      expect(() => timeManager.addTimeEntry(entry)).toThrow("Period is closed for this company");
    });

    it("should record workflow audits with reasons", () => {
      timeManager.addEmployee(employee);
      timeManager.addProject(project);
      // L'entrée existe déjà via beforeEach dans ce bloc
      timeManager.submitEntry(timeEntry.id, "submitted by user");
      timeManager.approveEntry(timeEntry.id, "approved by manager");
      const audits = timeManager.getAuditLog();
      expect(audits.find((a) => a.entryId === timeEntry.id && a.action === "submit")).toBeTruthy();
      expect(audits.find((a) => a.entryId === timeEntry.id && a.action === "approve")).toBeTruthy();
    });
  });
});
