import LoadingLink from '../loading/LoadingLink'
import { formatVnd } from '../../utils/helpers/format'

export default function ProductCard({ product }) {
    const id = product.productId
    const isOutOfStock = Boolean(product.isOutOfStock)
    const hasSizes = (product.productSizes?.length > 0) || (product.sizes?.length > 0)

    return (
        <LoadingLink
            to={`/menu/${id}`}
            className={`group relative overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                isOutOfStock ? 'opacity-90' : ''
            }`}
        >
            <div className="relative h-44 overflow-hidden bg-stone-100">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className={`h-full w-full object-cover transition duration-300 group-hover:scale-105 ${
                            isOutOfStock ? 'grayscale-30 contrast-90' : ''
                        }`}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-stone-400">Chưa có ảnh</div>
                )}

                {/* Tem hết hàng */}
                {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[1px]">
                        <span className="rounded-full bg-red-600/90 px-3 py-1 text-xs font-bold text-white shadow-md">
                            Hết hàng
                        </span>
                    </div>
                )}
            </div>
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wide text-amber-800">{product.categoryName}</p>
                    {isOutOfStock && (
                        <span className="text-[11px] font-semibold text-red-600">Tạm hết</span>
                    )}
                </div>
                <h3 className="mt-1 font-semibold text-stone-800 line-clamp-1">{product.name}</h3>
                <p className="mt-2 font-medium text-amber-900">
                    {hasSizes ? `Từ ${formatVnd(product.basePrice)}` : formatVnd(product.basePrice)}
                </p>
            </div>
        </LoadingLink>
    )
}
