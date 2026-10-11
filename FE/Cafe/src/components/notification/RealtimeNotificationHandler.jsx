import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import signalRService, { playNotificationSound } from '../../services/signalrService'
import { isAdminRole } from '../../utils/auth/authRole'

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

/**
 * RealtimeNotificationHandler Component
 * Component này chạy ngầm (invisible) để quản lý kết nối SignalR (Websocket).
 * Nhận và xử lý các sự kiện thời gian thực (ví dụ: đơn hàng mới, cập nhật trạng thái).
 * Hiển thị thông báo (toast), phát âm thanh cảnh báo, và cập nhật badge cho Admin/User.
 */
export default function RealtimeNotificationHandler() {
    const navigate = useNavigate()
    const { isAuthenticated, accessToken, role } = useSelector((s) => s.app.auth)
    const recentEventsRef = useRef(new Map())

    // Chống trùng lặp sự kiện trong vòng 3 giây
    const isDuplicate = (key, cooldownMs = 3000) => {
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

        // ── 1. Admin Notification (Đơn hàng mới từ khách) ────────────────────────
        const unsubAdmin = signalRService.onAdminNotification((raw) => {
            const data = parsePayload(raw)
            //console.log('[Realtime] ReceiveAdminNotification payload:', data)

            const orderId = data?.orderId ?? data?.OrderId ?? data?.id ?? data?.Id
            const msg = data?.message ?? data?.Message ?? `Khách hàng vừa đặt đơn hàng mới #${orderId || ''}`

            const dedupKey = `admin-order-${orderId || msg}`
            if (isDuplicate(dedupKey)) {
                console.log('[Realtime] Ignored duplicate Admin notification:', dedupKey)
                return
            }

            playNotificationSound()

            // Hiển thị duy nhất 1 toast với toastId cố định để chống đè
            toast.info(`🔔 ${msg}`, {
                toastId: dedupKey,
                autoClose: 6000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                onClick: () => navigate('/admin/orders'),
            })

            // Bắn event toàn hệ thống để các trang Admin tự làm mới dữ liệu và chuông
            window.dispatchEvent(new CustomEvent('app:admin-new-order', { detail: data }))
        })
        unsubs.push(unsubAdmin)

        // ── 2. User Notification (Admin cập nhật trạng thái đơn hàng) ────────────
        const unsubUser = signalRService.onUserNotification((raw) => {
            const data = parsePayload(raw)
            // console.log('[Realtime] ReceiveUserNotification payload:', data)

            const orderId = data?.orderId ?? data?.OrderId ?? data?.id ?? data?.Id
            const status = data?.status ?? data?.Status ?? ''
            const msg = data?.message ?? data?.Message ?? `Đơn hàng #${orderId} của bạn đã có cập nhật mới`

            const dedupKey = `user-order-${orderId}-${status || msg}`
            if (isDuplicate(dedupKey)) {
                console.log('[Realtime] Ignored duplicate User notification:', dedupKey)
                return
            }

            playNotificationSound()

            // Hiển thị duy nhất 1 toast với toastId cố định để chống đè
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

        // ── 3. Reconnected: Tự động kích hoạt làm mới tránh bỏ sót sự kiện ────────
        const unsubReconnected = signalRService.onReconnected(() => {
            if (isAdminRole(role)) {
                window.dispatchEvent(new CustomEvent('app:admin-new-order', { detail: { isReconnected: true } }))
            } else {
                window.dispatchEvent(new CustomEvent('app:user-order-update', { detail: { isReconnected: true } }))
            }
        })
        unsubs.push(unsubReconnected)

        return () => {
            unsubs.forEach((fn) => fn?.())
        }
    }, [isAuthenticated, accessToken, role, navigate])

    return null
}
