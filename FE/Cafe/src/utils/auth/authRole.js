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

export function getRoleFromAccessToken(accessToken) {
    if (!accessToken) return null
    try {
        const decoded = jwtDecode(accessToken)
        const raw =
            decoded.role ??
            decoded.Role ??
            decoded[ROLE_CLAIM] ??
            (Array.isArray(decoded.roles) ? decoded.roles[0] : null)
        if (raw == null || raw === '') return null
        return typeof raw === 'string' ? raw.trim() : String(raw)
    } catch {
        return null
    }
}

export function resolveRoleFromAuth(payload, accessToken) {
    return extractRoleFromAuthPayload(payload) ?? getRoleFromAccessToken(accessToken)
}

export function normalizeRole(role) {
    if (role == null) return null
    return String(role).trim().toUpperCase()
}

export function isAdminRole(role) {
    const r = normalizeRole(role)
    return r === 'ADMIN' || r === 'ADMINISTRATOR'
}
