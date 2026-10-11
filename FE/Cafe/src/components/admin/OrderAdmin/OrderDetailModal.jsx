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
import { AppToast, AppConfirm } from '../../common/AppNotification'


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
    const [isExpanded, setIsExpanded] = useState(false)

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
            AppToast.success('Cập nhật trạng thái đơn hàng thành công!')
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

    const isSingleItem = (detail?.items?.length || 0) <= 1

    return (
        <>
            <div
                className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 backdrop-blur-[2px] p-4 transition-all animate-in fade-in duration-200 ${isExpanded ? 'p-0' : 'p-4'}`}
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <div className={`relative w-full overflow-y-auto bg-white shadow-2xl border border-slate-200/80 transition-all duration-300 ${isExpanded
                        ? 'max-w-full h-full rounded-none'
                        : 'max-w-4xl max-h-[90vh] rounded-3xl'
                    }`}>
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
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer"
                                title={isExpanded ? "Thu nhỏ" : "Phóng to"}
                            >
                                {isExpanded ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20V15H4M15 4v5h5M4 9h5V4M20 15h-5v5" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                    </svg>
                                )}
                            </button>
                            <button
                                onClick={onClose}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer"
                                title="Đóng"
                            >
                                ✕
                            </button>
                        </div>
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
                                <div className="flex flex-col gap-5">
                                    {/* Phần trên: Danh sách món */}
                                    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col h-full w-full">
                                        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                            <div className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                                </svg>
                                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Danh sách món ({detail.items?.length || 0})</h3>
                                            </div>
                                        </div>

                                        <div className={`${isSingleItem ? 'flex flex-col gap-3.5' : 'grid grid-cols-1 md:grid-cols-2 gap-3.5 content-start'} overflow-y-auto pr-1 custom-scrollbar w-full`} style={{ maxHeight: isExpanded ? 'calc(100vh - 400px)' : 'calc(100vh - 550px)', minHeight: '160px' }}>
                                            {(detail.items || []).map((item, i) => (
                                                <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-4 rounded-2xl border-2 border-slate-100 bg-white p-4 hover:border-sky-200 hover:shadow-md transition-all group w-full">
                                                    <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-slate-200 shadow-xs">
                                                        {item.imageUrl ? (
                                                            <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">No img</div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-1 flex-col justify-center min-w-0">
                                                        <div className="flex justify-between items-start gap-3">
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-800">{item.productName || 'Sản phẩm'}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="bg-sky-100 text-sky-800 font-black px-2 py-0.5 rounded-md border border-sky-200 text-xs">
                                                                        x{item.quantity}
                                                                    </span>
                                                                    <span className="text-slate-400 text-xs">({formatCurrency(item.unitPrice)})</span>
                                                                    {item.sizeName && <span className="text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-md border border-sky-100 text-xs font-semibold">Size: {item.sizeName}</span>}
                                                                </div>
                                                            </div>
                                                            <p className="text-base font-black text-sky-700 shrink-0">{formatCurrency(item.totalItemPrice)}</p>
                                                        </div>
                                                        {item.toppings?.length > 0 && (
                                                            <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                                                                {item.toppings.map((t, idx) => (
                                                                    <div key={idx} className="flex justify-between items-center bg-slate-50/90 px-3 py-2 rounded-xl border border-slate-100/80 text-xs">
                                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                                            {t.imageUrl ? (
                                                                                <img src={t.imageUrl} alt={t.toppingName} className="h-7 w-7 rounded-lg object-cover border border-slate-200 shrink-0" />
                                                                            ) : (
                                                                                <div className="h-7 w-7 rounded-lg bg-slate-200 border border-slate-300 shrink-0" />
                                                                            )}
                                                                            <span className="text-slate-600 font-medium truncate">+ {t.toppingName} <span className="font-bold text-slate-800">(x{t.quantity || 1} / ly)</span></span>
                                                                        </div>
                                                                        <span className="font-bold text-slate-600 shrink-0 ml-2">{formatCurrency(t.unitPrice)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Phần dưới: 2 cột */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs relative overflow-hidden h-full">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-sky-500"></div>
                                            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-600" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Thông tin giao hàng</h3>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-xs font-bold text-slate-500 w-24 shrink-0">Người nhận:</span>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-slate-800">{detail.userName || detail.UserName || detail.customerName || '-'}</p>
                                                        <p className="text-xs font-semibold text-slate-500 mt-0.5">{detail.userPhone || detail.UserPhone || detail.customerPhone || '-'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-start">
                                                    <span className="text-xs font-bold text-slate-500 w-24 shrink-0">Địa chỉ:</span>
                                                    <p className="text-sm font-medium text-slate-700 text-right">{detail.shippingAddress || 'Nhận tại cửa hàng'}</p>
                                                </div>
                                                {detail.distanceKm != null && (
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-xs font-bold text-slate-500 w-24 shrink-0">Khoảng cách:</span>
                                                        <p className="text-sm font-medium text-slate-700 text-right">{detail.distanceKm} km</p>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-start">
                                                    <span className="text-xs font-bold text-slate-500 w-24 shrink-0">Thời gian:</span>
                                                    <p className="text-sm font-medium text-slate-700 text-right">{formatDate(detail.orderDate)}</p>
                                                </div>
                                                {detail.note && (
                                                    <div className="mt-2 rounded-2xl bg-amber-50 p-3 border border-amber-100">
                                                        <p className="text-xs font-bold text-amber-800 mb-1">Ghi chú của khách:</p>
                                                        <p className="text-sm font-medium text-amber-900">{detail.note}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs relative overflow-hidden h-full">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Thanh toán</h3>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-xs font-bold text-slate-500">Phương thức:</span>
                                                    <span className="text-sm font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg">{detail.paymentMethod || 'COD'}</span>
                                                </div>
                                                {detail.subTotal != null && (
                                                    <div className="flex justify-between text-sm text-slate-700">
                                                        <span className="text-xs font-bold text-slate-500">Tạm tính món:</span>
                                                        <span className="font-semibold">{formatCurrency(detail.subTotal)}</span>
                                                    </div>
                                                )}
                                                {detail.shippingFee != null && (
                                                    <div className="flex justify-between text-sm text-slate-700">
                                                        <span className="text-xs font-bold text-slate-500">Phí giao hàng:</span>
                                                        <span className="font-semibold">{formatCurrency(detail.shippingFee)}</span>
                                                    </div>
                                                )}
                                                {detail.orderDiscount > 0 && (
                                                    <div className="flex justify-between text-sm text-emerald-600">
                                                        <span className="text-xs font-bold">Giảm giá món:</span>
                                                        <span className="font-bold">-{formatCurrency(detail.orderDiscount)}</span>
                                                    </div>
                                                )}
                                                {detail.shippingDiscount > 0 && (
                                                    <div className="flex justify-between text-sm text-emerald-600">
                                                        <span className="text-xs font-bold">Freeship:</span>
                                                        <span className="font-bold">-{formatCurrency(detail.shippingDiscount)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-1">
                                                    <span className="text-sm font-black text-slate-800 uppercase tracking-wide">Tổng cộng</span>
                                                    <span className="text-2xl font-black text-sky-600">{formatCurrency(detail.totalAmount)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>



                                {/* Cập nhật trạng thái */}
                                {nextStatuses.length > 0 && (
                                    <div>
                                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">⚡ Cập nhật trạng thái</h3>
                                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                                            {nextStatuses.map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => handleStatusButtonClick(s)}
                                                    disabled={updating}
                                                    className={`flex-1 flex justify-center items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition-all cursor-pointer disabled:opacity-60 ${s === OrderStatus.CANCELLED
                                                        ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                                                        : 'border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100 shadow-sm'
                                                        }`}
                                                >
                                                    <span>{updating ? '⏳' : '→'}</span>
                                                    <span className="truncate">{getStatusConfig(s).label}</span>
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
