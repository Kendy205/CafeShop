import { useNavigate } from 'react-router-dom'
import LoadingLink from '../loading/LoadingLink'

/**
 * NewsCard — Card hiển thị bài viết trong danh sách.
 * Dùng ở NewsListPage.
 */
export default function NewsCard({ news }) {
    const navigate = useNavigate()

    const publishedDate = news.publishedAt
        ? new Date(news.publishedAt).toLocaleDateString('vi-VN', {
              day: '2-digit', month: '2-digit', year: 'numeric',
          })
        : null

    return (
        <article
            onClick={() => navigate(`/news/${news.slug}`)}
            className="group flex flex-col sm:flex-row gap-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-sky-300"
        >
            {/* Thumbnail */}
            <div className="shrink-0 w-full sm:w-36 h-36 sm:h-28 overflow-hidden rounded-2xl bg-slate-100">
                {news.imageUrl ? (
                    <img
                        src={news.imageUrl}
                        alt={news.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-slate-300">📰</div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 min-w-0">
                <h2 className="text-base font-bold text-slate-800 line-clamp-2 group-hover:text-sky-700 transition-colors leading-snug">
                    {news.title}
                </h2>
                {news.summary && (
                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {news.summary}
                    </p>
                )}
                <div className="mt-auto pt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-medium">
                    {news.authorName && (
                        <span className="flex items-center gap-1">✍️ {news.authorName}</span>
                    )}
                    {publishedDate && (
                        <span className="flex items-center gap-1">📅 {publishedDate}</span>
                    )}
                    {news.viewCount != null && (
                        <span className="flex items-center gap-1">👁️ {news.viewCount} lượt xem</span>
                    )}
                </div>
            </div>
        </article>
    )
}
