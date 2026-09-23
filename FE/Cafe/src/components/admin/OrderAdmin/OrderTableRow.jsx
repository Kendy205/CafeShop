import React, { memo } from 'react'
import { Popconfirm, Tooltip } from 'antd'
import { getStatusConfig } from '../../../utils/constants/OrderConstants'

const NEXT_STATUSES = {
    Pending: ['Confirmed', 'Cancelled'],
    Confirmed: ['Preparing', 'Cancelled'],
    Preparing: ['Delivering', 'Cancelled'],
    Delivering: ['Completed', 'Cancelled'],
}

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
    
    return (
        <tr
            onClick={() => onSelectOrder(order.orderId)}
            className="hover:bg-sky-50/60 cursor-pointer transition-colors group"
            title="Bấm vào hàng để xem chi tiết đơn"
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
                <div 
                    className="inline-flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    {['Pending', 'Confirmed', 'Preparing', 'Delivering'].includes(order.currentStatus) ? (
                        /* Thanh trạng thái tích hợp liền khối (Unified Interactive Pill) */
                        <div className={`inline-flex items-center gap-1.5 rounded-full border pl-3 pr-1 py-1 text-xs font-bold shadow-2xs transition-all ${sc.color}`}>
                            {/* Tên trạng thái hiện tại */}
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot || 'bg-slate-400'}`} />
                                <span>{sc.label}</span>
                            </div>

                            {/* Vạch ngăn cách tinh tế */}
                            <div className="h-4 w-px bg-current opacity-20 mx-0.5" />

                            {/* Nút thao tác chuyển tiếp kế tiếp */}
                            {NEXT_STATUSES[order.currentStatus]?.[0] && (
                                <Tooltip
                                    title={`Bấm để chuyển sang: ${getStatusConfig(NEXT_STATUSES[order.currentStatus][0]).label}`}
                                    placement="top"
                                >
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onUpdateStatus(order.orderId, NEXT_STATUSES[order.currentStatus][0])
                                        }}
                                        disabled={isUpdating}
                                        className="flex h-6 items-center gap-1 rounded-full bg-white/90 hover:bg-white text-slate-800 px-2 text-[11px] font-extrabold shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50 border border-black/5"
                                    >
                                        {isUpdating ? (
                                            <span className="animate-spin text-[10px]">⏳</span>
                                        ) : (
                                            <span className="text-sky-600 font-black">→</span>
                                        )}
                                        <span>{getStatusConfig(NEXT_STATUSES[order.currentStatus][0]).label}</span>
                                    </button>
                                </Tooltip>
                            )}

                            {/* Nút hủy đơn (✕) */}
                            <Popconfirm
                                title="Xác nhận hủy đơn hàng?"
                                description={`Bạn có chắc muốn hủy đơn hàng #${order.orderId}?`}
                                onConfirm={(e) => {
                                    e?.stopPropagation?.()
                                    onUpdateStatus(order.orderId, 'Cancelled')
                                }}
                                okText="Hủy đơn"
                                cancelText="Đóng"
                                okButtonProps={{ danger: true, size: 'small' }}
                                cancelButtonProps={{ size: 'small' }}
                            >
                                <Tooltip title="Hủy đơn hàng" placement="top" color="#ef4444">
                                    <button
                                        type="button"
                                        onClick={(e) => e.stopPropagation()}
                                        disabled={isUpdating}
                                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/70 hover:bg-rose-500 hover:text-white text-rose-500 text-[10px] font-black transition-all cursor-pointer shadow-2xs active:scale-90 disabled:opacity-50"
                                    >
                                        ✕
                                    </button>
                                </Tooltip>
                            </Popconfirm>
                        </div>
                    ) : (
                        /* Trạng thái kết thúc: Completed / Cancelled */
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold shadow-2xs ${sc.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot || 'bg-slate-400'}`} />
                            {sc.label}
                        </span>
                    )}
                </div>
            </td>
            <td className="px-5 py-4 text-center">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation()
                        onSelectOrder(order.orderId)
                    }}
                    className="inline-flex h-8 items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-4 text-xs font-bold text-slate-700 hover:text-sky-700 hover:border-sky-300 transition-all cursor-pointer shadow-2xs"
                    title="Xem chi tiết đơn hàng"
                >
                    Chi tiết
                </button>
            </td>
        </tr>
    )
})

export default OrderTableRow
