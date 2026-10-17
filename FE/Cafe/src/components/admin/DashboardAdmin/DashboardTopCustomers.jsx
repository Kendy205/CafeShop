import { Link } from 'react-router-dom'
import { 
    CrownOutlined, 
    FileTextOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    ClockCircleOutlined,
    CreditCardOutlined
} from '@ant-design/icons'
import { formatVnd } from '../../../utils/helpers/format'
import { useState } from 'react'
import { Modal, Pagination, Spin } from 'antd'
import { adminOrderService } from '../../../services/admin/AdminOrderService'
import { unwrapApi, normalizePagedResult } from '../../../utils/helpers/api'
import AdminModalBanner from '../common/AdminModalBanner'

/**
 * DashboardTopCustomers Component
 * Danh sách hiển thị top khách hàng chi tiêu nhiều nhất hệ thống.
 * Đánh dấu rank (Hạng 1, 2, 3...) theo màu sắc và hiển thị tổng tiền đã chi.
 */
export default function DashboardTopCustomers({ topCustomers, dates }) {
    const rankColors = [
        'from-amber-400 to-amber-600 text-white shadow-amber-500/25',
        'from-slate-300 to-slate-500 text-white shadow-slate-400/25',
        'from-amber-600 to-orange-700 text-white shadow-orange-500/25',
    ]

    const [selectedUser, setSelectedUser] = useState(null)
    const [orders, setOrders] = useState([])
    const [loadingOrders, setLoadingOrders] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalOrders, setTotalOrders] = useState(0)

    const fetchCompletedOrders = async (userId, page = 1) => {
        setLoadingOrders(true)
        try {
            const params = { pageNumber: page, pageSize: 5 }
            if (dates && dates[0] && dates[1]) {
                params.startDate = dates[0].format('YYYY-MM-DD')
                params.endDate = dates[1].format('YYYY-MM-DD')
            }
            
            const res = await adminOrderService.getUserCompletedOrders(userId, params)
            const data = unwrapApi(res)
            const paged = normalizePagedResult(data, 5)
            
            setOrders(paged.items)
            setTotalOrders(paged.total)
            setCurrentPage(paged.page)
        } catch (error) {
            console.error('Failed to fetch orders:', error)
            setOrders([])
            setTotalOrders(0)
        } finally {
            setLoadingOrders(false)
        }
    }

    const handleCustomerClick = (customer) => {
        if (!customer || !customer.userId) return
        setSelectedUser(customer)
        fetchCompletedOrders(customer.userId, 1)
    }

    const handlePageChange = (page) => {
        if (selectedUser) {
            fetchCompletedOrders(selectedUser.userId, page)
        }
    }

    const handleCloseModal = () => {
        setSelectedUser(null)
        setOrders([])
    }

    return (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600 text-sm font-bold">
                        <CrownOutlined />
                    </span>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Top Khách Hàng Chi Tiêu</h3>
                </div>
                <Link 
                    to="/admin/users"
                    className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 transition-colors"
                >
                    Quản lý khách hàng →
                </Link>
            </div>

            <div className="flex flex-col gap-3">
                {topCustomers?.map((customer, idx) => {
                    const badgeClass = rankColors[idx] || 'from-sky-50 to-sky-100 text-sky-800 border border-sky-200'

                    return (
                        <div 
                            key={idx} 
                            onClick={() => handleCustomerClick(customer)}
                            className="group relative flex items-center gap-3 rounded-2xl border border-slate-100 p-3 bg-slate-50/70 hover:bg-white hover:border-sky-300 hover:shadow-md transition-all duration-300 cursor-pointer"
                        >
                            <div className="relative h-14 w-14 shrink-0">
                                <div className={`absolute -left-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${badgeClass} text-[10px] font-black shadow-md`}>
                                    #{idx + 1}
                                </div>
                                <img 
                                    src={customer.avatarUrl || 'https://placehold.co/150x150?text=Avatar'} 
                                    alt={customer.fullName || customer.username} 
                                    className="h-full w-full rounded-full object-cover border border-slate-200 bg-white"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-black text-slate-800 truncate text-sm group-hover:text-sky-700 transition-colors" title={customer.fullName || customer.username}>
                                    {customer.fullName || customer.username}
                                </h4>
                                <p className="text-[11px] text-slate-500 font-medium truncate mb-1">@{customer.username}</p>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="inline-flex items-center rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 shadow-2xs">
                                        Số đơn: <strong className="text-sky-600 ml-1">{customer.totalOrders}</strong>
                                    </span>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-[10px] uppercase font-bold text-slate-400">Đã chi</p>
                                <p className="font-black text-slate-800 text-sm">{formatVnd(customer.totalSpent)}</p>
                            </div>
                        </div>
                    )
                })}

                {(!topCustomers || topCustomers.length === 0) && (
                    <div className="col-span-full py-8 text-center text-slate-400 italic text-xs">
                        Không có dữ liệu khách hàng trong khoảng thời gian này
                    </div>
                )}
            </div>

            <Modal
                open={!!selectedUser}
                onCancel={handleCloseModal}
                footer={null}
                width={640}
                centered
                destroyOnClose
                className="custom-admin-modal"
                closeIcon={null}
            >
                <AdminModalBanner 
                    title="Đơn Hàng Đã Hoàn Thành"
                    subtitle={`Khách hàng: ${selectedUser?.fullName || selectedUser?.username || '—'} (@${selectedUser?.username || ''})`}
                    icon={<FileTextOutlined className="text-2xl text-white" />}
                    badgeText={`${totalOrders} ĐƠN HOÀN THÀNH`}
                    onClose={handleCloseModal}
                />

                <div className="p-6">
                    {loadingOrders ? (
                        <div className="flex justify-center items-center py-16">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.length === 0 ? (
                                <div className="text-center text-slate-500 py-10 bg-slate-50 rounded-2xl border border-slate-100 font-medium text-sm">
                                    Không tìm thấy đơn hàng hoàn thành nào trong khoảng thời gian này.
                                </div>
                            ) : (
                                <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar">
                                    {orders.map(order => {
                                        const isVnpay = order.paymentMethod?.toUpperCase() === 'VNPAY'
                                        const totalDiscount = (order.orderDiscount || 0) + (order.shippingDiscount || 0)

                                        return (
                                            <div 
                                                key={order.orderId} 
                                                className="group relative flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 transition-all duration-200 hover:border-sky-300 hover:shadow-md"
                                            >
                                                {/* Header: Mã đơn, Trạng thái, Phương thức & Thời gian */}
                                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-2.5 py-0.5 text-xs font-black tracking-wide text-white shadow-2xs">
                                                            #{order.orderId}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            Đã hoàn thành
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold ${
                                                            isVnpay 
                                                                ? 'border-blue-200 bg-blue-50 text-blue-700' 
                                                                : 'border-amber-200 bg-amber-50 text-amber-800'
                                                        }`}>
                                                            <CreditCardOutlined className="text-[10px]" />
                                                            {order.paymentMethod || 'COD'}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
                                                            <ClockCircleOutlined className="text-[11px]" />
                                                            {new Date(order.orderDate).toLocaleString('vi-VN', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Delivery Info */}
                                                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-2 text-xs">
                                                    <div className="flex items-start gap-2">
                                                        <EnvironmentOutlined className="mt-0.5 text-sky-500 shrink-0 text-sm" />
                                                        <div className="flex-1 text-slate-700">
                                                            <span className="font-semibold text-slate-800">{order.shippingAddress}</span>
                                                            {order.distanceKm != null && (
                                                                <span className="ml-2 inline-flex items-center rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-600 border border-sky-100">
                                                                    {order.distanceKm} km
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <PhoneOutlined className="text-slate-400 shrink-0 text-xs" />
                                                        <span>Người nhận: <strong className="text-slate-800 font-semibold">{order.userPhone || '—'}</strong></span>
                                                    </div>

                                                    {order.note && (
                                                        <div className="flex items-start gap-1.5 rounded-lg border border-amber-200/60 bg-amber-50/80 px-2.5 py-1.5 text-xs text-amber-800">
                                                            <span className="font-bold shrink-0">Ghi chú:</span>
                                                            <span className="italic">{order.note}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Footer: Chi tiết tiền & Tổng thanh toán */}
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100/80">
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                                        <span>Tạm tính: <strong className="text-slate-700 font-semibold">{formatVnd(order.subTotal || 0)}</strong></span>
                                                        <span className="text-slate-300">•</span>
                                                        <span>Phí giao: <strong className="text-slate-700 font-semibold">{formatVnd(order.shippingFee || 0)}</strong></span>
                                                        {totalDiscount > 0 && (
                                                            <>
                                                                <span className="text-slate-300">•</span>
                                                                <span className="text-emerald-600 font-semibold">
                                                                    Giảm: -{formatVnd(totalDiscount)}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="flex items-baseline justify-end gap-1.5">
                                                        <span className="text-[11px] font-bold uppercase text-slate-400">Thành tiền:</span>
                                                        <span className="text-lg font-black text-sky-600">{formatVnd(order.totalAmount || 0)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {totalOrders > 0 && (
                                <div className="flex justify-end pt-3 border-t border-slate-100">
                                    <Pagination 
                                        current={currentPage} 
                                        total={totalOrders} 
                                        pageSize={5} 
                                        onChange={handlePageChange}
                                        showSizeChanger={false}
                                        size="small"
                                        className="custom-admin-pagination"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    )
}
