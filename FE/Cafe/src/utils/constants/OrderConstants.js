/**
 * Cấu hình và hằng số cho Đơn hàng (Order)
 * Enum phải UPPER_CASE để khớp đúng Backend contract.
 */

export const OrderStatus = Object.freeze({
    PENDING:    'PENDING',
    CONFIRMED:  'CONFIRMED',
    PREPARING:  'PREPARING',
    DELIVERING: 'DELIVERING',
    COMPLETED:  'COMPLETED',
    CANCELLED:  'CANCELLED',
})

// ── Cấu hình trạng thái đơn hàng ──────────────────────────────────────────────
export const STATUS_CONFIG = {
    PENDING:    { label: 'Chờ xác nhận', color: 'bg-sky-100 text-sky-900 border-sky-300',        dot: 'bg-sky-500' },
    CONFIRMED:  { label: 'Đã xác nhận',  color: 'bg-blue-100 text-blue-900 border-blue-300',     dot: 'bg-blue-500' },
    PREPARING:  { label: 'Đang pha chế', color: 'bg-purple-100 text-purple-900 border-purple-300', dot: 'bg-purple-500' },
    DELIVERING: { label: 'Đang giao',    color: 'bg-sky-100 text-sky-900 border-sky-300',        dot: 'bg-sky-500' },
    COMPLETED:  { label: 'Hoàn thành',   color: 'bg-emerald-100 text-emerald-900 border-emerald-300', dot: 'bg-emerald-600' },
    CANCELLED:  { label: 'Đã hủy',       color: 'bg-slate-100 text-slate-500 border-slate-300',  dot: 'bg-slate-400' },
}

// ── Phương thức thanh toán ────────────────────────────────────────────────────
export const PAYMENT_LABEL = {
    COD:   '💵 Tiền mặt (COD)',
    VNPAY: '🏦 VNPAY',
    VNPay: '🏦 VNPAY',
}

/**
 * Lấy cấu hình hiển thị trạng thái đơn hàng (case-insensitive)
 * @param {string} status
 */
export function getStatusConfig(status) {
    const key = Object.keys(STATUS_CONFIG).find(
        (k) => k.toUpperCase() === String(status || '').toUpperCase()
    ) || 'PENDING'
    return STATUS_CONFIG[key] ?? STATUS_CONFIG.PENDING

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
    { key: OrderStatus.PENDING,    label: STATUS_CONFIG.PENDING.label,    icon: '⏳', dot: STATUS_CONFIG.PENDING.dot },
    { key: OrderStatus.CONFIRMED,  label: STATUS_CONFIG.CONFIRMED.label,  icon: '✓',  dot: STATUS_CONFIG.CONFIRMED.dot },
    { key: OrderStatus.PREPARING,  label: STATUS_CONFIG.PREPARING.label,  icon: '☕', dot: STATUS_CONFIG.PREPARING.dot },
    { key: OrderStatus.DELIVERING, label: STATUS_CONFIG.DELIVERING.label, icon: '🛵', dot: STATUS_CONFIG.DELIVERING.dot },
    { key: OrderStatus.COMPLETED,  label: STATUS_CONFIG.COMPLETED.label,  icon: '⭐', dot: STATUS_CONFIG.COMPLETED.dot },
    { key: OrderStatus.CANCELLED,  label: STATUS_CONFIG.CANCELLED.label,  icon: '✕',  dot: STATUS_CONFIG.CANCELLED.dot },
]

/**
 * Trạng thái tiếp theo hợp lệ cho từng trạng thái đơn hàng.
 * Lưu ý: DELIVERING không cho phép CANCELLED (Backend đã chặn).
 */
export const NEXT_STATUSES = {
    [OrderStatus.PENDING]:    [OrderStatus.CONFIRMED,  OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]:  [OrderStatus.PREPARING,  OrderStatus.CANCELLED],
    [OrderStatus.PREPARING]:  [OrderStatus.DELIVERING, OrderStatus.CANCELLED],
    [OrderStatus.DELIVERING]: [OrderStatus.COMPLETED],
}
