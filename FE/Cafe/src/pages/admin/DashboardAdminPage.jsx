import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DatePicker, Spin } from 'antd'
import dayjs from 'dayjs'
import {
    ShoppingCartOutlined,
    DollarCircleOutlined,
    UserOutlined,
    CoffeeOutlined,
} from '@ant-design/icons'
import { fetchDashboardData } from '../../redux/actions/admin/adminDashboardAction'
import { formatVnd } from '../../utils/helpers/format'

const { RangePicker } = DatePicker

// Hàm helper tạo màu cho pie chart
const getStatusColor = (status) => {
    switch (status) {
        case 'Completed': return '#10b981' // emerald-500
        case 'Processing': return '#3b82f6' // blue-500
        case 'Pending': return '#f59e0b' // sky-500
        case 'Cancelled': return '#ef4444' // red-500
        default: return '#9ca3af' // gray-400
    }
}

const getStatusLabel = (status) => {
    switch (status) {
        case 'Completed': return 'Hoàn thành'
        case 'Processing': return 'Đang xử lý'
        case 'Pending': return 'Chờ xác nhận'
        case 'Cancelled': return 'Đã hủy'
        default: return status
    }
}

export default function DashboardAdminPage() {
    const dispatch = useDispatch()
    const { summary, revenueChart, topProducts, orderStats, loading } = useSelector(s => s.adminDashboard)

    // Mặc định lấy 30 ngày gần nhất
    const [dates, setDates] = useState([
        dayjs().subtract(30, 'days'),
        dayjs()
    ])

    useEffect(() => {
        if (dates && dates[0] && dates[1]) {
            dispatch(fetchDashboardData({
                startDate: dates[0].format('YYYY-MM-DD'),
                endDate: dates[1].format('YYYY-MM-DD')
            }))
        }
    }, [dates, dispatch])

    // Tính toán góc cho pie chart từ orderStats
    const pieChartStyle = useMemo(() => {
        if (!orderStats || orderStats.length === 0) return { background: '#f5f5f4' } // rỗng
        
        const total = orderStats.reduce((sum, item) => sum + item.count, 0)
        if (total === 0) return { background: '#f5f5f4' }

        let currentAngle = 0
        const gradients = orderStats.map(item => {
            const percentage = (item.count / total) * 100
            const start = currentAngle
            const end = currentAngle + percentage
            currentAngle = end
            return `${getStatusColor(item.status)} ${start}% ${end}%`
        })

        return {
            background: `conic-gradient(${gradients.join(', ')})`
        }
    }, [orderStats])

    // Chuẩn bị dữ liệu cho bar chart
    const maxRevenue = Math.max(...(revenueChart || []).map(item => item.revenue), 1)

    const stats = [
        { title: 'Tổng Doanh Thu', value: formatVnd(summary?.totalRevenue || 0), icon: <DollarCircleOutlined />, color: 'from-green-500 to-emerald-700' },
        { title: 'Đơn Hàng Mới', value: summary?.totalOrders || 0, icon: <ShoppingCartOutlined />, color: 'from-sky-500 to-sky-700' },
        { title: 'Khách Hàng Mới', value: summary?.newUsersCount || 0, icon: <UserOutlined />, color: 'from-blue-500 to-indigo-700' },
        { title: 'Sản Phẩm Đã Bán', value: summary?.totalProductsSold || 0, icon: <CoffeeOutlined />, color: 'from-purple-500 to-fuchsia-700' },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Bảng điều khiển</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Theo dõi tình hình kinh doanh của cửa hàng.
                    </p>
                </div>
                <div>
                    <RangePicker 
                        value={dates}
                        onChange={val => setDates(val)}
                        className="rounded-3xl px-4 py-2"
                        allowClear={false}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center justify-between relative z-10">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                            {stat.title}
                                        </p>
                                        <p className="mt-2 text-2xl font-black text-slate-800">
                                            {stat.value}
                                        </p>
                                    </div>
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} text-xl text-white shadow-lg`}>
                                        {stat.icon}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Bar Chart Area */}
                        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-slate-800">Biểu đồ doanh thu</h3>
                            </div>
                            
                            {revenueChart && revenueChart.length > 0 ? (
                                <div className="relative h-64 w-full flex items-end justify-between gap-1 px-2 pb-6 pt-4 border-b border-l border-slate-200 overflow-x-auto custom-scrollbar">
                                    {revenueChart.map((item, i) => {
                                        const heightPercent = (item.revenue / maxRevenue) * 100
                                        return (
                                            <div key={i} className="group relative flex flex-1 flex-col items-center justify-end h-full min-w-[30px]">
                                                <div 
                                                    className="w-full max-w-[40px] rounded-t-md bg-gradient-to-t from-sky-800 to-sky-500 hover:from-sky-600 hover:to-sky-400 transition-colors cursor-pointer relative"
                                                    style={{ height: `${heightPercent}%`, minHeight: item.revenue > 0 ? '4px' : '0' }}
                                                >
                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded bg-slate-800 px-2 py-1 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                                        {formatVnd(item.revenue)}
                                                        <br/>
                                                        {item.label}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-slate-400 italic border-b border-l border-slate-200">
                                    Không có dữ liệu trong khoảng thời gian này
                                </div>
                            )}
                        </div>

                        {/* Order Stats Pie Chart */}
                        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-slate-800">Trạng thái đơn hàng</h3>
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center gap-8">
                                <div 
                                    className="w-48 h-48 rounded-full shadow-inner"
                                    style={pieChartStyle}
                                />
                                <div className="w-full space-y-2">
                                    {orderStats?.map((stat, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor(stat.status) }} />
                                                <span className="text-slate-600 font-medium">{getStatusLabel(stat.status)}</span>
                                            </div>
                                            <span className="font-bold">{stat.count}</span>
                                        </div>
                                    ))}
                                    {(!orderStats || orderStats.length === 0) && (
                                        <p className="text-center text-slate-400 italic">Chưa có đơn hàng</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Sản phẩm bán chạy nhất</h3>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {topProducts?.map((product, idx) => (
                                <div key={idx} className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4 bg-slate-50 hover:border-sky-200 transition-colors">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl bg-sky-100 text-sky-700 text-xl font-black">
                                        #{idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 truncate" title={product.productName}>
                                            {product.productName}
                                        </h4>
                                        <p className="text-sm text-slate-500">
                                            Đã bán: <span className="font-bold text-sky-600">{product.totalSold}</span>
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs text-slate-400">Doanh thu</p>
                                        <p className="font-bold text-slate-700">{formatVnd(product.totalRevenue)}</p>
                                    </div>
                                </div>
                            ))}
                            {(!topProducts || topProducts.length === 0) && (
                                <p className="col-span-full text-center text-slate-400 italic py-4">Không có dữ liệu</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
