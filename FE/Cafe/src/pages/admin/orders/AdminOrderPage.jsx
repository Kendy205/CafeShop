import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { message } from 'antd'
import {
    fetchAdminOrders,
    fetchAdminOrderDetail,
    updateAdminOrderStatus,
} from '../../../redux/actions/admin/adminOrderAction'
import { clearAdminOrderDetail } from '../../../redux/slices/admin/adminOrderSlice'
import AppPagination from '../../../components/common/AppPagination'
import { STATUS_CONFIG, ORDER_STATUS_TABS, getStatusConfig } from '../../../utils/constants/OrderConstants'

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

// ─── Modal chi tiết đơn hàng ─────────────────────────────────────────────────
function OrderDetailModal({ orderId, onClose, onStatusUpdated }) {
    const dispatch = useDispatch()
    const { detail, detailLoading: loading, updating, detailError: error } = useSelector((s) => s.adminOrder)

    useEffect(() => {
        if (!orderId) return
        dispatch(fetchAdminOrderDetail(orderId))
        return () => {
            dispatch(clearAdminOrderDetail())
        }
    }, [orderId, dispatch])

    const handleUpdateStatus = async (status) => {
        const res = await dispatch(updateAdminOrderStatus({ orderId, status }))
        if (updateAdminOrderStatus.fulfilled.match(res)) {
            message.success('Cập nhật trạng thái đơn hàng thành công!')
            onStatusUpdated?.()
            onClose()
        } else {
            message.error(res.payload || 'Cập nhật trạng thái thất bại')
        }
    }

    const nextStatuses = detail?.currentStatus ? (NEXT_STATUSES[detail.currentStatus] ?? []) : []

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-md">
                    <div>
                        <h2 className="text-lg font-black text-slate-800">Chi tiết đơn #{orderId}</h2>
                        {detail?.currentStatus && (
                            <span className={`mt-1 inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getStatusConfig(detail.currentStatus).color}`}>
                                {getStatusConfig(detail.currentStatus).label}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {loading && (
                        <div className="flex h-40 items-center justify-center text-slate-400 text-sm">
                            ⏳ Đang tải...
                        </div>
                    )}
                    {error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-xs text-red-600">
                            ⚠️ {error}
                        </div>
                    )}

                    {detail && !loading && (
                        <>
                            {/* Thông tin khách */}
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-1.5">
                                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">👤 Thông tin khách hàng</h3>
                                <p className="text-sm text-slate-700"><span className="font-semibold">Tên:</span> {detail.userName || detail.UserName || detail.customerName || '-'}</p>
                                <p className="text-sm text-slate-700"><span className="font-semibold">SĐT:</span> {detail.userPhone || detail.UserPhone || detail.customerPhone || '-'}</p>
                                <p className="text-sm text-slate-700"><span className="font-semibold">Địa chỉ:</span> {detail.shippingAddress || '-'}</p>
                                <p className="text-sm text-slate-700"><span className="font-semibold">Ghi chú:</span> {detail.note || '-'}</p>
                                <p className="text-sm text-slate-700"><span className="font-semibold">Đặt lúc:</span> {formatDate(detail.orderDate)}</p>
                            </div>

                            {/* Danh sách món */}
                            <div>
                                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">🛒 Danh sách món</h3>
                                <div className="space-y-2">
                                    {(detail.items || []).map((item, i) => (
                                        <div key={i} className="flex items-start justify-between gap-2 rounded-3xl border border-slate-100 bg-white px-4 py-3 shadow-xs">
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-slate-800">{item.productName || '-'}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {item.sizeName && <span>Size: {item.sizeName} · </span>}
                                                    x{item.quantity}
                                                    {item.toppings?.length > 0 && (
                                                        <span> · {item.toppings.map(t => t.toppingName).join(', ')}</span>
                                                    )}
                                                </p>
                                            </div>
                                            <p className="text-sm font-bold text-sky-800 whitespace-nowrap">{formatCurrency(item.totalItemPrice)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tổng tiền */}
                            <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 space-y-1.5">
                                <h3 className="text-xs font-bold uppercase tracking-wide text-sky-700 mb-2">💰 Thanh toán</h3>
                                <div className="flex justify-between text-sm text-slate-700">
                                    <span>Tạm tính món:</span>
                                    <span>{formatCurrency(detail.totalAmount - (detail.shippingFee || 0) + (detail.discountAmount || 0))}</span>
                                </div>
                                {detail.shippingFee != null && (
                                    <div className="flex justify-between text-sm text-slate-700">
                                        <span>Phí giao hàng:</span>
                                        <span>{formatCurrency(detail.shippingFee)}</span>
                                    </div>
                                )}
                                {detail.discountAmount > 0 && (
                                    <div className="flex justify-between text-sm text-emerald-700">
                                        <span>Giảm giá voucher:</span>
                                        <span>-{formatCurrency(detail.discountAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t border-sky-200 pt-2 text-base font-black text-sky-900">
                                    <span>Tổng cộng:</span>
                                    <span>{formatCurrency(detail.totalAmount)}</span>
                                </div>
                            </div>

                            {/* Cập nhật trạng thái */}
                            {nextStatuses.length > 0 && (
                                <div>
                                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">⚡ Cập nhật trạng thái</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {nextStatuses.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => handleUpdateStatus(s)}
                                                disabled={updating}
                                                className={`rounded-3xl border px-4 py-2 text-xs font-bold transition-all cursor-pointer disabled:opacity-60 ${s === 'Cancelled'
                                                    ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                                                    : 'border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100'
                                                    }`}
                                            >
                                                {updating ? '⏳' : '→'} {getStatusConfig(s).label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Trang chính AdminOrderPage ───────────────────────────────────────────────
export default function AdminOrderPage() {
    const dispatch = useDispatch()
    const { items: orders, total, totalPages, loading, error } = useSelector((s) => s.adminOrder)

    const [pageNumber, setPageNumber] = useState(1)
    const [activeStatus, setActiveStatus] = useState('ALL')
    const [keyword, setKeyword] = useState('')
    const [selectedOrderId, setSelectedOrderId] = useState(null)

    const PAGE_SIZE = 10

    const fetchOrders = useCallback(() => {
        dispatch(
            fetchAdminOrders({
                pageNumber,
                pageSize: PAGE_SIZE,
                status: activeStatus !== 'ALL' ? activeStatus : undefined,
                keyword: keyword.trim() || undefined,
            })
        )
    }, [dispatch, pageNumber, activeStatus, keyword])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    const handleTabChange = (tab) => {
        setActiveStatus(tab)
        setPageNumber(1)
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Quản lý Đơn hàng</h1>
                    <p className="mt-0.5 text-xs text-slate-500">
                        Tổng <strong className="text-sky-900">{total}</strong> đơn hàng
                    </p>
                </div>
            </div>

            {/* Toolbar: Search */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px] max-w-sm">
                    <input
                        id="admin-order-keyword"
                        type="text"
                        value={keyword}
                        onChange={(e) => { setKeyword(e.target.value); setPageNumber(1) }}
                        placeholder="Tìm theo tên KH, SĐT, mã đơn..."
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 pl-9 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none shadow-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-200 transition-colors"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">🔍</span>
                    {keyword && (
                        <button
                            onClick={() => { setKeyword(''); setPageNumber(1) }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {ORDER_STATUS_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key)}
                        className={`rounded-3xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${activeStatus === tab.key
                            ? 'bg-sky-900 text-white shadow-sm'
                            : 'border border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:bg-sky-50'
                            }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-xs text-red-600">
                    ⚠️ {error}
                </div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-bold uppercase tracking-wide text-slate-500">
                                <th className="px-5 py-3.5 text-left">Mã đơn</th>
                                <th className="px-5 py-3.5 text-left">Khách hàng</th>
                                <th className="px-5 py-3.5 text-left">Thời gian</th>
                                <th className="px-5 py-3.5 text-right">Tổng tiền</th>
                                <th className="px-5 py-3.5 text-center">Trạng thái</th>
                                <th className="px-5 py-3.5 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 6 }).map((__, j) => (
                                            <td key={j} className="px-5 py-4">
                                                <div className="h-4 rounded-2xl bg-slate-100 animate-pulse" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center text-slate-400">
                                        <span className="text-3xl block mb-2">📭</span>
                                        <span className="text-sm font-medium">Không có đơn hàng nào</span>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => {
                                    const sc = getStatusConfig(order.currentStatus)
                                    return (
                                        <tr
                                            key={order.orderId}
                                            className="hover:bg-sky-50/40 transition-colors"
                                        >
                                            <td className="px-5 py-4 font-bold text-slate-800">
                                                #{order.orderId}
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-800">{order.userName || order.UserName || order.customerName || '-'}</p>
                                                <p className="text-xs text-slate-500">{order.userPhone || order.UserPhone || order.customerPhone || '-'}</p>
                                                <p className="text-xs text-slate-400 mt-1 line-clamp-1" title={order.shippingAddress}>{order.shippingAddress || '-'}</p>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-500">
                                                {formatDate(order.orderDate)}
                                            </td>
                                            <td className="px-5 py-4 text-right font-bold text-sky-900">
                                                {formatCurrency(order.totalAmount)}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`inline-block rounded-full border px-2.5 py-1 text-[11px] font-bold ${sc.color}`}>
                                                    {sc.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <button
                                                    onClick={() => setSelectedOrderId(order.orderId)}
                                                    className="rounded-3xl border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-800 hover:bg-sky-100 transition-colors cursor-pointer"
                                                >
                                                    Xem chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <AppPagination
                current={pageNumber}
                pageSize={PAGE_SIZE}
                total={total}
                totalPages={totalPages}
                onChange={setPageNumber}
                border={false}
                className="mt-4"
            />

            {/* Modal chi tiết */}
            {selectedOrderId && (
                <OrderDetailModal
                    orderId={selectedOrderId}
                    onClose={() => setSelectedOrderId(null)}
                    onStatusUpdated={fetchOrders}
                />
            )}
        </div>
    )
}
