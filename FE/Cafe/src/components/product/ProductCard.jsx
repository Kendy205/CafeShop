import LoadingLink from '../loading/LoadingLink'
import { formatVnd } from '../../utils/helpers/format'

export default function ProductCard({ product }) {
    const id = product.productId
    const isOutOfStock = Boolean(product.isOutOfStock || (product.totalStock !== undefined && product.totalStock <= 0))
    const sizes = Array.isArray(product.productSizes) && product.productSizes.length > 0
        ? product.productSizes
        : (Array.isArray(product.sizes) ? product.sizes : [])
    const hasSizes = sizes.length > 0
    const totalStock = product.totalStock !== undefined && product.totalStock !== null ? Number(product.totalStock) : null

    // Tìm giá thấp nhất từ các size (nếu có)
    const minSizePrice = hasSizes
        ? Math.min(...sizes.map((s) => Number(s.price || product.basePrice)))
        : null
    const displayPrice = minSizePrice != null
        ? `Từ ${formatVnd(minSizePrice)}`
        : formatVnd(product.basePrice)

    return (
        <LoadingLink
            to={`/menu/${id}`}
            className={`group flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg ${
                isOutOfStock ? 'opacity-85' : ''
            }`}
        >
            {/* ── Khung ảnh sản phẩm ── */}
            <div>
                <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                                isOutOfStock ? 'grayscale-40 contrast-90' : ''
                            }`}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-amber-50/50 text-3xl text-amber-800/40">
                            ☕
                        </div>
                    )}

                    {/* Gradient phủ nhẹ phía trên để text badge dễ đọc */}
                    <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

                    {/* Badge Danh mục ở góc trên bên trái */}
                    {product.categoryName && (
                        <div className="absolute left-3 top-3">
                            <span className="inline-flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-2xs">
                                <span>☕</span>
                                <span>{product.categoryName}</span>
                            </span>
                        </div>
                    )}

                    {/* Badge Tồn kho ở góc trên bên phải */}
                    <div className="absolute right-3 top-3">
                        {isOutOfStock ? (
                            <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
                                Hết hàng
                            </span>
                        ) : totalStock !== null && totalStock <= 10 ? (
                            <span className="rounded-full bg-amber-500/95 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
                                Còn {totalStock} phần
                            </span>
                        ) : totalStock !== null ? (
                            <span className="rounded-full bg-emerald-600/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                                Còn {totalStock}
                            </span>
                        ) : null}
                    </div>

                    {/* Overlay hết hàng lớn khi hết hàng */}
                    {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[1px]">
                            <span className="rounded-full border border-white/20 bg-stone-900/90 px-4 py-1.5 text-xs font-extrabold text-white shadow-md tracking-wider">
                                TẠM HẾT HÀNG
                            </span>
                        </div>
                    )}
                </div>

                {/* ── Thông tin sản phẩm ── */}
                <div className="p-4">
                    {/* Tên món */}
                    <h3 className="text-base font-bold text-stone-800 line-clamp-1 transition-colors group-hover:text-amber-900">
                        {product.name}
                    </h3>

                    {/* Mô tả sản phẩm */}
                    {product.description ? (
                        <p className="mt-1 text-xs text-stone-500 line-clamp-2 leading-relaxed h-8">
                            {product.description}
                        </p>
                    ) : (
                        <p className="mt-1 text-xs text-stone-400 italic h-8">
                            Hương vị thơm ngon được chọn lọc kỹ càng...
                        </p>
                    )}

                    {/* Các kích cỡ có sẵn (Sizes) */}
                    {hasSizes && (
                        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-medium text-stone-400">Size:</span>
                            {sizes.map((s) => (
                                <span
                                    key={s.sizeId || s.name}
                                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold transition-colors ${
                                        s.isOutOfStock
                                            ? 'bg-stone-100 text-stone-400 line-through'
                                            : 'bg-amber-50 text-amber-900 border border-amber-200/80'
                                    }`}
                                >
                                    {s.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Chân card: Giá & Nút Chọn món ── */}
            <div className="border-t border-stone-100 bg-stone-50/50 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider block">
                            {hasSizes ? 'Giá từ' : 'Giá bán'}
                        </span>
                        <span className="text-base font-black text-amber-900 tracking-tight">
                            {displayPrice}
                        </span>
                    </div>

                    <button
                        type="button"
                        className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-2xs ${
                            isOutOfStock
                                ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                                : 'bg-amber-800 text-white hover:bg-amber-900 group-hover:shadow-sm'
                        }`}
                    >
                        <span>{isOutOfStock ? 'Hết món' : 'Đặt món'}</span>
                        {!isOutOfStock && <span className="text-[10px]">→</span>}
                    </button>
                </div>
            </div>
        </LoadingLink>
    )
}
