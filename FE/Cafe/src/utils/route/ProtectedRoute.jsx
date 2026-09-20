import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { normalizeRole } from '../auth/authRole'
import { useEffect } from 'react'
import { openAuthModal } from '../../redux/slices/authSlice'

export default function ProtectedRoute({ allowedRoles }) {
    const location = useLocation()
    const dispatch = useDispatch()
    const { isAuthenticated, role } = useSelector((s) => s.auth)

    useEffect(() => {
        if (!isAuthenticated) {
            // Lưu trang định đến để redirect sau khi đăng nhập
            sessionStorage.setItem('authRedirectAfter', location.pathname)
            dispatch(openAuthModal('login'))
        }
    }, [isAuthenticated, dispatch, location.pathname])

    if (!isAuthenticated) {
        return null // Không render gì — popup sẽ hiện ra
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
