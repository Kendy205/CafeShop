import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { message, Popconfirm, Tooltip } from 'antd'
import {
    fetchAdminOrders,
    fetchAdminOrderDetail,
    updateAdminOrderStatus,
} from '../../../redux/actions/admin/adminOrderAction'
import { clearAdminOrderDetail } from '../../../redux/slices/admin/adminOrderSlice'
import AppPagination from '../../../components/common/AppPagination'
import { STATUS_CONFIG, ORDER_STATUS_TABS, getStatusConfig } from '../../../utils/constants/OrderConstants'


import OrderDetailModal from '../../../components/admin/OrderAdmin/OrderDetailModal'
import OrderTableRow from '../../../components/admin/OrderAdmin/OrderTableRow'
import AdminPageBanner from '../../../components/admin/common/AdminPageBanner'
import AppSearchBox from '../../../components/common/AppSearchBox'
import { ShoppingCartOutlined, SyncOutlined } from '@ant-design/icons'
import { AppToast, AppConfirm } from '../../../components/common/AppNotification'


// ─── Trang chính AdminOrderPage ───────────────────────────────────────────────
export default function AdminOrderPage() {
    const dispatch = useDispatch()
    const { items: orders, total, totalPages, loading, error } = useSelector((s) => s.admin.order)

    const [pageNumber, setPageNumber] = useState(1)
    const [activeStatus, setActiveStatus] = useState('ALL')
    const [keyword, setKeyword] = useState('')
    const [selectedOrderId, setSelectedOrderId] = useState(null)
    const [updatingOrderId, setUpdatingOrderId] = useState(null)

    const PAGE_SIZE = 10

    const fetchOrders = useCallback(() => {
        dispatch(
            fetchAdminOrders({
                pageNumber,
                pageSize: PAGE_SIZE,
                status: activeStatus !== 'ALL' ? activeStatus : undefined,
                keyword: keyword.trim() || undefined,
            })
        )
    }, [dispatch, pageNumber, activeStatus, keyword])

    const handleQuickUpdateStatus = useCallback(async (orderId, targetStatus, cancelReason = null) => {
        try {
            setUpdatingOrderId(orderId)
            const res = await dispatch(updateAdminOrderStatus({ orderId, status: targetStatus, cancelReason }))
            if (updateAdminOrderStatus.fulfilled.match(res)) {
                AppToast.success(`Đã cập nhật đơn #${orderId} sang "${getStatusConfig(targetStatus).label}"`)
                fetchOrders()
            } else {
                /* API Error Modal will handle this */
            }
        } finally {
            setUpdatingOrderId(null)
        }
    }, [dispatch, fetchOrders])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    // Lắng nghe sự kiện Realtime khi có đơn hàng mới từ khách
    useEffect(() => {
        const handleNewOrder = () => {
            fetchOrders()
        }
        window.addEventListener('app:admin-new-order', handleNewOrder)
        return () => {
            window.removeEventListener('app:admin-new-order', handleNewOrder)
        }
    }, [fetchOrders])

    const handleTabChange = (tab) => {
        setActiveStatus(tab)
        setPageNumber(1)
    }

    return (
        <div className="space-y-6">
            {/* Page Header Banner */}
            <AdminPageBanner
                badge="Quản Lý Đơn Hàng Realtime"
                title="Đơn Hàng Khách Hàng"
                description="Theo dõi toàn bộ đơn hàng trực tuyến, duyệt đơn, điều phối pha chế và giao hàng tức thì."
                icon={<ShoppingCartOutlined className="text-sky-400 text-xl" />}
                extra={
                    <button
                        onClick={fetchOrders}
                        className="flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer backdrop-blur-md shadow-xs active:scale-95"
                    >
                        <SyncOutlined spin={loading} className="text-sky-300" />
                        <span>Làm mới danh sách</span>
                    </button>
                }
                stats={
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-xs">
                        <span className="text-slate-300 font-medium">Tổng số đơn:</span>
                        <strong className="text-white text-sm font-black">{total}</strong>
                    </div>
                }
            />

            {/* Toolbar: Search & Filter Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 shadow-xs">
                <AppSearchBox
                    initialValue={keyword}
                    placeholder="Tìm theo tên khách hàng, số điện thoại, mã đơn..."
                    onSearch={(val) => { setKeyword(val); setPageNumber(1); }}
                    className="flex-1 min-w-[220px] max-w-md"
                />

                <div className="flex flex-wrap gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {ORDER_STATUS_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={`rounded-2xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${activeStatus === tab.key
                                ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                                : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 border border-transparent'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-xs text-red-600">
                    ⚠️ {error}
                </div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-bold uppercase tracking-wide text-slate-500">
                                <th className="px-5 py-3.5 text-left">Mã đơn</th>
                                <th className="px-5 py-3.5 text-left">Khách hàng</th>
                                <th className="px-5 py-3.5 text-left">Thời gian</th>
                                <th className="px-5 py-3.5 text-right">Tổng tiền</th>
                                <th className="px-5 py-3.5 text-center">Trạng thái</th>
                                <th className="px-5 py-3.5 text-center">Cập nhật</th>
                                <th className="px-5 py-3.5 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 7 }).map((__, j) => (
                                            <td key={j} className="px-5 py-4">
                                                <div className="h-4 rounded-2xl bg-slate-100 animate-pulse" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center text-slate-400">
                                        <span className="text-3xl block mb-2">📭</span>
                                        <span className="text-sm font-medium">Không có đơn hàng nào</span>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <OrderTableRow
                                        key={order.orderId}
                                        order={order}
                                        onSelectOrder={setSelectedOrderId}
                                        onUpdateStatus={handleQuickUpdateStatus}
                                        isUpdating={updatingOrderId === order.orderId}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <AppPagination
                current={pageNumber}
                pageSize={PAGE_SIZE}
                total={total}
                totalPages={totalPages}
                onChange={setPageNumber}
                border={false}
                className="mt-4"
            />

            {/* Modal chi tiết */}
            {selectedOrderId && (
                <OrderDetailModal
                    orderId={selectedOrderId}
                    onClose={() => setSelectedOrderId(null)}
                    onStatusUpdated={fetchOrders}
                />
            )}
        </div>
    )
}
