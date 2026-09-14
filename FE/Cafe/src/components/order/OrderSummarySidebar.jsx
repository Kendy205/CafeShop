import { calcLineTotal, formatVnd, itemDisplayName, toppingLabel } from '../../utils/helpers/format'

/**
 * OrderSummarySidebar Component
 * Hiển thị tóm tắt danh sách món ăn/đồ uống, chi tiết tiền thanh toán (tạm tính, phí ship, voucher)
 * và nút [ Đặt hàng ] với kiểm soát điều kiện hợp lệ.
 */
export default function OrderSummarySidebar({
    items = [],
    subtotal = 0,
    currentDistanceKm = 0,
    shippingFee = 0,
    feeCalculating = false,
    discountAmount = 0,
    submitting = false,
    canSubmit = false,
    shippingError = '',
    addressTab = 'saved',
    mapValid = false,
}) {
    const finalTotal = Math.max(0, subtotal + shippingFee - discountAmount)

    return (
        <aside className="h-fit rounded-2xl bg-white p-5 shadow-xs">
            <h2 className="mb-3 font-semibold text-stone-800">🛒 Chi tiết đơn hàng</h2>

            {/* Danh sách các món */}
            <ul className="max-h-80 divide-y divide-stone-100 overflow-y-auto pr-1 text-sm">
                {items.map((i, idx) => (
                    <li key={i.cartItemId || idx} className="py-2.5">
                        <div className="flex justify-between gap-2">
                            <span className="font-medium text-stone-800">
                                {itemDisplayName(i)}{' '}
                                <span className="font-normal text-stone-400">×{i.quantity}</span>
                            </span>
                            <span className="shrink-0 font-semibold text-stone-700">
                                {formatVnd(i.totalItemPrice ?? calcLineTotal(i))}
                            </span>
                        </div>
                        <p className="text-xs text-stone-400">
                            Size: {i.sizeName || 'Mặc định'}
                        </p>
                        {i.toppings?.length > 0 && (
                            <ul className="mt-0.5 space-y-0.5 text-xs text-stone-400">
                                {i.toppings.map((t, tIdx) => (
                                    <li key={tIdx}>+ {toppingLabel(t)}</li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>

            {/* Khối tính tiền */}
            <div className="mt-3 space-y-2 border-t border-stone-100 pt-3 text-sm">
                <div className="flex justify-between text-stone-600">
                    <span>Tạm tính</span>
                    <span className="font-medium text-stone-800">{formatVnd(subtotal)}</span>
                </div>

                {/* Phí vận chuyển (Tính từ Mapbox + Backend API) */}
                {currentDistanceKm > 0 && (
                    <div className="flex justify-between text-stone-600">
                        <span className="flex items-center gap-1.5">
                            Phí vận chuyển
                            {feeCalculating ? (
                                <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-700 animate-pulse">
                                    ⏳ Đang tính...
                                </span>
                            ) : (
                                <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-500">
                                    {currentDistanceKm} km
                                </span>
                            )}
                        </span>
                        <span
                            className={`font-semibold ${
                                shippingFee === 0 ? 'text-green-600' : 'text-stone-800'
                            }`}
                        >
                            {feeCalculating
                                ? '...'
                                : shippingFee === 0
                                ? '🎉 Miễn phí (Freeship)'
                                : formatVnd(shippingFee)}
                        </span>
                    </div>
                )}

                {/* Giảm giá voucher */}
                {discountAmount > 0 && (
                    <div className="flex justify-between font-medium text-green-700">
                        <span>Mã giảm giá</span>
                        <span>−{formatVnd(discountAmount)}</span>
                    </div>
                )}

                {/* Tổng cộng */}
                <div className="flex justify-between border-t border-stone-100 pt-2.5 text-base font-bold text-stone-900">
                    <span>Tổng cộng</span>
                    <span className="text-lg text-amber-900">{formatVnd(finalTotal)}</span>
                </div>

                {/* Badge thông báo Freeship */}
                {currentDistanceKm > 0 && shippingFee === 0 && !feeCalculating && (
                    <p className="text-right text-[11px] font-medium text-green-600">
                        ✨ Đơn hàng của bạn đã được ưu đãi Freeship!
                    </p>
                )}
            </div>

            {/* Nút Submit [ Đặt hàng ] */}
            <button
                type="submit"
                disabled={submitting || !canSubmit}
                className={`mt-4 w-full rounded-xl py-3.5 font-bold shadow-sm transition-all ${
                    canSubmit && !submitting
                        ? 'bg-amber-800 text-white hover:bg-amber-900 active:scale-[0.99] cursor-pointer shadow-amber-800/20'
                        : 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-60 shadow-none'
                }`}
            >
                {submitting ? '⏳ Đang đặt...' : '✅ Đặt hàng'}
            </button>

            {/* Thông báo lý do không thể đặt hàng */}
            {shippingError && (
                <p className="mt-2.5 text-center text-xs font-semibold text-red-600">
                    ⛔ Không thể đặt hàng do địa chỉ vượt quá phạm vi giao
                </p>
            )}

            {addressTab === 'map' && !mapValid && (
                <p className="mt-2 text-center text-xs text-stone-400">
                    Vui lòng điền đủ tên, SĐT và chọn địa chỉ trên bản đồ
                </p>
            )}
        </aside>
    )
}
