import { useEffect, useState } from 'react'
import { productService } from '../../services/user/ProductService'
import { unwrapApi } from '../../utils/helpers/api'
import ProductCard from './ProductCard'
import { ProductCardSkeleton } from '../loading/Skeleton'

/**
 * RelatedProductsSection Component
 * Hiển thị danh sách các món cùng danh mục gợi ý ở trang chi tiết sản phẩm.
 * Tự động fetch theo productId, ẩn hoàn toàn nếu không có món nào.
 */
export default function RelatedProductsSection({ productId, limit = 4 }) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!productId) return

        let isCancelled = false

        const fetchRelated = async () => {
            setLoading(true)
            try {
                const res = await productService.getRelatedProducts(productId, { limit })
                if (!isCancelled) {
                    const data = unwrapApi(res)
                    setItems(Array.isArray(data) ? data : [])
                }
            } catch (err) {
                if (!isCancelled) {
                    console.error('Error loading related products:', err)
                    setItems([])
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false)
                }
            }
        }

        fetchRelated()

        return () => {
            isCancelled = true
        }
    }, [productId, limit])

    // Đang tải dữ liệu: hiển thị skeleton
    if (loading) {
        return (
            <section className="mt-8 border-t border-slate-200/80 pt-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
                            <span className="text-sky-700">☕</span>
                            <span>Sản phẩm liên quan</span>
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Gợi ý các món cùng danh mục có thể bạn sẽ thích
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: limit }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            </section>
        )
    }

    // Nếu không có sản phẩm liên quan: ẩn toàn bộ khối
    if (!items.length) {
        return null
    }

    return (
        <section className="mt-8 border-t border-slate-200/80 pt-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
                        <span className="text-sky-700">☕</span>
                        <span>Sản phẩm liên quan</span>
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                        Gợi ý các món cùng danh mục có thể bạn sẽ thích
                    </p>
                </div>
                <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                    {items.length} món gợi ý
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((product) => (
                    <ProductCard key={product.productId} product={product} />
                ))}
            </div>
        </section>
    )
}
