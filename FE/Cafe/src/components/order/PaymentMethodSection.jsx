import { formatVnd } from '../../utils/helpers/format'

/**
 * PaymentMethodSection Component
 * Lựa chọn phương thức thanh toán (COD / VNPAY), ô nhập / chọn voucher và ghi chú đơn hàng.
 */
export default function PaymentMethodSection({
    paymentMethod,
    setPaymentMethod,
    voucherInput,
    onVoucherInputChange,
    onApplyManual,
    onClearVoucher,
    onOpenVoucherModal,
    voucherChecking,
    voucherResult,
    note,
    setNote,
}) {
    return (
        <section className="rounded-2xl bg-white p-5 shadow-xs">
            <h2 className="mb-4 font-semibold text-stone-800">💳 Phương thức thanh toán & Ưu đãi</h2>

            {/* Phương thức thanh toán */}
            <div className="mb-4 flex gap-2.5">
                {['COD', 'VNPAY'].map((method) => (
                    <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-all cursor-pointer ${
                            paymentMethod === method
                                ? 'border-amber-700 bg-amber-50 text-amber-900 shadow-xs'
                                : 'border-stone-100 text-stone-500 hover:border-stone-200 hover:bg-stone-50/50'
                        }`}
                    >
                        {method === 'COD' ? '💵 Tiền mặt (COD)' : '🏦 VNPAY'}
                    </button>
                ))}
            </div>

            {/* Voucher */}
            <div className="mb-4">
                <label className="mb-1.5 block text-xs font-semibold text-stone-700">
                    🎟️ Mã giảm giá / Voucher
                </label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={voucherInput}
                            onChange={onVoucherInputChange}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    onApplyManual()
                                }
                            }}
                            placeholder="Nhập mã giảm giá..."
                            className={`w-full rounded-xl border px-3 py-2 pr-8 font-mono text-sm uppercase outline-none transition-colors focus:ring-1 ${
                                voucherResult
                                    ? voucherResult.isValid
                                        ? 'border-green-500 bg-green-50 text-green-900 focus:ring-green-200'
                                        : 'border-red-400 bg-red-50 text-red-900 focus:ring-red-200'
                                    : 'border-stone-200 focus:border-amber-500 focus:ring-amber-200'
                            }`}
                        />
                        {voucherInput && (
                            <button
                                type="button"
                                onClick={onClearVoucher}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-600"
                                title="Xoá mã"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onApplyManual}
                        disabled={voucherChecking || !voucherInput.trim()}
                        className="shrink-0 rounded-xl bg-amber-800 px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-40 hover:bg-amber-900 cursor-pointer disabled:cursor-not-allowed"
                    >
                        {voucherChecking ? 'Kiểm tra...' : 'Áp dụng'}
                    </button>

                    <button
                        type="button"
                        onClick={onOpenVoucherModal}
                        className="shrink-0 rounded-xl border border-amber-700 px-3.5 py-2 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-50 cursor-pointer"
                    >
                        Chọn mã
                    </button>
                </div>

                {/* Phản hồi trạng thái voucher */}
                {voucherChecking && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-amber-700 animate-pulse">
                        ⏳ Đang kiểm tra mã giảm giá...
                    </p>
                )}

                {voucherResult && !voucherChecking && (
                    <div
                        className={`mt-2 flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium ${
                            voucherResult.isValid
                                ? 'border border-green-200 bg-green-50 text-green-800'
                                : 'border border-red-200 bg-red-50 text-red-700'
                        }`}
                    >
                        <div className="flex items-center gap-1.5">
                            <span>{voucherResult.isValid ? '✅' : '❌'}</span>
                            <span>{voucherResult.message}</span>
                        </div>
                        {voucherResult.isValid && voucherResult.discountAmount > 0 && (
                            <span className="font-bold text-green-700">
                                −{formatVnd(voucherResult.discountAmount)}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Ghi chú */}
            <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700">📝 Ghi chú đơn hàng</label>
                <textarea
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
                    rows={2}
                    placeholder="Pha ít đá, ít đường, giao giờ hành chính..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </div>
        </section>
    )
}
