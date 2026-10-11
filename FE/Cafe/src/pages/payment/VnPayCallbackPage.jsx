import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { paymentService } from '../../services/user/PaymentService'
import { orderService } from '../../services/user/OrderService'
import { getMyOrders } from '../../redux/actions/user/orderAction'
import { formatVnd } from '../../utils/helpers/format'
import { pickErrorMessage, unwrapApi } from '../../utils/helpers/api'
import LoadingLink from '../../components/loading/LoadingLink'
import { AppToast } from '../../components/common/AppNotification'
import {
    PAYMENT_LABEL,
    getStatusConfig,
    getPaymentStatusConfig,
} from '../../utils/constants/OrderConstants'

// ── Animated Success Check Icon ───────────────────────────────────────────────
function AnimatedCheck() {
    return (
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 shadow-inner">
            <svg
                viewBox="0 0 52 52"
                className="h-12 w-12 drop-shadow-sm"
                style={{ animation: 'pop .4s cubic-bezier(.175,.885,.32,1.275) both' }}
            >
                <circle cx="26" cy="26" r="25" fill="#059669" />
                <path
                    d="M14 27l8 8 16-16"
                    fill="none"
                    stroke="white"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        animation: 'draw .5s .25s ease forwards',
                        strokeDasharray: 36,
                        strokeDashoffset: 36,
                    }}
                />
            </svg>
            <style>{`
                @keyframes pop {
                    from { transform: scale(.4); opacity: 0 }
                    to   { transform: scale(1); opacity: 1 }
                }
                @keyframes draw {
                    to { stroke-dashoffset: 0 }
                }
            `}</style>
        </div>
    )
}

// ── Animated Failed / Warning Icon ────────────────────────────────────────────
function AnimatedFailed() {
    return (
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 shadow-inner">
            <svg
                viewBox="0 0 52 52"
                className="h-12 w-12 drop-shadow-sm"
                style={{ animation: 'pop .4s cubic-bezier(.175,.885,.32,1.275) both' }}
            >
                <circle cx="26" cy="26" r="25" fill="#e11d48" />
                <path
                    d="M16 16 L36 36 M36 16 L16 36"
                    fill="none"
                    stroke="white"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        animation: 'draw .5s .25s ease forwards',
                        strokeDasharray: 36,
                        strokeDashoffset: 36,
                    }}
                />
            </svg>
            <style>{`
                @keyframes pop {
                    from { transform: scale(.4); opacity: 0 }
                    to   { transform: scale(1); opacity: 1 }
                }
                @keyframes draw {
                    to { stroke-dashoffset: 0 }
                }
            `}</style>
        </div>
    )
}

/**
 * VnPayCallbackPage Component
 * Hợp nhất toàn diện giữa OrderSuccessPage và VnPayCallback:
 * - Tiếp nhận callback từ cổng VNPay, đối soát chữ ký với Backend.
 * - Hiển thị trạng thái giao dịch (Thành công / Thất bại).
 * - Hiển thị chi tiết đơn hàng (Món, Size, Topping, Phụ phí ship, Địa chỉ).
 * - Hỗ trợ "Thanh toán lại bằng VNPay ngay" tại chỗ nếu đơn chưa thanh toán / thất bại.
 */
export default function VnPayCallbackPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const lastOrderFromStore = useSelector((s) => s.user.order.lastOrder)
    const myOrdersFromStore = useSelector((s) => s.user.order.myOrders)

    const [loading, setLoading] = useState(true)
    const [callbackResult, setCallbackResult] = useState(null)
    const [fetchedOrder, setFetchedOrder] = useState(null)
    const [retryLoading, setRetryLoading] = useState(false)

    // ── 1. Gọi API đối soát kết quả VNPay ──────────────────────────────────────
    useEffect(() => {
        let isMounted = true
        const queryString = searchParams.toString()

        if (!queryString) {
            setLoading(false)
            setCallbackResult({
                success: false,
                message: 'Không tìm thấy thông tin phản hồi từ cổng thanh toán VNPay.',
            })
            return
        }

        const verifyPayment = async () => {
            try {
                const res = await paymentService.getPaymentCallback(queryString)
                const data = unwrapApi(res)
                if (isMounted) {
                    setCallbackResult(data)
                }
            } catch (err) {
                if (isMounted) {
                    const errorData = err.response?.data?.data
                    const msg = pickErrorMessage(err, 'Xác thực thanh toán thất bại!')
                    setCallbackResult({
                        success: false,
                        message: msg,
                        ...(errorData || {}),
                    })
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        verifyPayment()

        return () => {
            isMounted = false
        }
    }, [searchParams])

    // Mã đơn hàng từ callback hoặc từ store
    const callbackOrderId = callbackResult?.orderId || searchParams.get('vnp_TxnRef')?.split('_')?.[0]

    // ── 2. Nạp chi tiết đơn hàng tương ứng ────────────────────────────────────
    useEffect(() => {
        if (!callbackOrderId) return

        const idNum = Number(callbackOrderId)
        // Ưu tiên 1: Lấy từ lastOrder trong store nếu trùng ID
        if (Number(lastOrderFromStore?.orderId ?? lastOrderFromStore?.id) === idNum) {
            setFetchedOrder(lastOrderFromStore)
            return
        }

        // Ưu tiên 2: Tìm trong myOrders
        const foundInMyOrders = myOrdersFromStore.find((o) => Number(o.orderId) === idNum)
        if (foundInMyOrders) {
            setFetchedOrder(foundInMyOrders)
            return
        }

        // Ưu tiên 3: Tải từ API my-orders để lấy dữ liệu snapshot đơn
        orderService.getMyOrders({ pageNumber: 1, pageSize: 10 })
            .then((res) => {
                const data = unwrapApi(res)
                const matched = (data?.items || []).find((o) => Number(o.orderId) === idNum)
                if (matched) {
                    setFetchedOrder(matched)
                }
            })
            .catch(() => {
                /* Bỏ qua lỗi nếu chưa đăng nhập */
            })
    }, [callbackOrderId, lastOrderFromStore, myOrdersFromStore])

    // Cập nhật lại danh sách đơn hàng khi thanh toán thành công
    useEffect(() => {
        if (callbackResult?.success || callbackResult?.responseCode === '00') {
            dispatch(getMyOrders({ pageNumber: 1, pageSize: 10 }))
        }
    }, [callbackResult, dispatch])

    // ── 3. Xử lý tạo lại link thanh toán khi giao dịch thất bại ─────────────
    const handleRetryPayment = async () => {
        if (!callbackOrderId) {
            navigate('/orders')
            return
        }

        setRetryLoading(true)
        try {
            const res = await paymentService.createPaymentUrl({ orderId: Number(callbackOrderId) })
            const data = unwrapApi(res)
            const paymentUrl = data?.paymentUrl || data?.url
            if (paymentUrl) {
                window.location.href = paymentUrl
            } else {
                AppToast.error('Không tìm thấy đường dẫn thanh toán mới!')
            }
        } catch (err) {
            const msg = pickErrorMessage(err, 'Không thể tạo lại liên kết thanh toán!')
            AppToast.error(msg)
        } finally {
            setRetryLoading(false)
        }
    }

    const handleCopyOrderId = (id) => {
        if (id) {
            try {
                navigator.clipboard.writeText(String(id))
                AppToast.success(`Đã sao chép mã đơn #${id}!`)
            } catch {
                AppToast.success(`Mã đơn: #${id}`)
            }
        }
    }

    // ── Trạng thái đang tải xác thực chữ ký ──
    if (loading) {
        return (
            <div className="mx-auto max-w-md px-4 py-24 text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-sky-200 border-t-sky-800" />
                <h2 className="text-lg font-bold text-slate-800">Đang đối soát giao dịch VNPay...</h2>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    Hệ thống đang tiến hành kiểm tra chữ ký điện tử và xác thực giao dịch từ cổng thanh toán. Vui lòng không đóng trình duyệt.
                </p>
            </div>
        )
    }

    const isSuccess = Boolean(callbackResult?.success || callbackResult?.responseCode === '00')
    const finalOrderId = callbackOrderId || fetchedOrder?.orderId
    const currentStatus = fetchedOrder?.currentStatus ?? (isSuccess ? 'CONFIRMED' : 'PENDING')
    const statusCfg = getStatusConfig(currentStatus)
    const paymentStatus = isSuccess ? 'PAID' : (fetchedOrder?.paymentStatus || 'FAILED')
    const paymentStatusCfg = getPaymentStatusConfig(paymentStatus)

    // Chi tiết tiền & món
    const items = Array.isArray(fetchedOrder?.items)
        ? fetchedOrder.items
        : (Array.isArray(fetchedOrder?.orderDetails) ? fetchedOrder.orderDetails : [])

    const totalAmount = fetchedOrder?.totalAmount ?? callbackResult?.amount ?? 0
    const shippingFee = fetchedOrder?.shippingFee ?? 0
    const distanceKm = fetchedOrder?.distanceKm
    const orderDiscount = fetchedOrder?.orderDiscount ?? 0
    const shippingDiscount = fetchedOrder?.shippingDiscount ?? 0

    const itemsSubtotal = items.length
        ? items.reduce((sum, i) => sum + (Number(i.totalItemPrice) || (Number(i.unitPrice) * Number(i.quantity)) || 0), 0)
        : (fetchedOrder?.subTotal || null)

    const formattedDate = fetchedOrder?.orderDate
        ? new Date(fetchedOrder.orderDate).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        })
        : null

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            {/* ── 1. Banner Trạng Thái ── */}
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
                {isSuccess ? <AnimatedCheck /> : <AnimatedFailed />}

                <h1 className="text-2xl font-black text-slate-800 tracking-tight sm:text-3xl">
                    {isSuccess ? 'Thanh toán thành công! 🎉' : 'Thanh toán chưa hoàn tất'}
                </h1>

                <p className="max-w-md text-xs text-slate-500 leading-relaxed">
                    {callbackResult?.message || (isSuccess
                        ? 'Cảm ơn bạn! Đơn hàng đã được thanh toán trực tuyến qua cổng VNPay và chuyển cho quán chuẩn bị.'
                        : 'Giao dịch qua cổng VNPay không thành công hoặc đã bị hủy. Bạn có thể bấm thanh toán lại bên dưới.')}
                </p>

                {/* Mã đơn hàng & Badge Trạng thái */}
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                    {finalOrderId && (
                        <button
                            type="button"
                            onClick={() => handleCopyOrderId(finalOrderId)}
                            title="Bấm để sao chép mã đơn"
                            className="group inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-50/90 px-3.5 py-1 font-mono text-xs font-extrabold text-sky-900 shadow-2xs hover:bg-sky-100 transition-colors cursor-pointer"
                        >
                            <span>Đơn hàng #{finalOrderId}</span>
                            <span className="opacity-60 group-hover:opacity-100 text-[10px]">📋</span>
                        </button>
                    )}

                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold shadow-2xs ${statusCfg.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                        <span>{statusCfg.label}</span>
                    </span>

                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold shadow-2xs ${paymentStatusCfg.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${paymentStatusCfg.dot}`} />
                        <span>{paymentStatusCfg.label}</span>
                    </span>
                </div>
            </div>

            {/* ── 2. Card Chi tiết Giao dịch VNPay ── */}
            <div className="mb-5 overflow-hidden rounded-3xl border border-sky-100 bg-sky-50/40 p-4 shadow-xs">
                <div className="mb-2.5 flex items-center justify-between text-xs font-bold text-sky-950">
                    <span className="flex items-center gap-1.5">
                        <span>🏦</span>
                        <span>Đối soát giao dịch VNPay</span>
                    </span>
                    {callbackResult?.bankCode && (
                        <span className="rounded-md bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-sky-800 border border-sky-200">
                            {callbackResult.bankCode}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 sm:grid-cols-3">
                    <div>
                        <span className="text-[11px] text-slate-400 block">Số tiền</span>
                        <span className="font-extrabold text-sky-900">
                            {formatVnd(callbackResult?.amount || totalAmount)}
                        </span>
                    </div>

                    <div>
                        <span className="text-[11px] text-slate-400 block">Mã GD VNPay</span>
                        <span className="font-mono font-semibold text-slate-700">
                            {callbackResult?.transactionNo && callbackResult.transactionNo !== '0'
                                ? callbackResult.transactionNo
                                : '—'}
                        </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                        <span className="text-[11px] text-slate-400 block">Mã phản hồi</span>
                        <span className="font-mono text-slate-700">
                            {callbackResult?.responseCode ? `Code ${callbackResult.responseCode}` : '—'}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── 3. Card Chi tiết Đơn Hàng (Các món đã đặt) ── */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
                <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-3.5 text-xs text-slate-600">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        {formattedDate && (
                            <span className="flex items-center gap-1.5">
                                <span className="text-slate-400">🕒</span>
                                <span>Thời gian đặt: <strong className="text-slate-700">{formattedDate}</strong></span>
                            </span>
                        )}
                        <span className="font-medium text-slate-700">
                            {PAYMENT_LABEL.VNPAY}
                        </span>
                    </div>
                </div>

                {/* Thông tin người nhận và địa chỉ */}
                {(fetchedOrder?.userName || fetchedOrder?.shippingAddress) && (
                    <div className="border-b border-slate-100 bg-white px-5 py-3.5 text-xs text-slate-700">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                            {fetchedOrder?.userName && (
                                <div>
                                    <span className="text-[11px] text-slate-400 block">Người nhận</span>
                                    <strong className="text-slate-800">{fetchedOrder.userName}</strong>
                                    {fetchedOrder?.userPhone && <span className="text-slate-500 ml-1.5">({fetchedOrder.userPhone})</span>}
                                </div>
                            )}
                            {fetchedOrder?.shippingAddress && (
                                <div className="flex-1">
                                    <span className="text-[11px] text-slate-400 block">Địa chỉ giao hàng</span>
                                    <span className="text-slate-700">{fetchedOrder.shippingAddress}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Danh sách các món trong đơn hàng */}
                <div className="p-5">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                        ☕ Món đã đặt {items.length > 0 ? `(${items.reduce((s, i) => s + (Number(i.quantity) || 1), 0)} phần)` : ''}
                    </h3>

                    {items.length > 0 ? (
                        <div className="space-y-4">
                            {items.map((item, idx) => {
                                const hasSize = item.sizeId !== null && item.sizeId !== undefined && item.sizeName
                                const itemToppings = Array.isArray(item.toppings) ? item.toppings : []
                                const lineTotal = item.totalItemPrice != null
                                    ? Number(item.totalItemPrice)
                                    : (Number(item.unitPrice || 0) * Number(item.quantity || 1))

                                return (
                                    <div
                                        key={idx}
                                        className="flex items-start justify-between gap-3.5 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
                                    >
                                        {/* Ảnh món */}
                                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
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
                                        </div>

                                        {/* Tên món + Size + Topping */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="text-sm font-bold text-slate-800">
                                                    {item.productName || item.name}
                                                </h4>
                                                {hasSize && (
                                                    <span className="rounded-md bg-sky-100/80 px-1.5 py-0.5 text-[11px] font-bold text-sky-900">
                                                        Size {item.sizeName}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                                <span>Số lượng: <strong className="text-slate-700">×{item.quantity}</strong></span>
                                                <span>•</span>
                                                <span>Đơn giá: {formatVnd(item.unitPrice)}</span>
                                            </div>

                                            {itemToppings.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                    {itemToppings.map((top, tIdx) => (
                                                        <span
                                                            key={tIdx}
                                                            className="inline-flex items-center gap-1 rounded-2xl border border-sky-200/60 bg-sky-50/70 px-2 py-0.5 text-[11px] text-sky-900"
                                                        >
                                                            <span>+</span>
                                                            <span>{top.toppingName || top.name}</span>
                                                            {top.quantity > 1 && (
                                                                <strong className="text-sky-800 font-bold">(×{top.quantity})</strong>
                                                            )}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Thành tiền món */}
                                        <div className="text-right shrink-0">
                                            <span className="text-sm font-bold text-slate-800">
                                                {formatVnd(lineTotal)}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="py-4 text-center text-xs text-slate-400">
                            <span>Đã tiếp nhận đơn hàng #{finalOrderId}</span>
                        </div>
                    )}

                    {/* Ghi chú đơn nếu có */}
                    {fetchedOrder?.note && (
                        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-sky-200 bg-sky-50/80 p-3 text-xs text-sky-900">
                            <span className="shrink-0 text-sm">📝</span>
                            <div>
                                <strong className="font-bold">Ghi chú:</strong> {fetchedOrder.note}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── 4. Chi tiết Dòng Tiền & Phụ Phí ── */}
                <div className="border-t border-slate-100 bg-slate-50/40 p-5">
                    <div className="space-y-2 text-xs text-slate-600">
                        {itemsSubtotal != null && (
                            <div className="flex justify-between">
                                <span className="text-slate-500">Tạm tính tiền món:</span>
                                <span className="font-semibold text-slate-800">{formatVnd(itemsSubtotal)}</span>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <span className="text-slate-500">
                                Phí vận chuyển {distanceKm ? `(${distanceKm} km)` : ''}:
                            </span>
                            <span className="font-semibold text-slate-800">{formatVnd(shippingFee)}</span>
                        </div>

                        {orderDiscount > 0 && (
                            <div className="flex justify-between text-emerald-700 font-bold">
                                <span>Giảm giá món ăn:</span>
                                <span>−{formatVnd(orderDiscount)}</span>
                            </div>
                        )}
                        {shippingDiscount > 0 && (
                            <div className="flex justify-between text-emerald-700 font-bold">
                                <span>Giảm cước ship:</span>
                                <span>−{formatVnd(shippingDiscount)}</span>
                            </div>
                        )}
                    </div>

                    {/* Tổng thanh toán */}
                    <div className="mt-4 flex items-baseline justify-between border-t border-slate-200/80 pt-4">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Tổng thanh toán
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                                (Đã bao gồm tiền món, topping, phí ship và voucher)
                            </span>
                        </div>
                        <span className="text-2xl font-black text-sky-900">
                            {formatVnd(totalAmount)}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── 5. Nút Điều Hướng & Thử Lại Thanh Toán ── */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                {/* Nút Thanh toán lại: Hiển thị nổi bật khi thất bại */}
                {!isSuccess && finalOrderId && (
                    <button
                        type="button"
                        onClick={handleRetryPayment}
                        disabled={retryLoading}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-800 px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-sky-900 disabled:opacity-50 transition-all cursor-pointer"
                    >
                        {retryLoading ? (
                            <>
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                <span>Đang kết nối lại VNPay...</span>
                            </>
                        ) : (
                            <>
                                <span>💳</span>
                                <span>Thanh toán lại bằng VNPay ngay</span>
                            </>
                        )}
                    </button>
                )}

                <LoadingLink
                    to="/orders"
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                    <span>📋 Xem lịch sử đơn hàng</span>
                </LoadingLink>

                <LoadingLink
                    to="/"
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-100 py-3 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-all"
                >
                    <span>☕ Tiếp tục đặt món</span>
                </LoadingLink>
            </div>
        </div>
    )
}
