import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import { getAvailableVouchers } from '../../redux/actions/user/voucherAction'
import { formatVnd } from '../../utils/helpers/format'
import {
    APPLY_TYPE_LABEL,
    DiscountType,
    formatDiscount,
    TARGET_TYPE_LABEL,
    VoucherApplyType,
    VoucherTargetType,
} from '../../utils/constants/VoucherConstants'
import LoadingLink from '../../components/loading/LoadingLink'

// ── Format Ngày ────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
    if (!dateStr) return 'Vô thời hạn'
    try {
        const d = new Date(dateStr)
        if (isNaN(d.getTime())) return dateStr
        return d.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    } catch {
        return dateStr
    }
}

// ── Filter Categories ──────────────────────────────────────────────────────────
const FILTERS = [
    { key: 'ALL', label: 'Tất cả' },
    { key: VoucherTargetType.USER, label: `🎁 ${TARGET_TYPE_LABEL[VoucherTargetType.USER]}` },
    { key: VoucherTargetType.PUBLIC, label: `🌐 ${TARGET_TYPE_LABEL[VoucherTargetType.PUBLIC]}` },
    { key: VoucherApplyType.SHIPPING, label: APPLY_TYPE_LABEL[VoucherApplyType.SHIPPING] },
    { key: VoucherApplyType.ORDER, label: APPLY_TYPE_LABEL[VoucherApplyType.ORDER] },
]

// ── Voucher Ticket Card Component ─────────────────────────────────────────────
function VoucherCard({ voucher, onCopy, onUse }) {
    const isUserExclusive = voucher.targetType === VoucherTargetType.USER || voucher.targetType === 'USER'
    const isShipping =
        voucher.applyType === VoucherApplyType.SHIPPING ||
        String(voucher.applyType || '').toUpperCase() === 'SHIPPING'
    const isPercentage =
        voucher.discountType === DiscountType.PERCENTAGE ||
        String(voucher.discountType || '').toUpperCase() === 'PERCENTAGE'

    // Format giá trị giảm lớn ở cột trái
    const discountDisplay = isPercentage
        ? `${voucher.discountValue}%`
        : voucher.discountValue >= 1000
            ? `${Math.round(voucher.discountValue / 1000)}K`
            : formatVnd(voucher.discountValue)

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md sm:flex-row">
            {/* Cột Trái: Ticket Stub / Giá trị giảm */}
            <div
                className={`relative flex flex-col items-center justify-center p-5 text-center sm:w-44 shrink-0 transition-colors ${
                    isUserExclusive
                        ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white'
                        : isShipping
                            ? 'bg-gradient-to-br from-sky-600 to-blue-700 text-white'
                            : 'bg-gradient-to-br from-amber-50 to-orange-50 text-amber-900 border-b sm:border-b-0 sm:border-r border-dashed border-stone-200'
                }`}
            >
                {/* Icon biểu trưng */}
                <span className="text-2xl mb-1 drop-shadow-xs">
                    {isShipping ? '🚚' : isUserExclusive ? '🎁' : '☕'}
                </span>

                {/* Chữ GIẢM & Số tiền */}
                <span className={`text-[10px] font-bold tracking-widest uppercase ${
                    isUserExclusive || isShipping ? 'text-white/80' : 'text-amber-800/70'
                }`}>
                    {isShipping ? 'Giảm phí ship' : 'Ưu đãi giảm'}
                </span>

                <div className="mt-0.5 flex items-baseline gap-0.5">
                    <span className="text-3xl font-black tracking-tight drop-shadow-xs">
                        {discountDisplay}
                    </span>
                </div>

                {/* Ghi chú tối đa nếu là % */}
                {isPercentage && voucher.maxDiscountAmount ? (
                    <span className={`mt-1 text-[11px] font-medium leading-tight ${
                        isUserExclusive || isShipping ? 'text-white/90' : 'text-stone-500'
                    }`}>
                        Tối đa {formatVnd(voucher.maxDiscountAmount)}
                    </span>
                ) : null}

                {/* Vết khuyết coupon tròn (notch) trang trí */}
                <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-stone-50 border border-stone-200/90 z-10" />
            </div>

            {/* Thân Phải: Thông tin chi tiết */}
            <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                    {/* Hàng 1: Mã Code + Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Mã Code */}
                            <span className="rounded-xl border border-amber-300 bg-amber-50/90 px-2.5 py-1 font-mono text-xs font-extrabold text-amber-900 tracking-wider">
                                {voucher.code}
                            </span>

                            {/* Badge Cá nhân hoặc Public */}
                            {isUserExclusive ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-2xs">
                                    <span>⭐</span>
                                    <span>{TARGET_TYPE_LABEL[VoucherTargetType.USER]}</span>
                                </span>
                            ) : (
                                <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-600">
                                    {TARGET_TYPE_LABEL[VoucherTargetType.PUBLIC]}
                                </span>
                            )}

                            {/* Loại áp dụng */}
                            <span className="rounded-full bg-amber-100/60 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                                {APPLY_TYPE_LABEL[voucher.applyType] ?? (isShipping ? '🚚 Giảm phí ship' : '🛒 Giảm tiền món')}
                            </span>
                        </div>

                        {/* Lượt dùng còn lại nếu là mã cá nhân */}
                        {isUserExclusive && voucher.remainingUsage != null && (
                            <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                                Còn {voucher.remainingUsage} lượt
                            </span>
                        )}
                    </div>

                    {/* Tên khuyến mãi */}
                    <h3 className="text-base font-bold text-stone-800 leading-snug">
                        {voucher.name || voucher.code}
                    </h3>

                    {/* Mô tả */}
                    {voucher.description && (
                        <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                            {voucher.description}
                        </p>
                    )}

                    {/* Điều kiện & HSD */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-500 border-t border-stone-100 pt-2.5">
                        <span className="inline-flex items-center gap-1">
                            <span className="text-amber-700 font-bold">●</span>
                            <span>
                                {voucher.minOrderValue > 0
                                    ? `Đơn tối thiểu ${formatVnd(voucher.minOrderValue)}`
                                    : 'Mọi giá trị đơn hàng'}
                            </span>
                        </span>

                        <span className="inline-flex items-center gap-1">
                            <span className="text-stone-400">🕒</span>
                            <span>HSD: <strong className="text-stone-700 font-semibold">{formatDate(voucher.endDate)}</strong></span>
                        </span>
                    </div>
                </div>

                {/* Hàng nút bấm Hành động */}
                <div className="mt-4 flex items-center justify-end gap-2.5 pt-2">
                    <button
                        type="button"
                        onClick={() => onCopy(voucher.code)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-bold text-stone-700 shadow-2xs hover:bg-stone-50 hover:border-stone-300 transition-colors"
                        title="Sao chép mã vào khay nhớ tạm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-stone-500">
                            <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12a1.5 1.5 0 01.439 1.061V16.5A1.5 1.5 0 0115.5 18h-7A1.5 1.5 0 017 16.5v-13z" />
                            <path d="M4.5 6A1.5 1.5 0 003 7.5v10A1.5 1.5 0 004.5 19h7a1.5 1.5 0 001.5-1.5v-1h-2v1a.5.5 0 01-.5.5h-7a.5.5 0 01-.5-.5v-10a.5.5 0 01.5-.5h1v-2h-1z" />
                        </svg>
                        <span>Sao chép</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onUse(voucher)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-800 px-4 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-amber-900 transition-colors"
                    >
                        <span>Dùng ngay</span>
                        <span>→</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Main MyVouchersPage Component ─────────────────────────────────────────────
export default function MyVouchersPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { items: vouchers, loading, error } = useSelector((s) => s.voucher)
    const [filter, setFilter] = useState('ALL')
    const [searchQuery, setSearchQuery] = useState('')

    // Fetch mã khả dụng ngay khi vào trang theo đặc tả: GET /api/Voucher/available
    useEffect(() => {
        dispatch(getAvailableVouchers())
    }, [dispatch])

    // Copy mã vào clipboard
    const handleCopy = async (code) => {
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(code)
            } else {
                const ta = document.createElement('textarea')
                ta.value = code
                document.body.appendChild(ta)
                ta.select()
                document.execCommand('copy')
                document.body.removeChild(ta)
            }
            message.success(`Đã sao chép mã "${code}" vào bộ nhớ tạm!`)
        } catch {
            message.success(`Mã: ${code}`)
        }
    }

    // Nút dùng ngay -> dẫn đến giỏ hàng để đặt món
    const handleUse = (v) => {
        handleCopy(v.code)
        navigate('/cart')
    }

    // Lọc danh sách theo Tab & Search
    const filteredVouchers = useMemo(() => {
        let list = Array.isArray(vouchers) ? vouchers : []

        // Lọc theo Category
        if (filter === 'USER') {
            list = list.filter((v) => v.targetType === VoucherTargetType.USER || v.targetType === 'USER')
        } else if (filter === 'PUBLIC') {
            list = list.filter((v) => v.targetType === VoucherTargetType.ALL || v.targetType === 'ALL' || v.targetType === 'PUBLIC')
        } else if (filter === 'SHIPPING') {
            list = list.filter((v) => String(v.applyType || '').toUpperCase() === 'SHIPPING')
        } else if (filter === 'ORDER') {
            list = list.filter((v) => String(v.applyType || '').toUpperCase() !== 'SHIPPING')
        }

        // Lọc theo tìm kiếm code / tên
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim()
            list = list.filter(
                (v) =>
                    (v.code && v.code.toLowerCase().includes(q)) ||
                    (v.name && v.name.toLowerCase().includes(q)) ||
                    (v.description && v.description.toLowerCase().includes(q))
            )
        }

        return list
    }, [vouchers, filter, searchQuery])

    // Thống kê số lượng
    const countPersonal = useMemo(
        () => (Array.isArray(vouchers) ? vouchers.filter((v) => v.targetType === 'USER').length : 0),
        [vouchers]
    )

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            {/* Header Title */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
                        <span>🎟️</span>
                        <span>Mã giảm giá khả dụng</span>
                    </h1>
                    <p className="mt-1 text-xs text-stone-500">
                        Danh sách các ưu đãi và voucher đang có hiệu lực trong tài khoản của bạn
                    </p>
                </div>

                <LoadingLink
                    to="/"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 px-3.5 py-2 text-xs font-bold text-stone-700 hover:bg-stone-200 transition-colors"
                >
                    <span>☕ Xem menu quán</span>
                </LoadingLink>
            </div>

            {/* Banner tóm tắt số lượng voucher */}
            {!loading && vouchers.length > 0 && (
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 p-4">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-800 text-lg text-white shadow-2xs">
                            🎟️
                        </span>
                        <div>
                            <p className="text-xs font-bold text-amber-950">
                                Bạn đang có <strong className="text-amber-800 text-sm">{vouchers.length}</strong> mã ưu đãi khả dụng
                            </p>
                            {countPersonal > 0 && (
                                <p className="text-[11px] text-amber-800/80">
                                    Trong đó có <strong>{countPersonal} mã độc quyền</strong> dành riêng cho ví của bạn!
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/cart')}
                        className="rounded-xl bg-amber-800 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-amber-900 transition-colors"
                    >
                        Vào giỏ hàng dùng ngay
                    </button>
                </div>
            )}

            {/* Ô tìm kiếm & Bộ lọc */}
            <div className="mb-6 space-y-3">
                {/* Search input */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm theo mã hoặc tên voucher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-2.5 pl-10 text-xs text-stone-800 placeholder-stone-400 shadow-2xs focus:border-amber-600 focus:outline-hidden"
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm">
                        🔍
                    </span>
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-600"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                    {FILTERS.map((f) => (
                        <button
                            key={f.key}
                            type="button"
                            onClick={() => setFilter(f.key)}
                            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shadow-2xs ${
                                filter === f.key
                                    ? 'bg-amber-800 text-white shadow-xs'
                                    : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Skeleton Loading */}
            {loading && (
                <div className="flex flex-col gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-36 animate-pulse rounded-3xl bg-stone-100 border border-stone-200" />
                    ))}
                </div>
            )}

            {/* Lỗi tải */}
            {!loading && error && (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
                    <p className="text-sm font-semibold text-red-600">{error}</p>
                    <button
                        type="button"
                        onClick={() => dispatch(getAvailableVouchers())}
                        className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Danh sách rỗng */}
            {!loading && !error && filteredVouchers.length === 0 && (
                <div className="flex flex-col items-center gap-3 rounded-3xl border border-stone-200 bg-white py-16 text-center shadow-xs">
                    <span className="text-5xl">🎟️</span>
                    <h3 className="text-base font-bold text-stone-800">
                        {searchQuery ? 'Không tìm thấy voucher phù hợp' : 'Hiện chưa có mã giảm giá nào'}
                    </h3>
                    <p className="text-xs text-stone-400 max-w-xs">
                        {searchQuery
                            ? 'Vui lòng thử tìm với từ khóa hoặc mã khác.'
                            : 'Các mã khuyến mãi và ưu đãi độc quyền dành riêng cho bạn sẽ hiển thị tại đây.'}
                    </p>
                    <LoadingLink
                        to="/"
                        className="mt-2 inline-flex items-center gap-2 rounded-xl bg-amber-800 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-900 transition-colors"
                    >
                        <span>Khám phá thực đơn</span>
                    </LoadingLink>
                </div>
            )}

            {/* Danh sách Voucher khả dụng */}
            {!loading && !error && filteredVouchers.length > 0 && (
                <div className="flex flex-col gap-4">
                    {filteredVouchers.map((v) => (
                        <VoucherCard
                            key={v.voucherId ?? v.code}
                            voucher={v}
                            onCopy={handleCopy}
                            onUse={handleUse}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
