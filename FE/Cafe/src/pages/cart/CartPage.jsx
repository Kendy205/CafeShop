import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Modal, message } from 'antd'
import LoadingLink from '../../components/loading/LoadingLink'
import { clearCart, getCart, removeCartItem, updateCartItem } from '../../redux/actions/user/cartAction'
import { calcLineTotal, formatVnd, itemDisplayName } from '../../utils/helpers/format'
import { ProductCardSkeleton } from '../../components/loading/Skeleton'

export default function CartPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { items, totalPrice, loading, error, submitting } = useSelector((s) => s.cart)

    useEffect(() => {
        dispatch(getCart())
    }, [dispatch])

    // Kiểm tra xem có món nào bị vượt tồn kho không
    const hasExceedStock = useMemo(() => {
        return items.some((i) => {
            if (i.isExceedStock === true) return true
            if (i.stockQuantity !== undefined && i.stockQuantity !== null && i.quantity > i.stockQuantity) return true
            return false
        })
    }, [items])

    if (loading && !items.length) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-8">
                <div className="h-8 w-48 animate-pulse rounded bg-stone-200 mb-6" />
                <div className="space-y-4">
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                </div>
            </div>
        )
    }

    if (!items.length) {
        return (
            <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center shadow-xs">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-4xl">
                    🛒
                </div>
                <h2 className="mt-4 text-xl font-bold text-stone-800">Giỏ hàng của bạn đang trống</h2>
                <p className="mt-1 text-sm text-stone-500">
                    Hãy dạo quanh thực đơn và chọn cho mình những món đồ uống yêu thích nhé!
                </p>
                <LoadingLink
                    to="/"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-800 px-6 py-2.5 font-medium text-white shadow-sm hover:bg-amber-900 transition-colors"
                >
                    <span>Khám phá thực đơn</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                </LoadingLink>
            </div>
        )
    }

    const displayTotal =
        totalPrice || items.reduce((sum, i) => sum + calcLineTotal(i), 0)

    const handleUpdateQty = (item, nextQty) => {
        if (submitting) return

        // 1. Nút [-]: Khi số lượng giảm về <= 0
        if (nextQty <= 0) {
            Modal.confirm({
                title: 'Xóa món khỏi giỏ hàng?',
                content: `Bạn có chắc muốn xóa món "${itemDisplayName(item)}" khỏi giỏ hàng không?`,
                okText: 'Xóa món',
                cancelText: 'Giữ lại',
                okType: 'danger',
                centered: true,
                onOk: async () => {
                    const res = await dispatch(
                        updateCartItem({
                            cartItemId: item.cartItemId,
                            quantity: 0,
                        })
                    )
                    if (updateCartItem.fulfilled.match(res)) {
                        message.success('Đã xóa món khỏi giỏ hàng!')
                    } else {
                        message.error(res.payload || 'Không thể xóa món!')
                    }
                },
            })
            return
        }

        // 2. Nút [+]: Số lượng không được vượt quá stockQuantity
        const stock = item.stockQuantity !== undefined && item.stockQuantity !== null ? Number(item.stockQuantity) : null
        if (stock !== null && nextQty > stock) {
            message.warning(`Món "${itemDisplayName(item)}" chỉ còn tối đa ${stock} phần trong kho!`)
            return
        }

        dispatch(
            updateCartItem({
                cartItemId: item.cartItemId,
                quantity: nextQty,
            })
        )
    }

    const handleClearAll = () => {
        Modal.confirm({
            title: 'Xóa toàn bộ giỏ hàng?',
            content: 'Bạn có chắc chắn muốn xóa tất cả các món trong giỏ hàng không?',
            okText: 'Xóa tất cả',
            cancelText: 'Giữ lại',
            okType: 'danger',
            centered: true,
            onOk: async () => {
                const res = await dispatch(clearCart())
                if (clearCart.fulfilled.match(res)) {
                    message.success('Đã xóa toàn bộ giỏ hàng!')
                } else {
                    message.error(res.payload || 'Không thể xóa giỏ hàng!')
                }
            },
        })
    }

    const handleRemoveItem = (item) => {
        Modal.confirm({
            title: 'Xóa món khỏi giỏ hàng?',
            content: `Bạn có chắc muốn xóa "${itemDisplayName(item)}" khỏi giỏ hàng không?`,
            okText: 'Xóa món',
            cancelText: 'Hủy',
            okType: 'danger',
            centered: true,
            onOk: async () => {
                const res = await dispatch(removeCartItem(item.cartItemId))
                if (removeCartItem.fulfilled.match(res)) {
                    message.success('Đã xóa món khỏi giỏ hàng!')
                } else {
                    message.error(res.payload || 'Xóa món thất bại!')
                }
            },
        })
    }

    return (
        <div className="pb-10">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-stone-800">Giỏ hàng</h1>
                    <p className="text-xs text-stone-500">
                        Bạn đang có <span className="font-semibold text-amber-900">{items.length}</span> món trong giỏ
                    </p>
                </div>
                <button
                    type="button"
                    disabled={submitting}
                    onClick={handleClearAll}
                    className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                    </svg>
                    <span>Xóa tất cả</span>
                </button>
            </div>

            {error && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Cảnh báo tồn kho tổng quát */}
            {hasExceedStock && (
                <div className="mb-4 flex items-center gap-3 rounded-2xl border border-red-300 bg-red-50/90 p-4 text-red-800 shadow-xs">
                    <span className="text-xl">⚠️</span>
                    <div className="text-xs sm:text-sm">
                        <p className="font-bold">Có sản phẩm vượt quá số lượng tồn kho hiện tại!</p>
                        <p className="text-red-700 mt-0.5">
                            Vui lòng điều chỉnh giảm số lượng món bị cảnh báo đỏ trước khi tiến hành thanh toán.
                        </p>
                    </div>
                </div>
            )}

            {/* Danh sách các món trong giỏ */}
            <div className="space-y-4">
                {items.map((item) => {
                    const isExceeded = Boolean(
                        item.isExceedStock ||
                        (item.stockQuantity !== undefined && item.stockQuantity !== null && item.quantity > item.stockQuantity)
                    )
                    const stock = item.stockQuantity !== undefined && item.stockQuantity !== null ? Number(item.stockQuantity) : null
                    const isOutOfStock = stock !== null && stock <= 0
                    const canIncrease = stock === null || item.quantity < stock

                    return (
                        <div
                            key={item.cartItemId}
                            className={`relative overflow-hidden rounded-3xl border bg-white p-4 transition-all duration-200 shadow-xs ${
                                isExceeded
                                    ? 'border-red-400 bg-red-50/15 ring-2 ring-red-200'
                                    : 'border-stone-200 hover:border-amber-400'
                            }`}
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                {/* Hình ảnh món */}
                                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-stone-100">
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={itemDisplayName(item)}
                                            className={`h-full w-full object-cover ${isExceeded ? 'contrast-95' : ''}`}
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-3xl text-stone-400">
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
                                </div>

                                {/* Thông tin chi tiết món */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div>
                                            <h3 className="text-base font-bold text-stone-800">
                                                {itemDisplayName(item)}
                                            </h3>
                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                                {item.sizeName ? (
                                                    <span className="rounded-md bg-amber-100/70 px-2 py-0.5 font-semibold text-amber-900">
                                                        Size: {item.sizeName}
                                                    </span>
                                                ) : (
                                                    <span className="rounded-md bg-stone-100 px-2 py-0.5 text-stone-500">
                                                        Tiêu chuẩn
                                                    </span>
                                                )}

                                                <span className="text-stone-500">
                                                    Đơn giá: <strong className="text-stone-700">{formatVnd(item.unitPrice)}</strong>
                                                </span>

                                                {/* Tồn kho của món / size */}
                                                {stock !== null && (
                                                    <span
                                                        className={`rounded-md px-2 py-0.5 font-medium ${
                                                            isExceeded
                                                                ? 'bg-red-100 font-bold text-red-700'
                                                                : 'bg-stone-100 text-stone-600'
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
                                            onClick={() => handleRemoveItem(item)}
                                            className="text-stone-400 hover:text-red-600 transition-colors p-1"
                                            title="Xóa món này khỏi giỏ"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                                                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Cảnh báo đỏ nổi bật khi vượt số lượng tồn kho */}
                                    {isExceeded && (
                                        <div className="mt-2.5 flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-100/70 px-3 py-1.5 text-xs font-semibold text-red-800">
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
                                        <div className="mt-3 rounded-2xl border border-stone-100 bg-stone-50/80 p-2.5 text-xs">
                                            <p className="font-semibold text-stone-700 mb-1.5">Topping thêm:</p>
                                            <ul className="space-y-1">
                                                {item.toppings.map((t, idx) => (
                                                    <li
                                                        key={`${item.cartItemId}-t-${idx}`}
                                                        className="flex items-center justify-between text-stone-600"
                                                    >
                                                        <div className="flex items-center gap-1.5">
                                                            <span>•</span>
                                                            <span className="font-medium text-stone-800">{t.name}</span>
                                                            <span className="text-amber-800 font-bold">
                                                                ×{t.quantity} {t.unit || 'phần'}
                                                            </span>
                                                            {t.stockQuantity !== undefined && t.stockQuantity !== null && (
                                                                <span className="text-[10px] text-stone-400">
                                                                    (kho: {t.stockQuantity})
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="font-semibold text-amber-900">
                                                            +{formatVnd(Number(t.price || 0) * (t.quantity || 1))}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Bộ điều khiển số lượng & Thành tiền */}
                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-stone-500">Số lượng:</span>
                                            <div className="inline-flex items-center rounded-xl border border-stone-200 bg-white shadow-2xs">
                                                <button
                                                    type="button"
                                                    disabled={submitting}
                                                    title={item.quantity <= 1 ? 'Giảm để xóa món này' : 'Giảm số lượng'}
                                                    onClick={() => handleUpdateQty(item, item.quantity - 1)}
                                                    className="flex h-7 w-7 items-center justify-center font-bold text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
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
                                                            handleUpdateQty(item, val)
                                                        }
                                                    }}
                                                    className="w-12 border-x border-stone-100 py-0.5 text-center text-xs font-bold text-stone-800 focus:outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    disabled={submitting || !canIncrease}
                                                    title={!canIncrease ? `Đã đạt giới hạn tồn kho (${stock})` : 'Tăng số lượng'}
                                                    onClick={() => handleUpdateQty(item, item.quantity + 1)}
                                                    className={`flex h-7 w-7 items-center justify-center font-bold text-stone-600 transition ${
                                                        !canIncrease
                                                            ? 'opacity-30 cursor-not-allowed'
                                                            : 'hover:bg-stone-100'
                                                    }`}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <span className="text-[11px] text-stone-400 block">Thành tiền món</span>
                                            <span className="text-base font-extrabold text-amber-900">
                                                {formatVnd(item.totalItemPrice ?? calcLineTotal(item))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Khung tổng quan giỏ hàng và nút thanh toán */}
            <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs text-stone-500">Tổng tiền giỏ hàng</p>
                        <p className="text-2xl font-black text-amber-950">{formatVnd(displayTotal)}</p>
                        <p className="text-[11px] text-stone-400">(Chưa bao gồm phí vận chuyển và khuyến mãi nếu có)</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <button
                            type="button"
                            disabled={hasExceedStock || submitting}
                            onClick={() => navigate('/checkout')}
                            className={`inline-flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-bold shadow-md transition-all ${
                                hasExceedStock
                                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                                    : 'bg-amber-800 text-white hover:bg-amber-900 active:scale-[0.99]'
                            }`}
                        >
                            <span>Thanh toán ngay</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                            </svg>
                        </button>
                        {hasExceedStock && (
                            <span className="text-xs font-semibold text-red-600">
                                ⚠️ Vui lòng xử lý món vượt tồn kho để tiếp tục
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
