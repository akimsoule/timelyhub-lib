import type { Project } from '../types'

export class ProjectManager {
  private projects: Map<string, Project> = new Map();

  add(project: Project): void {
    this.projects.set(project.id, project);
  }

  get(id: string): Project | undefined {
    return this.projects.get(id);
  }

  has(id: string): boolean {
    return this.projects.has(id);
  }

  list(): ReadonlyArray<Project> {
    return Array.from(this.projects.values());
  }
}
