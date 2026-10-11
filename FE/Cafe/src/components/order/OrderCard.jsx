import { useEffect, useState } from 'react'
import { message, Modal } from 'antd'
import {
    PAYMENT_LABEL,
    canCancelOrder,
    getStatusConfig,
    getPaymentStatusConfig,
} from '../../utils/constants/OrderConstants'
import { pickErrorMessage, unwrapApi } from '../../utils/helpers/api'
import { feedbackService } from '../../services/user/FeedbackService'
import { paymentService } from '../../services/user/PaymentService'
import { formatVnd } from '../../utils/helpers/format'
import LoadingLink from '../loading/LoadingLink'
import { AppToast, AppConfirm } from '../common/AppNotification'


// Helper lưu trạng thái món đã đánh giá (theo orderDetailId)
const STORAGE_KEY = 'user_reviewed_order_details'
export const getStoredReviewedItems = () => {
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

import { Upload, Button } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

/**
 * ReviewModal Component
 * Modal bật lên để người dùng đánh giá (chấm sao và bình luận) cho từng món cụ thể trong đơn hàng.
 */
export function ReviewModal({ open, item, onClose, onSuccess }) {
    const [rating, setRating] = useState(5)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [fileList, setFileList] = useState([])

    useEffect(() => {
        if (open) {
            setRating(5)
            setHoverRating(0)
            setComment('')
            setFileList([])
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

    const handleUploadChange = ({ fileList: newFileList }) => {
        setFileList(newFileList)
    }

    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/')
        if (!isImage) {
            AppToast.error('Chỉ hỗ trợ upload file ảnh!')
        }
        return false // Ngăn chặn tự động upload
    }

    const handleSubmit = async () => {
        if (!rating || rating < 1 || rating > 5) {
            AppToast.warning('Vui lòng chọn số sao đánh giá từ 1 đến 5!')
            return
        }

        setSubmitting(true)
        try {
            // Bước 1: Gửi text review
            const body = {
                productId: Number(item.productId),
                orderDetailId: Number(item.orderDetailId),
                rating: Number(rating),
                comment: comment.trim() || null,
            }
            const res = await feedbackService.addFeedback(body)
            // Lấy feedbackId từ response (unwrapApi đã trả thẳng Data là số)
            const feedbackId = typeof res === 'number' ? res : null

            // Bước 2: Upload ảnh nếu có
            if (feedbackId && fileList.length > 0) {
                const formData = new FormData()
                fileList.forEach((file) => {
                    formData.append('files', file.originFileObj)
                })
                await feedbackService.uploadFeedbackImages(feedbackId, formData)
            }

            AppToast.success(res?.message || 'Cảm ơn bạn đã gửi đánh giá!')
            saveStoredReviewedItem(item.orderDetailId)
            onSuccess?.(item.orderDetailId)
            onClose()
        } catch (err) {
            const msg = pickErrorMessage(err, 'Đã có lỗi xảy ra khi gửi đánh giá!')
            AppToast.error(msg)
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
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-2xl shadow-inner">
                        ⭐
                    </span>
                    <h3 className="mt-2.5 text-lg font-black text-slate-800">Đánh giá món</h3>
                    <p className="text-xs text-slate-500">
                        Cảm nhận thực tế của bạn sẽ giúp quán cải thiện chất lượng phục vụ tốt hơn
                    </p>
                </div>

                {/* Thông tin món đang đánh giá */}
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50/50 p-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-3xl border border-slate-200 bg-white">
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-xl">☕</div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-bold text-slate-800">{item.productName}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            {item.sizeName && (
                                <span className="rounded bg-white px-1.5 py-0.5 font-semibold text-sky-800 border border-sky-200">
                                    Size {item.sizeName}
                                </span>
                            )}
                            <span>Đơn #{item.orderId}</span>
                        </div>
                    </div>
                </div>

                {/* Phần chọn số sao */}
                <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
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
                                        className={`h-9 w-9 transition-colors ${isFilled ? 'text-amber-400 drop-shadow-sm' : 'text-slate-300 hover:text-amber-200'
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
                    <div className="mt-2 flex items-center justify-center gap-1.5 text-sm font-bold text-amber-600">
                        <span>{RATING_LABELS[currentRating]?.emoji}</span>
                        <span>{RATING_LABELS[currentRating]?.text}</span>
                    </div>
                </div>

                {/* Nhận xét văn bản */}
                <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                        <label htmlFor="feedback-comment" className="font-semibold">
                            Nhận xét chi tiết <span className="font-normal text-slate-400">(Tùy chọn)</span>
                        </label>
                        <span className="text-[11px] text-slate-400">{comment.length}/500</span>
                    </div>
                    <textarea
                        id="feedback-comment"
                        rows={3}
                        maxLength={500}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Hãy chia sẻ hương vị đồ uống, độ đậm đà, độ ngọt đá, hay cách quán đóng gói bạn nhé..."
                        className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-sky-700 focus:outline-none focus:ring-1 focus:ring-sky-700 transition"
                    />
                </div>

                {/* Upload ảnh */}
                <div className="mt-4">
                    <div className="text-xs text-slate-600 mb-2 font-semibold">
                        Đính kèm hình ảnh <span className="font-normal text-slate-400">(Tối đa 5 ảnh)</span>
                    </div>
                    <Upload
                        listType="picture-card"
                        fileList={fileList}
                        onChange={handleUploadChange}
                        beforeUpload={beforeUpload}
                        maxCount={5}
                        multiple
                        accept="image/*"
                    >
                        {fileList.length >= 5 ? null : (
                            <div className="flex flex-col items-center justify-center text-slate-400 hover:text-sky-600 transition-colors">
                                <PlusOutlined className="text-xl mb-1" />
                                <div className="text-xs font-semibold">Thêm ảnh</div>
                            </div>
                        )}
                    </Upload>
                </div>

                {/* Buttons hành động */}
                <div className="mt-6 flex items-center justify-end gap-2.5">
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={onClose}
                        className="rounded-3xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                    >
                        Để sau
                    </button>
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={handleSubmit}
                        className="inline-flex items-center gap-1.5 rounded-3xl bg-sky-800 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-sky-900 disabled:opacity-50 transition"
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
export default function OrderCard({ order, onCancel, cancelling, onReviewClick, reviewedMap }) {
    const {
        orderId, orderDate, totalAmount, shippingFee, distanceKm,
        orderDiscount, shippingDiscount, subTotal, currentStatus, paymentMethod, paymentStatus, note,
    } = order

    const [payingVnPay, setPayingVnPay] = useState(false)

    // Hỗ trợ cả items (đặc tả mới) và fallback orderDetails
    const orderItems = Array.isArray(order.items)
        ? order.items
        : (Array.isArray(order.orderDetails) ? order.orderDetails : [])

    const canCancel = canCancelOrder(currentStatus)
    const isCompleted = String(currentStatus || '').toUpperCase() === 'COMPLETED'
    const isVnPay = String(paymentMethod || '').toUpperCase() === 'VNPAY'
    const isUnpaid = String(paymentStatus || '').toUpperCase() === 'UNPAID'
    const isFailed = String(paymentStatus || '').toUpperCase() === 'FAILED'
    const isCancelled = String(currentStatus || '').toUpperCase() === 'CANCELLED'

    // Cho phép thanh toán lại khi phương thức là VNPay, đơn chưa thanh toán hoặc thất bại và chưa bị hủy
    const canPayVnPay = isVnPay && (isUnpaid || isFailed) && !isCancelled

    const handlePayVnPay = async () => {
        setPayingVnPay(true)
        try {
            const res = await paymentService.createPaymentUrl({ orderId: Number(orderId) })
            const data = unwrapApi(res)
            const paymentUrl = data?.paymentUrl || data?.url
            if (paymentUrl) {
                window.location.href = paymentUrl
            } else {
                AppToast.error('Không tìm thấy đường dẫn thanh toán!')
            }
        } catch (err) {
            const msg = pickErrorMessage(err, 'Không thể tạo liên kết thanh toán VNPay!')
            AppToast.error(msg)
        } finally {
            setPayingVnPay(false)
        }
    }

    const formattedDate = orderDate
        ? new Date(orderDate).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        })
        : '—'

    const paymentStatusCfg = getPaymentStatusConfig(paymentStatus)

    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs transition-all hover:shadow-md hover:border-sky-300">
            {/* Header: Mã đơn + Ngày giờ + Trạng thái */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-slate-800">
                        Đơn hàng #{orderId}
                    </span>
                    <StatusBadge status={currentStatus} />
                    {paymentStatus && (
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-2xs ${paymentStatusCfg.color}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${paymentStatusCfg.dot}`} />
                            {paymentStatusCfg.label}
                        </span>
                    )}
                </div>
                <span className="text-xs font-medium text-slate-400">{formattedDate}</span>
            </div>

            {/* Thông tin giao hàng */}
            <div className="border-b border-slate-100 bg-white px-5 py-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                            </svg>
                            Người nhận
                        </div>
                        <p className="text-sm font-semibold text-slate-800">
                            {order.userName || 'Không có tên'}
                        </p>
                        <p className="text-sm font-medium text-slate-500 mt-0.5">
                            {order.userPhone || 'Không có SĐT'}
                        </p>
                    </div>
                    
                    <div className="flex-[2]">
                        <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.02.01.006.004zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                            </svg>
                            Địa chỉ giao hàng
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                            {order.shippingAddress || 'Nhận tại cửa hàng'}
                        </p>
                    </div>
                </div>
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
                                className="flex items-start justify-between gap-3.5 border-b border-slate-100/80 pb-3.5 last:border-b-0 last:pb-0"
                            >
                                {/* Thumbnail sản phẩm */}
                                <LoadingLink 
                                    to={`/product/${item.productId}`}
                                    className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 hover:opacity-90 transition-opacity"
                                >
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.productName || item.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-2xl text-slate-400">
                                            ☕
                                        </div>
                                    )}
                                </LoadingLink>

                                {/* Thông tin món + size + topping */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <LoadingLink to={`/product/${item.productId}`}>
                                            <h4 className="text-sm font-bold text-slate-800 hover:text-sky-800 transition-colors">
                                                {item.productName || item.name}
                                            </h4>
                                        </LoadingLink>
                                        {/* Size: chỉ hiển thị khi sizeId != null theo đặc tả */}
                                        {hasSize && (
                                            <span className="rounded-md bg-sky-100/80 px-1.5 py-0.5 text-[11px] font-bold text-sky-900">
                                                Size {item.sizeName}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                                        <span>Số lượng: <strong className="text-slate-700">×{item.quantity}</strong></span>
                                        <span>•</span>
                                        <span>Đơn giá: {formatVnd(item.unitPrice)}</span>
                                    </div>

                                    {/* Danh sách topping của món */}
                                    {itemToppings.length > 0 && (
                                        <div className="mt-1.5 space-y-1 rounded-3xl bg-slate-50 p-2 text-xs">
                                            {itemToppings.map((t, ti) => (
                                                <div
                                                    key={ti}
                                                    className="flex items-center justify-between text-slate-600"
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        {t.imageUrl ? (
                                                            <img
                                                                src={t.imageUrl}
                                                                alt={t.toppingName || t.name}
                                                                className="h-4 w-4 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-[10px] text-sky-700">+</span>
                                                        )}
                                                        <span>{t.toppingName || t.name}</span>
                                                        <span className="font-bold text-sky-800">
                                                            ×{t.quantity} {t.unit || 'phần'}
                                                        </span>
                                                    </div>
                                                    <span className="font-medium text-slate-700">
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
                                                <span className="inline-flex items-center gap-1 rounded-2xl bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
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
                                                            orderId: orderId,
                                                            productName: item.productName || item.name,
                                                            imageUrl: item.imageUrl,
                                                            sizeName: item.sizeName,
                                                        })
                                                    }
                                                    className="inline-flex items-center gap-1 rounded-2xl border border-sky-300 bg-sky-50/80 px-2.5 py-1 text-xs font-bold text-sky-900 shadow-2xs hover:bg-sky-100 hover:border-sky-400 transition-colors"
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
                                    <span className="text-sm font-extrabold text-sky-900">
                                        {formatVnd(item.totalItemPrice ?? (item.unitPrice * item.quantity))}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Ghi chú của đơn (nếu có) */}
                {note && (
                    <div className="mt-3.5 flex items-start gap-1.5 rounded-3xl border border-sky-200/80 bg-sky-50/70 px-3 py-2 text-xs text-sky-900">
                        <span className="shrink-0 font-bold">📝 Ghi chú:</span>
                        <span>{note}</span>
                    </div>
                )}
            </div>

            {/* Chi tiết phụ phí & Tổng thanh toán */}
            <div className="border-t border-slate-100 bg-slate-50/40 px-5 py-4">
                <div className="space-y-1 text-xs text-slate-600">
                    {subTotal != null && Number(subTotal) > 0 && (
                        <div className="flex justify-between">
                            <span className="text-slate-500">Tạm tính món:</span>
                            <span>{formatVnd(subTotal)}</span>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <span className="text-slate-500">Phí giao hàng {distanceKm ? `(${distanceKm} km)` : ''}:</span>
                        <span>{formatVnd(shippingFee ?? 0)}</span>
                    </div>

                    {orderDiscount != null && Number(orderDiscount) > 0 && (
                        <div className="flex justify-between text-green-700 font-semibold">
                            <span>Giảm giá món ăn:</span>
                            <span>−{formatVnd(orderDiscount)}</span>
                        </div>
                    )}

                    {shippingDiscount != null && Number(shippingDiscount) > 0 && (
                        <div className="flex justify-between text-green-700 font-semibold">
                            <span>Giảm cước ship:</span>
                            <span>−{formatVnd(shippingDiscount)}</span>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <span className="text-slate-500">Phương thức thanh toán:</span>
                        <span className="font-medium text-slate-700">{PAYMENT_LABEL[paymentMethod] ?? paymentMethod ?? 'COD'}</span>
                    </div>
                </div>

                {/* Tổng thanh toán cuối cùng (totalAmount BE đã tính sẵn) */}
                <div className="mt-3 flex items-baseline justify-between border-t border-slate-200/70 pt-3">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Tổng thanh toán
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                            (Đã bao gồm phí ship & giảm giá)
                        </span>
                    </div>
                    <span className="text-xl font-black text-sky-900">
                        {formatVnd(totalAmount)}
                    </span>
                </div>

                {/* Nút Hành Động: Thanh toán lại VNPay & Hủy Đơn */}
                {(canPayVnPay || canCancel) && (
                    <div className="mt-4 border-t border-slate-200/60 pt-3 flex flex-wrap items-center justify-end gap-2.5">
                        {canPayVnPay && (
                            <button
                                type="button"
                                disabled={payingVnPay}
                                onClick={handlePayVnPay}
                                className="inline-flex items-center gap-1.5 rounded-3xl bg-sky-800 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-900 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                {payingVnPay ? (
                                    <>
                                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        <span>Đang kết nối VNPay...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🏦</span>
                                        <span>Thanh toán VNPay ngay</span>
                                    </>
                                )}
                            </button>
                        )}

                        {canCancel && (
                            <button
                                type="button"
                                disabled={cancelling}
                                onClick={() => onCancel(orderId)}
                                className="inline-flex items-center gap-1.5 rounded-3xl border border-red-300 bg-white px-4 py-2 text-xs font-bold text-red-600 shadow-2xs hover:bg-red-50 hover:border-red-400 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                                </svg>
                                <span>{cancelling ? 'Đang hủy...' : 'Hủy đơn hàng này'}</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

