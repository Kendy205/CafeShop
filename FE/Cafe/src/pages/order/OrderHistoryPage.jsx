import { useEffect, useState, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { message, Modal } from 'antd'
import { getMyOrders, cancelOrder } from '../../redux/actions/user/orderAction'
import { clearCancelError } from '../../redux/slices/user/orderSlice'
import { formatVnd } from '../../utils/helpers/format'
import OrderCard, { StatusBadge } from '../../components/order/OrderCard'
import LoadingLink from '../../components/loading/LoadingLink'
import AppPagination from '../../components/common/AppPagination'
import { feedbackService } from '../../services/user/FeedbackService'
import {
    PAYMENT_LABEL,
    canCancelOrder,
    getStatusConfig,
    ORDER_STATUS_TABS,
} from '../../utils/constants/OrderConstants'
import { pickErrorMessage } from '../../utils/helpers/api'

// ── Main Page Component ───────────────────────────────────────────────────────
export default function OrderHistoryPage() {
    const dispatch = useDispatch()

    const {
        myOrders,
        myOrdersTotal,
        myOrdersTotalPages,
        myOrdersLoading,
        myOrdersError,
        cancelling,
    } = useSelector((s) => s.order)

    const [page, setPage] = useState(1)
    const [selectedStatus, setSelectedStatus] = useState('ALL')
    const [reviewedMap, setReviewedMap] = useState(getStoredReviewedItems)
    const [reviewTargetItem, setReviewTargetItem] = useState(null)

    const fetchOrders = useCallback(
        (p, status = selectedStatus) => {
            dispatch(
                getMyOrders({
                    pageNumber: p,
                    pageSize: 10,
                    status: status === 'ALL' ? undefined : status,
                })
            )
        },
        [dispatch, selectedStatus]
    )

    useEffect(() => {
        fetchOrders(page, selectedStatus)
    }, [fetchOrders, page, selectedStatus])

    // Lắng nghe sự kiện Realtime khi Admin cập nhật trạng thái đơn hàng
    useEffect(() => {
        const handleOrderUpdate = () => {
            fetchOrders(page, selectedStatus)
        }
        window.addEventListener('app:user-order-update', handleOrderUpdate)
        return () => {
            window.removeEventListener('app:user-order-update', handleOrderUpdate)
        }
    }, [fetchOrders, page, selectedStatus])

    const handleTabChange = (tabKey) => {
        if (tabKey === selectedStatus) return
        setSelectedStatus(tabKey)
        setPage(1)
    }

    const handleCancel = useCallback(
        (orderId) => {
            Modal.confirm({
                title: 'Xác nhận hủy đơn hàng?',
                content: `Bạn có chắc chắn muốn hủy đơn hàng #${orderId}? Thao tác này không thể hoàn tác.`,
                okText: 'Xác nhận hủy',
                cancelText: 'Giữ lại đơn',
                okType: 'danger',
                centered: true,
                onOk: async () => {
                    const res = await dispatch(cancelOrder(orderId))
                    if (cancelOrder.fulfilled.match(res)) {
                        message.success(`Đã hủy đơn hàng #${orderId} thành công!`)
                    } else {
                        /* API Error Modal will handle this */
                    }
                },
            })
        },
        [dispatch]
    )

    const handleReviewSuccess = useCallback((orderDetailId) => {
        setReviewedMap((prev) => ({
            ...prev,
            [orderDetailId]: true,
        }))
    }, [])

    // Khi BE đã lọc theo query ?status=..., myOrders chính là danh sách đã lọc.
    // Thêm fallback an toàn: nếu BE chưa kịp lọc ở server thì client tự lọc.
    const displayedOrders = useMemo(() => {
        if (!Array.isArray(myOrders)) return []
        if (selectedStatus === 'ALL') return myOrders
        const allMatch = myOrders.every(
            (o) => String(o.currentStatus || '').toLowerCase() === selectedStatus.toLowerCase()
        )
        if (allMatch) return myOrders
        return myOrders.filter(
            (o) => String(o.currentStatus || '').toLowerCase() === selectedStatus.toLowerCase()
        )
    }, [myOrders, selectedStatus])

    const currentTabInfo = ORDER_STATUS_TABS.find((t) => t.key === selectedStatus) || ORDER_STATUS_TABS[0]
    const pageNumbers = Array.from({ length: myOrdersTotalPages }, (_, i) => i + 1)

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Lịch sử đơn hàng</h1>
                    <p className="text-xs text-slate-500">Xem và theo dõi tình trạng các đơn hàng bạn đã đặt</p>
                </div>
                <LoadingLink
                    to="/"
                    className="inline-flex items-center gap-1.5 rounded-3xl bg-sky-800 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-900 transition-colors"
                >
                    <span>☕ Đặt món mới</span>
                </LoadingLink>
            </div>

            {/* Header Phân Loại Nhanh Các Trạng Thái Đơn Hàng (Sử dụng ORDER_STATUS_TABS từ utils) */}
            <div className="mb-6">
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/90 pb-4">
                    {ORDER_STATUS_TABS.map((tab) => {
                        const isActive = selectedStatus === tab.key
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleTabChange(tab.key)}
                                className={`group inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all shadow-2xs ${isActive
                                        ? 'bg-sky-800 text-white shadow-md shadow-sky-900/20 ring-2 ring-sky-800/30'
                                        : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:border-sky-300 hover:text-sky-900'
                                    }`}
                            >
                                {tab.dot && (
                                    <span
                                        className={`h-2 w-2 rounded-full transition-transform group-hover:scale-125 ${isActive ? 'bg-sky-300 ring-2 ring-white' : tab.dot
                                            }`}
                                    />
                                )}
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Loading skeleton */}
            {myOrdersLoading && (
                <div className="flex flex-col gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-44 animate-pulse rounded-3xl bg-slate-100" />
                    ))}
                </div>
            )}

            {/* Error state */}
            {!myOrdersLoading && myOrdersError && (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
                    <p className="text-sm font-semibold text-red-600">{myOrdersError}</p>
                    <button
                        type="button"
                        onClick={() => fetchOrders(page, selectedStatus)}
                        className="mt-3 rounded-3xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Empty state */}
            {!myOrdersLoading && !myOrdersError && displayedOrders.length === 0 && (
                <div className="flex flex-col items-center gap-3 rounded-3xl border border-slate-200 bg-white py-16 text-center shadow-xs">
                    <span className="text-5xl">{currentTabInfo.icon || '📦'}</span>
                    <h3 className="text-base font-bold text-slate-800">
                        {selectedStatus === 'ALL'
                            ? 'Bạn chưa có đơn hàng nào'
                            : `Không có đơn hàng nào "${currentTabInfo.label}"`}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xs">
                        {selectedStatus === 'ALL'
                            ? 'Các đơn hàng đã đặt của bạn sẽ xuất hiện tại đây cùng trạng thái giao hàng chi tiết.'
                            : `Hiện tại bạn không có đơn hàng nào thuộc trạng thái ${currentTabInfo.label.toLowerCase()}.`}
                    </p>
                    {selectedStatus !== 'ALL' ? (
                        <button
                            type="button"
                            onClick={() => handleTabChange('ALL')}
                            className="mt-3 inline-flex items-center gap-2 rounded-3xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                        >
                            <span>Xem tất cả đơn hàng</span>
                        </button>
                    ) : (
                        <LoadingLink
                            to="/"
                            className="mt-3 inline-flex items-center gap-2 rounded-3xl bg-sky-800 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-sky-900 transition-colors"
                        >
                            <span>Khám phá thực đơn ngay</span>
                        </LoadingLink>
                    )}
                </div>
            )}

            {/* Order list */}
            {!myOrdersLoading && !myOrdersError && displayedOrders.length > 0 && (
                <>
                    <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                        <span>
                            Trạng thái: <strong className="text-slate-800">{currentTabInfo.label}</strong> (
                            {displayedOrders.length} đơn hàng)
                        </span>
                        <span>Trang {page} / {myOrdersTotalPages}</span>
                    </div>

                    <div className="flex flex-col gap-4">
                        {displayedOrders.map((order) => (
                            <OrderCard
                                key={order.orderId}
                                order={order}
                                cancelling={cancelling}
                                onCancel={(id) => handleCancel(id)}
                                onReviewClick={(itemInfo) => setReviewTargetItem(itemInfo)}
                                reviewedMap={reviewedMap}
                            />
                        ))}
                    </div>

                    {/* Review Modal */}
                    <ReviewModal
                        open={Boolean(reviewTargetItem)}
                        item={reviewTargetItem}
                        onClose={() => setReviewTargetItem(null)}
                        onSuccess={handleReviewSuccess}
                    />

                    {/* Pagination */}
                    {myOrdersTotalPages > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-1.5">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="h-9 w-9 rounded-3xl border border-slate-200 bg-white text-sm font-bold text-slate-600 shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                ‹
                            </button>
                            {pageNumbers.map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => setPage(n)}
                                    className={`h-9 w-9 rounded-3xl text-xs font-bold transition-all shadow-2xs ${n === page
                                        ? 'bg-sky-800 text-white shadow-sm'
                                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    {n}
                                </button>
                            ))}
                            <button
                                type="button"
                                disabled={page >= myOrdersTotalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="h-9 w-9 rounded-3xl border border-slate-200 bg-white text-sm font-bold text-slate-600 shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                ›
                            </button>
                        </div>
                    )}
                    <AppPagination
                        current={page}
                        pageSize={10}
                        total={myOrdersTotal}
                        totalPages={myOrdersTotalPages}
                        onChange={setPage}
                        border={false}
                        className="mt-8"
                    />
                </>
            )}
        </div>
    )
}
