import type { PermissionAction, Role } from '../types'

export class AccessControlManager {
  // companyId -> role assignments (userId -> role)
  private roles: Map<string, Map<string, Role>> = new Map()
  // companyId -> action -> roles allowed
  private policies: Map<string, Map<PermissionAction, Set<Role>>> = new Map()

  setUserRole(companyId: string, userId: string, role: Role) {
    if (!this.roles.has(companyId)) this.roles.set(companyId, new Map())
    this.roles.get(companyId)!.set(userId, role)
  }

  allow(companyId: string, action: PermissionAction, role: Role) {
    if (!this.policies.has(companyId)) this.policies.set(companyId, new Map())
    const map = this.policies.get(companyId)!
    if (!map.has(action)) map.set(action, new Set())
    map.get(action)!.add(role)
  }

  can(companyId: string, userId: string, action: PermissionAction): boolean {
    const role = this.roles.get(companyId)?.get(userId)
    if (!role) return false
    const allowed = this.policies.get(companyId)?.get(action)
    return !!allowed && allowed.has(role)
  }

  clear() { this.roles.clear(); this.policies.clear() }
}
