import { Link } from 'react-router-dom'
import { CrownOutlined } from '@ant-design/icons'
import { formatVnd } from '../../../utils/helpers/format'

export default function DashboardTopCustomers({ topCustomers }) {
    const rankColors = [
        'from-amber-400 to-amber-600 text-white shadow-amber-500/25',
        'from-slate-300 to-slate-500 text-white shadow-slate-400/25',
        'from-amber-600 to-orange-700 text-white shadow-orange-500/25',
    ]

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
                            className="group relative flex items-center gap-3 rounded-2xl border border-slate-100 p-3 bg-slate-50/70 hover:bg-white hover:border-sky-300 hover:shadow-md transition-all duration-300"
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
        </div>
    )
}
