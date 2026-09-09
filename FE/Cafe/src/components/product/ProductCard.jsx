import LoadingLink from '../loading/LoadingLink'
import { formatVnd } from '../../utils/helpers/format'

export default function ProductCard({ product }) {
    const id = product.productId
    return (
        <LoadingLink
            to={`/menu/${id}`}
            className="group overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
            <div className="h-44 overflow-hidden bg-stone-100">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-stone-400">Chưa có ảnh</div>
                )}
            </div>
            <div className="p-4">
                <p className="text-xs uppercase tracking-wide text-amber-800">{product.categoryName}</p>
                <h3 className="mt-1 font-semibold text-stone-800">{product.name}</h3>
                <p className="mt-2 font-medium text-amber-900">{formatVnd(product.basePrice)}</p>
            </div>
        </LoadingLink>
    )
}
