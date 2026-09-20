import { calcLineTotal, formatVnd, itemDisplayName, toppingLabel } from '../../utils/helpers/format'
import {
    ShoppingCartOutlined,
    SafetyCertificateOutlined,
    ThunderboltOutlined,
    TagOutlined,
    CheckCircleOutlined,
    LoadingOutlined,
} from '@ant-design/icons'

/**
 * OrderSummarySidebar Component
 * Giao diện tóm tắt đơn hàng hiện đại, sang trọng và đồng nhất.
 * Quản lý tính toán: Tạm tính, Phí vận chuyển (kèm khoảng cách km), Giảm giá voucher và Tổng cộng.
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
    const totalQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)
    const isFreeship = currentDistanceKm > 0 && shippingFee === 0 && !feeCalculating

    return (
        <aside className="sticky top-24 h-fit rounded-3xl border border-slate-200/90 bg-white p-5 shadow-lg shadow-slate-200/40 backdrop-blur-sm transition-all">
            {/* ── Tiêu đề & Đếm số lượng món ── */}
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-3xl bg-sky-100/80 text-base text-sky-900 shadow-2xs">
                        <ShoppingCartOutlined />
                    </span>
                    <h2 className="font-bold text-slate-800 text-base">Đơn hàng của bạn</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    {totalQuantity} món
                </span>
            </div>

            {/* ── Danh sách món ăn/đồ uống ── */}
            <ul className="max-h-72 divide-y divide-slate-100/80 overflow-y-auto pr-1 text-sm scrollbar-thin scrollbar-thumb-slate-200">
                {items.map((i, idx) => (
                    <li key={i.cartItemId || idx} className="py-3 first:pt-0 last:pb-1">
                        <div className="flex items-start justify-between gap-2.5">
                            <div className="flex-1">
                                <p className="font-semibold text-slate-800 text-sm leading-snug">
                                    {itemDisplayName(i)}
                                    <span className="ml-1.5 inline-block rounded-md bg-sky-50 px-1.5 py-0.2 text-xs font-bold text-sky-800">
                                        ×{i.quantity}
                                    </span>
                                </p>
                                <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                                    Size: <span className="font-semibold text-slate-700">{i.sizeName || 'Tiêu chuẩn'}</span>
                                </p>
                            </div>
                            <span className="shrink-0 font-bold text-slate-800 text-sm">
                                {formatVnd(i.totalItemPrice ?? calcLineTotal(i))}
                            </span>
                        </div>

                        {i.toppings?.length > 0 && (
                            <ul className="mt-1 space-y-0.5 rounded-2xl bg-slate-50/80 p-1.5 text-[11px] text-slate-500 border border-slate-100">
                                {i.toppings.map((t, tIdx) => (
                                    <li key={tIdx} className="flex items-center gap-1">
                                        <span className="text-sky-700">+</span>
                                        <span>{toppingLabel(t)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>

            {/* ── Khối chi tiết thanh toán ── */}
            <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-3.5 text-sm">
                {/* Tạm tính */}
                <div className="flex items-center justify-between text-slate-600">
                    <span>Tạm tính tiền hàng</span>
                    <span className="font-semibold text-slate-800">{formatVnd(subtotal)}</span>
                </div>

                {/* Phí vận chuyển */}
                <div className="flex items-center justify-between text-slate-600">
                    <div className="flex items-center gap-1.5">
                        <span>Phí vận chuyển</span>
                        {currentDistanceKm > 0 && (
                            <span className="inline-flex items-center gap-0.5 rounded-md bg-sky-50 border border-sky-200/60 px-1.5 py-0.5 text-[10px] font-bold text-sky-800" title="Khoảng cách tính phí">
                                <span>📍</span>
                                <span>{currentDistanceKm} km</span>
                            </span>
                        )}
                    </div>

                    <div>
                        {feeCalculating ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-700">
                                <LoadingOutlined className="animate-spin text-xs" />
                                <span>Đang tính...</span>
                            </span>
                        ) : currentDistanceKm <= 0 ? (
                            <span className="text-xs text-slate-400 italic">Chọn địa chỉ</span>
                        ) : isFreeship ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                                <span>🎉</span>
                                <span>Miễn phí</span>
                            </span>
                        ) : (
                            <span className="font-bold text-slate-800">{formatVnd(shippingFee)}</span>
                        )}
                    </div>
                </div>

                {/* Giảm giá voucher nếu có */}
                {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-emerald-700 font-medium">
                        <span className="flex items-center gap-1">
                            <TagOutlined className="text-xs" />
                            <span>Voucher giảm giá</span>
                        </span>
                        <span className="font-bold">−{formatVnd(discountAmount)}</span>
                    </div>
                )}

                {/* Thông báo Freeship nếu đạt */}
                {isFreeship && (
                    <div className="rounded-3xl bg-emerald-50/90 border border-emerald-200/80 p-2 text-center text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1.5">
                        <CheckCircleOutlined className="text-emerald-600" />
                        <span>Đơn hàng được ưu đãi Miễn phí vận chuyển!</span>
                    </div>
                )}

                {/* Tổng thanh toán */}
                <div className="mt-3 rounded-2xl bg-gradient-to-br from-sky-50/90 via-sky-50/60 to-orange-50/40 p-4 border border-sky-200/80 shadow-2xs">
                    <div className="flex items-baseline justify-between">
                        <div>
                            <span className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                                Tổng cộng thanh toán
                            </span>
                            <span className="text-[11px] text-slate-400">Đã bao gồm VAT & phí ship</span>
                        </div>
                        <span className="text-2xl font-black text-sky-900 tracking-tight">
                            {formatVnd(finalTotal)}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Nút Đặt hàng ── */}
            <button
                type="submit"
                disabled={submitting || !canSubmit}
                className={`mt-4 w-full rounded-2xl py-3.5 text-base font-extrabold shadow-md transition-all flex items-center justify-center gap-2 ${
                    canSubmit && !submitting
                        ? 'bg-gradient-to-r from-sky-800 via-sky-850 to-sky-900 hover:from-sky-900 hover:to-sky-950 text-white shadow-sky-900/25 hover:shadow-lg active:scale-[0.99] cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
            >
                {submitting ? (
                    <>
                        <LoadingOutlined className="animate-spin text-lg" />
                        <span>Đang xử lý đặt hàng...</span>
                    </>
                ) : (
                    <>
                        <span>✅</span>
                        <span>Đặt hàng ngay</span>
                    </>
                )}
            </button>

            {/* ── Thông báo lỗi hoặc hướng dẫn ── */}
            {shippingError && (
                <div className="mt-2.5 rounded-3xl bg-red-50 border border-red-200 p-2.5 text-center text-xs font-semibold text-red-700">
                    <span>⛔ {shippingError}</span>
                </div>
            )}

            {!canSubmit && !submitting && !shippingError && (
                <p className="mt-2.5 text-center text-xs font-medium text-slate-400">
                    {addressTab === 'map' && !mapValid
                        ? 'Vui lòng điền đủ tên, SĐT và chọn địa chỉ trên bản đồ'
                        : 'Vui lòng chọn địa chỉ giao hàng để tiếp tục'}
                </p>
            )}

            {/* ── Reassurance badges ── */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] font-medium text-slate-400">
                <span className="flex items-center gap-1">
                    <SafetyCertificateOutlined className="text-sky-700" /> An toàn & Bảo mật
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                    <ThunderboltOutlined className="text-sky-700" /> Giao hàng nhanh
                </span>
            </div>
        </aside>
    )
}
