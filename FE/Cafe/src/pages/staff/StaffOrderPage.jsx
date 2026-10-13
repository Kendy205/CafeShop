import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Tooltip } from 'antd'
import {
    fetchAdminOrders,
    updateAdminOrderStatus,
} from '../../redux/actions/admin/adminOrderAction'
import {
    OrderStatus,
    STATUS_CONFIG,
    getStatusConfig,
    NEXT_STATUSES,
    canCancelOrder,
} from '../../utils/constants/OrderConstants'
import { AppToast } from '../../components/common/AppNotification'
import OrderDetailModal from '../../components/admin/OrderAdmin/OrderDetailModal'
import CancelReasonModal from '../../components/admin/OrderAdmin/CancelReasonModal'
import AppSearchBox from '../../components/common/AppSearchBox'
import AppPagination from '../../components/common/AppPagination'
import {
    SyncOutlined,
    ClockCircleOutlined,
    CheckOutlined,
    CloseOutlined,
    CoffeeOutlined,
    CarOutlined,
    CheckCircleOutlined,
    EyeOutlined,
    UserOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    DollarOutlined
} from '@ant-design/icons'

const STAFF_TABS = [
    { key: 'ACTIVE', label: 'Cần làm ngay', icon: '⚡' },
    { key: OrderStatus.PENDING, label: 'Chờ xác nhận', icon: '⏳' },
    { key: OrderStatus.CONFIRMED, label: 'Đã nhận đơn', icon: '✓' },
    { key: OrderStatus.PREPARING, label: 'Đang pha chế', icon: '☕' },
    { key: OrderStatus.DELIVERING, label: 'Đang giao', icon: '🛵' },
    { key: OrderStatus.COMPLETED, label: 'Hoàn thành', icon: '⭐' },
    { key: OrderStatus.CANCELLED, label: 'Đã hủy', icon: '✕' },
    { key: 'ALL', label: 'Tất cả đơn', icon: '📋' },
]

export default function StaffOrderPage() {
    const dispatch = useDispatch()
    const { items: orders, total, totalPages, loading } = useSelector((s) => s.admin.order)

    const [activeTab, setActiveTab] = useState('ACTIVE')
    const [pageNumber, setPageNumber] = useState(1)
    const [keyword, setKeyword] = useState('')
    const [selectedOrderId, setSelectedOrderId] = useState(null)
    const [updatingOrderId, setUpdatingOrderId] = useState(null)

    // Cancel modal state
    const [cancellingOrderId, setCancellingOrderId] = useState(null)
    const [cancelModalLoading, setCancelModalLoading] = useState(false)

    const PAGE_SIZE = 12

    const fetchOrders = useCallback(() => {
        let statusParam = undefined
        if (activeTab === 'ACTIVE') {
            // Cho active tab, có thể load PENDING hoặc fetch chung
            statusParam = undefined
        } else if (activeTab !== 'ALL') {
            statusParam = activeTab
        }

        dispatch(
            fetchAdminOrders({
                pageNumber,
                pageSize: PAGE_SIZE,
                status: statusParam,
                keyword: keyword.trim() || undefined,
            })
        )
    }, [dispatch, pageNumber, activeTab, keyword])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    // Lắng nghe realtime khi có đơn mới
    useEffect(() => {
        const handleNewOrder = () => {
            fetchOrders()
        }
        window.addEventListener('app:admin-new-order', handleNewOrder)
        return () => {
            window.removeEventListener('app:admin-new-order', handleNewOrder)
        }
    }, [fetchOrders])

    // Lọc đơn hàng cho tab 'ACTIVE' (PENDING, CONFIRMED, PREPARING, DELIVERING)
    const displayedOrders = activeTab === 'ACTIVE'
        ? orders.filter(o => ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING'].includes((o.currentStatus || o.status || '').toUpperCase()))
        : orders

    const handleQuickUpdateStatus = async (orderId, targetStatus, cancelReason = null) => {
        try {
            setUpdatingOrderId(orderId)
            const res = await dispatch(updateAdminOrderStatus({ orderId, status: targetStatus, cancelReason }))
            if (updateAdminOrderStatus.fulfilled.match(res)) {
                AppToast.success(`Đã chuyển đơn #${orderId} sang "${getStatusConfig(targetStatus).label}"`)
                fetchOrders()
            }
        } finally {
            setUpdatingOrderId(null)
        }
    }

    const handleConfirmCancel = async (reason) => {
        if (!cancellingOrderId) return
        try {
            setCancelModalLoading(true)
            await handleQuickUpdateStatus(cancellingOrderId, OrderStatus.CANCELLED, reason)
            setCancellingOrderId(null)
        } finally {
            setCancelModalLoading(false)
        }
    }

    const renderActionButtons = (order) => {
        const orderId = order.orderId ?? order.id
        const status = (order.currentStatus || order.status || '').toUpperCase()
        const isUpdating = updatingOrderId === orderId

        if (status === OrderStatus.PENDING) {
            return (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                    <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleQuickUpdateStatus(orderId, OrderStatus.CONFIRMED)}
                        className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                        <CheckOutlined /> Nhận đơn
                    </button>
                    <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => setCancellingOrderId(orderId)}
                        className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                        <CloseOutlined /> Từ chối
                    </button>
                </div>
            )
        }

        if (status === OrderStatus.CONFIRMED) {
            return (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                    <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleQuickUpdateStatus(orderId, OrderStatus.PREPARING)}
                        className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                        <CoffeeOutlined /> Bắt đầu pha chế
                    </button>
                    <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => setCancellingOrderId(orderId)}
                        className="py-2 px-2.5 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                        title="Hủy đơn"
                    >
                        <CloseOutlined />
                    </button>
                </div>
            )
        }

        if (status === OrderStatus.PREPARING) {
            return (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                    <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleQuickUpdateStatus(orderId, OrderStatus.DELIVERING)}
                        className="flex-1 py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                        <CarOutlined /> Món xong / Giao hàng
                    </button>
                    <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => setCancellingOrderId(orderId)}
                        className="py-2 px-2.5 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                        title="Hủy đơn"
                    >
                        <CloseOutlined />
                    </button>
                </div>
            )
        }

        if (status === OrderStatus.DELIVERING) {
            return (
                <div className="mt-3 pt-3 border-t border-slate-100">
                    <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleQuickUpdateStatus(orderId, OrderStatus.COMPLETED)}
                        className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                        <CheckCircleOutlined /> Đã hoàn thành đơn
                    </button>
                </div>
            )
        }

        return (
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>{status === OrderStatus.COMPLETED ? 'Đơn đã giao thành công' : 'Đơn đã kết thúc'}</span>
                <button
                    type="button"
                    onClick={() => setSelectedOrderId(orderId)}
                    className="text-sky-600 hover:underline font-semibold"
                >
                    Chi tiết
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header Control Panel */}
            <div className="rounded-3xl bg-white p-4 sm:p-5 shadow-sm border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <span>Quản lý & Nhận Đơn hàng</span>
                        <button
                            type="button"
                            onClick={fetchOrders}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                            title="Tải lại danh sách"
                        >
                            <SyncOutlined spin={loading} className="text-base" />
                        </button>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        Theo dõi tiến độ đơn, bấm nhận đơn và hoàn tất pha chế tại quầy
                    </p>
                </div>

                <div className="w-full sm:w-72">
                    <AppSearchBox
                        placeholder="Tìm mã đơn, tên, SĐT..."
                        value={keyword}
                        onChange={(e) => {
                            setKeyword(e.target.value)
                            setPageNumber(1)
                        }}
                    />
                </div>
            </div>

            {/* Status Tabs Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {STAFF_TABS.map((tab) => {
                    const isActive = activeTab === tab.key
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => {
                                setActiveTab(tab.key)
                                setPageNumber(1)
                            }}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                                isActive
                                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-[1.02]'
                                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                            }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* Orders Grid / Cards */}
            {loading && orders.length === 0 ? (
                <div className="flex h-64 items-center justify-center rounded-3xl bg-white border border-slate-200/60">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                        <SyncOutlined spin className="text-3xl text-amber-500" />
                        <span className="text-sm font-medium">Đang tải danh sách đơn hàng...</span>
                    </div>
                </div>
            ) : displayedOrders.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-3xl bg-white border border-slate-200/60 p-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 text-3xl mb-3">
                        ☕
                    </div>
                    <h3 className="text-base font-bold text-slate-800">Hiện không có đơn nào trong mục này</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                        Khi khách đặt món mới qua ứng dụng, đơn sẽ tự động xuất hiện tại đây theo thời gian thực.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {displayedOrders.map((order) => {
                        const orderId = order.orderId ?? order.id
                        const status = (order.currentStatus || order.status || 'PENDING').toUpperCase()
                        const statusConfig = getStatusConfig(status)
                        const items = order.orderItems || order.items || []
                        const isUpdating = updatingOrderId === orderId

                        return (
                            <div
                                key={orderId}
                                className={`rounded-3xl bg-white p-4 border transition-all duration-200 flex flex-col justify-between ${
                                    status === OrderStatus.PENDING
                                        ? 'border-amber-300 ring-2 ring-amber-400/20 shadow-md shadow-amber-500/5'
                                        : 'border-slate-200/80 shadow-sm hover:shadow-md'
                                }`}
                            >
                                {/* Card Header */}
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-slate-900">#{orderId}</span>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusConfig.color}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}></span>
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedOrderId(orderId)}
                                            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                            title="Xem toàn bộ chi tiết"
                                        >
                                            <EyeOutlined />
                                        </button>
                                    </div>

                                    {/* Customer brief */}
                                    <div className="text-xs text-slate-600 space-y-1 mb-3 bg-slate-50/80 p-2.5 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                            <UserOutlined className="text-slate-400 text-xs" />
                                            <span className="truncate">{order.userName || order.receiverName || 'Khách đặt'}</span>
                                            {(order.userPhone || order.receiverPhone) && (
                                                <span className="text-slate-500 font-normal">({order.userPhone || order.receiverPhone})</span>
                                            )}
                                        </div>
                                        {(order.shippingAddress || order.deliveryAddress) && (
                                            <div className="flex items-start gap-1.5 text-[11px] text-slate-500 line-clamp-1" title={order.shippingAddress || order.deliveryAddress}>
                                                <EnvironmentOutlined className="text-slate-400 shrink-0 mt-0.5" />
                                                <span>{order.shippingAddress || order.deliveryAddress}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                                            <span>{order.orderDate || order.createdAt ? new Date(order.orderDate || order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                            <span className="font-bold text-amber-700">
                                                {Number(order.totalAmount || order.total || 0).toLocaleString('vi-VN')}đ
                                            </span>
                                        </div>
                                    </div>

                                    {/* Items Preview */}
                                    <div className="space-y-1.5">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Món đặt ({items.length || order.itemCount || 1})
                                        </div>
                                        <div className="max-h-28 overflow-y-auto no-scrollbar space-y-1">
                                            {items.slice(0, 3).map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-xs text-slate-700">
                                                    <span className="truncate font-medium">
                                                        <span className="font-bold text-amber-600 mr-1">{item.quantity}x</span>
                                                        {item.productName || item.name}
                                                    </span>
                                                    {item.sizeName && (
                                                        <span className="text-[10px] text-slate-400 bg-slate-100 px-1 rounded ml-1 shrink-0">
                                                            {item.sizeName}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                            {items.length > 3 && (
                                                <div className="text-[11px] text-slate-400 italic">
                                                    + {items.length - 3} món khác...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div>
                                    {renderActionButtons(order)}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Pagination if multiple pages */}
            {totalPages > 1 && (
                <div className="flex justify-end pt-2">
                    <AppPagination
                        currentPage={pageNumber}
                        totalPages={totalPages}
                        onPageChange={setPageNumber}
                    />
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrderId && (
                <OrderDetailModal
                    orderId={selectedOrderId}
                    onClose={() => setSelectedOrderId(null)}
                    onStatusUpdated={fetchOrders}
                />
            )}

            {/* Cancel Reason Modal */}
            {cancellingOrderId && (
                <CancelReasonModal
                    orderId={cancellingOrderId}
                    onConfirm={handleConfirmCancel}
                    onClose={() => setCancellingOrderId(null)}
                    isLoading={cancelModalLoading}
                />
            )}
        </div>
    )
}
