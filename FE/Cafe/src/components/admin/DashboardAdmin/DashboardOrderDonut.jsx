import { useMemo } from 'react'
import { PieChartOutlined } from '@ant-design/icons'

/**
 * DashboardOrderDonut Component
 * Biểu đồ tròn (Donut chart) hiển thị tỷ lệ trạng thái đơn hàng.
 * Tự custom vẽ bằng CSS conic-gradient để tối ưu nhẹ nhàng không cần thư viện.
 */
export default function DashboardOrderDonut({ orderStats, totalOrdersCount, completedOrders, completionRate, getStatusTheme }) {
    // Tính toán góc cho pie chart (conic-gradient hiện đại với donut hole)
    const donutSegments = useMemo(() => {
        if (!orderStats || orderStats.length === 0 || totalOrdersCount === 0) {
            return {
                gradient: '#f1f5f9 0% 100%',
                itemsWithPercent: []
            }
        }

        let currentAngle = 0
        const itemsWithPercent = orderStats.map(item => {
            const percentage = ((item.count / totalOrdersCount) * 100)
            const start = currentAngle
            const end = currentAngle + percentage
            currentAngle = end
            const theme = getStatusTheme(item.status)
            return {
                ...item,
                percentage: percentage.toFixed(1),
                theme,
                gradientChunk: `${theme.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`
            }
        })

        return {
            gradient: itemsWithPercent.map(i => i.gradientChunk).join(', '),
            itemsWithPercent
        }
    }, [orderStats, totalOrdersCount, getStatusTheme])

    return (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
            {/* Decorative background dot pattern */}
            <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(#94a3b8 1px, transparent 1px)`,
                    backgroundSize: '16px 16px'
                }}
            />

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 text-sm font-bold">
                        <PieChartOutlined />
                    </span>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Trạng Thái Đơn</h3>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {totalOrdersCount} đơn
                </span>
            </div>

            {/* Donut Ring with Center Summary */}
            <div className="relative z-10 flex flex-col items-center justify-center my-4">
                <div className="relative flex items-center justify-center w-48 h-48">
                    {/* Conic Gradient Donut Outer */}
                    <div 
                        className="w-48 h-48 rounded-full shadow-lg transition-all duration-500"
                        style={{
                            background: `conic-gradient(${donutSegments.gradient})`
                        }}
                    />
                    {/* Inner White Cutout forming the Donut */}
                    <div className="absolute w-32 h-32 rounded-full bg-white shadow-inner flex flex-col items-center justify-center text-center p-2 border border-slate-100">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tỉ lệ xong</span>
                        <span className="text-3xl font-black text-slate-800">{completionRate}%</span>
                        <span className="text-[10px] text-emerald-600 font-bold">{completedOrders}/{totalOrdersCount} đơn</span>
                    </div>
                </div>
            </div>

            {/* Legend Details List */}
            <div className="relative z-10 space-y-2 mt-2">
                {donutSegments.itemsWithPercent.map((stat, i) => (
                    <div 
                        key={i} 
                        className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors text-xs"
                    >
                        <div className="flex items-center gap-2.5">
                            <span 
                                className="w-3 h-3 rounded-full shadow-2xs" 
                                style={{ backgroundColor: stat.theme.color }} 
                            />
                            <span className="text-slate-700 font-bold">{stat.theme.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-800">{stat.count}</span>
                            <span className="text-slate-400 text-[11px] min-w-[38px] text-right">({stat.percentage}%)</span>
                        </div>
                    </div>
                ))}

                {(!orderStats || orderStats.length === 0) && (
                    <p className="text-center text-slate-400 italic py-6 text-xs">Chưa có đơn hàng nào được ghi nhận</p>
                )}
            </div>
        </div>
    )
}
