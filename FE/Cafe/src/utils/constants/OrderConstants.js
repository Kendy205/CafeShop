/**
 * Cấu hình và hằng số cho Đơn hàng (Order)
 */

export const OrderStatus = Object.freeze({
    PENDING:    'Pending',
    CONFIRMED:  'Confirmed',
    PREPARING:  'Preparing',
    DELIVERING: 'Delivering',
    COMPLETED:  'Completed',
    CANCELLED:  'Cancelled',
})

// ── Cấu hình trạng thái đơn hàng ──────────────────────────────────────────────
export const STATUS_CONFIG = {
    Pending:    { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-900 border-amber-300', dot: 'bg-amber-500' },
    Confirmed:  { label: 'Đã xác nhận',  color: 'bg-blue-100 text-blue-900 border-blue-300',     dot: 'bg-blue-500' },
    Preparing:  { label: 'Đang pha chế', color: 'bg-purple-100 text-purple-900 border-purple-300', dot: 'bg-purple-500' },
    Delivering: { label: 'Đang giao',    color: 'bg-sky-100 text-sky-900 border-sky-300',       dot: 'bg-sky-500' },
    Completed:  { label: 'Hoàn thành',   color: 'bg-emerald-100 text-emerald-900 border-emerald-300', dot: 'bg-emerald-600' },
    Cancelled:  { label: 'Đã hủy',       color: 'bg-stone-100 text-stone-500 border-stone-300',   dot: 'bg-stone-400' },
}

// ── Phương thức thanh toán ────────────────────────────────────────────────────
export const PAYMENT_LABEL = {
    COD:   '💵 Tiền mặt (COD)',
    VNPAY: '🏦 VNPAY',
    VNPay: '🏦 VNPAY',
}

/**
 * Lấy cấu hình hiển thị trạng thái đơn hàng (case-insensitive: "PENDING", "Pending", "pending"...)
 * @param {string} status
 */
export function getStatusConfig(status) {
    const key = Object.keys(STATUS_CONFIG).find(
        (k) => k.toLowerCase() === String(status || '').toLowerCase()
    ) || 'Pending'
    return STATUS_CONFIG[key] ?? STATUS_CONFIG.Pending
}

/**
 * Kiểm tra xem đơn hàng có được phép hủy hay không (chỉ được hủy khi status là PENDING)
 * @param {string} status
 */
export function canCancelOrder(status) {
    return String(status || '').toUpperCase() === 'PENDING'
}

// ── Danh sách các Tab phân loại nhanh trạng thái đơn hàng ─────────────────────
export const ORDER_STATUS_TABS = [
    { key: 'ALL', label: 'Tất cả', icon: '📋' },
    { key: OrderStatus.PENDING,    label: STATUS_CONFIG.Pending.label,    icon: '⏳', dot: STATUS_CONFIG.Pending.dot },
    { key: OrderStatus.CONFIRMED,  label: STATUS_CONFIG.Confirmed.label,  icon: '✓',  dot: STATUS_CONFIG.Confirmed.dot },
    { key: OrderStatus.PREPARING,  label: STATUS_CONFIG.Preparing.label,  icon: '☕', dot: STATUS_CONFIG.Preparing.dot },
    { key: OrderStatus.DELIVERING, label: STATUS_CONFIG.Delivering.label, icon: '🛵', dot: STATUS_CONFIG.Delivering.dot },
    { key: OrderStatus.COMPLETED,  label: STATUS_CONFIG.Completed.label,  icon: '⭐', dot: STATUS_CONFIG.Completed.dot },
    { key: OrderStatus.CANCELLED,  label: STATUS_CONFIG.Cancelled.label,  icon: '✕',  dot: STATUS_CONFIG.Cancelled.dot },
]

