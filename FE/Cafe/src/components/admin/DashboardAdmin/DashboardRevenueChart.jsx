import { useState, useMemo } from 'react'
import { RiseOutlined, BarChartOutlined } from '@ant-design/icons'
import { formatVnd } from '../../../utils/helpers/format'

/**
 * DashboardRevenueChart Component
 * Biểu đồ hiển thị biến động doanh thu theo thời gian (Line chart & Area chart).
 * Được code thuần bằng thẻ <svg> (SVG path generation) giúp render cực nhanh.
 */
export default function DashboardRevenueChart({ revenueChart, dates }) {
    const [chartMode, setChartMode] = useState('line')
    const [hoveredRevenueIndex, setHoveredRevenueIndex] = useState(null)

    // Tính toán dữ liệu biểu đồ doanh thu SVG
    const { maxRevenue, svgPoints, avgRevenue } = useMemo(() => {
        if (!revenueChart || revenueChart.length === 0) {
            return { maxRevenue: 1, svgPoints: [], avgRevenue: 0 }
        }
        const max = Math.max(...revenueChart.map(item => Number(item.revenue) || 0), 1000)
        const total = revenueChart.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0)
        const avg = total / revenueChart.length

        // Biến đổi các điểm dữ liệu thành tọa độ chuẩn viewBox SVG 800 x 240
        const width = 800
        const height = 240
        const paddingX = 40
        const paddingY = 30
        const usableWidth = width - paddingX * 2
        const usableHeight = height - paddingY * 2

        const points = revenueChart.map((item, idx) => {
            const x = paddingX + (idx / Math.max(revenueChart.length - 1, 1)) * usableWidth
            const rev = Number(item.revenue) || 0
            const y = height - paddingY - (rev / max) * usableHeight
            return { x, y, ...item, revenueNum: rev }
        })

        return { maxRevenue: max, svgPoints: points, avgRevenue: avg }
    }, [revenueChart])

    // Đường path SVG cho Line & Area Gradient
    const svgPaths = useMemo(() => {
        if (svgPoints.length === 0) return { linePath: '', areaPath: '' }
        if (svgPoints.length === 1) {
            const p = svgPoints[0]
            return {
                linePath: `M ${p.x - 20} ${p.y} L ${p.x + 20} ${p.y}`,
                areaPath: `M ${p.x - 20} ${p.y} L ${p.x + 20} ${p.y} L ${p.x + 20} 240 L ${p.x - 20} 240 Z`
            }
        }

        // Tạo smooth cubic bezier curve
        let line = `M ${svgPoints[0].x} ${svgPoints[0].y}`
        for (let i = 0; i < svgPoints.length - 1; i++) {
            const curr = svgPoints[i]
            const next = svgPoints[i + 1]
            const controlX = (curr.x + next.x) / 2
            line += ` C ${controlX} ${curr.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`
        }

        const last = svgPoints[svgPoints.length - 1]
        const first = svgPoints[0]
        const area = `${line} L ${last.x} 220 L ${first.x} 220 Z`

        return { linePath: line, areaPath: area }
    }, [svgPoints])

    return (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
            {/* Subtle Ambient Light */}
            <div className="absolute top-0 left-1/3 w-96 h-48 bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 relative z-10">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600 text-sm font-bold">
                            <RiseOutlined />
                        </span>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Xu Hướng Doanh Thu</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        Đỉnh doanh số: <strong className="text-slate-800">{formatVnd(maxRevenue)}</strong> · TB kỳ: <strong className="text-sky-700">{formatVnd(avgRevenue)}</strong>
                    </p>
                </div>

                {/* Mode Switcher: Smooth Area vs Column Bars */}
                <div className="inline-flex rounded-2xl bg-slate-100 p-1 border border-slate-200/70 text-xs font-bold">
                    <button
                        onClick={() => setChartMode('line')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${chartMode === 'line' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <RiseOutlined /> Đường sóng
                    </button>
                    <button
                        onClick={() => setChartMode('bar')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${chartMode === 'bar' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <BarChartOutlined /> Cột Bar
                    </button>
                </div>
            </div>

            {/* Chart Visual Presentation */}
            {revenueChart && revenueChart.length > 0 ? (
                <div className="relative w-full">
                    {chartMode === 'line' ? (
                        /* High-End SVG Vector Line Chart */
                        <div className="w-full relative">
                            <svg viewBox="0 0 800 240" className="w-full h-64 overflow-visible">
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#0284c7" stopOpacity="0.35" />
                                        <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.08" />
                                        <stop offset="100%" stopColor="#bae6fd" stopOpacity="0" />
                                    </linearGradient>
                                    <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
                                        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0284c7" floodOpacity="0.3" />
                                    </filter>
                                </defs>

                                {/* Horizontal Grid lines */}
                                {[0.25, 0.5, 0.75, 1].map((pct, i) => {
                                    const y = 220 - pct * 180
                                    return (
                                        <g key={i}>
                                            <line x1="40" y1={y} x2="760" y2={y} stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
                                            <text x="35" y={y + 3} textAnchor="end" fontSize="10" fill="#94a3b8" fontWeight="600">
                                                {formatVnd(maxRevenue * pct).replace('₫', '')}
                                            </text>
                                        </g>
                                    )
                                })}

                                {/* Area under curve */}
                                {svgPaths.areaPath && (
                                    <path d={svgPaths.areaPath} fill="url(#revenueGradient)" />
                                )}

                                {/* Smooth Line Curve */}
                                {svgPaths.linePath && (
                                    <path
                                        d={svgPaths.linePath}
                                        fill="none"
                                        stroke="#0284c7"
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                        filter="url(#shadowFilter)"
                                    />
                                )}

                                {/* Data Points */}
                                {svgPoints.map((point, idx) => {
                                    const isHovered = hoveredRevenueIndex === idx
                                    return (
                                        <g 
                                            key={idx}
                                            className="cursor-pointer"
                                            onMouseEnter={() => setHoveredRevenueIndex(idx)}
                                            onMouseLeave={() => setHoveredRevenueIndex(null)}
                                        >
                                            {/* Invisible trigger area */}
                                            <circle cx={point.x} cy={point.y} r="14" fill="transparent" />
                                            
                                            {/* Visual point */}
                                            <circle
                                                cx={point.x}
                                                cy={point.y}
                                                r={isHovered ? "6.5" : "4"}
                                                fill="#ffffff"
                                                stroke="#0284c7"
                                                strokeWidth={isHovered ? "3.5" : "2.5"}
                                                className="transition-all duration-200"
                                            />

                                            {/* Label on X Axis */}
                                            {(idx % Math.ceil(svgPoints.length / 8) === 0 || idx === svgPoints.length - 1) && (
                                                <text x={point.x} y="235" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="600">
                                                    {point.label || point.date || ''}
                                                </text>
                                            )}
                                        </g>
                                    )
                                })}
                            </svg>

                            {/* Hover Floating Tooltip */}
                            {hoveredRevenueIndex !== null && svgPoints[hoveredRevenueIndex] && (
                                <div 
                                    className="absolute -top-12 left-0 transform -translate-x-1/2 pointer-events-none rounded-xl bg-slate-900 text-white px-3 py-1.5 shadow-xl text-center z-20"
                                    style={{
                                        left: `${(svgPoints[hoveredRevenueIndex].x / 800) * 100}%`,
                                    }}
                                >
                                    <p className="text-[10px] text-sky-300 font-semibold">{svgPoints[hoveredRevenueIndex].label || svgPoints[hoveredRevenueIndex].date}</p>
                                    <p className="text-xs font-black">{formatVnd(svgPoints[hoveredRevenueIndex].revenueNum)}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* High-End Stylized Bar Columns */
                        <div className="relative h-64 w-full flex items-end justify-between gap-1.5 px-3 pb-6 pt-4 border-b border-l border-slate-100 overflow-x-auto custom-scrollbar">
                            {revenueChart.map((item, i) => {
                                const rev = Number(item.revenue) || 0
                                const heightPercent = (rev / maxRevenue) * 100
                                return (
                                    <div key={i} className="group relative flex flex-1 flex-col items-center justify-end h-full min-w-[28px]">
                                        <div 
                                            className="w-full max-w-[36px] rounded-t-xl bg-gradient-to-t from-sky-700 via-sky-500 to-cyan-400 group-hover:from-sky-500 group-hover:to-cyan-300 transition-all duration-300 cursor-pointer relative shadow-xs"
                                            style={{ height: `${Math.max(heightPercent, 3)}%` }}
                                        >
                                            {/* Glowing top line */}
                                            <div className="absolute top-0 inset-x-0 h-1 bg-white/70 rounded-t-xl" />

                                            {/* Tooltip on bar hover */}
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-xl bg-slate-900 px-2.5 py-1 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-xl border border-slate-700">
                                                <p className="text-amber-300">{formatVnd(rev)}</p>
                                                <p className="text-[10px] text-slate-300 font-normal">{item.label || item.date}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-slate-400 mt-2 truncate max-w-[36px] text-center font-medium">
                                            {item.label ? item.label.slice(0, 5) : ''}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    <span className="text-3xl mb-1">📊</span>
                    <span className="text-xs font-semibold">Chưa có dữ liệu ghi nhận trong khoảng ngày này</span>
                </div>
            )}

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                <span>* Dữ liệu tự động đồng bộ theo đơn hàng thực tế</span>
                <span className="font-semibold text-slate-500">Mốc thống kê: {dates?.[0]?.format('DD/MM')} - {dates?.[1]?.format('DD/MM/YYYY')}</span>
            </div>
        </div>
    )
}
