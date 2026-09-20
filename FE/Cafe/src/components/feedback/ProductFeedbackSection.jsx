import { useEffect, useState, useCallback } from 'react'
import { feedbackService } from '../../services/user/FeedbackService'

// Helper hiển thị ngôi sao màu vàng
function StarRatingDisplay({ rating, size = 'sm' }) {
    const starClass = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'

    return (
        <div className="flex items-center gap-0.5 text-sky-400">
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= Math.round(Number(rating) || 0)
                return (
                    <svg
                        key={star}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className={`${starClass} ${filled ? 'text-sky-400' : 'text-slate-200'}`}
                    >
                        <path
                            fillRule="evenodd"
                            d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                            clipRule="evenodd"
                        />
                    </svg>
                )
            })}
        </div>
    )
}

// ── Biểu đồ thanh Progress Bar cho từng mức sao ──────────────────────────────
function RatingProgressBar({ starLabel, count = 0, total = 0 }) {
    const safeCount = Number(count) || 0
    const safeTotal = Number(total) || 0
    const percentage = safeTotal > 0 ? Math.round((safeCount / safeTotal) * 100) : 0

    return (
        <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <span className="w-10 shrink-0 font-medium text-slate-500">{starLabel}</span>
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                    className="h-full rounded-full bg-sky-400 transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="w-14 shrink-0 text-right font-mono text-[11px] text-slate-400">
                {safeCount} <span className="text-[10px]">({percentage}%)</span>
            </span>
        </div>
    )
}

// ── Component Khối Nhận Xét & Đánh Giá Sản Phẩm ─────────────────────────────
export default function ProductFeedbackSection({ productId, summary: initialSummary }) {
    const [feedbacks, setFeedbacks] = useState([])
    const [page, setPage] = useState(1)
    const [pageSize] = useState(5)
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)
    const [summary, setSummary] = useState(initialSummary || null)

    // Đồng bộ khi initialSummary thay đổi
    useEffect(() => {
        if (initialSummary) {
            setSummary(initialSummary)
        }
    }, [initialSummary])

    // Luôn chủ động fetch summary nếu chưa có hoặc khi productId đổi
    useEffect(() => {
        if (!productId) return
        feedbackService
            .getProductSummary(productId)
            .then((data) => {
                if (data && typeof data === 'object') {
                    setSummary(data)
                }
            })
            .catch((err) => {
                console.error('Error fetching summary:', err)
            })
    }, [productId])

    const fetchFeedbacks = useCallback(
        async (p) => {
            if (!productId) return
            setLoading(true)
            try {
                // feedbackService.getProductFeedbacks đã bóc tách unwrapApi và normalizePagedResult
                const result = await feedbackService.getProductFeedbacks(productId, {
                    pageNumber: p,
                    pageSize,
                })

                setFeedbacks(result.items || [])
                setTotal(result.total || 0)
                setTotalPages(result.totalPages || 1)
            } catch (err) {
                console.error('Error fetching product feedbacks:', err)
            } finally {
                setLoading(false)
            }
        },
        [productId, pageSize]
    )

    useEffect(() => {
        setPage(1)
        fetchFeedbacks(1)
    }, [fetchFeedbacks])

    const handlePageChange = (newPage) => {
        setPage(newPage)
        fetchFeedbacks(newPage)
        const el = document.getElementById('product-feedback-list')
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
    }

    const totalReviews = Number(summary?.totalReviews || total || 0)
    const averageRating =
        summary?.averageRating !== undefined && summary?.averageRating !== null
            ? Number(summary.averageRating).toFixed(1)
            : '5.0'

    return (
        <section id="product-reviews" className="mt-12 border-t border-slate-200/80 pt-10">
            {/* Header Tiêu Đề */}
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <span>Đánh giá & Nhận xét</span>
                        <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-900">
                            {totalReviews}
                        </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Phản hồi thực tế từ khách hàng đã thưởng thức món này tại quán
                    </p>
                </div>
            </div>

            {/* Khối Thống kê Tổng quan (Summary Card) */}
            <div className="mb-8 rounded-3xl border border-slate-200/80 bg-slate-50/60 p-6 shadow-2xs">
                <div className="grid gap-6 md:grid-cols-12 md:items-center">
                    {/* Cột trái: Điểm trung bình to */}
                    <div className="flex flex-col items-center justify-center border-b border-slate-200/70 pb-5 text-center md:col-span-4 md:border-b-0 md:border-r md:pb-0 md:pr-6">
                        <div className="flex items-baseline gap-1">
                            <span className="text-5xl font-black tracking-tight text-slate-800">
                                {totalReviews > 0 ? averageRating : '0'}
                            </span>
                            <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
                        </div>
                        <div className="mt-2">
                            <StarRatingDisplay rating={totalReviews > 0 ? Number(averageRating) : 0} size="lg" />
                        </div>
                        <p className="mt-1.5 text-xs font-medium text-slate-500">
                            {totalReviews > 0 ? `Dựa trên ${totalReviews} lượt đánh giá` : 'Chưa có lượt đánh giá nào'}
                        </p>
                    </div>

                    {/* Cột phải: Biểu đồ thanh phân bố các mức sao */}
                    <div className="space-y-2 md:col-span-8 md:pl-2">
                        <RatingProgressBar starLabel="5 sao" count={summary?.fiveStarCount || 0} total={totalReviews} />
                        <RatingProgressBar starLabel="4 sao" count={summary?.fourStarCount || 0} total={totalReviews} />
                        <RatingProgressBar starLabel="3 sao" count={summary?.threeStarCount || 0} total={totalReviews} />
                        <RatingProgressBar starLabel="2 sao" count={summary?.twoStarCount || 0} total={totalReviews} />
                        <RatingProgressBar starLabel="1 sao" count={summary?.oneStarCount || 0} total={totalReviews} />
                    </div>
                </div>
            </div>

            {/* Danh sách bình luận & nhận xét */}
            <div id="product-feedback-list" className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700">
                    Bình luận của khách hàng {total > 0 && `(${total})`}
                </h3>

                {loading && (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                        ))}
                    </div>
                )}

                {!loading && feedbacks.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
                        <span className="text-3xl">☕</span>
                        <p className="mt-2 text-sm font-bold text-slate-700">Chưa có bình luận nào cho món này</p>
                        <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                            Hãy đặt món ngay để trải nghiệm và trở thành người đầu tiên để lại đánh giá bạn nhé!
                        </p>
                    </div>
                )}

                {!loading && feedbacks.length > 0 && (
                    <div className="space-y-3">
                        {feedbacks.map((fb) => {
                            const formattedDate = fb.createdAt
                                ? new Date(fb.createdAt).toLocaleString('vi-VN', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                  })
                                : '—'

                            const hasComment = fb.comment && fb.comment.trim() !== ''

                            return (
                                <div
                                    key={fb.feedbackId}
                                    className="rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs transition hover:border-slate-200"
                                >
                                    {/* Header của feedback: Avatar + Tên + Ngày + Sao */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            {/* Avatar khách */}
                                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-linear-to-br from-sky-700 to-slate-800 text-white flex items-center justify-center font-bold text-sm">
                                                {fb.userAvatar ? (
                                                    <img
                                                        src={fb.userAvatar}
                                                        alt={fb.userName || 'User'}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span>{(fb.userName || 'K')[0].toUpperCase()}</span>
                                                )}
                                            </div>

                                            <div>
                                                <h4 className="text-xs font-bold text-slate-800">
                                                    {fb.userName || 'Khách hàng ẩn danh'}
                                                </h4>
                                                <div className="mt-0.5 flex items-center gap-2">
                                                    <StarRatingDisplay rating={fb.rating} size="sm" />
                                                    <span className="text-[11px] text-slate-400">•</span>
                                                    <span className="text-[11px] text-slate-400">{formattedDate}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nội dung nhận xét */}
                                    <div className="mt-3 pl-13">
                                        {hasComment ? (
                                            <p className="rounded-3xl bg-slate-50/80 p-3 text-xs leading-relaxed text-slate-700 border border-slate-100/60">
                                                {fb.comment}
                                            </p>
                                        ) : (
                                            <p className="text-xs italic text-slate-400">
                                                Khách hàng không để lại bình luận
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Phân trang danh sách feedback */}
                {!loading && totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-1.5 pt-2">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => handlePageChange(page - 1)}
                            className="h-8 w-8 rounded-3xl border border-slate-200 bg-white text-xs font-bold text-slate-600 shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            ‹
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => handlePageChange(n)}
                                className={`h-8 w-8 rounded-3xl text-xs font-bold transition shadow-2xs ${
                                    n === page
                                        ? 'bg-sky-800 text-white'
                                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                {n}
                            </button>
                        ))}
                        <button
                            type="button"
                            disabled={page >= totalPages}
                            onClick={() => handlePageChange(page + 1)}
                            className="h-8 w-8 rounded-3xl border border-slate-200 bg-white text-xs font-bold text-slate-600 shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            ›
                        </button>
                    </div>
                )}
            </div>
        </section>
    )
}
