import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { getProductDetail } from '../../redux/actions/user/productAction'
import { getAvailableToppings } from '../../redux/actions/user/toppingAction'
import { addToCart } from '../../redux/actions/user/cartAction'
import { clearProductDetail } from '../../redux/slices/user/productSlice'
import { formatVnd } from '../../utils/helpers/format'
import Skeleton from '../../components/loading/Skeleton'
import ProductFeedbackSection from '../../components/feedback/ProductFeedbackSection'
import { feedbackService } from '../../services/user/FeedbackService'

function ProductCustomize({ detail, sizes, toppings, error, isAuthenticated, productId, summary }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const cartSubmitting = useSelector((s) => s.cart.submitting)
    const cartError = useSelector((s) => s.cart.error)

    const hasSizes = sizes.length > 0
    const firstAvailableSize = hasSizes ? (sizes.find((s) => !s.isOutOfStock) ?? sizes[0]) : null
    const [sizeId, setSizeId] = useState(firstAvailableSize ? firstAvailableSize.sizeId : null)
    const [quantity, setQuantity] = useState(1)
    const [toppingQty, setToppingQty] = useState({})
    const [showToppingList, setShowToppingList] = useState(false)
    const [note, setNote] = useState('')
    const [localError, setLocalError] = useState('')

    const selectedSize = useMemo(
        () => sizes.find((s) => s.sizeId === sizeId) ?? sizes[0] ?? null,
        [sizes, sizeId]
    )

    // Giới hạn tồn kho theo đặc tả: món có size -> size.stockQuantity, không size -> product.totalStock
    const maxAvailableStock = useMemo(() => {
        if (hasSizes) {
            return selectedSize?.stockQuantity !== undefined && selectedSize?.stockQuantity !== null
                ? Math.max(0, Number(selectedSize.stockQuantity))
                : 999
        }
        return detail?.totalStock !== undefined && detail?.totalStock !== null
            ? Math.max(0, Number(detail.totalStock))
            : (detail?.stockQuantity !== undefined && detail?.stockQuantity !== null ? Math.max(0, Number(detail.stockQuantity)) : 999)
    }, [hasSizes, selectedSize, detail])

    const isProductOutOfStock = Boolean(
        detail?.isOutOfStock ||
        (hasSizes ? (!selectedSize || selectedSize.isOutOfStock || maxAvailableStock <= 0) : maxAvailableStock <= 0)
    )

    // Tự động điều chỉnh quantity nếu vượt quá tồn kho
    useEffect(() => {
        if (maxAvailableStock > 0 && quantity > maxAvailableStock) {
            setQuantity(maxAvailableStock)
        }
    }, [maxAvailableStock, quantity])

    const selectedToppings = useMemo(() => {
        return toppings
            .filter((t) => Number(toppingQty[t.toppingId]) > 0 && !t.isOutOfStock)
            .map((t) => ({
                toppingId: t.toppingId,
                name: t.name,
                price: t.price,
                unit: t.unit,
                quantity: Number(toppingQty[t.toppingId]),
            }))
    }, [toppings, toppingQty])

    const linePreview = useMemo(() => {
        const unit = selectedSize?.price ?? detail.basePrice ?? 0
        const toppingSum = selectedToppings.reduce((s, t) => s + Number(t.price || 0) * t.quantity, 0)
        return unit * quantity + toppingSum
    }, [selectedSize, detail, selectedToppings, quantity])

    const buildAddPayload = () => ({
        productId: Number(detail.productId),
        sizeId: selectedSize?.sizeId ?? null,
        quantity,
        toppings: selectedToppings.map((t) => ({
            toppingId: t.toppingId,
            quantity: t.quantity,
        })),
    })

    const requireLogin = () => {
        navigate('/login', { state: { from: `/menu/${productId}` } })
    }

    const handleAddToCart = async () => {
        if (isProductOutOfStock) {
            setLocalError('Sản phẩm hiện đang hết hàng.')
            return
        }
        if (!isAuthenticated) {
            requireLogin()
            return
        }
        if (hasSizes && !selectedSize) {
            setLocalError('Vui lòng chọn size')
            return
        }
        if (hasSizes && selectedSize?.isOutOfStock) {
            setLocalError('Size này hiện đã hết hàng, vui lòng chọn size khác')
            return
        }
        setLocalError('')
        const result = await dispatch(addToCart(buildAddPayload()))
        if (addToCart.fulfilled.match(result)) {
            navigate('/cart')
        }
    }

    const handleBuyNow = () => {
        if (isProductOutOfStock) {
            setLocalError('Sản phẩm hiện đang hết hàng.')
            return
        }
        if (!isAuthenticated) {
            requireLogin()
            return
        }
        if (hasSizes && !selectedSize) {
            setLocalError('Vui lòng chọn size')
            return
        }
        if (hasSizes && selectedSize?.isOutOfStock) {
            setLocalError('Size này hiện đã hết hàng, vui lòng chọn size khác')
            return
        }
        navigate('/checkout', {
            state: {
                buyNow: true,
                buyNowItems: [
                    {
                        productId: detail.productId,
                        name: detail.name,
                        sizeId: selectedSize?.sizeId ?? null,
                        sizeName: selectedSize?.name,
                        sizePrice: selectedSize?.price ?? detail.basePrice,
                        quantity,
                        toppings: selectedToppings,
                    },
                ],
                note,
            },
        })
    }

    const changeTopping = (toppingId, next) => {
        setToppingQty((prev) => ({
            ...prev,
            [toppingId]: Math.max(0, next),
        }))
    }

    return (
        <div>
            {detail.categoryName && (
                <p className="text-xs uppercase tracking-wide text-amber-800">{detail.categoryName}</p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold">{detail.name}</h1>
                {isProductOutOfStock && (
                    <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                        Hết hàng
                    </span>
                )}
            </div>

            {/* Badge Đánh giá (API Summary) */}
            <div className="mt-2 flex items-center gap-2">
                {summary && Number(summary.totalReviews) > 0 ? (
                    <a
                        href="#product-reviews"
                        onClick={(e) => {
                            e.preventDefault()
                            document.getElementById('product-reviews')?.scrollIntoView({ behavior: 'smooth' })
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-900 border border-amber-200/80 hover:bg-amber-100 hover:border-amber-300 transition shadow-2xs"
                    >
                        <span className="text-amber-500 font-extrabold">★</span>
                        <span>{Number(summary.averageRating).toFixed(1)}</span>
                        <span className="text-stone-400 font-medium">({summary.totalReviews} đánh giá)</span>
                    </a>
                ) : (
                    <span className="text-xs text-stone-400">★ Chưa có đánh giá</span>
                )}
            </div>

            <p className="mt-2 text-sm text-stone-500">
                Giá size đang chọn:{' '}
                {formatVnd(selectedSize?.price ?? detail.basePrice)}
            </p>
            <p className="mt-2 text-xl text-amber-900">{formatVnd(linePreview)}</p>
            {(error || cartError || localError) && (
                <p className="mt-2 text-sm text-red-600">{localError || cartError || error}</p>
            )}

            <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium">Chọn size</p>
                    {hasSizes && selectedSize && (
                        <span className="text-xs text-stone-500">
                            {selectedSize.isOutOfStock ? (
                                <span className="font-semibold text-red-600">Size này đã hết</span>
                            ) : (
                                selectedSize.stockQuantity !== undefined && (
                                    <span>Còn {selectedSize.stockQuantity} ly</span>
                                )
                            )}
                        </span>
                    )}
                </div>
                {hasSizes ? (
                    <div className="flex flex-wrap gap-2">
                        {sizes.map((s) => {
                            const isSizeOOS = Boolean(
                                s.isOutOfStock ||
                                (s.stockQuantity !== undefined && s.stockQuantity !== null && s.stockQuantity <= 0)
                            )
                            const isSelected = selectedSize?.sizeId === s.sizeId

                            return (
                                <button
                                    key={s.sizeId}
                                    type="button"
                                    disabled={isSizeOOS}
                                    onClick={() => setSizeId(s.sizeId)}
                                    className={`rounded-full border px-4 py-2 text-sm transition-all ${isSizeOOS
                                            ? 'cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 opacity-60'
                                            : isSelected
                                                ? 'border-amber-800 bg-amber-800 text-white shadow-sm'
                                                : 'border-stone-200 bg-white hover:border-amber-700'
                                        }`}
                                >
                                    {s.name} · {formatVnd(s.price)} {isSizeOOS && '(Hết hàng)'}
                                </button>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-stone-500">Món này không có size.</p>
                )}
            </div>

            {/* ── Topping thêm (Add-on) ── */}
            <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-stone-800">Topping thêm</p>
                            <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[11px] font-medium text-stone-600">
                                Tùy chọn
                            </span>
                            {selectedToppings.length > 0 && (
                                <span className="rounded-full bg-amber-800 px-2 py-0.5 text-[11px] font-medium text-white shadow-sm">
                                    Đã thêm {selectedToppings.length} loại
                                </span>
                            )}
                        </div>
                        <p className="mt-1 text-xs text-stone-500">
                            Đồ uống đã có topping mặc định theo công thức. Chọn thêm nếu bạn muốn thêm topping nhé!
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowToppingList((prev) => !prev)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${showToppingList
                                ? 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                                : 'bg-amber-800 text-white shadow-sm hover:bg-amber-900'
                            }`}
                    >
                        {showToppingList ? (
                            <>
                                <span>Thu gọn</span>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                                    <path fillRule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z" clipRule="evenodd" />
                                </svg>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                                </svg>
                                <span>{selectedToppings.length > 0 ? 'Sửa topping thêm' : 'Thêm topping'}</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Danh sách các topping đã chọn thêm (luôn hiển thị tóm tắt khi đã chọn) */}
                {selectedToppings.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {selectedToppings.map((t) => (
                            <div
                                key={t.toppingId}
                                className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50/90 px-2.5 py-1 text-xs text-amber-950 shadow-xs"
                            >
                                <span className="font-medium">{t.name}</span>
                                <span className="rounded-md bg-amber-200/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                                    +{t.quantity} {t.unit}
                                </span>
                                <span className="text-amber-800 font-semibold">
                                    {formatVnd(Number(t.price) * t.quantity)}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => changeTopping(t.toppingId, 0)}
                                    title="Xóa topping này"
                                    className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-stone-400 hover:bg-amber-200 hover:text-red-600 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Danh sách chọn topping - chỉ hiển thị khi showToppingList = true */}
                {showToppingList && (
                    <div className="mt-4 border-t border-stone-200/80 pt-4">
                        {toppings.length === 0 ? (
                            <p className="py-2 text-center text-sm text-stone-400">Hiện chưa có topping khả dụng.</p>
                        ) : (
                            <>
                                <div className="mb-2 flex items-center justify-between text-xs text-stone-500">
                                    <span>Chọn loại topping và định lượng thêm:</span>
                                    <span>{toppings.length} loại có thể thêm</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {toppings.map((t) => {
                                        const isToppingOOS = Boolean(
                                            t.isOutOfStock ||
                                            (t.stockQuantity !== undefined && t.stockQuantity !== null && t.stockQuantity <= 0)
                                        )
                                        const maxToppingStock = t.stockQuantity !== undefined && t.stockQuantity !== null
                                            ? Number(t.stockQuantity)
                                            : 999
                                        const qty = toppingQty[t.toppingId] ?? 0
                                        const active = qty > 0 && !isToppingOOS
                                        const step = String(t.unit || '').toLowerCase() === 'ml' ? 50 : 1
                                        const canIncrease = !isToppingOOS && qty + step <= maxToppingStock

                                        return (
                                            <div
                                                key={t.toppingId}
                                                onClick={() => {
                                                    if (!active && !isToppingOOS) changeTopping(t.toppingId, Math.min(step, maxToppingStock))
                                                }}
                                                className={`relative flex flex-col overflow-hidden rounded-2xl border-2 transition-all duration-200 ${isToppingOOS
                                                        ? 'cursor-not-allowed border-stone-200 bg-stone-100/70 opacity-60'
                                                        : active
                                                            ? 'border-amber-700 bg-amber-50/40 shadow-md shadow-amber-100'
                                                            : 'cursor-pointer border-stone-200/80 bg-white hover:border-amber-400 hover:shadow-sm'
                                                    }`}
                                            >
                                                {/* Hình ảnh topping */}
                                                <div className="relative h-24 w-full overflow-hidden bg-amber-50">
                                                    {t.imageUrl ? (
                                                        <img
                                                            src={t.imageUrl}
                                                            alt={t.name}
                                                            className={`h-full w-full object-cover transition-transform duration-300 ${isToppingOOS ? 'grayscale-40' : 'hover:scale-105'
                                                                }`}
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-3xl">
                                                            ☕
                                                        </div>
                                                    )}

                                                    {/* Badge hết hàng */}
                                                    {isToppingOOS && (
                                                        <span className="absolute left-2 top-2 rounded-full bg-stone-800/90 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                                                            Hết hàng
                                                        </span>
                                                    )}

                                                    {/* Badge số lượng khi active */}
                                                    {active && !isToppingOOS && (
                                                        <span className="absolute left-2 top-2 rounded-full bg-amber-800 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                                                            +{qty} {t.unit || 'phần'}
                                                        </span>
                                                    )}

                                                    {/* Nút "+" khi chưa chọn */}
                                                    {!active && !isToppingOOS && (
                                                        <button
                                                            type="button"
                                                            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-amber-800 shadow-sm hover:bg-amber-800 hover:text-white transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                changeTopping(t.toppingId, Math.min(step, maxToppingStock))
                                                            }}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                                                                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Thông tin topping */}
                                                <div className={`px-2.5 py-2 ${active ? 'bg-amber-50/60' : 'bg-white'}`}>
                                                    <p className="truncate text-xs font-semibold text-stone-800" title={t.name}>
                                                        {t.name}{' '}
                                                        {isToppingOOS && (
                                                            <span className="font-normal text-red-600">(Hết hàng)</span>
                                                        )}
                                                    </p>
                                                    <div className="mt-1 flex items-center justify-between gap-1">
                                                        <span className="text-[11px] font-medium text-amber-800">
                                                            +{formatVnd(t.price)}
                                                            {t.unit ? <span className="text-stone-400 font-normal"> / {t.unit}</span> : null}
                                                        </span>
                                                        {!isToppingOOS && t.stockQuantity !== undefined && t.stockQuantity !== null && (
                                                            <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-600">
                                                                Còn {t.stockQuantity}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Controls tăng giảm — chỉ hiện khi active */}
                                                {active && !isToppingOOS && (
                                                    <div
                                                        className="flex items-center justify-between gap-1 border-t border-amber-200/60 bg-amber-50 px-2 pb-2 pt-1"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <button
                                                            type="button"
                                                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-base font-bold text-stone-600 shadow-xs hover:bg-red-50 hover:text-red-500 transition-colors"
                                                            onClick={() => changeTopping(t.toppingId, qty - step)}
                                                        >
                                                            −
                                                        </button>
                                                        <span className="min-w-[36px] text-center text-xs font-bold text-amber-900">
                                                            {qty} {t.unit || ''}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            disabled={!canIncrease}
                                                            title={!canIncrease ? 'Đã đạt giới hạn tồn kho topping' : 'Thêm'}
                                                            className={`flex h-7 w-7 items-center justify-center rounded-lg bg-amber-800 text-base font-bold text-white shadow-xs transition-colors ${!canIncrease
                                                                    ? 'opacity-40 cursor-not-allowed'
                                                                    : 'hover:bg-amber-900'
                                                                }`}
                                                            onClick={() => canIncrease && changeTopping(t.toppingId, qty + step)}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowToppingList(false)}
                                        className="rounded-xl border border-stone-300 bg-white px-4 py-1.5 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
                                    >
                                        Đóng danh sách topping
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-stone-700">Số lượng ly</label>
                    {isProductOutOfStock ? (
                        <span className="text-xs font-semibold text-red-600">(Hết hàng)</span>
                    ) : (
                        maxAvailableStock < 999 && (
                            <span className="text-xs text-stone-500">(Còn {maxAvailableStock} ly)</span>
                        )
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        disabled={quantity <= 1 || isProductOutOfStock}
                        className="h-8 w-8 rounded-lg border border-stone-300 bg-white font-bold text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                        −
                    </button>
                    <input
                        type="number"
                        min={1}
                        max={maxAvailableStock}
                        disabled={isProductOutOfStock}
                        value={quantity}
                        onChange={(e) => {
                            const val = Number(e.target.value) || 1
                            setQuantity(Math.max(1, Math.min(maxAvailableStock, val)))
                        }}
                        className="w-16 rounded-lg border border-stone-300 bg-white px-2 py-1 text-center font-medium disabled:bg-stone-100 disabled:opacity-50"
                    />
                    <button
                        type="button"
                        disabled={quantity >= maxAvailableStock || isProductOutOfStock}
                        className="h-8 w-8 rounded-lg border border-stone-300 bg-white font-bold text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        onClick={() => setQuantity((q) => Math.min(maxAvailableStock, q + 1))}
                    >
                        +
                    </button>
                </div>
            </div>
            <textarea
                className="mt-4 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm focus:border-amber-700 focus:outline-none"
                rows={2}
                placeholder="Ghi chú (ít đá, ít đường...) — dùng khi mua ngay"
                value={note}
                onChange={(e) => setNote(e.target.value)}
            />
            <div className="mt-4 flex flex-wrap gap-3">
                <button
                    type="button"
                    disabled={cartSubmitting || isProductOutOfStock}
                    onClick={handleAddToCart}
                    className="rounded-xl border border-amber-800 px-5 py-2.5 font-medium text-amber-900 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isProductOutOfStock ? 'Tạm hết hàng' : cartSubmitting ? 'Đang thêm...' : 'Thêm vào giỏ'}
                </button>
                <button
                    type="button"
                    disabled={isProductOutOfStock}
                    onClick={handleBuyNow}
                    className="rounded-xl bg-amber-800 px-5 py-2.5 font-medium text-white hover:bg-amber-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isProductOutOfStock ? 'Tạm hết hàng' : 'Mua ngay'}
                </button>
            </div>
        </div>
    )
}

export default function ProductDetailPage() {
    const { id } = useParams()
    const dispatch = useDispatch()
    const { detail, detailLoading, error } = useSelector((s) => s.product)
    const masterToppings = useSelector((s) => s.topping.items)
    const toppingError = useSelector((s) => s.topping.error)
    const isAuthenticated = useSelector((s) => s.auth.isAuthenticated)
    const [summary, setSummary] = useState(null)

    useEffect(() => {
        dispatch(clearProductDetail())
        dispatch(getProductDetail(id))
        dispatch(getAvailableToppings())

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

    const sizes = Array.isArray(detail?.productSizes)
        ? detail.productSizes
        : (Array.isArray(detail?.sizes) ? detail.sizes : [])

    const toppings = Array.isArray(detail?.toppings) && detail.toppings.length
        ? detail.toppings
        : masterToppings

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
            <div className="grid gap-8 md:grid-cols-2">
                <div className="relative overflow-hidden rounded-3xl bg-stone-100">
                    {detail.imageUrl ? (
                        <img
                            src={detail.imageUrl}
                            alt={detail.name}
                            className={`h-80 w-full object-cover ${detail.isOutOfStock ? 'grayscale-30' : ''}`}
                        />
                    ) : (
                        <div className="flex h-80 items-center justify-center text-stone-400">Chưa có ảnh</div>
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
                    error={error || toppingError}
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
