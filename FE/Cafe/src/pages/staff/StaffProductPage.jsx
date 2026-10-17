import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Switch, Select, Modal, Button } from 'antd'
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
    StarFilled,
} from '@ant-design/icons'

function ProductCardImage({ src, alt, isAvailable }) {
    const [failed, setFailed] = useState(false)

    if (!src || failed) {
        return (
            <div
                className={`flex h-full w-full items-center justify-center rounded-[18px] ${
                    isAvailable ? 'bg-[#F2F2F7] text-amber-500/60' : 'bg-[#E5E5EA] text-[#8E8E93]'
                } text-4xl transition-colors`}
            >
                <CoffeeOutlined />
            </div>
        )
    }

    return (
        <img
            src={src}
            alt={alt}
            onError={() => setFailed(true)}
            className={`h-full w-full object-cover object-center rounded-[18px] transition-all duration-300 ${
                !isAvailable ? 'grayscale opacity-40' : 'group-hover:scale-105'
            }`}
        />
    )
}

export default function StaffProductPage() {
    const dispatch = useDispatch()
    const { items: products, total, totalPages, loading } = useSelector((s) => s.admin.product)
    const { items: categories } = useSelector((s) => s.admin.category)

    const [keyword, setKeyword] = useState('')
    const [categoryId, setCategoryId] = useState(null)
    const [availabilityFilter, setAvailabilityFilter] = useState('ALL') // 'ALL', 'AVAILABLE', 'OUT_OF_STOCK'
    const [currentPage, setCurrentPage] = useState(1)
    const [togglingId, setTogglingId] = useState(null)

    // Modal view full details (Sizes & Toppings)
    const [detailModalOpen, setDetailModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)

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
        if (!productId) return
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

    const openProductDetail = (prod) => {
        setSelectedProduct(prod)
        setDetailModalOpen(true)
    }

    return (
        <div className="space-y-5">
            {/* Header Box - Apple Card */}
            <div className="rounded-[26px] bg-white/80 backdrop-blur-2xl p-5 sm:p-6 border border-black/[0.05] shadow-[0_2px_16px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight flex items-center gap-3">
                        <span>Quản lý Món & Tồn kho Quầy</span>
                        <button
                            type="button"
                            onClick={loadProducts}
                            className="w-8 h-8 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#1D1D1F] flex items-center justify-center transition-all cursor-pointer active:scale-95"
                            title="Tải lại danh sách"
                        >
                            <SyncOutlined spin={loading} className="text-sm" />
                        </button>
                        {total > 0 && (
                            <span className="text-xs font-semibold text-[#1D1D1F] bg-black/[0.05] px-3 py-1 rounded-full">
                                {total} món
                            </span>
                        )}
                    </h1>
                    <p className="text-xs sm:text-sm text-[#86868B] mt-1 font-normal">
                        Theo dõi số lượng tồn kho từng size, danh sách topping đi kèm và gạt công tắc để khóa bán khi hết nguyên liệu
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
                        className="w-40 h-10"
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
                <div className="flex h-64 items-center justify-center rounded-[26px] bg-white border border-black/[0.05]">
                    <div className="flex flex-col items-center gap-2 text-[#86868B]">
                        <SyncOutlined spin className="text-3xl text-amber-500" />
                        <span className="text-sm font-medium">Đang tải danh sách món...</span>
                    </div>
                </div>
            ) : products.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-[26px] bg-white border border-black/[0.05] p-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-amber-50 text-amber-500 text-3xl mb-3">
                        <CoffeeOutlined />
                    </div>
                    <h3 className="text-base font-bold text-[#1D1D1F]">Không tìm thấy món nào</h3>
                    <p className="text-xs text-[#86868B] mt-1">
                        Thử điều chỉnh lại từ khóa tìm kiếm hoặc chọn danh mục khác.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4.5 items-stretch">
                    {products.map((prod) => {
                        const pid = prod.productId || prod.id
                        const isAvailable = Boolean(prod.isAvailable)
                        const isToggling = togglingId === pid
                        const totalStock = prod.totalStock ?? prod.stockQuantity
                        const isOutOfStock = Boolean(prod.isOutOfStock || (totalStock !== null && totalStock <= 0))

                        return (
                            <div
                                key={pid}
                                className={`group rounded-[24px] p-4 border transition-all duration-300 flex flex-col justify-between h-full ${
                                    isAvailable
                                        ? 'bg-white border-black/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.06)] hover:border-black/[0.08]'
                                        : 'bg-[#FBFBFD] border-black/[0.06] shadow-2xs opacity-90'
                                }`}
                            >
                                <div className="flex flex-col flex-1">
                                    {/* Image with 4:3 Aspect Ratio */}
                                    <div className="relative w-full aspect-[4/3] rounded-[18px] overflow-hidden bg-[#F2F2F7] mb-3 shrink-0">
                                        <ProductCardImage
                                            src={prod.imageUrl}
                                            alt={prod.name}
                                            isAvailable={isAvailable}
                                        />

                                        {/* Status Badge (Top-Left) */}
                                        <div className="absolute top-2.5 left-2.5">
                                            {isAvailable ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 text-[#248A3D] backdrop-blur-xl border border-black/[0.04] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                                                    <CheckCircleFilled className="text-[10px]" /> Đang bán
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 text-[#FF3B30] backdrop-blur-xl border border-black/[0.04] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                                                    <StopOutlined className="text-[10px]" /> Tạm hết món
                                                </span>
                                            )}
                                        </div>

                                        {/* Product Code Badge (Top-Right) */}
                                        <div className="absolute top-2.5 right-2.5">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                                                #SP-{pid}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Category & Rating */}
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-[#86868B] font-semibold text-[11px] uppercase tracking-wider truncate max-w-[60%]">
                                            {prod.categoryName || 'Món nước'}
                                        </span>
                                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-[6px] border border-amber-200/50">
                                            <StarFilled className="text-amber-400 text-[10px]" />
                                            <span>{prod.averageRating ? prod.averageRating.toFixed(1) : '5.0'}</span>
                                            <span className="text-[#86868B] font-normal text-[10px]">
                                                ({prod.totalFeedbacks ?? 0})
                                            </span>
                                        </div>
                                    </div>

                                    {/* Product Title & Base Price */}
                                    <div className="flex items-start justify-between gap-2">
                                        <h3
                                            className="text-sm sm:text-base font-extrabold text-[#1D1D1F] line-clamp-1 tracking-tight cursor-pointer hover:text-[#0071E3] transition-colors"
                                            title={prod.name}
                                            onClick={() => openProductDetail(prod)}
                                        >
                                            {prod.name}
                                        </h3>
                                        <span className="font-extrabold text-[#1D1D1F] text-sm sm:text-base shrink-0">
                                            {formatVnd(prod.basePrice || prod.price || 0)}
                                        </span>
                                    </div>

                                    {/* Short Description (cố định chiều cao dòng để không lệch thẻ) */}
                                    <p
                                        className="text-xs text-[#86868B] line-clamp-1 mt-0.5 min-h-[16px] leading-normal"
                                        title={prod.description || ''}
                                    >
                                        {prod.description || 'Chưa có mô tả'}
                                    </p>

                                    {/* Stock Status Bar */}
                                    <div className="mt-2 flex items-center justify-between text-xs">
                                        <span className="text-[#86868B] font-medium">Tồn kho tổng:</span>
                                        {isOutOfStock ? (
                                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-[8px] border border-rose-200/60">
                                                Hết hàng
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[8px] border border-emerald-200/60">
                                                {totalStock !== null && totalStock !== undefined ? `${totalStock} ly/phần` : 'Sẵn sàng'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Sizes Breakdown List */}
                                    <div className="mt-2 flex flex-wrap gap-1 min-h-[28px] items-center">
                                        {Array.isArray(prod.productSizes) && prod.productSizes.length > 0 ? (
                                            prod.productSizes.map((sz) => (
                                                <div
                                                    key={sz.sizeId || sz.sizeName}
                                                    className={`px-1.5 py-0.5 rounded-[8px] text-[10px] font-bold border transition-all ${
                                                        sz.isOutOfStock
                                                            ? 'bg-rose-50/60 text-rose-500 border-rose-200/40 line-through'
                                                            : 'bg-[#F5F5F7] text-[#1D1D1F] border-black/[0.04]'
                                                    }`}
                                                    title={`Tồn kho size ${sz.sizeName}: ${sz.stockQuantity ?? 0} phần`}
                                                >
                                                    <span>{sz.sizeName || sz.name}</span>
                                                    <span className="text-[#86868B] font-normal ml-0.5">
                                                        {formatVnd(sz.price)}
                                                    </span>
                                                    {sz.stockQuantity !== null && sz.stockQuantity !== undefined && (
                                                        <span className="ml-0.5 text-[9px] font-medium text-slate-500">
                                                            ({sz.stockQuantity})
                                                        </span>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-[11px] text-[#86868B] italic">Không chia size</span>
                                        )}
                                    </div>

                                    {/* Topping trigger button */}
                                    {Array.isArray(prod.productToppings) && prod.productToppings.length > 0 ? (
                                        <button
                                            type="button"
                                            onClick={() => openProductDetail(prod)}
                                            className="mt-2.5 w-full py-1.5 px-2.5 rounded-[12px] bg-[#F9F9FB] hover:bg-[#F2F2F7] border border-black/[0.04] text-xs font-semibold text-[#1D1D1F] flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer"
                                        >
                                            <span className="flex items-center gap-1.5 text-[#0071E3] text-[11px]">
                                                <span>🧋</span>
                                                <span>{prod.productToppings.length} loại Topping</span>
                                            </span>
                                            <span className="text-[10px] text-[#86868B] font-medium">Chi tiết →</span>
                                        </button>
                                    ) : (
                                        <div className="mt-2.5 h-[30px]" />
                                    )}
                                </div>

                                {/* Apple iOS Toggle Switch (đẩy xuống đáy với mt-auto) */}
                                <div className="mt-3 pt-2.5 border-t border-black/[0.04] bg-[#F9F9FB] rounded-[16px] p-2 px-3 flex items-center justify-between">
                                    <span className={`text-xs font-semibold ${isAvailable ? 'text-[#1D1D1F]' : 'text-[#FF3B30]'}`}>
                                        {isAvailable ? 'Đang mở bán' : 'Khóa bán (Hết)'}
                                    </span>
                                    <Switch
                                        checked={isAvailable}
                                        loading={isToggling}
                                        onChange={() => handleToggleAvailability(pid, isAvailable)}
                                        checkedChildren="BÁN"
                                        unCheckedChildren="HẾT"
                                        className={isAvailable ? 'bg-[#34C759]' : 'bg-[#FF3B30]'}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Pagination via AppPagination */}
            <div className="flex justify-center sm:justify-end pt-4 pb-2">
                <AppPagination
                    current={currentPage}
                    pageSize={PAGE_SIZE}
                    total={total}
                    totalPages={totalPages}
                    onChange={(p) => {
                        setCurrentPage(p)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                />
            </div>

            {/* Apple Quick Sheet Modal: Sizes & Toppings Breakdown */}
            <Modal
                title={
                    <div className="flex items-center gap-2.5 text-base font-extrabold text-[#1D1D1F]">
                        <span>🧋 Chi tiết món & Topping:</span>
                        <span className="text-[#0071E3]">{selectedProduct?.name}</span>
                    </div>
                }
                open={detailModalOpen}
                onCancel={() => setDetailModalOpen(false)}
                footer={null}
                centered
                destroyOnClose
            >
                {selectedProduct && (
                    <div className="space-y-4 pt-1 max-h-[75vh] overflow-y-auto pr-1">
                        {/* Header Banner */}
                        <div className="flex items-center gap-3 p-3.5 bg-[#F9F9FB] rounded-[20px] border border-black/[0.05]">
                            <div className="h-16 w-16 shrink-0 rounded-[16px] overflow-hidden bg-white border border-black/[0.06] flex items-center justify-center">
                                {selectedProduct.imageUrl ? (
                                    <img
                                        src={selectedProduct.imageUrl}
                                        alt={selectedProduct.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-2xl">☕</span>
                                )}
                            </div>
                            <div>
                                <h4 className="font-extrabold text-base text-[#1D1D1F]">
                                    {selectedProduct.name}
                                </h4>
                                <div className="text-xs text-[#86868B] mt-0.5">
                                    Danh mục: <span className="font-semibold text-[#1D1D1F]">{selectedProduct.categoryName}</span>
                                </div>
                                <div className="text-xs text-[#86868B] mt-0.5">
                                    Giá gốc: <span className="font-extrabold text-[#0071E3] font-mono">{formatVnd(selectedProduct.basePrice || selectedProduct.price || 0)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Section: Sizes Breakdown */}
                        <div>
                            <h5 className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <span>📏</span>
                                <span>Các kích cỡ (Sizes) & Tồn kho:</span>
                            </h5>
                            {Array.isArray(selectedProduct.productSizes) && selectedProduct.productSizes.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {selectedProduct.productSizes.map((sz) => (
                                        <div
                                            key={sz.sizeId || sz.sizeName}
                                            className="p-3 rounded-[16px] bg-[#F5F5F7]/80 border border-black/[0.04] text-xs space-y-1"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-extrabold text-sm text-[#1D1D1F]">
                                                    Size {sz.sizeName || sz.name}
                                                </span>
                                                {sz.isOutOfStock ? (
                                                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                                        Hết size
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                                        Còn hàng
                                                    </span>
                                                )}
                                            </div>
                                            <div className="font-extrabold text-[#0071E3]">
                                                {formatVnd(sz.price)}
                                            </div>
                                            <div className="text-[11px] text-[#86868B]">
                                                Tồn kho: <span className="font-semibold text-[#1D1D1F]">{sz.stockQuantity ?? 0}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-[#86868B] italic">Món này không phân chia kích cỡ.</p>
                            )}
                        </div>

                        {/* Section: Toppings Breakdown */}
                        <div>
                            <h5 className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <span>🧋</span>
                                <span>Topping khả dụng ({selectedProduct.productToppings?.length || 0}):</span>
                            </h5>
                            {Array.isArray(selectedProduct.productToppings) && selectedProduct.productToppings.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {selectedProduct.productToppings.map((top) => (
                                        <div
                                            key={top.toppingId || top.toppingName}
                                            className="flex items-center gap-2.5 p-2.5 rounded-[16px] bg-[#F9F9FB] border border-black/[0.04]"
                                        >
                                            <div className="h-10 w-10 shrink-0 rounded-[12px] overflow-hidden bg-white border border-black/[0.06] flex items-center justify-center">
                                                {top.imageUrl ? (
                                                    <img
                                                        src={top.imageUrl}
                                                        alt={top.toppingName}
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none'
                                                            e.target.parentElement.innerHTML = '🧋'
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="text-sm">🧋</span>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-bold text-xs text-[#1D1D1F] truncate" title={top.toppingName}>
                                                    {top.toppingName}
                                                </div>
                                                <div className="flex items-center justify-between text-[11px] mt-0.5">
                                                    <span className="text-[#86868B]">Đơn vị: {top.unit || 'phần'}</span>
                                                    <span className="font-extrabold text-[#0071E3] font-mono">
                                                        +{formatVnd(top.price)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-[#86868B] italic">Món này không có topping kèm theo.</p>
                            )}
                        </div>

                        {/* Close button */}
                        <div className="pt-2 flex justify-end">
                            <Button
                                onClick={() => setDetailModalOpen(false)}
                                className="rounded-[12px] font-semibold"
                            >
                                Đóng
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
