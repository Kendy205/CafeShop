import { useState, useMemo } from 'react'
import { formatVnd } from '../../utils/helpers/format'
import { APPLY_TYPE_LABEL } from '../../utils/constants/VoucherConstants'

/**
 * VoucherModal Component
 * Modal cho phép khách hàng xem và chọn mã khuyến mãi áp dụng cho đơn hàng.
 */
export default function VoucherModal({ vouchers, onSelect, onClose }) {
    const [search, setSearch] = useState('')
    const list = Array.isArray(vouchers) ? vouchers : []

    const filteredVouchers = useMemo(() => {
        if (!search.trim()) return list
        const q = search.trim().toLowerCase()
        return list.filter((v) => {
            const code = (v.voucherCode || v.code || '').toLowerCase()
            const desc = (v.description || v.name || '').toLowerCase()
            return code.includes(q) || desc.includes(q)
        })
    }, [list, search])

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center p-0 sm:p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-stone-800">🎟️ Chọn mã giảm giá</h3>
                        <p className="text-xs text-stone-500">Áp dụng một mã ưu đãi cho đơn hàng này</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-800"
                    >
                        ✕
                    </button>
                </div>

                {/* Ô tìm kiếm mã nhanh nếu có nhiều voucher */}
                {list.length > 4 && (
                    <div className="mb-3">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm kiếm mã hoặc ưu đãi..."
                            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs outline-none focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-200"
                        />
                    </div>
                )}

                {/* Danh sách voucher */}
                {filteredVouchers.length === 0 ? (
                    <div className="py-8 text-center text-sm text-stone-400">
                        {list.length === 0
                            ? 'Hiện không có mã giảm giá khả dụng.'
                            : 'Không tìm thấy mã giảm giá phù hợp.'}
                    </div>
                ) : (
                    <ul className="max-h-80 space-y-2.5 overflow-y-auto pr-1">
                        {filteredVouchers.map((v) => {
                            const code = v.voucherCode || v.code || ''
                            const desc = v.description || v.name || ''
                            const minOrder = Number(v.minOrderAmount || v.minOrder || v.minOrderValue || 0)
                            const isPercent = String(v.discountType || '').toUpperCase() === 'PERCENTAGE'
                            const discountVal = Number(v.discountValue || 0)
                            const discountBadge = isPercent ? `-${discountVal}%` : `-${formatVnd(discountVal)}`
                            const applyLabel =
                                APPLY_TYPE_LABEL[v.applyType] ||
                                (String(v.applyType || '').toUpperCase() === 'SHIPPING'
                                    ? '🚚 Giảm phí ship'
                                    : '🛒 Giảm tiền món')

                            return (
                                <li
                                    key={v.voucherId || code}
                                    onClick={() => {
                                        onSelect(code)
                                        onClose()
                                    }}
                                    className="group flex cursor-pointer items-center justify-between rounded-2xl border border-stone-200/90 bg-white p-3.5 transition-all hover:border-amber-500 hover:bg-amber-50/60 hover:shadow-sm"
                                >
                                    <div className="flex-1 pr-3">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span className="rounded-lg bg-amber-100 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-900">
                                                {code}
                                            </span>
                                            <span className="rounded-full bg-amber-800 px-2 py-0.5 text-[10px] font-semibold text-white">
                                                {discountBadge}
                                            </span>
                                            {v.applyType && (
                                                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] text-stone-600">
                                                    {applyLabel}
                                                </span>
                                            )}
                                        </div>
                                        {desc && <p className="mt-1.5 text-xs text-stone-600 leading-snug">{desc}</p>}
                                        {minOrder > 0 && (
                                            <p className="mt-1 text-[11px] font-medium text-stone-400">
                                                Đơn tối thiểu {formatVnd(minOrder)}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        className="shrink-0 rounded-xl bg-amber-800 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all group-hover:bg-amber-900"
                                    >
                                        Dùng mã
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                )}

                {/* Nút hủy bỏ áp dụng mã */}
                <button
                    type="button"
                    onClick={() => {
                        onSelect('')
                        onClose()
                    }}
                    className="mt-3.5 w-full rounded-xl border border-stone-200 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50"
                >
                    Không dùng mã
                </button>
            </div>
        </div>
    )
}
