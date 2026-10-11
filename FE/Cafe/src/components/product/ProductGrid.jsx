import ProductCard from './ProductCard'
import { ProductCardSkeleton } from '../loading/Skeleton'

/**
 * ProductGrid Component
 * Lưới (Grid) hiển thị danh sách các ProductCard.
 * Hỗ trợ hiển thị Skeleton khi đang tải (loading) và hiển thị thông báo nếu không có sản phẩm nào.
 */
export default function ProductGrid({ items, loading }) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        )
    }

    if (!items?.length) {
        return <p className="py-12 text-center text-slate-500">Không tìm thấy món phù hợp.</p>
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((p) => (
                <ProductCard key={p.productId} product={p} />
            ))}
        </div>
    )
}
