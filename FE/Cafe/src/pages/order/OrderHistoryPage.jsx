import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMyOrders, cancelOrder } from '../../redux/actions/user/orderAction'
import { clearCancelError } from '../../redux/slices/user/orderSlice'
import { formatVnd } from '../../utils/helpers/format'
import LoadingLink from '../../components/loading/LoadingLink'

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    Pending:    { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-800',   dot: 'bg-amber-500'   },
    Confirmed:  { label: 'Đã xác nhận',  color: 'bg-blue-100 text-blue-800',     dot: 'bg-blue-500'    },
    Preparing:  { label: 'Đang pha chế', color: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500'  },
    Delivering: { label: 'Đang giao',    color: 'bg-sky-100 text-sky-800',       dot: 'bg-sky-500'     },
    Completed:  { label: 'Hoàn thành',   color: 'bg-green-100 text-green-800',   dot: 'bg-green-500'   },
    Cancelled:  { label: 'Đã hủy',       color: 'bg-stone-100 text-stone-500',   dot: 'bg-stone-400'   },
}

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'bg-stone-100 text-stone-600', dot: 'bg-stone-400' }
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    )
}

// ── Order Card ────────────────────────────────────────────────────────────────
function OrderCard({ order, onCancel, cancelling }) {
    const [expanded, setExpanded] = useState(false)
    const {
        orderId, orderDate, totalAmount, shippingFee,
        discountAmount, currentStatus, paymentMethod, note, orderDetails = [],
    } = order

    const canCancel = currentStatus === 'Pending'
    const PAYMENT_LABEL = { COD: '💵 Tiền mặt', VNPAY: '🏦 VNPAY' }

    const formattedDate = orderDate
        ? new Date(orderDate).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })
        : '—'

    return (
        <div className="rounded-2xl border border-stone-100 bg-white shadow-sm transition-shadow hover:shadow-md">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-50 px-5 py-4">
                <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-stone-700">#{orderId}</span>
                    <StatusBadge status={currentStatus} />
                </div>
                <span className="text-xs text-stone-400">{formattedDate}</span>
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-5 py-3 sm:grid-cols-4">
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400">Tổng tiền</p>
                    <p className="font-semibold text-amber-800">{formatVnd(totalAmount)}</p>
                </div>
                {shippingFee != null && (
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-stone-400">Phí ship</p>
                        <p className="text-sm text-stone-700">{formatVnd(shippingFee)}</p>
                    </div>
                )}
                {discountAmount != null && discountAmount > 0 && (
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-stone-400">Giảm giá</p>
                        <p className="text-sm font-medium text-green-700">−{formatVnd(discountAmount)}</p>
                    </div>
                )}
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400">Thanh toán</p>
                    <p className="text-sm text-stone-700">{PAYMENT_LABEL[paymentMethod] ?? paymentMethod}</p>
                </div>
            </div>

            {note && (
                <p className="mx-5 mb-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    📝 {note}
                </p>
            )}

            {/* Expand toggle */}
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex w-full items-center gap-1 px-5 py-2.5 text-left text-xs font-medium text-amber-800 transition-colors hover:bg-amber-50"
            >
                <span>{expanded ? '▲' : '▼'}</span>
                {expanded ? 'Ẩn chi tiết' : `Xem ${orderDetails.length} món`}
            </button>

            {/* Detail items */}
            {expanded && (
                <div className="border-t border-stone-50 px-5 pb-4 pt-3">
                    <ul className="space-y-3">
                        {orderDetails.map((item, idx) => (
                            <li key={idx} className="flex justify-between gap-4 text-sm">
                                <div>
                                    <p className="font-medium text-stone-800">
                                        {item.productName}
                                        {item.sizeName && (
                                            <span className="ml-1.5 text-xs text-stone-400">({item.sizeName})</span>
                                        )}
                                        <span className="ml-1 text-stone-400">×{item.quantity}</span>
                                    </p>
                                    {item.toppings?.length > 0 && (
                                        <ul className="mt-0.5 space-y-0.5">
                                            {item.toppings.map((t, ti) => (
                                                <li key={ti} className="text-xs text-stone-400">
                                                    + {t.name}
                                                    {t.quantity > 1 ? ` ×${t.quantity}` : ''}
                                                    {t.unitPrice ? ` (${formatVnd(t.unitPrice)})` : ''}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <span className="shrink-0 text-right text-stone-700">
                                    {formatVnd(item.unitPrice * item.quantity)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Cancel button */}
            {canCancel && (
                <div className="border-t border-stone-50 px-5 py-3">
                    <button
                        type="button"
                        disabled={cancelling}
                        onClick={() => onCancel(orderId)}
                        className="w-full rounded-xl border border-red-300 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                        {cancelling ? '⏳ Đang hủy...' : '🗑️ Hủy đơn hàng'}
                    </button>
                </div>
            )}
        </div>
    )
}

// ── Confirm modal ─────────────────────────────────────────────────────────────
function ConfirmCancelModal({ orderId, onConfirm, onClose }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="mb-2 text-base font-bold text-stone-800">Xác nhận hủy đơn?</h3>
                <p className="mb-5 text-sm text-stone-500">
                    Bạn có chắc muốn hủy đơn hàng <b>#{orderId}</b>? Hành động này không thể hoàn tác.
                </p>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-stone-200 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
                    >
                        Giữ đơn
                    </button>
                    <button
                        type="button"
                        onClick={() => { onConfirm(); onClose() }}
                        className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                    >
                        Hủy đơn
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function OrderHistoryPage() {
    const dispatch = useDispatch()

    const {
        myOrders,
        myOrdersTotal,
        myOrdersTotalPages,
        myOrdersLoading,
        myOrdersError,
        cancelling,
        cancelError,
    } = useSelector((s) => s.order)

    const [page, setPage] = useState(1)
    const [pendingCancelId, setPendingCancelId] = useState(null)
    const [globalCancelError, setGlobalCancelError] = useState(null)

    const fetchOrders = useCallback(
        (p) => dispatch(getMyOrders({ pageNumber: p, pageSize: 10 })),
        [dispatch]
    )

    useEffect(() => {
        fetchOrders(page)
    }, [fetchOrders, page])

    // Hiển thị lỗi cancel và tự ẩn sau 4s
    useEffect(() => {
        if (cancelError) {
            setGlobalCancelError(cancelError)
            dispatch(clearCancelError())
            const t = setTimeout(() => setGlobalCancelError(null), 4000)
            return () => clearTimeout(t)
        }
    }, [cancelError, dispatch])

    const handleCancel = useCallback(
        async (orderId) => {
            await dispatch(cancelOrder(orderId))
        },
        [dispatch]
    )

    const pageNumbers = Array.from({ length: myOrdersTotalPages }, (_, i) => i + 1)

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-stone-800">📋 Lịch sử đơn hàng</h1>
                <LoadingLink
                    to="/"
                    className="rounded-xl bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-900"
                >
                    ☕ Đặt thêm
                </LoadingLink>
            </div>

            {/* Error toast */}
            {globalCancelError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    ❌ {globalCancelError}
                </div>
            )}

            {/* Loading skeleton */}
            {myOrdersLoading && (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 animate-pulse rounded-2xl bg-stone-100" />
                    ))}
                </div>
            )}

            {/* Error state */}
            {!myOrdersLoading && myOrdersError && (
                <div className="rounded-2xl bg-red-50 p-6 text-center">
                    <p className="text-red-600">{myOrdersError}</p>
                    <button
                        type="button"
                        onClick={() => fetchOrders(page)}
                        className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Empty state */}
            {!myOrdersLoading && !myOrdersError && myOrders.length === 0 && (
                <div className="flex flex-col items-center gap-4 rounded-2xl bg-white py-14 text-center shadow-sm">
                    <span className="text-5xl">🛒</span>
                    <p className="text-stone-500">Bạn chưa có đơn hàng nào.</p>
                    <LoadingLink
                        to="/"
                        className="rounded-xl bg-amber-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-900"
                    >
                        Khám phá thực đơn
                    </LoadingLink>
                </div>
            )}

            {/* Order list */}
            {!myOrdersLoading && !myOrdersError && myOrders.length > 0 && (
                <>
                    <p className="mb-3 text-sm text-stone-400">{myOrdersTotal} đơn hàng</p>
                    <div className="flex flex-col gap-4">
                        {myOrders.map((order) => (
                            <OrderCard
                                key={order.orderId}
                                order={order}
                                cancelling={cancelling}
                                onCancel={(id) => setPendingCancelId(id)}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {myOrdersTotalPages > 1 && (
                        <div className="mt-6 flex items-center justify-center gap-1">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-600 disabled:opacity-40 hover:bg-stone-50"
                            >
                                ‹
                            </button>
                            {pageNumbers.map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => setPage(n)}
                                    className={`h-9 w-9 rounded-xl text-sm font-medium transition-colors ${
                                        n === page
                                            ? 'bg-amber-800 text-white'
                                            : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
                                    }`}
                                >
                                    {n}
                                </button>
                            ))}
                            <button
                                type="button"
                                disabled={page >= myOrdersTotalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-600 disabled:opacity-40 hover:bg-stone-50"
                            >
                                ›
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Confirm cancel modal */}
            {pendingCancelId && (
                <ConfirmCancelModal
                    orderId={pendingCancelId}
                    onConfirm={() => handleCancel(pendingCancelId)}
                    onClose={() => setPendingCancelId(null)}
                />
            )}
        </div>
    )
}
