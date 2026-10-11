import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Modal, message } from 'antd'
import LoadingLink from '../../components/loading/LoadingLink'
import { clearCart, getCart, removeCartItem, updateCartItem } from '../../redux/actions/user/cartAction'
import { calcLineTotal, formatVnd, itemDisplayName } from '../../utils/helpers/format'
import { ProductCardSkeleton } from '../../components/loading/Skeleton'
import CartItem from '../../components/cart/CartItem'
import { AppToast, AppConfirm } from '../../components/common/AppNotification'


/**
 * CartPage Component
 * Trang xem Giỏ hàng của người dùng.
 * Liệt kê danh sách sản phẩm, báo lỗi nếu vượt tồn kho, và tính tổng tiền giỏ hàng.
 */
export default function CartPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { items, totalPrice, loading, error, submitting } = useSelector((s) => s.user.cart)

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
                <div className="h-8 w-48 animate-pulse rounded bg-slate-200 mb-6" />
                <div className="space-y-4">
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                </div>
            </div>
        )
    }

    if (!items.length) {
        return (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-50 text-4xl">
                    🛒
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-800">Giỏ hàng của bạn đang trống</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Hãy dạo quanh thực đơn và chọn cho mình những món đồ uống yêu thích nhé!
                </p>
                <LoadingLink
                    to="/"
                    className="mt-6 inline-flex items-center gap-2 rounded-3xl bg-sky-800 px-6 py-2.5 font-medium text-white shadow-sm hover:bg-sky-900 transition-colors"
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
            AppConfirm({
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
                        AppToast.success('Đã xóa món khỏi giỏ hàng!')
                    } else {
                        /* API Error Modal will handle this */
                    }
                },
            })
            return
        }

        // 2. Nút [+]: Số lượng không được vượt quá stockQuantity
        const stock = item.stockQuantity !== undefined && item.stockQuantity !== null ? Number(item.stockQuantity) : null
        if (stock !== null && nextQty > stock) {
            AppToast.warning(`Món "${itemDisplayName(item)}" chỉ còn tối đa ${stock} phần trong kho!`)
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
        AppConfirm({
            title: 'Xóa toàn bộ giỏ hàng?',
            content: 'Bạn có chắc chắn muốn xóa tất cả các món trong giỏ hàng không?',
            okText: 'Xóa tất cả',
            cancelText: 'Giữ lại',
            okType: 'danger',
            centered: true,
            onOk: async () => {
                const res = await dispatch(clearCart())
                if (clearCart.fulfilled.match(res)) {
                    AppToast.success('Đã xóa toàn bộ giỏ hàng!')
                } else {
                    /* API Error Modal will handle this */
                }
            },
        })
    }

    const handleRemoveItem = (item) => {
        AppConfirm({
            title: 'Xóa món khỏi giỏ hàng?',
            content: `Bạn có chắc muốn xóa "${itemDisplayName(item)}" khỏi giỏ hàng không?`,
            okText: 'Xóa món',
            cancelText: 'Hủy',
            okType: 'danger',
            centered: true,
            onOk: async () => {
                const res = await dispatch(removeCartItem(item.cartItemId))
                if (removeCartItem.fulfilled.match(res)) {
                    AppToast.success('Đã xóa món khỏi giỏ hàng!')
                } else {
                    /* API Error Modal will handle this */
                }
            },
        })
    }

    return (
        <div className="pb-10">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Giỏ hàng</h1>
                    <p className="text-xs text-slate-500">
                        Bạn đang có <span className="font-semibold text-sky-900">{items.length}</span> món trong giỏ
                    </p>
                </div>
                <button
                    type="button"
                    disabled={submitting}
                    onClick={handleClearAll}
                    className="inline-flex items-center gap-1 rounded-3xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
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
                {items.map((item) => (
                    <CartItem
                        key={item.cartItemId}
                        item={item}
                        submitting={submitting}
                        onUpdateQty={handleUpdateQty}
                        onRemoveItem={handleRemoveItem}
                    />
                ))}
            </div>

            {/* Khung tổng quan giỏ hàng và nút thanh toán */}
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs text-slate-500">Tổng tiền giỏ hàng</p>
                        <p className="text-2xl font-black text-sky-950">{formatVnd(displayTotal)}</p>
                        <p className="text-[11px] text-slate-400">(Chưa bao gồm phí vận chuyển và khuyến mãi nếu có)</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <button
                            type="button"
                            disabled={hasExceedStock || submitting}
                            onClick={() => navigate('/checkout')}
                            className={`inline-flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-bold shadow-md transition-all ${
                                hasExceedStock
                                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                    : 'bg-sky-800 text-white hover:bg-sky-900 active:scale-[0.99]'
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
