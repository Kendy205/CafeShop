import { DatePicker } from 'antd'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import {
    ShoppingCartOutlined,
    ThunderboltOutlined,
    SyncOutlined,
    CalendarOutlined,
} from '@ant-design/icons'

const { RangePicker } = DatePicker

// Hàm so sánh 2 khoảng thời gian theo ngày
const isSameDayRange = (currentDates, start, end) => {
    if (!currentDates || !currentDates[0] || !currentDates[1] || !start || !end) return false
    return currentDates[0].isSame(start, 'day') && currentDates[1].isSame(end, 'day')
}

// Cấu hình các nút lọc nhanh
const QUICK_FILTERS = [
    {
        id: 'today',
        label: 'Hôm nay',
        getRange: () => [dayjs(), dayjs()],
    },
    {
        id: '7days',
        label: '7 ngày',
        getRange: () => [dayjs().subtract(7, 'days'), dayjs()],
    },
    {
        id: '30days',
        label: '30 ngày',
        getRange: () => [dayjs().subtract(30, 'days'), dayjs()],
    },
]

// Presets hiển thị trong popup của RangePicker
const RANGE_PRESETS = [
    { label: 'Hôm nay', value: [dayjs(), dayjs()] },
    { label: '7 ngày qua', value: [dayjs().subtract(7, 'days'), dayjs()] },
    { label: '30 ngày qua', value: [dayjs().subtract(30, 'days'), dayjs()] },
    { label: 'Tuần này', value: [dayjs().startOf('week'), dayjs().endOf('week')] },
    { label: 'Tháng này', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
]

/**
 * DashboardHeader Component
 * Header của trang Admin Dashboard.
 * Hiển thị tiêu đề, mô tả và bộ lọc khoảng thời gian (Quick presets & RangePicker), cùng nút làm mới dữ liệu.
 */
export default function DashboardHeader({ dates, setDates, loading, onRefresh }) {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 md:p-8 text-white shadow-xl">
            {/* Background Geometric Decor */}
            <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }}
            />
            {/* Glowing Orbs */}
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/20 px-3 py-1 text-xs font-bold text-sky-300 backdrop-blur-md mb-3">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        Hệ Thống Phân Tích Bán Hàng Realtime
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                        Tổng Quan Kinh Doanh
                        <ThunderboltOutlined className="text-amber-400 text-xl" />
                    </h1>
                    <p className="mt-1.5 text-xs md:text-sm text-slate-300 max-w-xl">
                        Theo dõi doanh số, lưu lượng đơn hàng và các mặt hàng bán chạy nhất của thương hiệu CafeShop.
                    </p>
                </div>

                {/* Filter & Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Cụm bộ lọc thời gian: Nút chọn nhanh + RangePicker */}
                    <div className="flex flex-wrap items-center gap-1.5 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 shadow-inner">
                        {/* Các nút chọn nhanh: Hôm nay, 7 ngày, 30 ngày */}
                        <div className="flex items-center gap-1">
                            {QUICK_FILTERS.map((item) => {
                                const range = item.getRange()
                                const isActive = isSameDayRange(dates, range[0], range[1])
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setDates(range)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                            isActive
                                                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                                                : 'text-slate-300 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                )
                            })}
                        </div>

                        <div className="hidden sm:block h-5 w-px bg-white/20 mx-0.5" />

                        {/* Bộ chọn khoảng ngày tùy chỉnh */}
                        <div className="relative">
                            <RangePicker 
                                value={dates}
                                onChange={val => {
                                    if (val && val[0] && val[1]) {
                                        setDates(val)
                                    }
                                }}
                                className="border-0 bg-transparent text-white font-medium hover:bg-white/5 transition-colors rounded-xl [&_input]:text-white [&_input::placeholder]:text-slate-400 [&_.ant-picker-separator]:text-slate-300 [&_.ant-picker-suffix]:text-sky-300"
                                allowClear={false}
                                format="DD/MM/YYYY"
                                presets={RANGE_PRESETS}
                            />
                        </div>
                    </div>
                    <button
                        onClick={onRefresh}
                        className="flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer backdrop-blur-md shadow-xs active:scale-95"
                        title="Tải lại dữ liệu"
                    >
                        <SyncOutlined spin={loading} className="text-sky-300" />
                        <span>Làm mới</span>
                    </button>
                    <Link
                        to="/admin/orders"
                        className="flex items-center gap-2 rounded-2xl bg-sky-500 hover:bg-sky-400 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-sky-500/30 transition-all cursor-pointer active:scale-95"
                    >
                        <ShoppingCartOutlined />
                        <span>Quản lý đơn hàng</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
