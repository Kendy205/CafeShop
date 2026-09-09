import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import LoadingLink from '../../components/loading/LoadingLink'
import { clearCart, getCart, removeCartItem, updateCartItem } from '../../redux/actions/user/cartAction'
import { calcLineTotal, formatVnd, itemDisplayName, toppingLabel } from '../../utils/helpers/format'
import { ProductCardSkeleton } from '../../components/loading/Skeleton'

export default function CartPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { items, totalPrice, loading, error, submitting } = useSelector((s) => s.cart)

    useEffect(() => {
        dispatch(getCart())
    }, [dispatch])

    if (loading && !items.length) {
        return (
            <div className="space-y-3">
                <ProductCardSkeleton />
                <ProductCardSkeleton />
            </div>
        )
    }

    if (!items.length) {
        return (
            <div className="rounded-2xl bg-white p-10 text-center">
                <p className="text-stone-500">Giỏ hàng trống.</p>
                <LoadingLink to="/" className="mt-4 inline-block text-amber-800">
                    Xem thực đơn
                </LoadingLink>
            </div>
        )
    }

    const displayTotal =
        totalPrice || items.reduce((sum, i) => sum + calcLineTotal(i), 0)

    return (
        <div>
            <h1 className="mb-4 text-2xl font-semibold">Giỏ hàng</h1>
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            <div className="space-y-3">
                {items.map((item) => (
                    <div
                        key={item.cartItemId}
                        className="rounded-2xl border border-stone-100 bg-white p-4"
                    >
                        <div className="flex flex-wrap items-start gap-4">
                            <div className="min-w-0 flex-1">
                                <p className="text-lg font-semibold text-stone-800">
                                    {itemDisplayName(item)}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2 text-sm">
                                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-amber-900">
                                        Size: {item.sizeName || 'Mặc định'}
                                    </span>
                                    <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-stone-600">
                                        Đơn giá: {formatVnd(item.unitPrice)}
                                    </span>
                                </div>

                                {item.toppings?.length > 0 ? (
                                    <ul className="mt-3 space-y-1 border-t border-stone-100 pt-3">
                                        {item.toppings.map((t, idx) => (
                                            <li
                                                key={`${item.cartItemId}-t-${idx}`}
                                                className="flex justify-between gap-3 text-sm text-stone-600"
                                            >
                                                <span>{toppingLabel(t)}</span>
                                                <span className="shrink-0">{formatVnd(t.price)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="mt-3 text-xs text-stone-400">Không thêm topping</p>
                                )}
                            </div>

                            <div className="flex w-full flex-col items-end gap-3 sm:w-auto">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-stone-500">Số lượng</span>
                                    <input
                                        type="number"
                                        min={1}
                                        disabled={submitting}
                                        value={item.quantity}
                                        onChange={(e) => {
                                            const quantity = Math.max(1, Number(e.target.value) || 1)
                                            dispatch(
                                                updateCartItem({
                                                    cartItemId: item.cartItemId,
                                                    quantity,
                                                })
                                            )
                                        }}
                                        className="w-16 rounded-lg border px-2 py-1 text-center"
                                    />
                                </div>
                                <p className="text-right">
                                    <span className="block text-xs text-stone-400">Thành tiền</span>
                                    <span className="text-base font-semibold text-amber-900">
                                        {formatVnd(item.totalItemPrice ?? calcLineTotal(item))}
                                    </span>
                                </p>
                                <button
                                    type="button"
                                    disabled={submitting}
                                    className="text-sm text-red-600"
                                    onClick={() => dispatch(removeCartItem(item.cartItemId))}
                                >
                                    Xóa món
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <button
                    type="button"
                    disabled={submitting}
                    className="text-sm text-stone-500"
                    onClick={() => dispatch(clearCart())}
                >
                    Xóa giỏ
                </button>
                <div className="text-right">
                    <p className="text-lg font-semibold">Tổng cộng: {formatVnd(displayTotal)}</p>
                    <button
                        type="button"
                        className="mt-2 rounded-xl bg-amber-800 px-5 py-2 text-white"
                        onClick={() => navigate('/checkout')}
                    >
                        Thanh toán
                    </button>
                </div>
            </div>
        </div>
    )
}
