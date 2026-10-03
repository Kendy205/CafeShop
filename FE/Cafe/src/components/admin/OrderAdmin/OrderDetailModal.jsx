import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { message } from 'antd'
import {
    fetchAdminOrderDetail,
    updateAdminOrderStatus,
} from '../../../redux/actions/admin/adminOrderAction'
import { clearAdminOrderDetail } from '../../../redux/slices/admin/adminOrderSlice'
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

export default function OrderDetailModal({ orderId, onClose, onStatusUpdated }) {
    const dispatch = useDispatch()
    const { detail, detailLoading: loading, updating, detailError: error } = useSelector((s) => s.admin.order)

    const [showCancelModal, setShowCancelModal] = useState(false)
    const [pendingStatus, setPendingStatus] = useState(null)

    useEffect(() => {
        if (!orderId) return
        dispatch(fetchAdminOrderDetail(orderId))
        return () => {
            dispatch(clearAdminOrderDetail())
        }
    }, [orderId, dispatch])

    const handleUpdateStatus = async (status, cancelReason = null) => {
        const res = await dispatch(updateAdminOrderStatus({ orderId, status, cancelReason }))
        if (updateAdminOrderStatus.fulfilled.match(res)) {
            message.success('Cập nhật trạng thái đơn hàng thành công!')
            onStatusUpdated?.()
            onClose()
        } else {
            /* API Error Modal will handle this */
        }
    }

    const handleStatusButtonClick = (status) => {
        if (status === OrderStatus.CANCELLED) {
            setPendingStatus(status)
            setShowCancelModal(true)
        } else {
            handleUpdateStatus(status)
        }
    }

    const handleCancelConfirm = (reason) => {
        setShowCancelModal(false)
        handleUpdateStatus(pendingStatus, reason)
        setPendingStatus(null)
    }

    const nextStatuses = detail?.currentStatus
        ? (NEXT_STATUSES[detail.currentStatus?.toUpperCase()] ?? [])
        : []

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 backdrop-blur-[2px] p-4 transition-all animate-in fade-in duration-200"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-200/80">
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

                                {/* Tổng tiền — dùng fields mới: subTotal, orderDiscount, shippingDiscount */}
                                <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 space-y-1.5">
                                    <h3 className="text-xs font-bold uppercase tracking-wide text-sky-700 mb-2">💰 Thanh toán</h3>

                                    {detail.subTotal != null && (
                                        <div className="flex justify-between text-sm text-slate-700">
                                            <span>Tạm tính món:</span>
                                            <span>{formatCurrency(detail.subTotal)}</span>
                                        </div>
                                    )}

                                    {detail.shippingFee != null && (
                                        <div className="flex justify-between text-sm text-slate-700">
                                            <span>Phí giao hàng:</span>
                                            <span>{formatCurrency(detail.shippingFee)}</span>
                                        </div>
                                    )}

                                    {detail.orderDiscount > 0 && (
                                        <div className="flex justify-between text-sm text-emerald-700">
                                            <span>Giảm giá món ăn:</span>
                                            <span>-{formatCurrency(detail.orderDiscount)}</span>
                                        </div>
                                    )}

                                    {detail.shippingDiscount > 0 && (
                                        <div className="flex justify-between text-sm text-emerald-700">
                                            <span>Giảm cước ship:</span>
                                            <span>-{formatCurrency(detail.shippingDiscount)}</span>
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
                                                    onClick={() => handleStatusButtonClick(s)}
                                                    disabled={updating}
                                                    className={`rounded-3xl border px-4 py-2 text-xs font-bold transition-all cursor-pointer disabled:opacity-60 ${s === OrderStatus.CANCELLED
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

            {showCancelModal && (
                <CancelReasonModal
                    orderId={orderId}
                    onConfirm={handleCancelConfirm}
                    onClose={() => { setShowCancelModal(false); setPendingStatus(null) }}
                    isLoading={updating}
                />
            )}
        </>
    )
}
