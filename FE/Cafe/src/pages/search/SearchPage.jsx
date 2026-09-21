import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { getProducts } from '../../redux/actions/user/productAction'
import { getCategories } from '../../redux/actions/user/categoryAction'
import ProductGrid from '../../components/product/ProductGrid'
import ProductSearchBox from '../../components/product/ProductSearchBox'
import AppPagination from '../../components/common/AppPagination'

const SORT_OPTIONS = [
    { value: '', label: 'Mới nhất' },
    { value: 'rating_desc', label: 'Đánh giá cao nhất ⭐' },
    { value: 'price_asc', label: 'Giá tăng dần' },
    { value: 'price_desc', label: 'Giá giảm dần' },
    { value: 'name_asc', label: 'Tên A → Z' },
]

const RATING_OPTIONS = [
    { value: '', label: '⭐ Tất cả sao' },
    { value: '5', label: '5 sao ⭐⭐⭐⭐⭐' },
    { value: '4', label: 'Từ 4 sao trở lên ⭐' },
    { value: '3', label: 'Từ 3 sao trở lên ⭐' },
    { value: '2', label: 'Từ 2 sao trở lên ⭐' },
]

function getCategoryIcon(catName) {
    if (!catName) return '✨'
    const lower = catName.toLowerCase()
    if (lower.includes('cà phê') || lower.includes('coffee')) return '☕'
    if (lower.includes('trà sữa') || lower.includes('milk tea')) return '🧋'
    if (lower.includes('trà') || lower.includes('tea')) return '🍵'
    if (lower.includes('bánh') || lower.includes('cake') || lower.includes('pastry')) return '🥐'
    if (lower.includes('đá xay') || lower.includes('freeze') || lower.includes('smoothie')) return '🥤'
    if (lower.includes('nước ép') || lower.includes('juice')) return '🍹'
    return '✨'
}

function SearchResults({ q, setParams }) {
    const dispatch = useDispatch()
    const { items, loading, error, totalPages, total, pageSize } = useSelector((s) => s.product)
    const { items: categories } = useSelector((s) => s.category)

    const [pageNumber, setPageNumber] = useState(1)
    const [selectedCategoryId, setSelectedCategoryId] = useState(null)
    const [sortBy, setSortBy] = useState('')
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [minRating, setMinRating] = useState('')

    // Fetch danh mục 1 lần khi mount
    useEffect(() => {
        dispatch(getCategories())
    }, [dispatch])

    // Gọi API khi filter thay đổi
    useEffect(() => {
        dispatch(
            getProducts({
                keyword: q || undefined,
                categoryId: selectedCategoryId || undefined,
                sortBy: sortBy || undefined,
                minPrice: minPrice !== '' ? Number(minPrice) : undefined,
                maxPrice: maxPrice !== '' ? Number(maxPrice) : undefined,
                minRating: minRating !== '' ? Number(minRating) : undefined,
                pageNumber,
                pageSize: 8,
            })
        )
    }, [dispatch, q, pageNumber, selectedCategoryId, sortBy, minPrice, maxPrice, minRating])

    const handleFilterChange = (setter) => (val) => {
        setPageNumber(1)
        setter(val)
    }

    const resetFilters = () => {
        setSelectedCategoryId(null)
        setSortBy('')
        setMinPrice('')
        setMaxPrice('')
        setMinRating('')
        setPageNumber(1)
    }

    const hasActiveFilter = selectedCategoryId || sortBy || minPrice || maxPrice || minRating

    return (
        <div className="space-y-6">
            {/* Tiêu đề trang */}
            <div>
                <h1 className="text-2xl font-black text-slate-800">
                    {q ? (
                        <>Kết quả tìm kiếm: <span className="text-sky-700">&ldquo;{q}&rdquo;</span></>
                    ) : (
                        'Tìm kiếm món'
                    )}
                </h1>
                {total > 0 && (
                    <p className="mt-1 text-xs text-slate-500">Tìm thấy <strong className="text-sky-900">{total}</strong> kết quả</p>
                )}
            </div>

            {/* Thanh tìm kiếm thông minh với Autocomplete & Suggestions */}
            <ProductSearchBox
                initialValue={q}
                onSearch={(val) => {
                    setParams(val ? { q: val } : {})
                    setPageNumber(1)
                }}
            />

            {/* Bộ lọc nâng cao */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-4">
                {/* Sort + Rating + Price */}
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 shrink-0">⚙️ Bộ lọc:</span>

                    {/* Sort */}
                    <select
                        id="search-sort"
                        value={sortBy}
                        onChange={(e) => handleFilterChange(setSortBy)(e.target.value)}
                        className="rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none cursor-pointer focus:border-sky-500 focus:ring-1 focus:ring-sky-200 transition-colors"
                        title="Sắp xếp theo"
                    >
                        {SORT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>

                    {/* Min Rating Filter */}
                    <select
                        id="search-rating"
                        value={minRating}
                        onChange={(e) => handleFilterChange(setMinRating)(e.target.value)}
                        className="rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none cursor-pointer focus:border-sky-500 focus:ring-1 focus:ring-sky-200 transition-colors"
                        title="Lọc theo đánh giá sao"
                    >
                        {RATING_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                    </select>

                    {/* Price range */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-500 shrink-0">💰</span>
                        <input
                            id="search-min-price"
                            type="number"
                            value={minPrice}
                            min={0}
                            onChange={(e) => handleFilterChange(setMinPrice)(e.target.value)}
                            placeholder="Từ (đ)"
                            className="w-24 rounded-3xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200 transition-colors"
                        />
                        <span className="text-xs text-slate-400">—</span>
                        <input
                            id="search-max-price"
                            type="number"
                            value={maxPrice}
                            min={0}
                            onChange={(e) => handleFilterChange(setMaxPrice)(e.target.value)}
                            placeholder="Đến (đ)"
                            className="w-24 rounded-3xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200 transition-colors"
                        />
                    </div>

                    {hasActiveFilter && (
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="ml-auto inline-flex items-center gap-1 rounded-3xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                        >
                            ✕ Xóa bộ lọc
                        </button>
                    )}
                </div>

                {/* Category pills */}
                <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                    <button
                        type="button"
                        onClick={() => handleFilterChange(setSelectedCategoryId)(null)}
                        className={`inline-flex items-center gap-1.5 rounded-3xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${selectedCategoryId === null
                            ? 'bg-sky-900 text-white shadow-sm'
                            : 'border border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:bg-sky-50/60'
                            }`}
                    >
                        🌟 Tất cả
                    </button>

                    {categories.map((cat) => (
                        <button
                            key={cat.categoryId}
                            type="button"
                            onClick={() => handleFilterChange(setSelectedCategoryId)(cat.categoryId)}
                            className={`inline-flex items-center gap-1.5 rounded-3xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${selectedCategoryId === cat.categoryId
                                ? 'bg-sky-900 text-white shadow-sm'
                                : 'border border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:bg-sky-50/60'
                                }`}
                        >
                            {getCategoryIcon(cat.name)} {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lỗi */}
            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-xs font-semibold text-red-600">
                    ⚠️ {error}
                </div>
            )}

            {/* Danh sách kết quả */}
            <ProductGrid items={items} loading={loading} />

            {!loading && items.length === 0 && !error && (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
                    <span className="text-4xl">🔍</span>
                    <h3 className="mt-3 text-base font-bold text-slate-800">Không tìm thấy kết quả</h3>
                    <p className="mt-1 text-xs text-slate-500">Thử từ khóa khác hoặc xóa bộ lọc.</p>
                    {hasActiveFilter && (
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="mt-3 inline-flex items-center gap-1.5 rounded-3xl bg-sky-800 px-4 py-2 text-xs font-bold text-white hover:bg-sky-900 transition-colors cursor-pointer"
                        >
                            Xóa bộ lọc
                        </button>
                    )}
                </div>
            )}

            <AppPagination
                current={pageNumber}
                pageSize={pageSize}
                total={total}
                onChange={setPageNumber}
                border={false}
                className="mt-4"
            />
        </div>
    )
}

export default function SearchPage() {
    const [params, setParams] = useSearchParams()
    const q = params.get('q') || ''
    return <SearchResults key={q} q={q} setParams={setParams} />
}
