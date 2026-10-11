import React, { memo, useState } from 'react'
import AdminTooltip from './../common/AdminTooltip'
import { getStatusConfig, NEXT_STATUSES, OrderStatus } from '../../../utils/constants/OrderConstants'
import CancelReasonModal from './CancelReasonModal'

function formatCurrency(val) {
    if (!val && val !== 0) return '—'
    return Number(val).toLocaleString('vi-VN') + 'đ'
}

function formatDate(str) {
    if (!str) return '—'
    return new Date(str).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

/**
 * OrderTableRow Component
 * Component render từng dòng (row) trong bảng quản lý đơn hàng của Admin.
 * Tối ưu performance với React.memo, xử lý hiển thị trạng thái và hành động nhanh (hủy đơn, duyệt đơn).
 */
const OrderTableRow = memo(({ order, onSelectOrder, onUpdateStatus, isUpdating }) => {
    const sc = getStatusConfig(order.currentStatus)
    const nextStatuses = NEXT_STATUSES[order.currentStatus?.toUpperCase()] ?? []
    const nextProgressStatus = nextStatuses.find((s) => s !== OrderStatus.CANCELLED)
    const canCancel = nextStatuses.includes(OrderStatus.CANCELLED)

    const [showCancelModal, setShowCancelModal] = useState(false)

    const handleCancelConfirm = (reason) => {
        setShowCancelModal(false)
        onUpdateStatus(order.orderId, OrderStatus.CANCELLED, reason)
    }

    return (
        <>
            <tr
                onClick={() => onSelectOrder(order.orderId)}
                className="hover:bg-sky-50/60 cursor-pointer transition-colors group"
            >
                <td className="px-4 py-3 sm:py-3.5 font-bold text-slate-800">
                    <span className="group-hover:text-sky-600 transition-colors font-black">
                        #{order.orderId}
                    </span>
                </td>
                <td className="px-4 py-3 sm:py-3.5">
                    <div className="max-w-[170px] sm:max-w-[220px]">
                        <p className="font-semibold text-slate-800 group-hover:text-sky-900 transition-colors truncate">
                            {order.userName || order.UserName || order.customerName || '-'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                            {order.userPhone || order.UserPhone || order.customerPhone || '-'}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1" title={order.shippingAddress}>
                            {order.shippingAddress || '-'}
                        </p>
                    </div>
                </td>
                <td className="px-4 py-3 sm:py-3.5 text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(order.orderDate)}
                </td>
                <td className="px-4 py-3 sm:py-3.5 text-right font-black text-sky-900 whitespace-nowrap">
                    {formatCurrency(order.totalAmount)}
                </td>
                <td className="px-4 py-3 sm:py-3.5 text-center whitespace-nowrap min-w-[140px]">
                    <span className={`inline-flex h-8 min-w-[124px] items-center justify-center gap-1.5 rounded-2xl border px-3 text-xs font-bold shadow-2xs whitespace-nowrap ${sc.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot || 'bg-slate-400'} shrink-0`} />
                        <span>{sc.label}</span>
                    </span>
                </td>

                {/* Nút tiến trình nhanh (chuyển sang trạng thái kế tiếp) */}
                <td className="px-4 py-3 sm:py-3.5 text-center whitespace-nowrap min-w-[140px]">
                    {nextProgressStatus ? (
                        <AdminTooltip
                            title={`Bấm để chuyển sang: ${getStatusConfig(nextProgressStatus).label}`}
                        >
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onUpdateStatus(order.orderId, nextProgressStatus)
                                }}
                                disabled={isUpdating}
                                className="inline-flex h-8 min-w-[124px] items-center justify-center gap-1.5 rounded-2xl bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 px-3 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50 border border-slate-200 hover:border-sky-300 whitespace-nowrap"
                            >
                                {isUpdating ? (
                                    <span className="animate-spin text-sky-500">⏳</span>
                                ) : (
                                    <span className="text-sky-500 text-base leading-none font-black">»</span>
                                )}
                                <span className="text-sky-700">{getStatusConfig(nextProgressStatus).label}</span>
                            </button>
                        </AdminTooltip>
                    ) : (
                        <span className="inline-flex h-8 min-w-[124px] items-center justify-center text-slate-300 font-medium">-</span>
                    )}
                </td>

                {/* Hành động: Xem chi tiết + Hủy đơn (Sticky right) */}
                <td className="px-4 py-3 sm:py-3.5 text-center whitespace-nowrap sticky right-0 bg-white group-hover:bg-sky-50/60 shadow-[-6px_0_10px_rgba(0,0,0,0.04)] transition-colors z-10">
                    <div className="flex items-center justify-center gap-2">
                        <AdminTooltip title="Xem chi tiết đơn hàng">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onSelectOrder(order.orderId)
                                }}
                                className="admin-action-btn admin-action-btn-edit"
                            >
                                Chi tiết
                            </button>
                        </AdminTooltip>

                        {canCancel && (
                            <AdminTooltip title="Hủy đơn hàng">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setShowCancelModal(true)
                                    }}
                                    disabled={isUpdating}
                                    className="admin-action-btn admin-action-btn-delete disabled:opacity-50 !px-2"
                                >
                                    ✕
                                </button>
                            </AdminTooltip>
                        )}
                    </div>
                </td>
            </tr>

            {showCancelModal && (
                <CancelReasonModal
                    orderId={order.orderId}
                    onConfirm={handleCancelConfirm}
                    onClose={() => setShowCancelModal(false)}
                    isLoading={isUpdating}
                />
            )}
        </>
    )
})

export default OrderTableRow
