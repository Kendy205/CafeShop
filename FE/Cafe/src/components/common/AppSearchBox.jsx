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
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 pl-10 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-colors focus:border-sky-600 focus:bg-white focus:ring-1 focus:ring-sky-200 shadow-xs"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">🔍</span>
            {keyword && (
                <button
                    type="button"
                    onClick={() => setKeyword('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer transition-colors"
                >
                    ✕
                </button>
            )}
        </div>
    )
}
