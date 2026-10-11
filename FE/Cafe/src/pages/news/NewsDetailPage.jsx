import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getPublicNewsBySlug, incrementNewsView } from '../../redux/actions/user/newsAction'
import { clearNewsDetail } from '../../redux/slices/user/newsSlice'
import LoadingLink from '../../components/loading/LoadingLink'
import {
    NewsDetailSkeleton,
    NewsDetailNotFound,
    NewsDetailMeta,
} from '../../components/news/NewsDetailComponents'

/**
 * NewsDetailPage Component
 * Trang xem chi tiết một bài viết / tin tức.
 * Dựa vào slug trên URL để gọi API, hỗ trợ ghi nhận lượt xem (View Count) tự động.
 */
export default function NewsDetailPage() {
    const { slug }   = useParams()
    const navigate   = useNavigate()
    const dispatch   = useDispatch()
    const viewFired  = useRef(false)

    const { detail, detailLoading, detailError } = useSelector((s) => s.user.news)

    // Fetch chi tiết khi slug thay đổi
    useEffect(() => {
        if (!slug) return
        viewFired.current = false
        dispatch(clearNewsDetail())
        dispatch(getPublicNewsBySlug(slug))
    }, [dispatch, slug])

    // Tăng lượt xem sau khi load xong — fire-and-forget
    useEffect(() => {
        if (detail?.newsId && !viewFired.current) {
            viewFired.current = true
            dispatch(incrementNewsView(detail.newsId))
        }
    }, [dispatch, detail])

    // Cleanup khi rời trang
    useEffect(() => {
        return () => { dispatch(clearNewsDetail()) }
    }, [dispatch])

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-16">
            {/* ── Breadcrumb ── */}
            <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <LoadingLink to="/" className="hover:text-sky-600 transition-colors">Trang chủ</LoadingLink>
                <span>/</span>
                <LoadingLink to="/news" className="hover:text-sky-600 transition-colors">Tin tức</LoadingLink>
                <span>/</span>
                <span className="text-slate-600 truncate max-w-[200px]">{detail?.title || slug}</span>
            </nav>

            {/* ── States ── */}
            {detailLoading && <NewsDetailSkeleton />}

            {!detailLoading && detailError && (
                <NewsDetailNotFound
                    message={detailError}
                    onBack={() => navigate('/news')}
                />
            )}

            {!detailLoading && !detailError && detail && (
                <article className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs overflow-hidden">
                    {/* Hero image */}
                    {detail.imageUrl && (
                        <div className="h-72 sm:h-96 overflow-hidden">
                            <img
                                src={detail.imageUrl}
                                alt={detail.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="p-7 sm:p-10">
                        {/* Meta */}
                        <NewsDetailMeta
                            authorName={detail.authorName}
                            publishedAt={detail.publishedAt}
                            viewCount={detail.viewCount}
                        />

                        {/* Title */}
                        <h1 className="mt-5 text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
                            {detail.title}
                        </h1>

                        {/* Summary */}
                        {detail.summary && (
                            <p className="mt-4 text-sm text-slate-500 leading-relaxed border-l-4 border-sky-300 pl-4 italic">
                                {detail.summary}
                            </p>
                        )}

                        <div className="my-7 border-t border-slate-100" />

                        {/* Content HTML từ Backend */}
                        {detail.content ? (
                            <div
                                className="prose prose-slate prose-sm sm:prose-base max-w-none
                                           prose-headings:font-black prose-headings:text-slate-800
                                           prose-a:text-sky-600 prose-a:no-underline hover:prose-a:underline
                                           prose-img:rounded-2xl prose-img:shadow-sm
                                           prose-blockquote:border-sky-400 prose-blockquote:text-slate-500"
                                dangerouslySetInnerHTML={{ __html: detail.content }}
                            />
                        ) : (
                            <p className="text-sm text-slate-400 italic">Bài viết chưa có nội dung.</p>
                        )}
                    </div>
                </article>
            )}

            {/* ── Back button ── */}
            {!detailLoading && (
                <div className="flex justify-center">
                    <button
                        onClick={() => navigate('/news')}
                        className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:border-sky-400 hover:text-sky-700 transition-all shadow-xs cursor-pointer"
                    >
                        ← Quay lại danh sách tin tức
                    </button>
                </div>
            )}
        </div>
    )
}
