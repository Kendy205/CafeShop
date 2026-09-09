import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMyVouchers, claimVoucher, getAvailableVouchers } from '../../redux/actions/user/voucherAction'
import { clearVoucherMessages } from '../../redux/slices/user/voucherSlice'
import { formatVnd } from '../../utils/helpers/format'
import {
    VoucherTargetType,
    APPLY_TYPE_LABEL,
    formatDiscount,
} from '../../utils/constants/VoucherConstants'

// ── Tab constants ─────────────────────────────────────────────────────────────
const TAB_MY = 'my'
const TAB_AVAIL = 'available'

function formatDate(dateStr) {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    })
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3500)
        return () => clearTimeout(t)
    }, [onClose])

    return (
        <div
            className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-5 py-3 text-sm font-medium shadow-xl transition-all ${type === 'error'
                    ? 'bg-red-600 text-white'
                    : 'bg-green-600 text-white'
                }`}
        >
            {type === 'error' ? '❌' : '✅'} {message}
        </div>
    )
}

// ── Voucher Card (Ví cá nhân) ─────────────────────────────────────────────────
function MyVoucherCard({ v }) {
    const expired = v.endDate && new Date(v.endDate) < new Date()
    const usedUp = v.remainingUsage != null && v.remainingUsage <= 0

    const statusLabel = expired ? 'Hết hạn'
        : usedUp ? 'Đã dùng hết'
            : !v.isUsable ? 'Không khả dụng'
                : null

    return (
        <div className={`rounded-2xl border-2 border-dashed p-4 transition-opacity ${statusLabel ? 'border-stone-200 opacity-60' : 'border-amber-300 bg-amber-50'
            }`}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-bold text-amber-800">{v.code}</span>
                        <span className="rounded-full bg-amber-800 px-2 py-0.5 text-[11px] font-semibold text-white">
                            {formatDiscount(v.discountType, v.discountValue, formatVnd)}
                        </span>
                        {v.applyType && (
                            <span className="text-[11px] text-stone-500">
                                {APPLY_TYPE_LABEL[v.applyType] ?? v.applyType}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">{v.description}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-stone-400">
                        {v.minOrderValue > 0 && <span>Đơn tối thiểu {formatVnd(v.minOrderValue)}</span>}
                        {v.endDate && <span>HSD: {formatDate(v.endDate)}</span>}
                        {v.remainingUsage != null && (
                            <span>Còn {v.remainingUsage}/{v.usageLimitPerUser} lượt</span>
                        )}
                    </div>
                </div>
                {statusLabel ? (
                    <span className="shrink-0 rounded-full bg-stone-200 px-2.5 py-1 text-[11px] font-medium text-stone-500">
                        {statusLabel}
                    </span>
                ) : (
                    <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-medium text-green-700">
                        Khả dụng
                    </span>
                )}
            </div>
        </div>
    )
}

// ── Available Voucher Card (Public) ───────────────────────────────────────────
function AvailableVoucherCard({ v, onClaim, claiming }) {
    const code = v.code ?? v.voucherCode

    return (
        <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-bold text-amber-800">{code}</span>
                        <span className="rounded-full bg-amber-800 px-2 py-0.5 text-[11px] font-semibold text-white">
                            {formatDiscount(v.discountType, v.discountValue, formatVnd)}
                        </span>
                        {v.targetType === VoucherTargetType.USER && (
                            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-medium text-purple-700">
                                Tặng riêng
                            </span>
                        )}
                        {v.applyType && (
                            <span className="text-[11px] text-stone-500">
                                {APPLY_TYPE_LABEL[v.applyType] ?? v.applyType}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">{v.description}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-stone-400">
                        {v.minOrderValue > 0 && <span>Đơn tối thiểu {formatVnd(v.minOrderValue)}</span>}
                        {v.endDate && <span>HSD: {formatDate(v.endDate)}</span>}
                    </div>
                </div>
                {/* Chỉ hiện nút Lưu với mã Public */}
                {v.targetType === VoucherTargetType.PUBLIC && (
                    <button
                        type="button"
                        disabled={claiming}
                        onClick={() => onClaim(code)}
                        className="shrink-0 rounded-xl border-2 border-amber-700 px-3 py-1.5 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-50 disabled:opacity-50"
                    >
                        {claiming ? '...' : '💾 Lưu'}
                    </button>
                )}
            </div>
        </div>
    )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MyVouchersPage() {
    const dispatch = useDispatch()
    const [tab, setTab] = useState(TAB_MY)

    const {
        myVouchers, myVouchersLoading, myVouchersError,
        items: availableVouchers, loading: availLoading, error: availError,
        claiming, claimSuccess, claimError,
    } = useSelector((s) => s.voucher)

    const [toast, setToast] = useState(null) // { message, type }

    // Fetch theo tab
    useEffect(() => {
        if (tab === TAB_MY) dispatch(getMyVouchers())
        if (tab === TAB_AVAIL) dispatch(getAvailableVouchers())
    }, [tab, dispatch])

    // Hiện toast khi claim thành công / thất bại
    useEffect(() => {
        if (claimSuccess) {
            setToast({ message: claimSuccess, type: 'success' })
            dispatch(clearVoucherMessages())
            // Refresh ví sau claim thành công
            dispatch(getMyVouchers())
        }
    }, [claimSuccess, dispatch])

    useEffect(() => {
        if (claimError) {
            setToast({ message: claimError, type: 'error' })
            dispatch(clearVoucherMessages())
        }
    }, [claimError, dispatch])

    const handleClaim = useCallback(
        (code) => dispatch(claimVoucher(code)),
        [dispatch]
    )

    const isLoading = tab === TAB_MY ? myVouchersLoading : availLoading
    const pageError = tab === TAB_MY ? myVouchersError : availError
    const list = tab === TAB_MY ? myVouchers : availableVouchers

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            {/* Toast */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Header */}
            <h1 className="mb-6 text-2xl font-bold text-stone-800">🎟️ Ví Voucher</h1>

            {/* Tabs */}
            <div className="mb-5 flex gap-2">
                <button
                    type="button"
                    onClick={() => setTab(TAB_MY)}
                    className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${tab === TAB_MY
                            ? 'bg-amber-800 text-white shadow-sm'
                            : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                >
                    📂 Ví của tôi
                    {myVouchers.length > 0 && (
                        <span className="ml-1.5 rounded-full bg-white/30 px-1.5 text-xs font-bold">
                            {myVouchers.filter((v) => v.isUsable).length}
                        </span>
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => setTab(TAB_AVAIL)}
                    className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${tab === TAB_AVAIL
                            ? 'bg-amber-800 text-white shadow-sm'
                            : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                >
                    🏷️ Khuyến mãi
                </button>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-100" />
                    ))}
                </div>
            )}

            {/* Error */}
            {!isLoading && pageError && (
                <div className="rounded-2xl bg-red-50 p-6 text-center">
                    <p className="text-sm text-red-600">{pageError}</p>
                    <button
                        type="button"
                        onClick={() =>
                            tab === TAB_MY
                                ? dispatch(getMyVouchers())
                                : dispatch(getAvailableVouchers())
                        }
                        className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Empty */}
            {!isLoading && !pageError && list.length === 0 && (
                <div className="flex flex-col items-center gap-3 rounded-2xl bg-white py-14 text-center shadow-sm">
                    <span className="text-5xl">🎟️</span>
                    <p className="text-stone-500">
                        {tab === TAB_MY
                            ? 'Ví của bạn chưa có voucher nào.'
                            : 'Hiện không có khuyến mãi nào.'}
                    </p>
                    {tab === TAB_MY && (
                        <button
                            type="button"
                            onClick={() => setTab(TAB_AVAIL)}
                            className="rounded-xl border border-amber-700 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50"
                        >
                            Xem khuyến mãi để lưu mã
                        </button>
                    )}
                </div>
            )}

            {/* List */}
            {!isLoading && !pageError && list.length > 0 && (
                <div className="flex flex-col gap-3">
                    {tab === TAB_MY
                        ? list.map((v) => <MyVoucherCard key={v.id ?? v.voucherId} v={v} />)
                        : list.map((v) => (
                            <AvailableVoucherCard
                                key={v.voucherId ?? v.code}
                                v={v}
                                claiming={claiming}
                                onClaim={handleClaim}
                            />
                        ))
                    }
                </div>
            )}
        </div>
    )
}
