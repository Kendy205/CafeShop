import { Link } from 'react-router-dom'
import { FireOutlined } from '@ant-design/icons'
import { formatVnd } from '../../../utils/helpers/format'

export default function DashboardTopProducts({ topProducts }) {
    const rankColors = [
        'from-amber-400 to-amber-600 text-white shadow-amber-500/25',
        'from-slate-300 to-slate-500 text-white shadow-slate-400/25',
        'from-amber-600 to-orange-700 text-white shadow-orange-500/25',
    ]

    return (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 text-sm font-bold">
                        <FireOutlined />
                    </span>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Top Sản Phẩm Bán Chạy Nhất</h3>
                </div>
                <Link 
                    to="/admin/products"
                    className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 transition-colors"
                >
                    Xem toàn bộ menu & kho hàng →
                </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {topProducts?.map((product, idx) => {
                    const badgeClass = rankColors[idx] || 'from-sky-50 to-sky-100 text-sky-800 border border-sky-200'

                    return (
                        <div 
                            key={idx} 
                            className="group relative flex items-center gap-4 rounded-2xl border border-slate-100 p-4 bg-slate-50/70 hover:bg-white hover:border-sky-300 hover:shadow-md transition-all duration-300"
                        >
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${badgeClass} text-lg font-black shadow-md group-hover:scale-105 transition-transform`}>
                                #{idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-black text-slate-800 truncate text-sm group-hover:text-sky-700 transition-colors" title={product.productName}>
                                    {product.productName}
                                </h4>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-600 shadow-2xs">
                                        Đã bán: <strong className="text-sky-600">{product.totalSold}</strong>
                                    </span>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-[10px] uppercase font-bold text-slate-400">Doanh số</p>
                                <p className="font-black text-slate-800 text-sm">{formatVnd(product.totalRevenue)}</p>
                            </div>
                        </div>
                    )
                })}

                {(!topProducts || topProducts.length === 0) && (
                    <div className="col-span-full py-8 text-center text-slate-400 italic text-xs">
                        Không có dữ liệu sản phẩm trong khoảng thời gian này
                    </div>
                )}
            </div>
        </div>
    )
}
