import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { productService } from '../../services/user/ProductService'
import { formatVnd } from '../../utils/helpers/format'
import { unwrapApi } from '../../utils/helpers/api'

export default function ProductSearchBox({
    initialValue = '',
    placeholder = 'Tìm món: Cà phê, trà đào, bạc xỉu...',
    onSearch,
    className = '',
    inputClassName = '',
    buttonClassName = '',
    buttonText = 'Tìm kiếm',
    showButton = true,
    variant = 'default', // 'default' | 'hero'
}) {
    const navigate = useNavigate()
    const containerRef = useRef(null)

    const [keyword, setKeyword] = useState(initialValue)
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('topSelling') // 'topSelling' | 'newest'

    // Suggestions state (Default when keyword is empty)
    const [suggestions, setSuggestions] = useState({ topSellingProducts: [], newestProducts: [] })
    const [loadingSuggestions, setLoadingSuggestions] = useState(false)
    const [hasLoadedSuggestions, setHasLoadedSuggestions] = useState(false)

    // Autocomplete state (When user is typing)
    const [autocompleteList, setAutocompleteList] = useState([])
    const [loadingAutocomplete, setLoadingAutocomplete] = useState(false)

    // Sync initialValue if changed from parent
    useEffect(() => {
        setKeyword(initialValue)
    }, [initialValue])

    // Fetch suggestions once when opened with empty keyword
    const fetchSuggestions = async () => {
        if (hasLoadedSuggestions || loadingSuggestions) return
        setLoadingSuggestions(true)
        try {
            const res = await productService.getSuggestions()
            const data = unwrapApi(res)
            setSuggestions({
                topSellingProducts: data?.topSellingProducts || [],
                newestProducts: data?.newestProducts || [],
            })
            setHasLoadedSuggestions(true)
        } catch {
            // Im lặng xử lý để không chặn người dùng
        } finally {
            setLoadingSuggestions(false)
        }
    }

    // Debounced Autocomplete (250ms)
    useEffect(() => {
        const trimmed = keyword.trim()
        if (!trimmed) {
            setAutocompleteList([])
            setLoadingAutocomplete(false)
            return
        }

        setLoadingAutocomplete(true)
        const timer = setTimeout(async () => {
            try {
                const res = await productService.getAutocomplete(trimmed)
                const data = unwrapApi(res)
                setAutocompleteList(Array.isArray(data) ? data : [])
            } catch {
                setAutocompleteList([])
            } finally {
                setLoadingAutocomplete(false)
            }
        }, 250)

        return () => clearTimeout(timer)
    }, [keyword])

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleFocus = () => {
        setIsOpen(true)
        if (!keyword.trim()) {
            fetchSuggestions()
        }
    }

    const handleSubmit = (e) => {
        if (e) e.preventDefault()
        setIsOpen(false)
        const q = keyword.trim()
        if (onSearch) {
            onSearch(q)
        } else {
            navigate(`/search?q=${encodeURIComponent(q)}`)
        }
    }

    const handleSelectProduct = (productId) => {
        setIsOpen(false)
        navigate(`/menu/${productId}`)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsOpen(false)
        }
    }

    const isHero = variant === 'hero'

    const topSelling = suggestions.topSellingProducts || []
    const newest = suggestions.newestProducts || []
    const currentSuggestionList = activeTab === 'topSelling' ? topSelling : newest

    return (
        <div ref={containerRef} className={`relative w-full ${className}`} onKeyDown={handleKeyDown}>
            {/* Thanh Search Input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                    <input
                        id="product-search-input"
                        type="text"
                        value={keyword}
                        onChange={(e) => {
                            setKeyword(e.target.value)
                            if (!isOpen) setIsOpen(true)
                        }}
                        onFocus={handleFocus}
                        placeholder={placeholder}
                        autoComplete="off"
                        className={`w-full rounded-2xl transition-all outline-none ${
                            isHero
                                ? 'border border-white/20 bg-white/95 px-4 py-3.5 pl-11 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-lg shadow-black/10 backdrop-blur-md focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-500/40'
                                : 'border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-xs focus:border-sky-500 focus:ring-2 focus:ring-sky-200'
                        } ${inputClassName}`}
                    />

                    {/* Icon Kính lúp */}
                    <span
                        className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${
                            isHero ? 'left-3.5 text-lg text-slate-400' : 'left-3 text-slate-400'
                        }`}
                    >
                        🔍
                    </span>

                    {/* Nút xóa nhanh (Clear) */}
                    {keyword && (
                        <button
                            type="button"
                            onClick={() => {
                                setKeyword('')
                                setAutocompleteList([])
                                fetchSuggestions()
                            }}
                            className={`absolute right-3.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer`}
                            title="Xóa tìm kiếm"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Nút Tìm kiếm */}
                {showButton && (
                    <button
                        type="submit"
                        className={`cursor-pointer shrink-0 font-bold transition-all active:scale-[0.98] ${
                            isHero
                                ? 'inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 px-6 py-3.5 text-sm text-white shadow-lg shadow-sky-950/50 hover:from-sky-600 hover:to-sky-800 hover:shadow-xl hover:scale-[1.02]'
                                : 'rounded-2xl bg-gradient-to-r from-sky-700 to-sky-800 px-5 py-2.5 text-sm text-white shadow-sm hover:from-sky-800 hover:to-sky-900 hover:scale-[1.02]'
                        } ${buttonClassName}`}
                    >
                        {isHero ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                                </svg>
                                <span>{buttonText}</span>
                            </>
                        ) : (
                            buttonText
                        )}
                    </button>
                )}
            </form>

            {/* Dropdown Gợi ý & Autocomplete */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[480px] overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-xl transition-all duration-200 animate-in fade-in slide-in-from-top-2">
                    {/* TRƯỜNG HỢP 1: ĐANG GÕ TỪ KHÓA -> AUTOCOMPLETE */}
                    {keyword.trim().length > 0 ? (
                        <div>
                            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/75 px-4 py-2.5 text-xs font-semibold text-slate-500">
                                <span>Gợi ý nhanh cho &ldquo;<strong className="text-sky-800">{keyword}</strong>&rdquo;</span>
                                {loadingAutocomplete && (
                                    <span className="inline-flex items-center gap-1.5 text-sky-600">
                                        <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                        </svg>
                                        Đang tìm...
                                    </span>
                                )}
                            </div>

                            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 py-1">
                                {!loadingAutocomplete && autocompleteList.length === 0 ? (
                                    <div className="p-6 text-center">
                                        <p className="text-sm font-medium text-slate-500">Không tìm thấy món phù hợp</p>
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            className="mt-2 text-xs font-bold text-sky-700 hover:text-sky-900 underline cursor-pointer"
                                        >
                                            Nhấn để tìm kiếm toàn bộ với &ldquo;{keyword}&rdquo;
                                        </button>
                                    </div>
                                ) : (
                                    autocompleteList.map((item) => (
                                        <div
                                            key={item.productId}
                                            onClick={() => handleSelectProduct(item.productId)}
                                            className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-sky-50/70 cursor-pointer group"
                                        >
                                            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200/80">
                                                {item.imageUrl ? (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-base">☕</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-slate-800 group-hover:text-sky-900 truncate">
                                                    {item.name}
                                                </h4>
                                                <span className="text-xs font-bold text-sky-700">
                                                    {formatVnd(item.basePrice)}
                                                </span>
                                            </div>
                                            <span className="text-xs font-medium text-slate-400 group-hover:text-sky-600 transition-colors">
                                                Xem →
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>

                            {autocompleteList.length > 0 && (
                                <div className="border-t border-slate-100 bg-slate-50/70 p-2.5 text-center">
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-sky-800 hover:text-sky-950 transition-colors cursor-pointer"
                                    >
                                        🔍 Xem tất cả kết quả cho &ldquo;{keyword}&rdquo;
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* TRƯỜNG HỢP 2: CHƯA GÕ TỪ KHÓA -> GỢI Ý MẶC ĐỊNH (SUGGESTIONS) */
                        <div>
                            {/* Header Tabs */}
                            <div className="flex border-b border-slate-100 bg-slate-50/80 p-1.5 gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('topSelling')}
                                    className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                        activeTab === 'topSelling'
                                            ? 'bg-white text-sky-900 shadow-xs'
                                            : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                                    }`}
                                >
                                    🔥 Bán chạy nhất ({topSelling.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('newest')}
                                    className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                        activeTab === 'newest'
                                            ? 'bg-white text-sky-900 shadow-xs'
                                            : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                                    }`}
                                >
                                    ✨ Mới ra mắt ({newest.length})
                                </button>
                            </div>

                            {/* Nội dung danh sách gợi ý */}
                            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 py-1">
                                {loadingSuggestions ? (
                                    <div className="flex items-center justify-center p-8 text-xs text-slate-400 gap-2">
                                        <svg className="h-4 w-4 animate-spin text-sky-600" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                        </svg>
                                        Đang tải gợi ý...
                                    </div>
                                ) : currentSuggestionList.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-slate-400">
                                        Chưa có danh sách gợi ý
                                    </div>
                                ) : (
                                    currentSuggestionList.map((item, idx) => (
                                        <div
                                            key={item.productId}
                                            onClick={() => handleSelectProduct(item.productId)}
                                            className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-sky-50/70 cursor-pointer group"
                                        >
                                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
                                                idx === 0
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : idx === 1
                                                    ? 'bg-slate-200 text-slate-700'
                                                    : idx === 2
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : 'text-slate-400'
                                            }`}>
                                                {idx + 1}
                                            </span>

                                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200/80">
                                                {item.imageUrl ? (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-sm">☕</div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-semibold text-slate-800 group-hover:text-sky-900 truncate">
                                                    {item.name}
                                                </h4>
                                                <span className="text-[11px] font-bold text-sky-700">
                                                    {formatVnd(item.basePrice)}
                                                </span>
                                            </div>

                                            <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200/60 group-hover:bg-sky-100 transition-colors">
                                                Chọn món
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
