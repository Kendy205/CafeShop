import { useEffect, useState, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { message, Modal } from 'antd'
import { getMyOrders, cancelOrder } from '../../redux/actions/user/orderAction'
import { clearCancelError } from '../../redux/slices/user/orderSlice'
import { formatVnd } from '../../utils/helpers/format'
import LoadingLink from '../../components/loading/LoadingLink'
import { feedbackService } from '../../services/user/FeedbackService'
import {
    PAYMENT_LABEL,
    canCancelOrder,
    getStatusConfig,
    ORDER_STATUS_TABS,
} from '../../utils/constants/OrderConstants'
import { pickErrorMessage } from '../../utils/helpers/api'

// Helper lưu trạng thái món đã đánh giá (theo orderDetailId)
const STORAGE_KEY = 'user_reviewed_order_details'
const getStoredReviewedItems = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : {}
    } catch {
        return {}
    }
}
const saveStoredReviewedItem = (orderDetailId) => {
    try {
        const map = getStoredReviewedItems()
        map[orderDetailId] = true
        localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
    } catch (e) {
        console.error('Failed to cache reviewed item', e)
    }
}

// ── Modal Viết Đánh Giá Món ──────────────────────────────────────────────────
function ReviewModal({ open, item, onClose, onSuccess }) {
    const [rating, setRating] = useState(5)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (open) {
            setRating(5)
            setHoverRating(0)
            setComment('')
            setSubmitting(false)
        }
    }, [open, item])

    if (!item) return null

    const RATING_LABELS = {
        1: { text: 'Rất tệ', emoji: '😞' },
        2: { text: 'Chưa ngon', emoji: '🙁' },
        3: { text: 'Bình thường', emoji: '😐' },
        4: { text: 'Ngon, vừa miệng', emoji: '😋' },
        5: { text: 'Tuyệt vời!', emoji: '🥰' },
    }

    const currentRating = hoverRating || rating

    const handleSubmit = async () => {
        if (!rating || rating < 1 || rating > 5) {
            message.warning('Vui lòng chọn số sao đánh giá từ 1 đến 5!')
            return
        }

        setSubmitting(true)
        try {
            const body = {
                productId: Number(item.productId),
                orderDetailId: Number(item.orderDetailId),
                rating: Number(rating),
                comment: comment.trim() || null,
            }
            const res = await feedbackService.addFeedback(body)
            message.success(res?.message || 'Cảm ơn bạn đã gửi đánh giá!')
            saveStoredReviewedItem(item.orderDetailId)
            onSuccess?.(item.orderDetailId)
            onClose()
        } catch (err) {
            const msg = pickErrorMessage(err, 'Đã có lỗi xảy ra khi gửi đánh giá!')
            message.error(msg)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Modal
            open={open}
            onCancel={submitting ? undefined : onClose}
            footer={null}
            centered
            width={480}
            destroyOnClose
            className="review-feedback-modal"
        >
            <div className="pt-2 pb-1">
                {/* Header modal */}
                <div className="text-center">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-2xl shadow-inner">
                        ⭐
                    </span>
                    <h3 className="mt-2.5 text-lg font-black text-stone-800">Đánh giá món</h3>
                    <p className="text-xs text-stone-500">
                        Cảm nhận thực tế của bạn sẽ giúp quán cải thiện chất lượng phục vụ tốt hơn
                    </p>
                </div>

                {/* Thông tin món đang đánh giá */}
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50/50 p-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-white">
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-xl">☕</div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-bold text-stone-800">{item.productName}</h4>
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                            {item.sizeName && (
                                <span className="rounded bg-white px-1.5 py-0.5 font-semibold text-amber-800 border border-amber-200">
                                    Size {item.sizeName}
                                </span>
                            )}
                            <span>Đơn #{item.orderId}</span>
                        </div>
                    </div>
                </div>

                {/* Phần chọn số sao */}
                <div className="mt-5 rounded-2xl bg-stone-50 p-4 text-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                        Bạn thấy món này thế nào?
                    </label>

                    {/* Dãy 5 sao tương tác */}
                    <div className="mt-2 flex items-center justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => {
                            const isFilled = star <= currentRating
                            return (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className={`h-9 w-9 transition-colors ${
                                            isFilled ? 'text-amber-400 drop-shadow-sm' : 'text-stone-300 hover:text-amber-200'
                                        }`}
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            )
                        })}
                    </div>

                    {/* Nhãn cảm xúc tương ứng sao */}
                    <div className="mt-2 flex items-center justify-center gap-1.5 text-sm font-bold text-amber-900">
                        <span>{RATING_LABELS[currentRating]?.emoji}</span>
                        <span>{RATING_LABELS[currentRating]?.text}</span>
                    </div>
                </div>

                {/* Nhận xét văn bản */}
                <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-stone-600 mb-1.5">
                        <label htmlFor="feedback-comment" className="font-semibold">
                            Nhận xét chi tiết <span className="font-normal text-stone-400">(Tùy chọn)</span>
                        </label>
                        <span className="text-[11px] text-stone-400">{comment.length}/500</span>
                    </div>
                    <textarea
                        id="feedback-comment"
                        rows={3}
                        maxLength={500}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Hãy chia sẻ hương vị đồ uống, độ đậm đà, độ ngọt đá, hay cách quán đóng gói bạn nhé..."
                        className="w-full rounded-2xl border border-stone-200 p-3 text-xs text-stone-800 placeholder:text-stone-400 focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700 transition"
                    />
                </div>

                {/* Buttons hành động */}
                <div className="mt-5 flex items-center justify-end gap-2.5">
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={onClose}
                        className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-50 transition"
                    >
                        Để sau
                    </button>
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={handleSubmit}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-800 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-900 disabled:opacity-50 transition"
                    >
                        {submitting ? (
                            <>
                                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                <span>Đang gửi...</span>
                            </>
                        ) : (
                            <>
                                <span>Gửi đánh giá</span>
                                <span>✨</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export function StatusBadge({ status }) {
    const cfg = getStatusConfig(status)

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-2xs ${cfg.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    )
}

// ── Order Card ────────────────────────────────────────────────────────────────
function OrderCard({ order, onCancel, cancelling, onReviewClick, reviewedMap }) {
    const {
        orderId, orderDate, totalAmount, shippingFee, distanceKm,
        discountAmount, currentStatus, paymentMethod, note,
    } = order

    // Hỗ trợ cả items (đặc tả mới) và fallback orderDetails
    const orderItems = Array.isArray(order.items)
        ? order.items
        : (Array.isArray(order.orderDetails) ? order.orderDetails : [])

    const canCancel = canCancelOrder(currentStatus)
    const isCompleted = String(currentStatus || '').toUpperCase() === 'COMPLETED'

    const formattedDate = orderDate
        ? new Date(orderDate).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        })
        : '—'

    return (
        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xs transition-all hover:shadow-md hover:border-amber-300">
            {/* Header: Mã đơn + Ngày giờ + Trạng thái */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 bg-stone-50/50 px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-extrabold text-stone-800">
                        Đơn hàng #{orderId}
                    </span>
                    <StatusBadge status={currentStatus} />
                </div>
                <span className="text-xs font-medium text-stone-400">{formattedDate}</span>
            </div>

            {/* Danh sách các món của đơn hàng */}
            <div className="p-5">
                <div className="space-y-3.5">
                    {orderItems.map((item, idx) => {
                        const hasSize = item.sizeId !== null && item.sizeId !== undefined && item.sizeName
                        const itemToppings = Array.isArray(item.toppings) ? item.toppings : []

                        return (
                            <div
                                key={idx}
                                className="flex items-start justify-between gap-3.5 border-b border-stone-100/80 pb-3.5 last:border-b-0 last:pb-0"
                            >
                                {/* Thumbnail sản phẩm */}
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-stone-100 bg-stone-50">
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.productName || item.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-2xl text-stone-400">
                                            ☕
                                        </div>
                                    )}
                                </div>

                                {/* Thông tin món + size + topping */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <h4 className="text-sm font-bold text-stone-800">
                                            {item.productName || item.name}
                                        </h4>
                                        {/* Size: chỉ hiển thị khi sizeId != null theo đặc tả */}
                                        {hasSize && (
                                            <span className="rounded-md bg-amber-100/80 px-1.5 py-0.5 text-[11px] font-bold text-amber-900">
                                                Size {item.sizeName}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-0.5 flex items-center gap-2 text-xs text-stone-500">
                                        <span>Số lượng: <strong className="text-stone-700">×{item.quantity}</strong></span>
                                        <span>•</span>
                                        <span>Đơn giá: {formatVnd(item.unitPrice)}</span>
                                    </div>

                                    {/* Danh sách topping của món */}
                                    {itemToppings.length > 0 && (
                                        <div className="mt-1.5 space-y-1 rounded-xl bg-stone-50 p-2 text-xs">
                                            {itemToppings.map((t, ti) => (
                                                <div
                                                    key={ti}
                                                    className="flex items-center justify-between text-stone-600"
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        {t.imageUrl ? (
                                                            <img
                                                                src={t.imageUrl}
                                                                alt={t.toppingName || t.name}
                                                                className="h-4 w-4 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-[10px] text-amber-700">+</span>
                                                        )}
                                                        <span>{t.toppingName || t.name}</span>
                                                        <span className="font-bold text-amber-800">
                                                            ×{t.quantity} {t.unit || 'phần'}
                                                        </span>
                                                    </div>
                                                    <span className="font-medium text-stone-700">
                                                        {formatVnd((t.unitPrice ?? t.price ?? 0) * (t.quantity || 1))}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Nút Đánh giá món khi đơn đã giao thành công */}
                                    {isCompleted && item.productId && (
                                        <div className="mt-2 flex items-center">
                                            {Boolean(
                                                item.isReviewed ||
                                                (item.orderDetailId && reviewedMap?.[item.orderDetailId])
                                            ) ? (
                                                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                                                    <span>✓</span>
                                                    <span>Đã đánh giá</span>
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onReviewClick?.({
                                                            productId: item.productId,
                                                            orderDetailId: item.orderDetailId,
                                                            productName: item.productName || item.name,
                                                            imageUrl: item.imageUrl,
                                                            sizeName: item.sizeName,
                                                        })
                                                    }
                                                    className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50/80 px-2.5 py-1 text-xs font-bold text-amber-900 shadow-2xs hover:bg-amber-100 hover:border-amber-400 transition-colors"
                                                >
                                                    <span>⭐</span>
                                                    <span>Đánh giá món</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Tổng tiền dòng (Line Total: lấy trực tiếp totalItemPrice) */}
                                <div className="text-right shrink-0">
                                    <span className="text-sm font-extrabold text-amber-900">
                                        {formatVnd(item.totalItemPrice ?? (item.unitPrice * item.quantity))}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Ghi chú của đơn (nếu có) */}
                {note && (
                    <div className="mt-3.5 flex items-start gap-1.5 rounded-xl border border-amber-200/80 bg-amber-50/70 px-3 py-2 text-xs text-amber-900">
                        <span className="shrink-0 font-bold">📝 Ghi chú:</span>
                        <span>{note}</span>
                    </div>
                )}
            </div>

            {/* Chi tiết phụ phí & Tổng thanh toán */}
            <div className="border-t border-stone-100 bg-stone-50/40 px-5 py-4">
                <div className="space-y-1 text-xs text-stone-600">
                    <div className="flex justify-between">
                        <span className="text-stone-500">Phí giao hàng {distanceKm ? `(${distanceKm} km)` : ''}:</span>
                        <span>{formatVnd(shippingFee ?? 0)}</span>
                    </div>

                    {discountAmount != null && Number(discountAmount) > 0 && (
                        <div className="flex justify-between text-green-700 font-semibold">
                            <span>Giảm giá Voucher:</span>
                            <span>−{formatVnd(discountAmount)}</span>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <span className="text-stone-500">Phương thức thanh toán:</span>
                        <span className="font-medium text-stone-700">{PAYMENT_LABEL[paymentMethod] ?? paymentMethod ?? 'COD'}</span>
                    </div>
                </div>

                {/* Tổng thanh toán cuối cùng (totalAmount BE đã tính sẵn) */}
                <div className="mt-3 flex items-baseline justify-between border-t border-stone-200/70 pt-3">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                            Tổng thanh toán
                        </span>
                        <span className="text-[11px] text-stone-400 block">
                            (Đã bao gồm phí ship & giảm giá)
                        </span>
                    </div>
                    <span className="text-xl font-black text-amber-900">
                        {formatVnd(totalAmount)}
                    </span>
                </div>

                {/* Nút Hủy Đơn: Chỉ hiển thị/enabled khi currentStatus === "Pending" */}
                {canCancel && (
                    <div className="mt-4 border-t border-stone-200/60 pt-3 flex justify-end">
                        <button
                            type="button"
                            disabled={cancelling}
                            onClick={() => onCancel(orderId)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 bg-white px-4 py-2 text-xs font-bold text-red-600 shadow-2xs hover:bg-red-50 hover:border-red-400 transition-colors disabled:opacity-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                            </svg>
                            <span>{cancelling ? 'Đang hủy...' : 'Hủy đơn hàng này'}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

// ── Main Page Component ───────────────────────────────────────────────────────
export default function OrderHistoryPage() {
    const dispatch = useDispatch()

    const {
        myOrders,
        myOrdersTotal,
        myOrdersTotalPages,
        myOrdersLoading,
        myOrdersError,
        cancelling,
    } = useSelector((s) => s.order)

    const [page, setPage] = useState(1)
    const [selectedStatus, setSelectedStatus] = useState('ALL')
    const [reviewedMap, setReviewedMap] = useState(getStoredReviewedItems)
    const [reviewTargetItem, setReviewTargetItem] = useState(null)

    const fetchOrders = useCallback(
        (p, status = selectedStatus) => {
            dispatch(
                getMyOrders({
                    pageNumber: p,
                    pageSize: 10,
                    status: status === 'ALL' ? undefined : status,
                })
            )
        },
        [dispatch, selectedStatus]
    )

    useEffect(() => {
        fetchOrders(page, selectedStatus)
    }, [fetchOrders, page, selectedStatus])

    const handleTabChange = (tabKey) => {
        if (tabKey === selectedStatus) return
        setSelectedStatus(tabKey)
        setPage(1)
    }

    const handleCancel = useCallback(
        (orderId) => {
            Modal.confirm({
                title: 'Xác nhận hủy đơn hàng?',
                content: `Bạn có chắc chắn muốn hủy đơn hàng #${orderId}? Thao tác này không thể hoàn tác.`,
                okText: 'Xác nhận hủy',
                cancelText: 'Giữ lại đơn',
                okType: 'danger',
                centered: true,
                onOk: async () => {
                    const res = await dispatch(cancelOrder(orderId))
                    if (cancelOrder.fulfilled.match(res)) {
                        message.success(`Đã hủy đơn hàng #${orderId} thành công!`)
                    } else {
                        message.error(res.payload || 'Không thể hủy đơn hàng!')
                    }
                },
            })
        },
        [dispatch]
    )

    const handleReviewSuccess = useCallback((orderDetailId) => {
        setReviewedMap((prev) => ({
            ...prev,
            [orderDetailId]: true,
        }))
    }, [])

    // Khi BE đã lọc theo query ?status=..., myOrders chính là danh sách đã lọc.
    // Thêm fallback an toàn: nếu BE chưa kịp lọc ở server thì client tự lọc.
    const displayedOrders = useMemo(() => {
        if (!Array.isArray(myOrders)) return []
        if (selectedStatus === 'ALL') return myOrders
        const allMatch = myOrders.every(
            (o) => String(o.currentStatus || '').toLowerCase() === selectedStatus.toLowerCase()
        )
        if (allMatch) return myOrders
        return myOrders.filter(
            (o) => String(o.currentStatus || '').toLowerCase() === selectedStatus.toLowerCase()
        )
    }, [myOrders, selectedStatus])

    const currentTabInfo = ORDER_STATUS_TABS.find((t) => t.key === selectedStatus) || ORDER_STATUS_TABS[0]
    const pageNumbers = Array.from({ length: myOrdersTotalPages }, (_, i) => i + 1)

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-stone-800">Lịch sử đơn hàng</h1>
                    <p className="text-xs text-stone-500">Xem và theo dõi tình trạng các đơn hàng bạn đã đặt</p>
                </div>
                <LoadingLink
                    to="/"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-800 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-900 transition-colors"
                >
                    <span>☕ Đặt món mới</span>
                </LoadingLink>
            </div>

            {/* Header Phân Loại Nhanh Các Trạng Thái Đơn Hàng (Sử dụng ORDER_STATUS_TABS từ utils) */}
            <div className="mb-6">
                <div className="flex flex-wrap items-center gap-2 border-b border-stone-200/90 pb-4">
                    {ORDER_STATUS_TABS.map((tab) => {
                        const isActive = selectedStatus === tab.key
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleTabChange(tab.key)}
                                className={`group inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all shadow-2xs ${
                                    isActive
                                        ? 'bg-amber-800 text-white shadow-md shadow-amber-900/20 ring-2 ring-amber-800/30'
                                        : 'bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50 hover:border-amber-300 hover:text-amber-900'
                                }`}
                            >
                                {tab.dot && (
                                    <span
                                        className={`h-2 w-2 rounded-full transition-transform group-hover:scale-125 ${
                                            isActive ? 'bg-amber-300 ring-2 ring-white' : tab.dot
                                        }`}
                                    />
                                )}
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Loading skeleton */}
            {myOrdersLoading && (
                <div className="flex flex-col gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-44 animate-pulse rounded-3xl bg-stone-100" />
                    ))}
                </div>
            )}

            {/* Error state */}
            {!myOrdersLoading && myOrdersError && (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
                    <p className="text-sm font-semibold text-red-600">{myOrdersError}</p>
                    <button
                        type="button"
                        onClick={() => fetchOrders(page, selectedStatus)}
                        className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Empty state */}
            {!myOrdersLoading && !myOrdersError && displayedOrders.length === 0 && (
                <div className="flex flex-col items-center gap-3 rounded-3xl border border-stone-200 bg-white py-16 text-center shadow-xs">
                    <span className="text-5xl">{currentTabInfo.icon || '📦'}</span>
                    <h3 className="text-base font-bold text-stone-800">
                        {selectedStatus === 'ALL'
                            ? 'Bạn chưa có đơn hàng nào'
                            : `Không có đơn hàng nào "${currentTabInfo.label}"`}
                    </h3>
                    <p className="text-xs text-stone-400 max-w-xs">
                        {selectedStatus === 'ALL'
                            ? 'Các đơn hàng đã đặt của bạn sẽ xuất hiện tại đây cùng trạng thái giao hàng chi tiết.'
                            : `Hiện tại bạn không có đơn hàng nào thuộc trạng thái ${currentTabInfo.label.toLowerCase()}.`}
                    </p>
                    {selectedStatus !== 'ALL' ? (
                        <button
                            type="button"
                            onClick={() => handleTabChange('ALL')}
                            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-stone-100 px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-200 transition-colors"
                        >
                            <span>Xem tất cả đơn hàng</span>
                        </button>
                    ) : (
                        <LoadingLink
                            to="/"
                            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-800 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-900 transition-colors"
                        >
                            <span>Khám phá thực đơn ngay</span>
                        </LoadingLink>
                    )}
                </div>
            )}

            {/* Order list */}
            {!myOrdersLoading && !myOrdersError && displayedOrders.length > 0 && (
                <>
                    <div className="mb-3 flex items-center justify-between text-xs text-stone-500">
                        <span>
                            Trạng thái: <strong className="text-stone-800">{currentTabInfo.label}</strong> (
                            {displayedOrders.length} đơn hàng)
                        </span>
                        <span>Trang {page} / {myOrdersTotalPages}</span>
                    </div>

                    <div className="flex flex-col gap-4">
                        {displayedOrders.map((order) => (
                            <OrderCard
                                key={order.orderId}
                                order={order}
                                cancelling={cancelling}
                                onCancel={(id) => handleCancel(id)}
                                onReviewClick={(itemInfo) => setReviewTargetItem(itemInfo)}
                                reviewedMap={reviewedMap}
                            />
                        ))}
                    </div>

                    {/* Review Modal */}
                    <ReviewModal
                        open={Boolean(reviewTargetItem)}
                        item={reviewTargetItem}
                        onClose={() => setReviewTargetItem(null)}
                        onSuccess={handleReviewSuccess}
                    />

                    {/* Pagination */}
                    {myOrdersTotalPages > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-1.5">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="h-9 w-9 rounded-xl border border-stone-200 bg-white text-sm font-bold text-stone-600 shadow-2xs hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                ‹
                            </button>
                            {pageNumbers.map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => setPage(n)}
                                    className={`h-9 w-9 rounded-xl text-xs font-bold transition-all shadow-2xs ${n === page
                                            ? 'bg-amber-800 text-white shadow-sm'
                                            : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                                        }`}
                                >
                                    {n}
                                </button>
                            ))}
                            <button
                                type="button"
                                disabled={page >= myOrdersTotalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="h-9 w-9 rounded-xl border border-stone-200 bg-white text-sm font-bold text-stone-600 shadow-2xs hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                ›
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
