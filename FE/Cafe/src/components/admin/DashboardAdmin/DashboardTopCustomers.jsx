import { Link } from 'react-router-dom'
import { CrownOutlined, FileTextOutlined } from '@ant-design/icons'
import { formatVnd } from '../../../utils/helpers/format'
import { useState } from 'react'
import { Modal, Pagination, Spin, Tag } from 'antd'
import { adminOrderService } from '../../../services/admin/AdminOrderService'
import { unwrapApi, normalizePagedResult } from '../../../utils/helpers/api'

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
                title={
                    <div className="flex items-center gap-2 text-slate-800">
                        <FileTextOutlined className="text-sky-600" />
                        <span>Đơn hàng đã hoàn thành - {selectedUser?.fullName || selectedUser?.username}</span>
                    </div>
                }
                open={!!selectedUser}
                onCancel={handleCloseModal}
                footer={null}
                width={600}
                centered
                destroyOnClose
            >
                {loadingOrders ? (
                    <div className="flex justify-center items-center py-12">
                        <Spin size="large" />
                    </div>
                ) : (
                    <div className="space-y-4 mt-6">
                        {orders.length === 0 ? (
                            <div className="text-center text-slate-500 py-8 bg-slate-50 rounded-xl border border-slate-100">
                                Không tìm thấy đơn hàng hoàn thành nào.
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {orders.map(order => (
                                    <div key={order.orderId} className="flex flex-col gap-3 border border-slate-200 rounded-xl p-4 bg-white hover:border-sky-300 transition-colors shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-black text-slate-800 text-base">#{order.orderId}</span>
                                                    <Tag color="success" className="m-0 border-transparent bg-emerald-100 text-emerald-700 font-bold">
                                                        Đã hoàn thành
                                                    </Tag>
                                                </div>
                                                <div className="text-xs text-slate-500 font-medium">
                                                    {new Date(order.orderDate).toLocaleString('vi-VN')}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Thành tiền</span>
                                                <span className="font-black text-sky-600 text-lg">{formatVnd(order.totalAmount || 0)}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1.5">
                                            <div className="flex gap-2">
                                                <span className="font-semibold min-w-[70px]">Giao đến:</span>
                                                <span className="text-slate-800">{order.shippingAddress} <span className="text-slate-400">({order.distanceKm} km)</span></span>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="font-semibold min-w-[70px]">SĐT nhận:</span>
                                                <span className="text-slate-800 font-medium">{order.userPhone}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="font-semibold min-w-[70px]">Thanh toán:</span>
                                                <span className="text-slate-800 font-medium">{order.paymentMethod}</span>
                                            </div>
                                            {order.note && (
                                                <div className="flex gap-2">
                                                    <span className="font-semibold min-w-[70px]">Ghi chú:</span>
                                                    <span className="text-orange-600 italic">{order.note}</span>
                                                </div>
                                            )}
                                        </div>
                                    
                                        <div className="flex justify-end text-[11px] font-medium text-slate-500 mt-1">
                                            <div className="flex flex-col text-right space-y-1">
                                                <span>Tạm tính: {formatVnd(order.subTotal || 0)}</span>
                                                <span>Phí giao: {formatVnd(order.shippingFee || 0)}</span>
                                                {(order.orderDiscount > 0 || order.shippingDiscount > 0) && (
                                                    <span className="text-emerald-600">
                                                        Giảm giá: -{formatVnd((order.orderDiscount || 0) + (order.shippingDiscount || 0))}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {totalOrders > 0 && (
                            <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
                                <Pagination 
                                    current={currentPage} 
                                    total={totalOrders} 
                                    pageSize={5} 
                                    onChange={handlePageChange}
                                    showSizeChanger={false}
                                    size="small"
                                />
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    )
}
