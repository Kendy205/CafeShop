import { jwtDecode } from 'jwt-decode'

const ROLE_CLAIM =
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'

export function extractRoleFromAuthPayload(payload) {
    if (!payload || typeof payload !== 'object') return null
    const raw =
        payload.role ??
        payload.userRole ??
        payload.user?.role ??
        (Array.isArray(payload.roles) ? payload.roles[0] : null)
    if (raw == null || raw === '') return null
    return typeof raw === 'string' ? raw.trim() : String(raw)
}

export function getRolesAndPermissionsFromToken(accessToken) {
    if (!accessToken) return { roles: [], permissions: [] }
    try {
        const decoded = jwtDecode(accessToken)
        let roles = decoded.role ?? decoded.Role ?? decoded[ROLE_CLAIM] ?? decoded.roles ?? []
        if (typeof roles === 'string') {
            roles = [roles]
        }
        if (!Array.isArray(roles)) {
            roles = roles ? [String(roles)] : []
        }
        let permissions = decoded.Permission ?? decoded.permission ?? decoded.Permissions ?? decoded.permissions ?? []
        if (typeof permissions === 'string') {
            permissions = [permissions]
        }
        if (!Array.isArray(permissions)) {
            permissions = permissions ? [String(permissions)] : []
        }
        return { roles, permissions }
    } catch {
        return { roles: [], permissions: [] }
    }
}

export function resolveRoleFromAuth(payload, accessToken) {
    const fromToken = getRolesAndPermissionsFromToken(accessToken)
    return fromToken.roles // return array of roles
}

export function normalizeRole(role) {
    if (role == null) return []
    if (Array.isArray(role)) return role.map((r) => String(r).trim().toUpperCase())
    return [String(role).trim().toUpperCase()]
}

export function isAdminRole(role) {
    const roles = normalizeRole(role)
    return roles.includes('ADMIN')
}

export function isStaffRole(role) {
    const roles = normalizeRole(role)
    return roles.includes('STAFF')
}
