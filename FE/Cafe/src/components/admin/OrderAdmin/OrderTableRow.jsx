import React, { memo } from 'react'
import { Popconfirm } from 'antd'
import AdminTooltip from './../common/AdminTooltip'
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
            
            <td className="px-5 py-4 text-center">
                {['Pending', 'Confirmed', 'Preparing', 'Delivering'].includes(order.currentStatus) && NEXT_STATUSES[order.currentStatus]?.[0] ? (
                    <AdminTooltip
                        title={`Bấm để chuyển sang: ${getStatusConfig(NEXT_STATUSES[order.currentStatus][0]).label}`}
                    >
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                onUpdateStatus(order.orderId, NEXT_STATUSES[order.currentStatus][0])
                            }}
                            disabled={isUpdating}
                            className="inline-flex h-8 items-center gap-1.5 rounded-2xl bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 px-3 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50 border border-slate-200 hover:border-sky-300"
                        >
                            {isUpdating ? (
                                <span className="animate-spin text-sky-500">⏳</span>
                            ) : (
                                <span className="text-sky-500 text-lg leading-none mt-[-2px]">»</span>
                            )}
                            <span className="text-sky-700">{getStatusConfig(NEXT_STATUSES[order.currentStatus][0]).label}</span>
                        </button>
                    </AdminTooltip>
                ) : (
                    <span className="text-slate-300 font-medium">-</span>
                )}
            </td>

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

                    {['Pending', 'Confirmed', 'Preparing', 'Delivering'].includes(order.currentStatus) && (
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
                            <AdminTooltip title="Hủy đơn hàng">
                                <button
                                    type="button"
                                    onClick={(e) => e.stopPropagation()}
                                    disabled={isUpdating}
                                    className="flex h-8 w-8 items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-300 text-slate-400 hover:text-rose-500 font-black transition-all cursor-pointer shadow-2xs active:scale-90 disabled:opacity-50"
                                >
                                    ✕
                                </button>
                            </AdminTooltip>
                        </Popconfirm>
                    )}
                </div>
            </td>
        </tr>
    )
})

export default OrderTableRow
