import { useState, useEffect, useRef } from 'react'
import { useDebounce } from '../../hooks/useDebounce'

/**
 * AppSearchBox Component
 * Ô tìm kiếm tái sử dụng ở nhiều nơi (quản lý, sản phẩm...).
 * Có tích hợp sẵn useDebounce để chống gọi API liên tục khi người dùng đang gõ phím.
 */
export default function AppSearchBox({
    initialValue = '',
    placeholder = 'Tìm kiếm...',
    onSearch, // (debouncedValue) => void
    debounceTime = 400,
    className = 'flex-1 min-w-[220px]',
}) {
    const [keyword, setKeyword] = useState(initialValue)
    const debouncedKeyword = useDebounce(keyword, debounceTime)
    
    const onSearchRef = useRef(onSearch)
    const isFirstMount = useRef(true)

    // Luôn giữ tham chiếu mới nhất của onSearch
    useEffect(() => {
        onSearchRef.current = onSearch
    }, [onSearch])

    // Trigger onSearch when debounced keyword changes (bỏ qua lần đầu tiên render)
    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false
            return
        }
        if (onSearchRef.current) {
            onSearchRef.current(debouncedKeyword)
        }
    }, [debouncedKeyword])

    // Sync external changes
    useEffect(() => {
        setKeyword(initialValue)
    }, [initialValue])

    return (
        <div className={`relative ${className}`}>
            <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-[16px] border border-black/[0.06] bg-black/[0.04] px-4 py-2 pl-9 text-xs sm:text-sm font-medium text-[#1D1D1F] placeholder-[#86868B] outline-none transition-all focus:border-[#0071E3]/40 focus:bg-white focus:ring-2 focus:ring-[#0071E3]/15 shadow-2xs"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B] text-xs pointer-events-none">🔍</span>
            {keyword && (
                <button
                    type="button"
                    onClick={() => setKeyword('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-[#86868B] hover:bg-black/[0.08] hover:text-[#1D1D1F] cursor-pointer transition-colors"
                >
                    ✕
                </button>
            )}
        </div>
    )
}
