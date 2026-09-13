import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getProducts } from '../../redux/actions/user/productAction'
import ProductGrid from '../../components/product/ProductGrid'
import Pagination from '../../components/common/Pagination'
import hero from '../../assets/hero.png'

// ── Gợi ý tìm kiếm phổ biến ──────────────────────────────────────────────────
const QUICK_TAGS = ['Bạc xỉu', 'Cà phê đen đá', 'Cà phê sữa', 'Trà sữa', 'Bánh mì que']

export default function HomePage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { items, loading, error, totalPages, total } = useSelector((s) => s.product)

    const [pageNumber, setPageNumber] = useState(1)
    const [search, setSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('ALL')
    const [onlyAvailable, setOnlyAvailable] = useState(false)
    const [heroSearchInput, setHeroSearchInput] = useState('')

    // Tự động trích xuất các danh mục từ danh sách món hiện có
    const categories = useMemo(() => {
        const set = new Set()
        if (Array.isArray(items)) {
            items.forEach((p) => {
                if (p.categoryName) set.add(p.categoryName)
            })
        }
        return ['ALL', ...Array.from(set)]
    }, [items])

    // Gọi API lấy danh sách sản phẩm
    useEffect(() => {
        dispatch(
            getProducts({
                pageNumber,
                pageSize: 8,
                search: search.trim() || undefined,
            })
        )
    }, [dispatch, pageNumber, search])

    // Xử lý tìm kiếm từ Hero Section
    const handleHeroSearch = (e) => {
        e.preventDefault()
        const q = heroSearchInput.trim()
        if (q) {
            navigate(`/search?q=${encodeURIComponent(q)}`)
        }
    }

    // Xử lý click tag gợi ý
    const handleQuickTagClick = (tag) => {
        setHeroSearchInput(tag)
        navigate(`/search?q=${encodeURIComponent(tag)}`)
    }

    // Lọc theo Category và Chỉ món còn hàng tại Client
    const displayedItems = useMemo(() => {
        let list = Array.isArray(items) ? items : []

        if (selectedCategory !== 'ALL') {
            list = list.filter((p) => p.categoryName === selectedCategory)
        }

        if (onlyAvailable) {
            list = list.filter((p) => !p.isOutOfStock && (p.totalStock === undefined || p.totalStock > 0))
        }

        return list
    }, [items, selectedCategory, onlyAvailable])

    return (
        <div className="pb-12">
            {/* ── 1. Hero Section với Thanh Tìm Kiếm Đẳng Cấp ── */}
            <section className="mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 text-amber-50 shadow-xl md:flex md:items-stretch">
                <div className="flex flex-1 flex-col justify-center p-8 lg:p-12">
                    {/* Eyebrow Tag */}
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 border border-amber-400/20 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-300 w-fit">
                        <span>☕</span>
                        <span>Premium Coffee & Tea</span>
                    </div>

                    {/* Headline */}
                    <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl text-white leading-tight">
                        Thưởng thức vị cà phê đậm đà & món ngon mỗi ngày
                    </h1>

                    <p className="mt-3 text-sm text-amber-100/80 leading-relaxed max-w-lg">
                        Tùy chỉnh kích cỡ, thêm topping yêu thích và nhận hàng nhanh chóng tận tay bạn!
                    </p>

                    {/* Form Tìm Kiếm Cao Cấp */}
                    <form
                        onSubmit={handleHeroSearch}
                        className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center max-w-lg"
                    >
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={heroSearchInput}
                                onChange={(e) => setHeroSearchInput(e.target.value)}
                                placeholder="Tìm kiếm cà phê, bạc xỉu, trà sữa..."
                                className="w-full rounded-2xl border border-white/20 bg-white/95 px-4 py-3.5 pl-11 text-xs font-medium text-stone-800 placeholder-stone-400 shadow-inner backdrop-blur-md focus:border-amber-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
                            />
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-base pointer-events-none">
                                🔍
                            </span>
                            {heroSearchInput && (
                                <button
                                    type="button"
                                    onClick={() => setHeroSearchInput('')}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-600"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Nút Tìm kiếm sản phẩm nổi bật */}
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-6 py-3.5 text-xs font-extrabold text-white shadow-md shadow-amber-950/40 hover:from-amber-600 hover:to-amber-800 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 shrink-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                            </svg>
                            <span>Tìm kiếm ngay</span>
                        </button>
                    </form>

                    {/* Quick Search Chips */}
                    <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-amber-200/70">
                        <span className="font-semibold text-amber-300/90 mr-1">Gợi ý:</span>
                        {QUICK_TAGS.map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => handleQuickTagClick(tag)}
                                className="rounded-xl border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-amber-100 hover:bg-white/20 hover:text-white transition-colors"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Hero Image */}
                <div className="relative h-64 md:h-auto md:w-5/12 overflow-hidden">
                    <img
                        src={hero}
                        alt="Cafe Shop Banner"
                        className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-950/80 via-transparent to-transparent md:hidden" />
                </div>
            </section>

            {/* ── 2. Thanh Công Cụ Lọc & Tìm Kiếm Menu (Catalog Toolbar) ── */}
            <div className="mb-6 rounded-3xl border border-stone-200 bg-white p-5 shadow-xs">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Tiêu đề & Đếm số lượng món */}
                    <div>
                        <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                            <span>☕</span>
                            <span>Khám phá thực đơn</span>
                        </h2>
                        <p className="mt-0.5 text-xs text-stone-500">
                            Hiển thị <strong className="text-amber-800">{displayedItems.length}</strong> món phù hợp
                            {total ? ` (tổng cộng ${total} món trong hệ thống)` : ''}
                        </p>
                    </div>

                    {/* Live Search Input trên trang */}
                    <div className="relative min-w-[260px] md:w-72">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setPageNumber(1)
                                setSearch(e.target.value)
                            }}
                            placeholder="Lọc nhanh theo tên món..."
                            className="w-full rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-2 pl-9 text-xs text-stone-800 placeholder-stone-400 focus:border-amber-600 focus:bg-white focus:outline-hidden"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">
                            🔍
                        </span>
                        {search && (
                            <button
                                type="button"
                                onClick={() => {
                                    setPageNumber(1)
                                    setSearch('')
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-600"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Pills: Danh mục & Tồn kho */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3.5">
                    {/* Danh mục pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shadow-2xs ${
                                    selectedCategory === cat
                                        ? 'bg-amber-800 text-white shadow-xs'
                                        : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                                }`}
                            >
                                {cat === 'ALL' ? 'Tất cả danh mục' : cat}
                            </button>
                        ))}
                    </div>

                    {/* Toggle chỉ hiển thị món còn hàng */}
                    <button
                        type="button"
                        onClick={() => setOnlyAvailable((prev) => !prev)}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                            onlyAvailable
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs'
                                : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                        }`}
                    >
                        <span className={`h-2 w-2 rounded-full ${onlyAvailable ? 'bg-emerald-600' : 'bg-stone-300'}`} />
                        <span>Chỉ món còn hàng</span>
                    </button>
                </div>
            </div>

            {/* ── 3. Lỗi tải ── */}
            {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-xs font-semibold text-red-600">
                    {error}
                </div>
            )}

            {/* ── 4. Danh Sách Sản Phẩm (Product Grid) ── */}
            <ProductGrid items={displayedItems} loading={loading} />

            {/* ── 5. Phân Trang ── */}
            <div className="mt-8">
                <Pagination pageNumber={pageNumber} totalPages={totalPages} onChange={setPageNumber} />
            </div>
        </div>
    )
}
