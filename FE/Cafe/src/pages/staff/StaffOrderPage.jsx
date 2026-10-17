import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Tooltip } from 'antd'
import {
    fetchAdminOrders,
    updateAdminOrderStatus,
} from '../../redux/actions/admin/adminOrderAction'
import {
    OrderStatus,
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
    LoadingOutlined
} from '@ant-design/icons'

const STAFF_TABS = [
    { key: OrderStatus.PENDING, label: 'Chờ xác nhận', icon: '⏳' },
    { key: OrderStatus.CONFIRMED, label: 'Đã nhận đơn', icon: '✓' },
    { key: OrderStatus.PREPARING, label: 'Đang pha chế', icon: '☕' },
    { key: OrderStatus.DELIVERING, label: 'Đang giao', icon: '🛵' },
    { key: OrderStatus.COMPLETED, label: 'Hoàn thành', icon: '⭐' },
    { key: OrderStatus.CANCELLED, label: 'Đã hủy', icon: '✕' },
    { key: 'ALL', label: 'Tất cả đơn', icon: '📋' },
]

const APPLE_STATUS_STYLES = {
    PENDING: { label: 'Chờ xác nhận', bg: 'bg-[#0071E3]/10 text-[#0071E3] border-[#0071E3]/25', dot: 'bg-[#0071E3]' },
    CONFIRMED: { label: 'Đã nhận đơn', bg: 'bg-[#007AFF]/10 text-[#0062CC] border-[#007AFF]/25', dot: 'bg-[#007AFF]' },
    PREPARING: { label: 'Đang pha chế', bg: 'bg-[#AF52DE]/10 text-[#8E3EB9] border-[#AF52DE]/25', dot: 'bg-[#AF52DE]' },
    DELIVERING: { label: 'Đang giao', bg: 'bg-[#5856D6]/10 text-[#4745B8] border-[#5856D6]/25', dot: 'bg-[#5856D6]' },
    COMPLETED: { label: 'Hoàn thành', bg: 'bg-[#34C759]/10 text-[#248A3D] border-[#34C759]/25', dot: 'bg-[#34C759]' },
    CANCELLED: { label: 'Đã hủy', bg: 'bg-[#8E8E93]/10 text-[#636366] border-[#8E8E93]/25', dot: 'bg-[#8E8E93]' },
}

function getAppleStatus(status) {
    const key = String(status || 'PENDING').toUpperCase()
    return APPLE_STATUS_STYLES[key] || APPLE_STATUS_STYLES.PENDING
}

function formatOrderRelativeTime(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diffMin = Math.floor((now - d) / 60000)
    if (diffMin < 1) return 'Vừa đặt'
    if (diffMin < 60) return `${diffMin} phút trước`
    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `${diffHours} giờ trước`
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

export default function StaffOrderPage() {
    const dispatch = useDispatch()
    const { items: orders, total, totalPages, loading } = useSelector((s) => s.admin.order)

    const [activeTab, setActiveTab] = useState(OrderStatus.PENDING)
    const [pageNumber, setPageNumber] = useState(1)
    const [keyword, setKeyword] = useState('')
    const [selectedOrderId, setSelectedOrderId] = useState(null)
    const [updatingOrderId, setUpdatingOrderId] = useState(null)

    // Cancel modal state
    const [cancellingOrderId, setCancellingOrderId] = useState(null)
    const [cancelModalLoading, setCancelModalLoading] = useState(false)

    const PAGE_SIZE = 12

    const fetchOrders = useCallback(() => {
        const statusParam = activeTab !== 'ALL' ? activeTab : undefined

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
        const isPaid = String(order.paymentStatus || '').toUpperCase() === 'PAID'
        const isCod = String(order.paymentMethod || 'COD').toUpperCase() === 'COD'
        const isOnlineUnpaid = !isCod && !isPaid

        if (status === OrderStatus.PENDING) {
            return (
                <div className="flex items-center gap-2 mt-3.5 pt-3 border-t border-black/[0.04]">
                    <Tooltip title={isOnlineUnpaid ? 'Đơn thanh toán online chưa hoàn tất thanh toán, không thể nhận đơn' : ''}>
                        <button
                            type="button"
                            disabled={isUpdating || isOnlineUnpaid}
                            onClick={() => handleQuickUpdateStatus(orderId, OrderStatus.CONFIRMED)}
                            className="flex-1 py-2.5 px-4 bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.97] text-white font-semibold text-xs sm:text-sm rounded-[16px] shadow-[0_2px_10px_rgba(0,113,227,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? <LoadingOutlined /> : <CheckOutlined />}
                            <span>Nhận đơn</span>
                        </button>
                    </Tooltip>
                    <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => setCancellingOrderId(orderId)}
                        className="py-2.5 px-3.5 bg-[#FF3B30]/10 hover:bg-[#FF3B30]/15 active:scale-[0.97] text-[#FF3B30] font-semibold text-xs sm:text-sm rounded-[16px] transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                        <CloseOutlined />
                        <span>Từ chối</span>
                    </button>
                </div>
            )
        }

        if (status === OrderStatus.CONFIRMED) {
            return (
                <div className="flex items-center gap-2 mt-3.5 pt-3 border-t border-black/[0.04]">
                    <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleQuickUpdateStatus(orderId, OrderStatus.PREPARING)}
                        className="flex-1 py-2.5 px-4 bg-[#AF52DE] hover:bg-[#A343D5] active:scale-[0.97] text-white font-semibold text-xs sm:text-sm rounded-[16px] shadow-[0_2px_10px_rgba(175,82,222,0.22)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {isUpdating ? <LoadingOutlined /> : <CoffeeOutlined />}
                        <span>Bắt đầu pha chế</span>
                    </button>
                    <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => setCancellingOrderId(orderId)}
                        className="w-10 h-10 flex items-center justify-center bg-black/[0.04] hover:bg-[#FF3B30]/10 text-[#86868B] hover:text-[#FF3B30] rounded-[16px] active:scale-[0.97] transition-all cursor-pointer"
                        title="Hủy đơn"
                    >
                        <CloseOutlined />
                    </button>
                </div>
            )
        }

        if (status === OrderStatus.PREPARING) {
            return (
                <div className="flex items-center gap-2 mt-3.5 pt-3 border-t border-black/[0.04]">
                    <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleQuickUpdateStatus(orderId, OrderStatus.DELIVERING)}
                        className="flex-1 py-2.5 px-4 bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.97] text-white font-semibold text-xs sm:text-sm rounded-[16px] shadow-[0_2px_10px_rgba(0,113,227,0.22)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {isUpdating ? <LoadingOutlined /> : <CarOutlined />}
                        <span>Món xong / Giao hàng</span>
                    </button>
                    <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => setCancellingOrderId(orderId)}
                        className="w-10 h-10 flex items-center justify-center bg-black/[0.04] hover:bg-[#FF3B30]/10 text-[#86868B] hover:text-[#FF3B30] rounded-[16px] active:scale-[0.97] transition-all cursor-pointer"
                        title="Hủy đơn"
                    >
                        <CloseOutlined />
                    </button>
                </div>
            )
        }

        if (status === OrderStatus.DELIVERING) {
            return (
                <div className="mt-3.5 pt-3 border-t border-black/[0.04]">
                    <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleQuickUpdateStatus(orderId, OrderStatus.COMPLETED)}
                        className="w-full py-2.5 px-4 bg-[#30B0C7] hover:bg-[#289EB3] active:scale-[0.97] text-white font-semibold text-xs sm:text-sm rounded-[16px] shadow-[0_2px_10px_rgba(48,176,199,0.22)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {isUpdating ? <LoadingOutlined /> : <CheckCircleOutlined />}
                        <span>Đã hoàn thành đơn</span>
                    </button>
                </div>
            )
        }

        return (
            <div className="mt-3.5 pt-3 border-t border-black/[0.04] flex items-center justify-between text-xs text-[#86868B]">
                <span className="font-medium">
                    {status === OrderStatus.COMPLETED ? '✓ Đơn đã hoàn tất' : '✕ Đơn đã kết thúc'}
                </span>
                <button
                    type="button"
                    onClick={() => setSelectedOrderId(orderId)}
                    className="text-[#0071E3] hover:text-[#0077ED] font-semibold hover:underline cursor-pointer flex items-center gap-1"
                >
                    <EyeOutlined /> Chi tiết
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-5">
            {/* Header Control Panel - Apple Card */}
            <div className="rounded-[26px] bg-white/80 backdrop-blur-2xl p-5 sm:p-6 border border-black/[0.05] shadow-[0_2px_16px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight flex items-center gap-3">
                        <span>Quản lý & Nhận Đơn hàng</span>
                        <button
                            type="button"
                            onClick={fetchOrders}
                            className="w-8 h-8 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#1D1D1F] flex items-center justify-center transition-all cursor-pointer"
                            title="Tải lại danh sách"
                        >
                            <SyncOutlined spin={loading} className="text-sm" />
                        </button>
                        {total > 0 && (
                            <span className="text-xs font-bold text-[#0071E3] bg-[#0071E3]/10 border border-[#0071E3]/20 px-3 py-1 rounded-full">
                                {total} đơn
                            </span>
                        )}
                    </h1>
                    <p className="text-xs sm:text-sm text-[#86868B] mt-1 font-normal">
                        Theo dõi tiến độ đơn, bấm nhận đơn và hoàn tất pha chế tại quầy
                    </p>
                </div>

                <div className="w-full md:w-80">
                    <AppSearchBox
                        placeholder="Tìm mã đơn, tên, SĐT..."
                        initialValue={keyword}
                        onSearch={(val) => {
                            setKeyword(val)
                            setPageNumber(1)
                        }}
                    />
                </div>
            </div>

            {/* Apple Segmented Control for Status Tabs */}
            <div className="p-1 bg-[#E5E5EA]/80 rounded-[20px] inline-flex items-center gap-1 overflow-x-auto max-w-full no-scrollbar shadow-2xs">
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
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[16px] text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 select-none cursor-pointer ${
                                isActive
                                    ? 'bg-white text-[#0071E3] font-bold shadow-[0_2px_8px_rgba(0,113,227,0.12)] border border-[#0071E3]/15'
                                    : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-white/40'
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
                <div className="flex h-64 items-center justify-center rounded-[26px] bg-white border border-black/[0.05]">
                    <div className="flex flex-col items-center gap-2 text-[#86868B]">
                        <SyncOutlined spin className="text-3xl text-[#0071E3]" />
                        <span className="text-sm font-medium">Đang tải danh sách đơn hàng...</span>
                    </div>
                </div>
            ) : orders.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-[26px] bg-white border border-black/[0.05] p-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-blue-50 text-[#0071E3] text-3xl mb-3">
                        ☕
                    </div>
                    <h3 className="text-base font-bold text-[#1D1D1F]">Hiện không có đơn nào trong mục này</h3>
                    <p className="text-xs text-[#86868B] mt-1 max-w-sm">
                        Khi khách đặt món mới qua ứng dụng, đơn sẽ tự động xuất hiện tại đây theo thời gian thực.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4.5">
                    {orders.map((order) => {
                        const orderId = order.orderId ?? order.id
                        const status = (order.currentStatus || order.status || 'PENDING').toUpperCase()
                        const appleStatus = getAppleStatus(status)
                        const isPaid = String(order.paymentStatus || '').toUpperCase() === 'PAID'
                        const paymentMethod = String(order.paymentMethod || 'COD').toUpperCase()
                        const isCod = paymentMethod === 'COD'
                        const items = order.orderItems || order.items || []
                        const isPending = status === OrderStatus.PENDING

                        return (
                            <div
                                key={orderId}
                                className={`rounded-[26px] bg-white p-5 border transition-all duration-300 flex flex-col justify-between group ${
                                    isPending
                                        ? 'border-[#0071E3]/35 ring-2 ring-[#0071E3]/15 shadow-[0_4px_24px_rgba(0,113,227,0.08)]'
                                        : 'border-black/[0.05] shadow-[0_2px_14px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(0,113,227,0.08)] hover:border-[#0071E3]/30'
                                }`}
                            >
                                {/* Card Header */}
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-3.5">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-base font-extrabold text-[#1D1D1F] tracking-tight">
                                                #{orderId}
                                            </span>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border ${appleStatus.bg}`}>
                                                <span className={`h-2 w-2 rounded-full ${appleStatus.dot} ${isPending ? 'animate-pulse' : ''}`}></span>
                                                {appleStatus.label}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedOrderId(orderId)}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/[0.04] hover:bg-black/[0.08] text-[#1D1D1F] transition-colors cursor-pointer"
                                            title="Xem toàn bộ chi tiết đơn"
                                        >
                                            <EyeOutlined className="text-sm" />
                                        </button>
                                    </div>

                                    {/* Customer & Info Card (Apple subtle inset container) */}
                                    <div className="text-xs text-[#1D1D1F] space-y-2 mb-3.5 bg-[#F9F9FB] p-3.5 rounded-[20px] border border-black/[0.03]">
                                        <div className="flex items-center justify-between gap-1.5">
                                            <div className="flex items-center gap-1.5 font-bold truncate">
                                                <UserOutlined className="text-[#86868B] text-xs shrink-0" />
                                                <span className="truncate">{order.userName || order.receiverName || 'Khách đặt'}</span>
                                            </div>
                                            {(order.userPhone || order.receiverPhone) && (
                                                <a
                                                    href={`tel:${order.userPhone || order.receiverPhone}`}
                                                    className="inline-flex items-center gap-1 font-semibold text-[#0071E3] hover:underline shrink-0"
                                                >
                                                    <PhoneOutlined className="text-[10px]" />
                                                    <span>{order.userPhone || order.receiverPhone}</span>
                                                </a>
                                            )}
                                        </div>

                                        {(order.shippingAddress || order.deliveryAddress) && (
                                            <div
                                                className="flex items-start gap-1.5 text-[11px] text-[#86868B] line-clamp-1 font-normal"
                                                title={order.shippingAddress || order.deliveryAddress}
                                            >
                                                <EnvironmentOutlined className="text-[#86868B] shrink-0 mt-0.5" />
                                                <span className="truncate">{order.shippingAddress || order.deliveryAddress}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between text-xs pt-2 border-t border-black/[0.04]">
                                            <div className="flex items-center gap-1 text-[11px] text-[#86868B]">
                                                <ClockCircleOutlined />
                                                <span>{formatOrderRelativeTime(order.orderDate || order.createdAt)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isCod ? (
                                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                                        isPaid ? 'bg-[#34C759]/10 text-[#248A3D] border-[#34C759]/25' : 'bg-[#FF9500]/10 text-[#C97700] border-[#FF9500]/25'
                                                    }`}>
                                                        {isPaid ? 'COD • Đã thanh toán' : 'Thu tiền (COD)'}
                                                    </span>
                                                ) : (
                                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                                        isPaid ? 'bg-[#34C759]/10 text-[#248A3D] border-[#34C759]/25' : 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/25'
                                                    }`}>
                                                        {paymentMethod} • {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                                    </span>
                                                )}
                                                <span className="font-extrabold text-[#1D1D1F] text-sm">
                                                    {Number(order.totalAmount || order.total || 0).toLocaleString('vi-VN')}đ
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items Preview */}
                                    <div className="space-y-1.5">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] flex items-center justify-between">
                                            <span>Món đặt {items.length > 0 ? `(${items.length})` : ''}</span>
                                            {items.length > 3 && (
                                                <span className="text-[10px] text-[#0071E3] font-semibold lowercase">
                                                    +{items.length - 3} món nữa
                                                </span>
                                            )}
                                        </div>
                                        {items.length > 0 ? (
                                            <div className="max-h-32 overflow-y-auto no-scrollbar space-y-1 bg-white">
                                                {items.slice(0, 3).map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                                                        <div className="flex items-center gap-1.5 truncate">
                                                            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 bg-black/[0.05] text-[#1D1D1F] text-[11px] font-bold rounded-[7px] shrink-0">
                                                                {item.quantity}x
                                                            </span>
                                                            <span className="truncate font-medium text-[#1D1D1F]">
                                                                {item.productName || item.name}
                                                            </span>
                                                        </div>
                                                        {item.sizeName && (
                                                            <span className="text-[10px] font-semibold text-[#86868B] bg-black/[0.04] px-1.5 py-0.5 rounded-md ml-1 shrink-0">
                                                                {item.sizeName}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setSelectedOrderId(orderId)}
                                                className="w-full text-left py-2 px-3 rounded-[14px] bg-[#F9F9FB] hover:bg-black/[0.04] text-[11px] text-[#0071E3] font-medium flex items-center justify-between transition-colors cursor-pointer border border-black/[0.03]"
                                            >
                                                <span>Xem chi tiết danh sách món</span>
                                                <span className="text-xs font-semibold text-[#0071E3]/70">→</span>
                                            </button>
                                        )}
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

            {/* Pagination via AppPagination */}
            <div className="flex justify-center sm:justify-end pt-4 pb-2">
                <AppPagination
                    current={pageNumber}
                    pageSize={PAGE_SIZE}
                    total={total}
                    totalPages={totalPages}
                    onChange={(p) => {
                        setPageNumber(p)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                />
            </div>

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
