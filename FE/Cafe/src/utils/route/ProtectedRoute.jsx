import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { normalizeRole } from '../auth/authRole'

export default function ProtectedRoute({ allowedRoles }) {
    const location = useLocation()
    const { isAuthenticated, role } = useSelector((s) => s.auth)

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const current = normalizeRole(role)
        const allow = allowedRoles.map(normalizeRole)
        if (!current || !allow.includes(current)) {
            return <Navigate to="/" replace />
        }
    }

    return <Outlet />
}
