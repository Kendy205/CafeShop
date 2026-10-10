import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { getProductDetail } from '../../redux/actions/user/productAction'
import { addToCart } from '../../redux/actions/user/cartAction'
import { clearProductDetail } from '../../redux/slices/user/productSlice'
import { openAuthModal } from '../../redux/slices/authSlice'
import { formatVnd } from '../../utils/helpers/format'
import ProductCustomize from '../../components/product/ProductCustomize'
import Skeleton from '../../components/loading/Skeleton'
import ProductFeedbackSection from '../../components/feedback/ProductFeedbackSection'
import { feedbackService } from '../../services/user/FeedbackService'

export default function ProductDetailPage() {
    const { id } = useParams()
    const dispatch = useDispatch()
    const { detail, detailLoading, error } = useSelector((s) => s.user.product)
    const isAuthenticated = useSelector((s) => s.app.auth.isAuthenticated)
    const [summary, setSummary] = useState(null)

    useEffect(() => {
        dispatch(clearProductDetail())
        dispatch(getProductDetail(id))

        // Lấy thống kê đánh giá của sản phẩm: GET /api/Feedback/product/{productId}/summary
        if (id) {
            feedbackService
                .getProductSummary(id)
                .then((data) => {
                    if (data && typeof data === 'object') {
                        setSummary(data)
                    }
                })
                .catch((err) => {
                    console.error('Error loading product feedback summary:', err)
                })
        }
    }, [dispatch, id])

    const sizes = useMemo(() => {
        const rawSizes = Array.isArray(detail?.productSizes)
            ? detail.productSizes
            : (Array.isArray(detail?.sizes) ? detail.sizes : [])
        return rawSizes.map((s) => {
            const sizeLabel = s.sizeName ?? s.name ?? 'Size'
            return {
                ...s,
                name: sizeLabel,
                sizeName: sizeLabel,
            }
        })
    }, [detail?.productSizes, detail?.sizes])

    const toppings = Array.isArray(detail?.productToppings) && detail.productToppings.length > 0
        ? detail.productToppings.map(t => ({ ...t, name: t.name || t.toppingName || 'Topping' }))
        : []

    if (detailLoading) {
        return (
            <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-72" />
                <div>
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="mt-4 h-24" />
                </div>
            </div>
        )
    }

    if (!detail) {
        return <p className="text-red-600">{error || 'Không tìm thấy món.'}</p>
    }

    return (
        <div className="space-y-8">
            <div className="grid items-start gap-8 md:grid-cols-2">
                <div className="relative overflow-hidden rounded-3xl bg-slate-100 sticky top-24">
                    {detail.imageUrl ? (
                        <img
                            src={detail.imageUrl}
                            alt={detail.name}
                            className={`aspect-square w-full object-cover ${detail.isOutOfStock ? 'grayscale-30' : ''}`}
                        />
                    ) : (
                        <div className="flex aspect-square items-center justify-center text-slate-400">Chưa có ảnh</div>
                    )}
                    {detail.isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[1px]">
                            <span className="rounded-full bg-red-600 px-4 py-1.5 text-sm font-bold text-white shadow-lg">
                                Tạm hết hàng
                            </span>
                        </div>
                    )}
                </div>
                <ProductCustomize
                    key={detail.productId}
                    detail={detail}
                    sizes={sizes}
                    toppings={toppings}
                    error={error}
                    isAuthenticated={isAuthenticated}
                    productId={id}
                    summary={summary}
                />
            </div>

            {/* Khối Thống kê & Danh sách đánh giá món (Feedback) */}
            <ProductFeedbackSection productId={id || detail?.productId} summary={summary} />
        </div>
    )
}
