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
                <td className="px-5 py-4 font-bold text-slate-800">
                    <span className="group-hover:text-sky-600 transition-colors font-black">
                        #{order.orderId}
                    </span>
                </td>
                <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800 group-hover:text-sky-900 transition-colors">
                        {order.userName || order.UserName || order.customerName || '-'}
                    </p>
                    <p className="text-xs text-slate-500">
                        {order.userPhone || order.UserPhone || order.customerPhone || '-'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1" title={order.shippingAddress}>
                        {order.shippingAddress || '-'}
                    </p>
                </td>
                <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(order.orderDate)}
                </td>
                <td className="px-5 py-4 text-right font-black text-sky-900 whitespace-nowrap">
                    {formatCurrency(order.totalAmount)}
                </td>
                <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold shadow-2xs ${sc.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot || 'bg-slate-400'}`} />
                        {sc.label}
                    </span>
                </td>

                {/* Nút tiến trình nhanh (chuyển sang trạng thái kế tiếp) */}
                <td className="px-5 py-4 text-center">
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
                                className="inline-flex h-8 items-center gap-1.5 rounded-2xl bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 px-3 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50 border border-slate-200 hover:border-sky-300"
                            >
                                {isUpdating ? (
                                    <span className="animate-spin text-sky-500">⏳</span>
                                ) : (
                                    <span className="text-sky-500 text-lg leading-none mt-[-2px]">»</span>
                                )}
                                <span className="text-sky-700">{getStatusConfig(nextProgressStatus).label}</span>
                            </button>
                        </AdminTooltip>
                    ) : (
                        <span className="text-slate-300 font-medium">-</span>
                    )}
                </td>

                {/* Hành động: Xem chi tiết + Hủy đơn */}
                <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <AdminTooltip title="Xem chi tiết đơn hàng">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onSelectOrder(order.orderId)
                                }}
                                className="inline-flex h-8 items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-4 text-xs font-bold text-slate-700 hover:text-sky-700 hover:border-sky-300 transition-all cursor-pointer shadow-2xs"
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
                                    className="flex h-8 w-8 items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-300 text-slate-400 hover:text-rose-500 font-black transition-all cursor-pointer shadow-2xs active:scale-90 disabled:opacity-50"
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
