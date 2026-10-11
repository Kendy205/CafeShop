import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getProducts } from '../../redux/actions/user/productAction'
import { getCategories } from '../../redux/actions/user/categoryAction'
import ProductGrid from '../../components/product/ProductGrid'
import ProductSearchBox from '../../components/product/ProductSearchBox'
import AppSearchBox from '../../components/common/AppSearchBox'
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
]

/**
 * HomePage Component
 * Trang chủ của ứng dụng CafeShop.
 * Hiển thị Banner nổi bật, Menu sản phẩm đầy đủ với các bộ lọc (giá, số sao, danh mục) và tìm kiếm tích hợp.
 */
export default function HomePage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { items, loading, error, totalPages, total, pageSize } = useSelector((s) => s.user.product)
    const { items: categories } = useSelector((s) => s.user.category)

    const [pageNumber, setPageNumber] = useState(1)
    const [keyword, setKeyword] = useState('')
    const [selectedCategoryId, setSelectedCategoryId] = useState(null) // null = Tất cả
    const [sortBy, setSortBy] = useState('')
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [minRating, setMinRating] = useState('')

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
                minRating: minRating !== '' ? Number(minRating) : undefined,
            })
        )
    }, [dispatch, pageNumber, keyword, selectedCategoryId, sortBy, minPrice, maxPrice, minRating])

    // Reset về trang 1 khi đổi filter
    const handleFilterChange = (setter) => (val) => {
        setPageNumber(1)
        setter(val)
    }

    // Xử lý click tag gợi ý
    const handleQuickTagClick = (tag) => {
        navigate(`/search?q=${encodeURIComponent(tag)}`)
    }

    const resetAllFilters = () => {
        setPageNumber(1)
        setKeyword('')
        setSelectedCategoryId(null)
        setSortBy('')
        setMinPrice('')
        setMaxPrice('')
        setMinRating('')
    }

    const hasActiveFilter = selectedCategoryId || sortBy || minPrice || maxPrice || keyword || minRating

    return (
        <div className="space-y-12 pb-16">
            {/* ── 1. Hero Section Cao Cấp & Ấm Cúng ── */}
            <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#120a05] via-[#211208] to-[#0c0603] text-slate-100 shadow-2xl border border-amber-900/20">
                {/* Hiệu ứng ánh sáng nền đa tầng (Ambient Glows) */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-amber-600/15 blur-[120px]" />
                    <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-sky-500/15 blur-[120px]" />
                    <div className="absolute top-1/2 left-1/3 -translate-y-1/2 h-80 w-80 rounded-full bg-orange-500/10 blur-[100px]" />
                    <div 
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                            backgroundSize: '32px 32px'
                        }}
                    />
                </div>

                <div className="relative z-10 grid gap-8 md:grid-cols-12 md:items-center p-6 sm:p-10 lg:p-14">
                    {/* Cột Trái: Tiêu đề & Form tìm kiếm */}
                    <div className="md:col-span-7 flex flex-col justify-center">
                        {/* Eyebrow Tag */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-300 backdrop-blur-md w-fit shadow-xs">
                            <span className="text-sm">☕</span>
                            <span>Cà Phê Rang Mộc &amp; Trà Thượng Hạng</span>
                        </div>

                        {/* Headline */}
                        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl text-white leading-[1.2]">
                            Thưởng thức vị cà phê{' '}
                            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                                đậm đà &amp; trọn vẹn
                            </span>{' '}
                            mỗi ngày
                        </h1>

                        <p className="mt-3.5 text-sm sm:text-base text-slate-300/85 leading-relaxed max-w-xl">
                            Từ những hạt cà phê chín mọng đến tách đồ uống thơm nồng trên tay bạn.
                            Tùy chỉnh độ ngọt, mức đá và nhận hàng nóng hổi trong chốc lát!
                        </p>

                        {/* Thanh Tìm Kiếm Nổi (Floating Search Bar with Autocomplete & Suggestions) */}
                        <div className="mt-6 max-w-xl relative z-30">
                            <div className="p-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl">
                                <ProductSearchBox
                                    variant="hero"
                                    placeholder="Tìm món: Cà phê sữa, bạc xỉu, trà đào..."
                                    onSearch={(q) => {
                                        if (q) navigate(`/search?q=${encodeURIComponent(q)}`)
                                    }}
                                />
                            </div>
                        </div>

                        {/* Quick Tags Gợi Ý */}
                        <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-slate-300/90">
                            <span className="font-semibold text-amber-300 mr-1 flex items-center gap-1">
                                <span>🔥</span> Gợi ý:
                            </span>
                            {QUICK_TAGS.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleQuickTagClick(tag)}
                                    className="rounded-full border border-white/15 bg-white/10 hover:bg-white/20 px-3 py-1 text-xs font-medium text-slate-200 hover:text-white transition-all cursor-pointer backdrop-blur-sm active:scale-95 shadow-xs"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>

                        {/* 3 Chỉ số cam kết nhanh (Key Highlights) */}
                        <div className="mt-7 grid grid-cols-3 gap-3 border-t border-white/10 pt-6 max-w-xl">
                            <div className="flex flex-col">
                                <span className="text-xl sm:text-2xl font-black text-amber-300">100%</span>
                                <span className="text-xs text-slate-300/75 mt-0.5">Hạt Cà Phê Mộc</span>
                            </div>
                            <div className="flex flex-col border-l border-white/10 pl-3 sm:pl-4">
                                <span className="text-xl sm:text-2xl font-black text-amber-300">25 Phút</span>
                                <span className="text-xs text-slate-300/75 mt-0.5">Giao Hàng Siêu Tốc</span>
                            </div>
                            <div className="flex flex-col border-l border-white/10 pl-3 sm:pl-4">
                                <span className="text-xl sm:text-2xl font-black text-amber-300">4.9 ★</span>
                                <span className="text-xs text-slate-300/75 mt-0.5">Hài Lòng Từ Khách</span>
                            </div>
                        </div>
                    </div>

                    {/* Cột Phải: Ảnh Nghệ Thuật & Badges */}
                    <div className="md:col-span-5 relative flex items-center justify-center mt-4 md:mt-0">
                        {/* Floating Aura Halo behind image */}
                        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-600/20 blur-2xl pointer-events-none" />

                        <div className="relative w-full max-w-[320px] sm:max-w-[360px] lg:max-w-md">
                            {/* Main Card Frame */}
                            <div className="overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-white/10 via-black/30 to-black/60 p-3 shadow-2xl backdrop-blur-xl">
                                <div className="overflow-hidden rounded-2xl bg-slate-950/80 aspect-square relative group">
                                    <img
                                        src={hero}
                                        alt="Ly cà phê nghệ thuật"
                                        className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
                                </div>
                            </div>

                            {/* Floating Badge 1: Món đặc trưng */}
                            <div className="absolute -bottom-3 -left-3 sm:bottom-2 sm:-left-4 flex items-center gap-3 rounded-2xl border border-white/20 bg-slate-950/85 p-3 shadow-2xl backdrop-blur-xl animate-in fade-in duration-500">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-xl text-white shadow-md shadow-amber-500/30">
                                    ☕
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">Signature Blend</p>
                                    <p className="text-[11px] text-amber-200/80">Đậm đà chuẩn gu Việt</p>
                                </div>
                            </div>

                            {/* Floating Badge 2: Ưu đãi ship */}
                            <div className="absolute -top-3 -right-3 sm:top-2 sm:-right-4 rounded-2xl border border-white/20 bg-sky-950/85 px-3.5 py-2 shadow-2xl backdrop-blur-xl animate-in fade-in duration-500">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-200">
                                    <span className="text-sm">🎉</span> Freeship đơn gần
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
                        <AppSearchBox
                            initialValue={keyword}
                            placeholder="Tìm tên món..."
                            onSearch={(val) => handleFilterChange(setKeyword)(val)}
                            className="min-w-[220px]"
                        />

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

                        {/* Rating filter dropdown */}
                        <select
                            id="homepage-rating"
                            value={minRating}
                            onChange={(e) => handleFilterChange(setMinRating)(e.target.value)}
                            className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs font-medium text-slate-700 outline-none cursor-pointer focus:border-sky-600 focus:ring-1 focus:ring-sky-200 transition-colors"
                            title="Lọc theo đánh giá sao"
                        >
                            {RATING_OPTIONS.map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
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


            {/* ── 3. Dải Banner Khuyến Mãi Nhỏ (Voucher Promo Strip) (Đã di chuyển xuống đây) ── */}
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
