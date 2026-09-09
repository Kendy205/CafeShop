import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import LoadingLink from '../../components/loading/LoadingLink'
import { formatVnd } from '../../utils/helpers/format'

// ── Animated checkmark ──────────────────────────────────────────────────────
function AnimatedCheck() {
    return (
        <svg
            viewBox="0 0 52 52"
            className="h-16 w-16 drop-shadow-lg"
            style={{ animation: 'pop .4s cubic-bezier(.175,.885,.32,1.275) both' }}
        >
            <circle cx="26" cy="26" r="25" fill="#78350f" />
            <path
                d="M14 27l8 8 16-16"
                fill="none"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ animation: 'draw .5s .3s ease forwards', strokeDasharray: 36, strokeDashoffset: 36 }}
            />
            <style>{`
                @keyframes pop   { from { transform:scale(.4); opacity:0 } to { transform:scale(1); opacity:1 } }
                @keyframes draw  { to   { stroke-dashoffset: 0 } }
            `}</style>
        </svg>
    )
}

// ── Row helper ──────────────────────────────────────────────────────────────
function Row({ label, value, highlight }) {
    return (
        <div className="flex justify-between gap-4 py-1.5 text-sm">
            <span className="text-stone-500">{label}</span>
            <span className={`text-right font-medium ${highlight ? 'text-amber-800' : 'text-stone-800'}`}>
                {value}
            </span>
        </div>
    )
}

// ── Payment badge ───────────────────────────────────────────────────────────
const PAYMENT_LABEL = { COD: '💵 Tiền mặt (COD)', VNPAY: '🏦 VNPAY' }

// ── Main ────────────────────────────────────────────────────────────────────
export default function OrderSuccessPage() {
    const navigate = useNavigate()
    const order = useSelector((s) => s.order.lastOrder)
    const timerRef = useRef(null)

    // Nếu vào thẳng URL (không có lastOrder) → redirect về home sau 3s
    useEffect(() => {
        if (!order) {
            timerRef.current = setTimeout(() => navigate('/'), 3000)
        }
        return () => clearTimeout(timerRef.current)
    }, [order, navigate])

    // ── Derived values ──────────────────────────────────────────────────────
    const orderId        = order?.orderId ?? order?.id
    const address        = order?.deliveryAddress ?? order?.fullAddress ?? order?.newAddressString ?? '—'
    const recipientName  = order?.recipientName ?? order?.recipient ?? '—'
    const phone          = order?.phone ?? '—'
    const paymentMethod  = order?.paymentMethod ?? 'COD'
    const note           = order?.note
    const total          = order?.totalAmount ?? order?.total
    const shippingFee    = order?.shippingFee
    const discountAmount = order?.discountAmount
    const subtotal       = order?.subtotal ?? order?.itemsTotal

    // ── No-order fallback ───────────────────────────────────────────────────
    if (!order) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
                <p className="text-stone-400">Đang chuyển hướng về trang chủ...</p>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-lg px-4 py-8">
            {/* ── Header ── */}
            <div className="mb-6 flex flex-col items-center gap-3 text-center">
                <AnimatedCheck />
                <h1 className="text-2xl font-bold text-stone-800">Đặt hàng thành công! 🎉</h1>
                <p className="text-sm text-stone-500">
                    Cảm ơn bạn đã tin tưởng đặt hàng. Đơn của bạn đang được chuẩn bị.
                </p>
                {orderId && (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-1 font-mono text-sm font-semibold text-amber-800">
                        # {orderId}
                    </span>
                )}
            </div>

            {/* ── Order info card ── */}
            <div className="rounded-2xl border border-stone-100 bg-white shadow-sm">
                {/* Giao hàng */}
                <div className="border-b border-stone-50 p-5">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                        📦 Thông tin giao hàng
                    </p>
                    <Row label="Người nhận" value={recipientName} />
                    <Row label="Số điện thoại" value={phone} />
                    <Row label="Địa chỉ" value={address} />
                    {note && <Row label="Ghi chú" value={note} />}
                </div>

                {/* Thanh toán */}
                <div className="border-b border-stone-50 p-5">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                        💳 Thanh toán
                    </p>
                    <Row
                        label="Phương thức"
                        value={PAYMENT_LABEL[paymentMethod] ?? paymentMethod}
                    />
                    {subtotal != null && (
                        <Row label="Tạm tính" value={formatVnd(subtotal)} />
                    )}
                    {shippingFee != null && (
                        <Row label="Phí vận chuyển" value={formatVnd(shippingFee)} />
                    )}
                    {discountAmount != null && discountAmount > 0 && (
                        <Row label="Giảm giá" value={`−${formatVnd(discountAmount)}`} />
                    )}
                    {total != null && (
                        <div className="mt-2 flex justify-between border-t border-stone-100 pt-2">
                            <span className="font-semibold text-stone-700">Tổng cộng</span>
                            <span className="text-base font-bold text-amber-800">{formatVnd(total)}</span>
                        </div>
                    )}
                </div>

                {/* Status */}
                <div className="flex items-center gap-3 px-5 py-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-base">
                        ☕
                    </span>
                    <div>
                        <p className="text-sm font-medium text-stone-700">Đang chuẩn bị đơn hàng</p>
                        <p className="text-xs text-stone-400">Chúng mình sẽ pha chế và giao đến bạn sớm nhất!</p>
                    </div>
                </div>
            </div>

            {/* ── Navigation buttons ── */}
            <div className="mt-6 grid grid-cols-2 gap-3">
                <LoadingLink
                    to="/orders"
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-amber-800 py-3 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-50"
                >
                    📋 Xem đơn hàng
                </LoadingLink>
                <LoadingLink
                    to="/"
                    className="flex items-center justify-center gap-2 rounded-xl bg-amber-800 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-900"
                >
                    ☕ Đặt thêm món
                </LoadingLink>
            </div>

            <LoadingLink
                to="/cart"
                className="mt-3 flex items-center justify-center gap-1 text-sm text-stone-400 hover:text-stone-600"
            >
                🛒 Về giỏ hàng
            </LoadingLink>
        </div>
    )
}
