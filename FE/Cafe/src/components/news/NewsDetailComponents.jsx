/**
 * NewsDetailSkeleton — Loading placeholder cho trang chi tiết bài viết.
 */
export function NewsDetailSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-slate-100 rounded-full w-3/4" />
            <div className="h-4 bg-slate-100 rounded-full w-1/3" />
            <div className="h-72 bg-slate-100 rounded-3xl w-full" />
            <div className="space-y-3">
                <div className="h-4 bg-slate-100 rounded-full w-full" />
                <div className="h-4 bg-slate-100 rounded-full w-full" />
                <div className="h-4 bg-slate-100 rounded-full w-4/5" />
            </div>
        </div>
    )
}

/**
 * NewsDetailNotFound — Hiển thị khi bài viết không tìm thấy (404).
 */
export function NewsDetailNotFound({ message, onBack }) {
    return (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-xs">
            <span className="text-5xl">😕</span>
            <h2 className="mt-4 text-xl font-bold text-slate-700">Không tìm thấy bài viết</h2>
            <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
                {message || 'Bài viết này không tồn tại hoặc đã bị gỡ xuống.'}
            </p>
            <button
                onClick={onBack}
                className="mt-6 inline-flex items-center gap-2 rounded-3xl bg-sky-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-sky-800 transition-all cursor-pointer"
            >
                ← Quay lại danh sách
            </button>
        </div>
    )
}

/**
 * NewsDetailMeta — Thông tin tác giả, ngày đăng, lượt xem.
 */
export function NewsDetailMeta({ authorName, publishedAt, viewCount }) {
    const publishedDate = publishedAt
        ? new Date(publishedAt).toLocaleDateString('vi-VN', {
              weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
          })
        : null

    return (
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-medium">
            {authorName && (
                <span className="flex items-center gap-1.5 bg-slate-50 rounded-full px-3 py-1">
                    ✍️ {authorName}
                </span>
            )}
            {publishedDate && (
                <span className="flex items-center gap-1.5 bg-slate-50 rounded-full px-3 py-1">
                    📅 {publishedDate}
                </span>
            )}
            {viewCount != null && (
                <span className="flex items-center gap-1.5 bg-slate-50 rounded-full px-3 py-1">
                    👁️ {viewCount} lượt xem
                </span>
            )}
        </div>
    )
}
