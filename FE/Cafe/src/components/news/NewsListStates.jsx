/**
 * NewsCardSkeleton — Loading placeholder cho NewsCard.
 */
export function NewsCardSkeleton() {
    return (
        <div className="flex flex-col sm:flex-row gap-5 bg-white rounded-3xl border border-slate-200/80 p-5 animate-pulse">
            <div className="shrink-0 w-full sm:w-36 h-28 rounded-2xl bg-slate-100" />
            <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                <div className="h-3 bg-slate-100 rounded-full w-full" />
                <div className="h-3 bg-slate-100 rounded-full w-1/2" />
            </div>
        </div>
    )
}

/**
 * NewsListEmpty — Hiển thị khi danh sách trống.
 */
export function NewsListEmpty({ keyword, onClearKeyword }) {
    return (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-14 text-center shadow-xs">
            <span className="text-5xl">📭</span>
            <h3 className="mt-4 text-base font-bold text-slate-700">Chưa có bài viết nào</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
                {keyword
                    ? 'Không tìm thấy bài viết phù hợp với từ khóa này.'
                    : 'Hiện tại chưa có tin tức nào được đăng.'}
            </p>
            {keyword && (
                <button
                    onClick={onClearKeyword}
                    className="mt-4 text-xs font-bold text-sky-600 hover:underline cursor-pointer"
                >
                    Xem tất cả bài viết
                </button>
            )}
        </div>
    )
}

/**
 * NewsListError — Hiển thị khi API lỗi.
 */
export function NewsListError({ message }) {
    return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm font-semibold text-red-600">
            ⚠️ {message}
        </div>
    )
}
