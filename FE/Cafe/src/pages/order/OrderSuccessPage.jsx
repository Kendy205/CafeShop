import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { message } from 'antd'
import LoadingLink from '../../components/loading/LoadingLink'
import { formatVnd } from '../../utils/helpers/format'
import {
    PAYMENT_LABEL,
    getStatusConfig,
} from '../../utils/constants/OrderConstants'

// ── Animated Checkmark Icon ───────────────────────────────────────────────────
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

// ── Component chính OrderSuccessPage ──────────────────────────────────────────
export default function OrderSuccessPage() {
    const order = useSelector((s) => s.order.lastOrder)

    // Trích xuất các trường từ data trả về từ API Checkout / Buy Now
    const orderId = order?.orderId ?? order?.id
    const currentStatus = order?.currentStatus ?? 'PENDING'
    const statusCfg = getStatusConfig(currentStatus)
    const paymentMethod = order?.paymentMethod ?? 'COD'
    const note = order?.note
    const totalAmount = order?.totalAmount ?? order?.total
    const shippingFee = order?.shippingFee ?? 0
    const distanceKm = order?.distanceKm
    const discountAmount = order?.discountAmount ?? 0

    // Mảng items theo đặc tả API
    const items = useMemo(() => {
        if (Array.isArray(order?.items)) return order.items
        if (Array.isArray(order?.orderDetails)) return order.orderDetails
        return []
    }, [order])

    // Tính tạm tính tổng các món
    const itemsSubtotal = useMemo(() => {
        if (!items.length) return null
        return items.reduce((sum, i) => sum + (Number(i.totalItemPrice) || (Number(i.unitPrice) * Number(i.quantity)) || 0), 0)
    }, [items])

    const formattedDate = order?.orderDate
        ? new Date(order.orderDate).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : null

    const handleCopyOrderId = () => {
        if (orderId) {
            try {
                navigator.clipboard.writeText(String(orderId))
                message.success(`Đã sao chép mã đơn #${orderId}!`)
            } catch {
                message.success(`Mã đơn: #${orderId}`)
            }
        }
    }

    // ── Trường hợp không tìm thấy thông tin đơn hàng ──
    if (!order) {
        return (
            <div className="mx-auto max-w-md px-4 py-16 text-center">
                <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-4xl">
                    ☕
                </div>
                <h2 className="text-xl font-bold text-slate-800">Không tìm thấy thông tin đơn hàng</h2>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    Bạn có thể đã tải lại trang hoặc chưa hoàn tất thao tác đặt hàng. Vui lòng kiểm tra lại trong lịch sử đơn hàng của bạn.
                </p>
                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                    <LoadingLink
                        to="/orders"
                        className="rounded-3xl bg-sky-800 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-sky-900 transition-colors"
                    >
                        Xem lịch sử đơn hàng
                    </LoadingLink>
                    <LoadingLink
                        to="/"
                        className="rounded-3xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Về trang chủ
                    </LoadingLink>
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            {/* ── 1. Banner Chúc Mừng ── */}
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
                <AnimatedCheck />
                <h1 className="text-2xl font-black text-slate-800 tracking-tight sm:text-3xl">
                    Đặt hàng thành công! 🎉
                </h1>
                <p className="max-w-md text-xs text-slate-500 leading-relaxed">
                    Cảm ơn bạn đã đặt món tại quán. Chúng mình đã tiếp nhận đơn và đang chuẩn bị những phần đồ uống ngon nhất dành cho bạn!
                </p>

                {/* Mã đơn hàng & Badge Trạng thái */}
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2.5">
                    {orderId && (
                        <button
                            type="button"
                            onClick={handleCopyOrderId}
                            title="Bấm để sao chép mã đơn"
                            className="group inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-50/90 px-3.5 py-1 font-mono text-xs font-extrabold text-sky-900 shadow-2xs hover:bg-sky-100 transition-colors"
                        >
                            <span>Đơn hàng #{orderId}</span>
                            <span className="opacity-60 group-hover:opacity-100 text-[10px]">📋</span>
                        </button>
                    )}

                    {/* Trạng thái đơn hàng */}
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold shadow-2xs ${statusCfg.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                        <span>{statusCfg.label}</span>
                    </span>
                </div>
            </div>

            {/* ── 2. Card Chi tiết Đơn Hàng ── */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
                {/* Header Card: Ngày đặt + Phương thức thanh toán */}
                <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-3.5 text-xs text-slate-600">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        {formattedDate && (
                            <span className="flex items-center gap-1.5">
                                <span className="text-slate-400">🕒</span>
                                <span>Thời gian: <strong className="text-slate-700">{formattedDate}</strong></span>
                            </span>
                        )}
                        <span className="flex items-center gap-1.5">
                            <span>{PAYMENT_LABEL[paymentMethod] ?? paymentMethod}</span>
                        </span>
                    </div>
                </div>

                {/* Danh sách món trong đơn hàng */}
                <div className="p-5">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                        ☕ Món đã đặt ({items.reduce((s, i) => s + (Number(i.quantity) || 1), 0)} phần)
                    </h3>

                    <div className="space-y-4">
                        {items.map((item, idx) => {
                            const hasSize = item.sizeId !== null && item.sizeId !== undefined && item.sizeName
                            const itemToppings = Array.isArray(item.toppings) ? item.toppings : []
                            // Giá backend đã tính sẵn: item.totalItemPrice
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
                                                alt={item.productName}
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
                                                {item.productName}
                                            </h4>
                                            {/* Size: Tự động ẩn nếu là null theo đặc tả */}
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

                                        {/* Danh sách Topping (mảng toppings rỗng nếu không có) */}
                                        {itemToppings.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                {itemToppings.map((top, tIdx) => (
                                                    <span
                                                        key={tIdx}
                                                        className="inline-flex items-center gap-1 rounded-2xl border border-sky-200/60 bg-sky-50/70 px-2 py-0.5 text-[11px] text-sky-900"
                                                    >
                                                        <span>+</span>
                                                        <span>{top.toppingName}</span>
                                                        {top.quantity > 1 && (
                                                            <strong className="text-sky-800 font-bold">(×{top.quantity})</strong>
                                                        )}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Thành tiền món (Backend đã tính sẵn toàn bộ) */}
                                    <div className="text-right shrink-0">
                                        <span className="text-sm font-bold text-slate-800">
                                            {formatVnd(lineTotal)}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Ghi chú đơn hàng nếu có */}
                    {note && (
                        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-sky-200 bg-sky-50/80 p-3 text-xs text-sky-900">
                            <span className="shrink-0 text-sm">📝</span>
                            <div>
                                <strong className="font-bold">Ghi chú của bạn:</strong> {note}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── 3. Chi tiết Tiền & Phụ Phí ── */}
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

                        {discountAmount > 0 && (
                            <div className="flex justify-between text-emerald-700 font-bold">
                                <span>Giảm giá Voucher:</span>
                                <span>−{formatVnd(discountAmount)}</span>
                            </div>
                        )}
                    </div>

                    {/* Tổng thanh toán cuối cùng */}
                    <div className="mt-4 flex items-baseline justify-between border-t border-slate-200/80 pt-4">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Tổng thanh toán
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                                (Đã bao gồm tiền món, size, topping, phí ship và voucher)
                            </span>
                        </div>
                        <span className="text-2xl font-black text-sky-900">
                            {formatVnd(totalAmount)}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── 4. Nút Điều Hướng ── */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <LoadingLink
                    to="/orders"
                    className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                    <span>📋</span>
                    <span>Xem lịch sử đơn hàng</span>
                </LoadingLink>

                <LoadingLink
                    to="/"
                    className="flex items-center justify-center gap-2 rounded-2xl bg-sky-800 py-3 text-xs font-bold text-white shadow-sm hover:bg-sky-900 transition-all"
                >
                    <span>☕</span>
                    <span>Tiếp tục đặt món</span>
                </LoadingLink>
            </div>
        </div>
    )
}
