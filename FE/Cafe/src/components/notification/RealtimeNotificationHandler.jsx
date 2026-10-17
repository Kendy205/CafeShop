import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { jwtDecode } from 'jwt-decode'
import signalRService, { playNotificationSound } from '../../services/signalrService'
import { isAdminRole, isStaffRole } from '../../utils/auth/authRole'
import { updateRealtimeOrder } from '../../redux/slices/admin/adminOrderSlice'

function parsePayload(raw) {
    if (!raw) return {}
    if (typeof raw === 'string') {
        try {
            return JSON.parse(raw)
        } catch {
            return { message: raw }
        }
    }
    return raw
}

function getUserId(user, accessToken) {
    if (user?.userId != null) return user.userId
    if (user?.id != null) return user.id
    if (accessToken) {
        try {
            const decoded = jwtDecode(accessToken)
            const id =
                decoded.userId ??
                decoded.UserId ??
                decoded.nameid ??
                decoded.sub ??
                decoded.id ??
                decoded.Id ??
                decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
            if (id != null) return id
        } catch {
            // ignore token parse errors
        }
    }
    return null
}

/**
 * RealtimeNotificationHandler Component
 * Component này chạy ngầm (invisible) để quản lý kết nối SignalR (Websocket).
 * - Staff / Admin: Lắng nghe ReceiveOrderNotification để cập nhật Live Board & thông báo chuông/toast.
 * - Customer: Lắng nghe ReceiveUserNotification để cập nhật trạng thái đơn hàng cá nhân.
 */
export default function RealtimeNotificationHandler() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { isAuthenticated, accessToken, role, user } = useSelector((s) => s.app.auth)
    const recentEventsRef = useRef(new Map())

    const isStaff = isStaffRole(role)
    const isAdmin = isAdminRole(role)
    const isStaffOrAdmin = isStaff || isAdmin
    const currentUserId = getUserId(user, accessToken)

    // Chống trùng lặp sự kiện trong vòng 2.5 giây
    const isDuplicate = (key, cooldownMs = 2500) => {
        const now = Date.now()
        const lastTime = recentEventsRef.current.get(key)
        if (lastTime && now - lastTime < cooldownMs) {
            return true
        }
        recentEventsRef.current.set(key, now)

        // Dọn dẹp cache cũ
        if (recentEventsRef.current.size > 50) {
            for (const [k, t] of recentEventsRef.current) {
                if (now - t > 15000) recentEventsRef.current.delete(k)
            }
        }
        return false
    }

    useEffect(() => {
        if (!isAuthenticated || !accessToken) {
            signalRService.stopConnection()
            return
        }

        // Bắt đầu kết nối SignalR Hub
        signalRService.startConnection()

        const unsubs = []

        // ── 1. Staff / Admin Order Notification (ReceiveOrderNotification) ───────
        if (isStaffOrAdmin) {
            const unsubOrder = signalRService.onOrderNotification((raw) => {
                const data = parsePayload(raw)

                const orderId = data?.orderId ?? data?.OrderId ?? data?.id ?? data?.Id
                const notificationType = data?.notificationType ?? data?.NotificationType ?? 'NewOrder'
                const actionUserId = data?.actionUserId ?? data?.ActionUserId
                const msg = data?.message ?? data?.Message ?? `Có biến động đơn hàng #${orderId || ''}`
                const orderStatus = data?.orderStatus ?? data?.OrderStatus

                const dedupKey = `staff-order-${orderId}-${notificationType}-${orderStatus || ''}`
                if (isDuplicate(dedupKey)) {
                    return
                }

                // Luôn cập nhật Redux store và bắn custom event để sync Live Board / Order List
                dispatch(updateRealtimeOrder(data))
                window.dispatchEvent(new CustomEvent('app:admin-new-order', { detail: data }))

                // Xử lý chuông & Toast dựa trên actionUserId
                const isOwnAction =
                    currentUserId != null &&
                    actionUserId != null &&
                    String(currentUserId) === String(actionUserId)

                if (!isOwnAction) {
                    playNotificationSound()

                    const toastOptions = {
                        toastId: dedupKey,
                        autoClose: 6000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        onClick: () => {
                            if (isStaff) {
                                navigate('/staff/orders')
                            } else {
                                navigate('/admin/orders')
                            }
                        },
                    }

                    switch (notificationType) {
                        case 'PaymentSuccess':
                            toast.success(`💳 ${msg}`, toastOptions)
                            break
                        case 'OrderCancelled':
                            toast.warning(`❌ ${msg}`, toastOptions)
                            break
                        case 'OrderStatusChanged':
                            toast.info(`🔄 ${msg}`, toastOptions)
                            break
                        case 'NewOrder':
                        default:
                            toast.info(`🔔 ${msg}`, toastOptions)
                            break
                    }
                }
            })
            unsubs.push(unsubOrder)
        } else {
            // ── 2. Customer Notification (ReceiveUserNotification) ───────────────────
            const unsubUser = signalRService.onUserNotification((raw) => {
                const data = parsePayload(raw)

                const orderId = data?.orderId ?? data?.OrderId ?? data?.id ?? data?.Id
                const status = data?.status ?? data?.Status ?? ''
                const msg = data?.message ?? data?.Message ?? `Đơn hàng #${orderId} của bạn đã có cập nhật mới`

                const dedupKey = `user-order-${orderId}-${status || msg}`
                if (isDuplicate(dedupKey)) {
                    return
                }

                playNotificationSound()

                toast.info(`📦 ${msg}`, {
                    toastId: dedupKey,
                    autoClose: 6000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    onClick: () => navigate('/orders'),
                })

                // Bắn event toàn hệ thống để trang OrderHistoryPage làm mới
                window.dispatchEvent(new CustomEvent('app:user-order-update', { detail: data }))
            })
            unsubs.push(unsubUser)
        }

        // ── 3. Reconnected: Tự động kích hoạt làm mới tránh bỏ sót sự kiện ────────
        const unsubReconnected = signalRService.onReconnected(() => {
            if (isStaffOrAdmin) {
                window.dispatchEvent(new CustomEvent('app:admin-new-order', { detail: { isReconnected: true } }))
            } else {
                window.dispatchEvent(new CustomEvent('app:user-order-update', { detail: { isReconnected: true } }))
            }
        })
        unsubs.push(unsubReconnected)

        return () => {
            unsubs.forEach((fn) => fn?.())
        }
    }, [isAuthenticated, accessToken, isStaffOrAdmin, isStaff, currentUserId, navigate, dispatch])

    return null
}
