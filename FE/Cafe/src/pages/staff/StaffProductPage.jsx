import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Switch, Select, Tooltip } from 'antd'
import {
    fetchAdminProducts,
    toggleProductAvailability,
} from '../../redux/actions/admin/adminProductAction'
import { fetchAdminCategories } from '../../redux/actions/admin/adminCategoryAction'
import { formatVnd } from '../../utils/helpers/format'
import AppSearchBox from '../../components/common/AppSearchBox'
import AppPagination from '../../components/common/AppPagination'
import { AppToast } from '../../components/common/AppNotification'
import {
    SyncOutlined,
    CoffeeOutlined,
    CheckCircleFilled,
    StopOutlined,
    SearchOutlined
} from '@ant-design/icons'

export default function StaffProductPage() {
    const dispatch = useDispatch()
    const { items: products, total, totalPages, loading } = useSelector((s) => s.admin.product)
    const { items: categories } = useSelector((s) => s.admin.category)

    const [keyword, setKeyword] = useState('')
    const [categoryId, setCategoryId] = useState(null)
    const [availabilityFilter, setAvailabilityFilter] = useState('ALL') // 'ALL', 'AVAILABLE', 'OUT_OF_STOCK'
    const [currentPage, setCurrentPage] = useState(1)
    const [togglingId, setTogglingId] = useState(null)

    const PAGE_SIZE = 16

    useEffect(() => {
        dispatch(fetchAdminCategories())
    }, [dispatch])

    const loadProducts = useCallback(() => {
        let isAvailParam = undefined
        if (availabilityFilter === 'AVAILABLE') isAvailParam = true
        if (availabilityFilter === 'OUT_OF_STOCK') isAvailParam = false

        dispatch(
            fetchAdminProducts({
                pageNumber: currentPage,
                pageSize: PAGE_SIZE,
                keyword: keyword.trim() || undefined,
                categoryId: categoryId || undefined,
                isAvailable: isAvailParam,
            })
        )
    }, [dispatch, currentPage, keyword, categoryId, availabilityFilter])

    useEffect(() => {
        loadProducts()
    }, [loadProducts])

    const handleToggleAvailability = async (productId, currentStatus) => {
        try {
            setTogglingId(productId)
            const res = await dispatch(toggleProductAvailability(productId))
            if (toggleProductAvailability.fulfilled.match(res)) {
                AppToast.success(
                    currentStatus
                        ? 'Đã ẩn sản phẩm (Tạm hết món)!'
                        : 'Đã mở bán lại sản phẩm!'
                )
            }
        } finally {
            setTogglingId(null)
        }
    }

    return (
        <div className="space-y-4">
            {/* Header Box */}
            <div className="rounded-3xl bg-white p-4 sm:p-5 shadow-sm border border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <span>Kiểm soát Món hết hàng (Bán / Tạm hết)</span>
                        <button
                            type="button"
                            onClick={loadProducts}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                            title="Tải lại danh sách"
                        >
                            <SyncOutlined spin={loading} className="text-base" />
                        </button>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        Gạt công tắc để ẩn món khi hết nguyên liệu hoặc mở lại khi đã sẵn sàng phục vụ
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <div className="w-full sm:w-56">
                        <AppSearchBox
                            placeholder="Tìm tên món..."
                            value={keyword}
                            onChange={(e) => {
                                setKeyword(e.target.value)
                                setCurrentPage(1)
                            }}
                        />
                    </div>

                    <Select
                        placeholder="Danh mục"
                        allowClear
                        value={categoryId}
                        onChange={(val) => {
                            setCategoryId(val)
                            setCurrentPage(1)
                        }}
                        className="w-36 h-10"
                        options={categories.map((c) => ({
                            value: c.id,
                            label: c.name,
                        }))}
                    />

                    <Select
                        value={availabilityFilter}
                        onChange={(val) => {
                            setAvailabilityFilter(val)
                            setCurrentPage(1)
                        }}
                        className="w-36 h-10"
                        options={[
                            { value: 'ALL', label: 'Tất cả trạng thái' },
                            { value: 'AVAILABLE', label: '🟢 Đang bán' },
                            { value: 'OUT_OF_STOCK', label: '🔴 Tạm hết món' },
                        ]}
                    />
                </div>
            </div>

            {/* Products Grid */}
            {loading && products.length === 0 ? (
                <div className="flex h-64 items-center justify-center rounded-3xl bg-white border border-slate-200/60">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                        <SyncOutlined spin className="text-3xl text-amber-500" />
                        <span className="text-sm font-medium">Đang tải danh sách món...</span>
                    </div>
                </div>
            ) : products.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-3xl bg-white border border-slate-200/60 p-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 text-3xl mb-3">
                        <CoffeeOutlined />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">Không tìm thấy món ăn nào</h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Thử điều chỉnh lại từ khóa tìm kiếm hoặc bỏ bộ lọc danh mục.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((prod) => {
                        const isAvailable = Boolean(prod.isAvailable)
                        const isToggling = togglingId === prod.id

                        return (
                            <div
                                key={prod.id}
                                className={`rounded-3xl bg-white p-4 border transition-all duration-200 flex flex-col justify-between ${
                                    isAvailable
                                        ? 'border-slate-200/80 shadow-sm hover:shadow-md'
                                        : 'border-rose-200 bg-rose-50/20 shadow-sm'
                                }`}
                            >
                                <div>
                                    {/* Image & Status Tag */}
                                    <div className="relative aspect-video sm:aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 mb-3">
                                        {prod.imageUrl ? (
                                            <img
                                                src={prod.imageUrl}
                                                alt={prod.name}
                                                className={`h-full w-full object-cover transition-all duration-300 ${
                                                    !isAvailable ? 'grayscale opacity-60' : ''
                                                }`}
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-slate-300 text-3xl">
                                                <CoffeeOutlined />
                                            </div>
                                        )}

                                        {/* Status Badge Over Image */}
                                        <div className="absolute top-2 left-2">
                                            {isAvailable ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white backdrop-blur-sm shadow-sm">
                                                    <CheckCircleFilled /> Đang phục vụ
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/90 text-white backdrop-blur-sm shadow-sm">
                                                    <StopOutlined /> Tạm hết món
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="text-sm font-bold text-slate-800 line-clamp-1" title={prod.name}>
                                                {prod.name}
                                            </h3>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-500">{prod.categoryName || 'Món nước'}</span>
                                            <span className="font-bold text-amber-600">
                                                {formatVnd(prod.basePrice || prod.price || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Switch Action */}
                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-600">
                                        {isAvailable ? 'Có thể bán' : 'Khóa bán (Hết)'}
                                    </span>
                                    <Switch
                                        checked={isAvailable}
                                        loading={isToggling}
                                        onChange={() => handleToggleAvailability(prod.id, isAvailable)}
                                        checkedChildren="BÁN"
                                        unCheckedChildren="HẾT"
                                        className={isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-end pt-2">
                    <AppPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </div>
    )
}
