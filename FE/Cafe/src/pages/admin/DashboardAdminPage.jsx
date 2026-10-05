import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Spin } from 'antd'
import dayjs from 'dayjs'
import { fetchDashboardData } from '../../redux/actions/admin/adminDashboardAction'

import DashboardHeader from '../../components/admin/DashboardAdmin/DashboardHeader'
import DashboardStatsGrid from '../../components/admin/DashboardAdmin/DashboardStatsGrid'
import DashboardRevenueChart from '../../components/admin/DashboardAdmin/DashboardRevenueChart'
import DashboardOrderDonut from '../../components/admin/DashboardAdmin/DashboardOrderDonut'
import DashboardTopProducts from '../../components/admin/DashboardAdmin/DashboardTopProducts'
import DashboardTopCustomers from '../../components/admin/DashboardAdmin/DashboardTopCustomers'

// Hàm helper cấu hình màu và nhãn cho trạng thái đơn hàng
const STATUS_THEME = {
    completed:  { color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Hoàn thành' },
    delivering: { color: '#0284c7', bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200',     label: 'Đang giao hàng' },
    preparing:  { color: '#8b5cf6', bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200',  label: 'Đang pha chế' },
    processing: { color: '#3b82f6', bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    label: 'Đang xử lý' },
    confirmed:  { color: '#06b6d4', bg: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200',    label: 'Đã xác nhận' },
    pending:    { color: '#f59e0b', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   label: 'Chờ xác nhận' },
    cancelled:  { color: '#ef4444', bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    label: 'Đã hủy' },
}

const getStatusTheme = (status) => {
    const key = String(status).toLowerCase()
    return STATUS_THEME[key] || { color: '#94a3b8', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', label: status || 'Khác' }
}

export default function DashboardAdminPage() {
    const dispatch = useDispatch()
    const { summary, revenueChart, topProducts, topCustomers, orderStats, loading } = useSelector(s => s.admin.dashboard)

    // Mặc định lấy 30 ngày gần nhất
    const [dates, setDates] = useState([
        dayjs().subtract(30, 'days'),
        dayjs()
    ])

    const loadData = () => {
        if (dates && dates[0] && dates[1]) {
            dispatch(fetchDashboardData({
                startDate: dates[0].format('YYYY-MM-DD'),
                endDate: dates[1].format('YYYY-MM-DD')
            }))
        }
    }

    useEffect(() => {
        loadData()
    }, [dates, dispatch])

    // Lắng nghe sự kiện realtime đơn hàng mới để tự động cập nhật thống kê
    useEffect(() => {
        const handleNewOrder = () => {
            loadData()
        }
        window.addEventListener('app:admin-new-order', handleNewOrder)
        return () => {
            window.removeEventListener('app:admin-new-order', handleNewOrder)
        }
    }, [dates])

    // Tính toán tổng số đơn từ orderStats
    const totalOrdersCount = useMemo(() => {
        if (!orderStats || orderStats.length === 0) return 0
        return orderStats.reduce((sum, item) => sum + (Number(item.count) || 0), 0)
    }, [orderStats])

    // Doanh thu trung bình theo ngày
    const avgRevenue = useMemo(() => {
        if (!revenueChart || revenueChart.length === 0) return 0
        const total = revenueChart.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0)
        return total / revenueChart.length
    }, [revenueChart])

    // Số đơn hoàn thành & Tỉ lệ hoàn thành
    const completedOrders = useMemo(() => {
        const item = orderStats?.find(s => String(s.status).toLowerCase() === 'completed')
        return item ? item.count : 0
    }, [orderStats])

    const completionRate = totalOrdersCount > 0 ? Math.round((completedOrders / totalOrdersCount) * 100) : 0

    return (
        <div className="space-y-7 pb-10">
            {/* Top Header Banner with DatePicker & Controls */}
            <DashboardHeader 
                dates={dates} 
                setDates={setDates} 
                loading={loading} 
                onRefresh={loadData} 
            />

            {loading ? (
                <div className="flex flex-col justify-center items-center h-80 gap-3 rounded-3xl border border-slate-100 bg-white/70 backdrop-blur-md shadow-sm">
                    <Spin size="large" />
                    <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Đang nạp dữ liệu phân tích...</p>
                </div>
            ) : (
                <>
                    {/* 4 Cards Thống kê KPI */}
                    <DashboardStatsGrid 
                        summary={summary}
                        avgRevenue={avgRevenue}
                        totalOrdersCount={totalOrdersCount}
                        completedOrders={completedOrders}
                        completionRate={completionRate}
                    />

                    {/* Biểu đồ xu hướng Doanh thu & Phân tích Trạng thái Đơn hàng */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        <DashboardRevenueChart 
                            revenueChart={revenueChart}
                            dates={dates}
                        />

                        <DashboardOrderDonut 
                            orderStats={orderStats}
                            totalOrdersCount={totalOrdersCount}
                            completedOrders={completedOrders}
                            completionRate={completionRate}
                            getStatusTheme={getStatusTheme}
                        />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Bảng xếp hạng Top sản phẩm bán chạy nhất */}
                        <DashboardTopProducts 
                            topProducts={topProducts}
                        />
                        {/* Bảng xếp hạng Top khách hàng mua nhiều nhất */}
                        <DashboardTopCustomers 
                            topCustomers={topCustomers}
                        />
                    </div>
                </>
            )}
        </div>
    )
}
