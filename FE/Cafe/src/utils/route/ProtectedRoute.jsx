import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { normalizeRole } from '../auth/authRole'
import { useEffect } from 'react'
import { openAuthModal } from '../../redux/slices/authSlice'

export default function ProtectedRoute({ allowedRoles }) {
    const location = useLocation()
    const dispatch = useDispatch()
    const { isAuthenticated, role, authModalOpen } = useSelector((s) => s.app.auth)

    const isStaffOrAdminRoute =
        location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff')

    useEffect(() => {
        if (!isAuthenticated) {
            // Lưu trang định đến để redirect sau khi đăng nhập
            sessionStorage.setItem('authRedirectAfter', location.pathname)
            if (!isStaffOrAdminRoute) {
                dispatch(openAuthModal('login'))
            }
        }
    }, [isAuthenticated, dispatch, location.pathname, isStaffOrAdminRoute])

    // 1. Đối với Admin/Staff: chuyển hướng thẳng sang trang /login
    if (!isAuthenticated && isStaffOrAdminRoute) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // 2. Đối với Client: nếu modal bị đóng (người dùng bấm X hoặc ESC) thì quay về trang chủ
    if (!isAuthenticated) {
        if (!authModalOpen) {
            return <Navigate to="/" replace />
        }
        return null
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const current = normalizeRole(role)
        const allow = allowedRoles.flatMap(normalizeRole)
        const hasAccess = current.some((r) => allow.includes(r))
        if (!hasAccess) {
            return <Navigate to="/" replace />
        }
    }

    return <Outlet />
}
