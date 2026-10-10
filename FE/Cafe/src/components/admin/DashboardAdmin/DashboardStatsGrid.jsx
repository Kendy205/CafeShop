import {
    ShoppingCartOutlined,
    DollarCircleOutlined,
    UserOutlined,
    CoffeeOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
} from '@ant-design/icons'
import { formatVnd } from '../../../utils/helpers/format'

export default function DashboardStatsGrid({ summary, avgRevenue, totalOrdersCount, completedOrders, completionRate }) {
    const statsCards = [
        {
            title: 'Tổng Doanh Thu',
            value: formatVnd(summary?.totalRevenue || 0),
            subtext: `TB ngày: ${formatVnd(avgRevenue)}`,
            icon: <DollarCircleOutlined />,
            iconColor: 'text-emerald-500',
            bgGlow: 'from-emerald-500/10 via-teal-500/5 to-transparent',
            badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            trend: '+12.5%',
            isPositive: true,
            patternColor: 'rgba(16, 185, 129, 0.08)',
        },
        {
            title: 'Đơn Hàng Mới',
            value: summary?.totalOrders || 0,
            subtext: `Tỉ lệ hoàn thành: ${completionRate}%`,
            icon: <ShoppingCartOutlined />,
            iconColor: 'text-sky-500',
            bgGlow: 'from-sky-500/10 via-blue-500/5 to-transparent',
            badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
            trend: `${completedOrders} xong`,
            isPositive: true,
            patternColor: 'rgba(14, 165, 233, 0.08)',
        },
        {
            title: 'Khách Hàng Mới',
            value: summary?.newUsersCount || 0,
            subtext: 'Đăng ký trong kỳ này',
            icon: <UserOutlined />,
            iconColor: 'text-indigo-500',
            bgGlow: 'from-indigo-500/10 via-purple-500/5 to-transparent',
            badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            trend: 'Tích cực',
            isPositive: true,
            patternColor: 'rgba(99, 102, 241, 0.08)',
        },
        {
            title: 'Sản Phẩm Bán Ra',
            value: summary?.totalProductsSold || 0,
            subtext: 'Sản phẩm phục vụ',
            icon: <CoffeeOutlined />,
            iconColor: 'text-amber-500',
            bgGlow: 'from-amber-500/10 via-orange-500/5 to-transparent',
            badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
            trend: 'Bán chạy',
            isPositive: true,
            patternColor: 'rgba(245, 158, 11, 0.08)',
        },
        {
            title: 'Đánh Giá & Phản Hồi',
            value: summary?.totalFeedbacks || 0,
            subtext: `Điểm trung bình: ${summary?.averageFeedbackRating?.toFixed(1) || '0.0'}/5`,
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
            iconColor: 'text-pink-500',
            bgGlow: 'from-pink-500/10 via-rose-500/5 to-transparent',
            badgeBg: 'bg-pink-50 text-pink-700 border-pink-200',
            trend: 'Phản hồi',
            isPositive: true,
            patternColor: 'rgba(236, 72, 153, 0.08)',
        }
    ]

    return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {statsCards.map((stat, idx) => (
                <div 
                    key={idx} 
                    className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                    {/* Decorative Corner Gradient Background */}
                    <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl ${stat.bgGlow} rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-125`} />
                    
                    {/* Micro Grid Pattern */}
                    <div 
                        className="absolute inset-0 opacity-40 pointer-events-none" 
                        style={{
                            backgroundImage: `radial-gradient(${stat.patternColor} 1.5px, transparent 1.5px)`,
                            backgroundSize: '14px 14px'
                        }}
                    />

                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    {stat.title}
                                </span>
                                <h3 className="mt-2 text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                                    {stat.value}
                                </h3>
                            </div>
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 ${stat.iconColor} text-2xl shadow-xs group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                                {stat.icon}
                            </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-slate-100/80 pt-3">
                            <span className="text-xs font-medium text-slate-500">
                                {stat.subtext}
                            </span>
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${stat.badgeBg}`}>
                                {stat.isPositive ? <ArrowUpOutlined className="text-[9px]" /> : <ArrowDownOutlined className="text-[9px]" />}
                                {stat.trend}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
