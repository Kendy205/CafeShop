import LoadingLink from '../loading/LoadingLink'
import { calcLineTotal, formatVnd, itemDisplayName } from '../../utils/helpers/format'

export default function CartItem({ item, submitting, onUpdateQty, onRemoveItem }) {
    const isExceeded = Boolean(
        item.isExceedStock ||
        (item.stockQuantity !== undefined && item.stockQuantity !== null && item.quantity > item.stockQuantity)
    )
    const stock = item.stockQuantity !== undefined && item.stockQuantity !== null ? Number(item.stockQuantity) : null
    const isOutOfStock = stock !== null && stock <= 0
    const canIncrease = stock === null || item.quantity < stock

    return (
        <div
            className={`relative overflow-hidden rounded-3xl border bg-white p-4 transition-all duration-200 shadow-xs ${
                isExceeded
                    ? 'border-red-400 bg-red-50/15 ring-2 ring-red-200'
                    : 'border-slate-200 hover:border-sky-400'
            }`}
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {/* Hình ảnh món */}
                <LoadingLink to={`/product/${item.productId}`} className="relative block h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100 hover:opacity-90 transition-opacity">
                    {item.imageUrl ? (
                        <img
                            src={item.imageUrl}
                            alt={itemDisplayName(item)}
                            className={`h-full w-full object-cover ${isExceeded ? 'contrast-95' : ''}`}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-3xl text-slate-400">
                            ☕
                        </div>
                    )}
                    {isExceeded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-center">
                            <span className="px-1 text-[10px] font-bold text-white uppercase tracking-wider">
                                {isOutOfStock ? 'Hết hàng' : 'Vượt tồn'}
                            </span>
                        </div>
                    )}
                </LoadingLink>

                {/* Thông tin chi tiết món */}
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                            <LoadingLink to={`/product/${item.productId}`}>
                                <h3 className="text-base font-bold text-slate-800 hover:text-sky-800 transition-colors">
                                    {itemDisplayName(item)}
                                </h3>
                            </LoadingLink>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                {item.sizeName ? (
                                    <span className="rounded-md bg-sky-100/70 px-2 py-0.5 font-semibold text-sky-900">
                                        Size: {item.sizeName}
                                    </span>
                                ) : (
                                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-500">
                                        Tiêu chuẩn
                                    </span>
                                )}

                                <span className="text-slate-500">
                                    Đơn giá: <strong className="text-slate-700">{formatVnd(item.unitPrice)}</strong>
                                </span>

                                {/* Tồn kho của món / size */}
                                {stock !== null && (
                                    <span
                                        className={`rounded-md px-2 py-0.5 font-medium ${
                                            isExceeded
                                                ? 'bg-red-100 font-bold text-red-700'
                                                : 'bg-slate-100 text-slate-600'
                                        }`}
                                    >
                                        {isOutOfStock ? 'Hết hàng' : `Tồn kho: ${stock}`}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Nút xóa món */}
                        <button
                            type="button"
                            disabled={submitting}
                            onClick={() => onRemoveItem(item)}
                            className="text-slate-400 hover:text-red-600 transition-colors p-1"
                            title="Xóa món này khỏi giỏ"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    {/* Cảnh báo đỏ nổi bật khi vượt số lượng tồn kho */}
                    {isExceeded && (
                        <div className="mt-2.5 flex items-center gap-1.5 rounded-3xl border border-red-200 bg-red-100/70 px-3 py-1.5 text-xs font-semibold text-red-800">
                            <span>⚠️</span>
                            <span>
                                {isOutOfStock
                                    ? 'Món này hiện đã hết hàng. Vui lòng xóa món để thanh toán.'
                                    : `Số lượng đặt (${item.quantity}) vượt quá tồn kho hiện có (Chỉ còn ${stock}). Vui lòng giảm số lượng.`}
                            </span>
                        </div>
                    )}

                    {/* Danh sách topping đã chọn của món */}
                    {item.toppings?.length > 0 && (
                        <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-2.5 text-xs">
                            <p className="font-semibold text-slate-700 mb-1.5">Topping thêm:</p>
                            <ul className="space-y-1">
                                {item.toppings.map((t, idx) => (
                                    <li
                                        key={`${item.cartItemId}-t-${idx}`}
                                        className="flex items-center justify-between text-slate-600"
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span>•</span>
                                            <span className="font-medium text-slate-800">{t.name}</span>
                                            <span className="text-sky-800 font-bold">
                                                ×{t.quantity} {t.unit || 'phần'}
                                            </span>
                                            {t.stockQuantity !== undefined && t.stockQuantity !== null && (
                                                <span className="text-[10px] text-slate-400">
                                                    (kho: {t.stockQuantity})
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-semibold text-sky-900">
                                            +{formatVnd(Number(t.price || 0) * (t.quantity || 1))}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Bộ điều khiển số lượng & Thành tiền */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-500">Số lượng:</span>
                            <div className="inline-flex items-center rounded-3xl border border-slate-200 bg-white shadow-2xs">
                                <button
                                    type="button"
                                    disabled={submitting}
                                    title={item.quantity <= 1 ? 'Giảm để xóa món này' : 'Giảm số lượng'}
                                    onClick={() => onUpdateQty(item, item.quantity - 1)}
                                    className="flex h-7 w-7 items-center justify-center font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    min={0}
                                    max={stock ?? undefined}
                                    disabled={submitting}
                                    value={item.quantity}
                                    onChange={(e) => {
                                        const val = Number(e.target.value)
                                        if (Number.isFinite(val)) {
                                            onUpdateQty(item, val)
                                        }
                                    }}
                                    className="w-12 border-x border-slate-100 py-0.5 text-center text-xs font-bold text-slate-800 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    disabled={submitting || !canIncrease}
                                    title={!canIncrease ? `Đã đạt giới hạn tồn kho (${stock})` : 'Tăng số lượng'}
                                    onClick={() => onUpdateQty(item, item.quantity + 1)}
                                    className={`flex h-7 w-7 items-center justify-center font-bold text-slate-600 transition ${
                                        !canIncrease
                                            ? 'opacity-30 cursor-not-allowed'
                                            : 'hover:bg-slate-100'
                                    }`}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className="text-[11px] text-slate-400 block">Thành tiền món</span>
                            <span className="text-base font-extrabold text-sky-900">
                                {formatVnd(item.totalItemPrice ?? calcLineTotal(item))}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
