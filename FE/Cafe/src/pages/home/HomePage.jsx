import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getProducts } from '../../redux/actions/user/productAction'
import { getCategories } from '../../redux/actions/user/categoryAction'
import ProductGrid from '../../components/product/ProductGrid'
import AppPagination from '../../components/common/AppPagination'
import LoadingLink from '../../components/loading/LoadingLink'
import hero from '../../assets/ChatGPT Image 16_14_44 8 thg 9, 2026.png'

// ── Gợi ý tìm kiếm phổ biến ──────────────────────────────────────────────────
const QUICK_TAGS = ['Bạc xỉu', 'Cà phê muối', 'Cà phê đen đá', 'Trà đào cam sả', 'Trà sữa trân châu', 'Bánh croissant']

// ── Hàm gán icon sinh động cho từng danh mục ──────────────────────────────────
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

const SORT_OPTIONS = [
    { value: '', label: 'Mới nhất' },
    { value: 'price_asc', label: 'Giá tăng dần' },
    { value: 'price_desc', label: 'Giá giảm dần' },
    { value: 'name_asc', label: 'Tên A → Z' },
]

export default function HomePage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { items, loading, error, totalPages, total, pageSize } = useSelector((s) => s.product)
    const { items: categories } = useSelector((s) => s.category)

    const [pageNumber, setPageNumber] = useState(1)
    const [keyword, setKeyword] = useState('')
    const [selectedCategoryId, setSelectedCategoryId] = useState(null) // null = Tất cả
    const [sortBy, setSortBy] = useState('')
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [heroSearchInput, setHeroSearchInput] = useState('')

    // Fetch danh mục 1 lần khi mount
    useEffect(() => {
        dispatch(getCategories())
    }, [dispatch])

    // Gọi API lấy danh sách sản phẩm khi filter thay đổi
    useEffect(() => {
        dispatch(
            getProducts({
                pageNumber,
                pageSize: 8,
                keyword: keyword.trim() || undefined,
                categoryId: selectedCategoryId || undefined,
                sortBy: sortBy || undefined,
                minPrice: minPrice !== '' ? Number(minPrice) : undefined,
                maxPrice: maxPrice !== '' ? Number(maxPrice) : undefined,
            })
        )
    }, [dispatch, pageNumber, keyword, selectedCategoryId, sortBy, minPrice, maxPrice])

    // Reset về trang 1 khi đổi filter
    const handleFilterChange = (setter) => (val) => {
        setPageNumber(1)
        setter(val)
    }

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

    const resetAllFilters = () => {
        setPageNumber(1)
        setKeyword('')
        setSelectedCategoryId(null)
        setSortBy('')
        setMinPrice('')
        setMaxPrice('')
    }

    const hasActiveFilter = selectedCategoryId || sortBy || minPrice || maxPrice || keyword

    return (
        <div className="space-y-12 pb-16">
            {/* ── 1. Hero Section Cao Cấp & Ấm Cúng ── */}
            <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1a1008] via-[#2d180c] to-[#180e07] text-sky-50 shadow-2xl">
                {/* Hiệu ứng ánh sáng nền (Ambient Glows) */}
                <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-orange-600/10 blur-3xl" />

                <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center p-8 sm:p-10 lg:p-14">
                    {/* Cột Trái: Tiêu đề & Form tìm kiếm */}
                    <div className="lg:col-span-7 flex flex-col justify-center">
                        {/* Eyebrow Tag */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-sky-300 backdrop-blur-md w-fit shadow-xs">
                            <span className="text-sm">☕</span>
                            <span>Cà Phê Rang Mộc &amp; Trà Thượng Hạng</span>
                        </div>

                        {/* Headline */}
                        <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl text-white leading-[1.18]">
                            Thưởng thức vị cà phê{' '}
                            <span className="bg-gradient-to-r from-sky-200 via-sky-300 to-sky-100 bg-clip-text text-transparent">
                                đậm đà &amp; trọn vẹn
                            </span>{' '}
                            mỗi ngày
                        </h1>

                        <p className="mt-4 text-sm sm:text-base text-sky-100/75 leading-relaxed max-w-xl">
                            Từ những hạt cà phê chín mọng đến tách đồ uống thơm nồng trên tay bạn.
                            Tùy chỉnh độ ngọt, mức đá và nhận hàng nóng hổi trong chốc lát!
                        </p>

                        {/* Thanh Tìm Kiếm Nổi (Floating Search Bar) */}
                        <form
                            onSubmit={handleHeroSearch}
                            className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center max-w-xl"
                        >
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={heroSearchInput}
                                    onChange={(e) => setHeroSearchInput(e.target.value)}
                                    placeholder="Tìm món: Cà phê sữa, bạc xỉu, trà đào..."
                                    className="w-full rounded-2xl border border-white/20 bg-white/95 px-4 py-3.5 pl-11 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-lg shadow-black/10 backdrop-blur-md focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                                />
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
                                    🔍
                                </span>
                                {heroSearchInput && (
                                    <button
                                        type="button"
                                        onClick={() => setHeroSearchInput('')}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                                        title="Xóa tìm kiếm"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-950/50 hover:from-sky-600 hover:to-sky-800 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shrink-0 cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                                </svg>
                                <span>Tìm kiếm</span>
                            </button>
                        </form>

                        {/* Quick Tags Gợi Ý */}
                        <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-sky-200/80">
                            <span className="font-semibold text-sky-300 mr-1 flex items-center gap-1">
                                <span>🔥</span> Gợi ý:
                            </span>
                            {QUICK_TAGS.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleQuickTagClick(tag)}
                                    className="rounded-3xl border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-sky-100/90 hover:bg-white/20 hover:text-white transition-all cursor-pointer backdrop-blur-xs"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>

                        {/* 3 Chỉ số cam kết nhanh (Key Highlights) */}
                        <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-6 max-w-xl">
                            <div className="flex flex-col">
                                <span className="text-xl sm:text-2xl font-black text-sky-300">100%</span>
                                <span className="text-xs text-sky-100/70 mt-0.5">Hạt Cà Phê Mộc</span>
                            </div>
                            <div className="flex flex-col border-l border-white/10 pl-3">
                                <span className="text-xl sm:text-2xl font-black text-sky-300">25 Phút</span>
                                <span className="text-xs text-sky-100/70 mt-0.5">Giao Hàng Siêu Tốc</span>
                            </div>
                            <div className="flex flex-col border-l border-white/10 pl-3">
                                <span className="text-xl sm:text-2xl font-black text-sky-300">4.9 ★</span>
                                <span className="text-xs text-sky-100/70 mt-0.5">Hài Lòng Từ Khách</span>
                            </div>
                        </div>
                    </div>

                    {/* Cột Phải: Ảnh Nghệ Thuật & Badges */}
                    <div className="lg:col-span-5 relative flex items-center justify-center">
                        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-sky-500/20 bg-gradient-to-b from-sky-500/10 to-transparent p-2 shadow-2xl">
                            <div className="overflow-hidden rounded-2xl bg-slate-900/60 aspect-4/3 sm:aspect-square">
                                <img
                                    src={hero}
                                    alt="Ly cà phê nghệ thuật"
                                    className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
                                />
                            </div>

                            {/* Floating Badge 1: Món đặc trưng */}
                            <div className="absolute -bottom-2 -left-2 sm:bottom-4 sm:left-4 flex items-center gap-3 rounded-2xl border border-white/20 bg-slate-900/80 p-3 shadow-xl backdrop-blur-md">
                                <div className="flex h-10 w-10 items-center justify-center rounded-3xl bg-sky-500/20 text-xl text-sky-300">
                                    ☕
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">Signature Blend</p>
                                    <p className="text-[11px] text-sky-200/70">Đậm đà chuẩn gu Việt</p>
                                </div>
                            </div>

                            {/* Floating Badge 2: Ưu đãi ship */}
                            <div className="absolute -top-2 -right-2 sm:top-4 sm:right-4 rounded-2xl border border-white/20 bg-sky-900/80 px-3.5 py-2 shadow-xl backdrop-blur-md text-right">
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-200">
                                    <span>🎉</span> Freeship đơn gần
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 2. Dải Giá Trị Nổi Bật (Features / Value Propositions) ── */}
            <section className="grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-4">
                <div className="flex flex-col items-start rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:-translate-y-1 hover:border-sky-300 hover:shadow-md">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-2xl text-sky-800">☕</span>
                    <h3 className="mt-3.5 text-sm font-bold text-slate-800">Cà Phê Nguyên Chất</h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        Hạt Robusta &amp; Arabica tuyển chọn từ nông trại Tây Nguyên, rang mộc tự nhiên.
                    </p>
                </div>

                <div className="flex flex-col items-start rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:-translate-y-1 hover:border-sky-300 hover:shadow-md">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-2xl text-sky-800">🚀</span>
                    <h3 className="mt-3.5 text-sm font-bold text-slate-800">Giao Nhanh Tận Nơi</h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        Đóng gói cách nhiệt chuyên dụng, giữ trọn độ nóng hoặc đá mát lạnh tới tay bạn.
                    </p>
                </div>

                <div className="flex flex-col items-start rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:-translate-y-1 hover:border-sky-300 hover:shadow-md">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-2xl text-sky-800">🎟️</span>
                    <h3 className="mt-3.5 text-sm font-bold text-slate-800">Ưu Đãi Hấp Dẫn</h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        Voucher giảm giá món, miễn phí vận chuyển liên tục cập nhật mỗi ngày.
                    </p>
                </div>

                <div className="flex flex-col items-start rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:-translate-y-1 hover:border-sky-300 hover:shadow-md">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-2xl text-sky-800">🌿</span>
                    <h3 className="mt-3.5 text-sm font-bold text-slate-800">Tùy Chọn Theo Gu</h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        Dễ dàng điều chỉnh lượng đường, mức đá, chọn size và topping phong phú.
                    </p>
                </div>
            </section>

            {/* ── 3. Dải Banner Khuyến Mãi Nhỏ (Voucher Promo Strip) ── */}
            <section className="relative flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden rounded-3xl border border-sky-200/70 bg-gradient-to-r from-sky-50 via-orange-50/50 to-sky-100/60 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-800 text-2xl text-white shadow-sm">🎁</div>
                    <div>
                        <h4 className="text-sm sm:text-base font-bold text-sky-950">Bạn đã nhận mã giảm giá hôm nay chưa?</h4>
                        <p className="text-xs text-sky-800/80 mt-0.5">
                            Hàng loạt voucher giảm đến 30% và ưu đãi Freeship đang chờ bạn trong ví!
                        </p>
                    </div>
                </div>
                <LoadingLink
                    to="/vouchers"
                    className="inline-flex items-center gap-1.5 rounded-3xl bg-sky-800 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-sky-900 hover:scale-[1.02] shrink-0"
                >
                    <span>Khám phá Voucher</span>
                    <span>→</span>
                </LoadingLink>
            </section>

            {/* ── 4. Thanh Công Cụ Khám Phá Menu (Catalog Toolbar) ── */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
                {/* Row 1: Tiêu đề + Keyword search + Sort */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-2xl bg-sky-100 text-sky-900 text-sm">📋</span>
                            <h2 className="text-xl font-bold text-slate-800">Khám phá thực đơn</h2>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            Hiển thị <strong className="font-semibold text-sky-900">{items.length}</strong> món thơm ngon
                            {total ? ` / tổng ${total} món` : ''}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Keyword search */}
                        <div className="relative min-w-[220px]">
                            <input
                                id="homepage-keyword"
                                type="text"
                                value={keyword}
                                onChange={(e) => handleFilterChange(setKeyword)(e.target.value)}
                                placeholder="Tìm tên món..."
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 pl-9 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-colors focus:border-sky-600 focus:bg-white focus:ring-1 focus:ring-sky-200"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">🔍</span>
                            {keyword && (
                                <button
                                    type="button"
                                    onClick={() => handleFilterChange(setKeyword)('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Sort dropdown */}
                        <select
                            id="homepage-sort"
                            value={sortBy}
                            onChange={(e) => handleFilterChange(setSortBy)(e.target.value)}
                            className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs font-medium text-slate-700 outline-none cursor-pointer focus:border-sky-600 focus:ring-1 focus:ring-sky-200 transition-colors"
                        >
                            {SORT_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Row 2: Category pills từ API */}
                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                    <button
                        type="button"
                        onClick={() => handleFilterChange(setSelectedCategoryId)(null)}
                        className={`inline-flex items-center gap-1.5 rounded-3xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${selectedCategoryId === null
                            ? 'bg-sky-900 text-white shadow-sm shadow-sky-950/20'
                            : 'border border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:bg-sky-50/60'
                            }`}
                    >
                        <span>🌟</span>
                        <span>Tất cả thực đơn</span>
                    </button>

                    {categories.map((cat) => {
                        const isSelected = selectedCategoryId === cat.categoryId
                        return (
                            <button
                                key={cat.categoryId}
                                type="button"
                                onClick={() => handleFilterChange(setSelectedCategoryId)(cat.categoryId)}
                                className={`inline-flex items-center gap-1.5 rounded-3xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${isSelected
                                    ? 'bg-sky-900 text-white shadow-sm shadow-sky-950/20'
                                    : 'border border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:bg-sky-50/60'
                                    }`}
                            >
                                <span>{getCategoryIcon(cat.name)}</span>
                                <span>{cat.name}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Row 3: Bộ lọc giá + nút reset */}
                <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
                    <span className="text-xs font-semibold text-slate-500">💰 Khoảng giá:</span>
                    <div className="flex items-center gap-2">
                        <input
                            id="homepage-min-price"
                            type="number"
                            value={minPrice}
                            min={0}
                            onChange={(e) => handleFilterChange(setMinPrice)(e.target.value)}
                            placeholder="Từ (đ)"
                            className="w-28 rounded-3xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200 transition-colors"
                        />
                        <span className="text-xs text-slate-400">—</span>
                        <input
                            id="homepage-max-price"
                            type="number"
                            value={maxPrice}
                            min={0}
                            onChange={(e) => handleFilterChange(setMaxPrice)(e.target.value)}
                            placeholder="Đến (đ)"
                            className="w-28 rounded-3xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200 transition-colors"
                        />
                    </div>

                    {hasActiveFilter && (
                        <button
                            type="button"
                            onClick={resetAllFilters}
                            className="ml-auto inline-flex items-center gap-1 rounded-3xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                        >
                            ✕ Xóa bộ lọc
                        </button>
                    )}
                </div>
            </section>

            {/* ── 5. Thông Báo Lỗi Nếu Có ── */}
            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-xs font-semibold text-red-600">
                    ⚠️ {error}
                </div>
            )}

            {/* ── 6. Danh Sách Món (Product Grid) ── */}
            <section>
                <ProductGrid items={items} loading={loading} />

                {!loading && items.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
                        <span className="text-4xl">☕</span>
                        <h3 className="mt-3 text-base font-bold text-slate-800">Không tìm thấy món phù hợp</h3>
                        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                            Hãy thử đổi từ khóa tìm kiếm hoặc bấm xem tất cả danh mục để khám phá thêm nhiều món ngon.
                        </p>
                        <button
                            type="button"
                            onClick={resetAllFilters}
                            className="mt-4 inline-flex items-center gap-1.5 rounded-3xl bg-sky-800 px-4 py-2 text-xs font-bold text-white hover:bg-sky-900 transition-colors cursor-pointer"
                        >
                            <span>Xem tất cả món</span>
                        </button>
                    </div>
                )}
            </section>

            {/* ── 7. Phân Trang (Pagination) ── */}
            <AppPagination
                current={pageNumber}
                pageSize={pageSize}
                total={total}
                onChange={setPageNumber}
                border={false}
                className="justify-center pt-2"
            />


            {/* ── 8. Banner Cuối Trang (Warm Cafe Story & Experience) ── */}
            <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-8 sm:p-10 text-center text-white shadow-xl">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="relative z-10 max-w-2xl mx-auto space-y-3">
                    <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase text-sky-300">
                        Cảm hứng &amp; Đam mê
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black">
                        Khởi đầu ngày mới tràn đầy năng lượng cùng tách cà phê thơm ngát
                    </h2>
                    <p className="text-xs sm:text-sm text-sky-100/70 leading-relaxed">
                        Mỗi ly cà phê đều được chuẩn bị với sự tâm huyết, từ hạt rang mộc đến công thức pha chế riêng biệt.
                    </p>
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="inline-flex items-center gap-2 rounded-3xl bg-sky-500 px-5 py-2.5 text-xs font-extrabold text-slate-900 hover:bg-sky-400 transition-all cursor-pointer shadow-lg shadow-sky-950/40"
                        >
                            <span>Khám phá menu ngay</span>
                            <span>↑</span>
                        </button>
                    </div>
                </div>
            </section>
        </div>
    )
}
