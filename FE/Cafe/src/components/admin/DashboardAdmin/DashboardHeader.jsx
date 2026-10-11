import { DatePicker } from 'antd'
import { Link } from 'react-router-dom'
import {
    ShoppingCartOutlined,
    ThunderboltOutlined,
    SyncOutlined,
} from '@ant-design/icons'

const { RangePicker } = DatePicker

/**
 * DashboardHeader Component
 * Header của trang Admin Dashboard.
 * Hiển thị tiêu đề, mô tả và bộ lọc khoảng thời gian (RangePicker), cùng nút làm mới dữ liệu.
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
                    <div className="bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/15">
                        <RangePicker 
                            value={dates}
                            onChange={val => setDates(val)}
                            className="border-0 bg-transparent text-white font-medium"
                            allowClear={false}
                            format="DD/MM/YYYY"
                        />
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
