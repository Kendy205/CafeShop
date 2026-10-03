import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getPublicNews } from '../../redux/actions/user/newsAction'
import NewsCard from '../../components/news/NewsCard'
import { NewsCardSkeleton, NewsListEmpty, NewsListError } from '../../components/news/NewsListStates'
import AppPagination from '../../components/common/AppPagination'

const PAGE_SIZE = 10

export default function NewsListPage() {
    const dispatch = useDispatch()
    const { items, total, page, loading, error } = useSelector((s) => s.user.news)

    const [keyword, setKeyword] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        dispatch(getPublicNews({
            keyword:  keyword || undefined,
            page:     currentPage,
            pageSize: PAGE_SIZE,
        }))
    }, [dispatch, currentPage, keyword])

    const handleSearch  = (val) => { setKeyword(val); setCurrentPage(1) }
    const handlePageChange = (pg) => setCurrentPage(pg)

    return (
        <div className="space-y-8 pb-16">
            {/* ── Hero header ── */}
            <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0c1a2b] via-[#0f2544] to-[#07111e] text-white py-14 px-8 sm:px-12 shadow-xl">
                <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-sky-600/10 blur-3xl" />
                <div className="relative z-10 max-w-xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-sky-300 mb-5">
                        <span>📰</span>
                        <span>Tin Tức & Sự Kiện</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black leading-tight">
                        Cập nhật tin tức{' '}
                        <span className="bg-gradient-to-r from-sky-200 to-sky-400 bg-clip-text text-transparent">
                            mới nhất
                        </span>
                    </h1>
                    <p className="mt-3 text-sm text-sky-100/70 leading-relaxed">
                        Khám phá thông báo, sự kiện và ưu đãi hấp dẫn từ Cafe Shop.
                    </p>
                </div>
            </section>

            {/* ── Search ── */}
            <div className="flex items-center gap-3">
                <AppSearchBox
                    initialValue={keyword}
                    placeholder="Tìm kiếm bài viết..."
                    onSearch={handleSearch}
                    className="flex-1 max-w-md"
                />
                {total > 0 && !loading && (
                    <span className="text-xs text-slate-500 shrink-0">
                        <strong className="text-sky-700">{total}</strong> bài viết
                    </span>
                )}
            </div>

            {/* ── List content ── */}
            <div className="space-y-4">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <NewsCardSkeleton key={i} />)
                ) : error ? (
                    <NewsListError message={error} />
                ) : items.length === 0 ? (
                    <NewsListEmpty keyword={keyword} onClearKeyword={() => handleSearch('')} />
                ) : (
                    items.map((news) => <NewsCard key={news.newsId} news={news} />)
                )}
            </div>

            {/* ── Pagination ── */}
            <AppPagination
                current={currentPage}
                pageSize={PAGE_SIZE}
                total={total}
                onChange={handlePageChange}
                className="justify-center"
            />
        </div>
    )
}
