import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Rate, Modal, Input, Image, Select, Button } from 'antd'
import {
    fetchAllFeedbacks,
    replyToFeedback,
    toggleFeedbackVisibility,
} from '../../redux/actions/admin/adminFeedbackAction'
import { AppToast } from '../../components/common/AppNotification'
import AppPagination from '../../components/common/AppPagination'
import dayjs from 'dayjs'
import {
    MessageOutlined,
    SyncOutlined,
    CheckCircleFilled,
    ClockCircleOutlined,
    UserOutlined,
    CoffeeOutlined,
    SendOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    StarFilled
} from '@ant-design/icons'

export default function StaffFeedbackPage() {
    const dispatch = useDispatch()
    const { feedbacks, total, page, pageSize, loading, actionLoading } = useSelector(
        (s) => s.admin.feedback
    )

    const [ratingFilter, setRatingFilter] = useState(null)
    const [replyModalOpen, setReplyModalOpen] = useState(false)
    const [selectedFeedback, setSelectedFeedback] = useState(null)
    const [replyText, setReplyText] = useState('')
    const [submittingReply, setSubmittingReply] = useState(false)
    const [togglingId, setTogglingId] = useState(null)

    const loadData = useCallback(
        (p = 1) => {
            dispatch(
                fetchAllFeedbacks({
                    pageNumber: p,
                    pageSize: 10,
                    rating: ratingFilter,
                })
            )
        },
        [dispatch, ratingFilter]
    )

    useEffect(() => {
        loadData(1)
    }, [loadData])

    const handleOpenReply = (item) => {
        setSelectedFeedback(item)
        setReplyText(item.adminReply?.replyContent || '')
        setReplyModalOpen(true)
    }

    const handleSubmitReply = async () => {
        if (!selectedFeedback) return
        const trimmed = replyText.trim()
        if (!trimmed) {
            AppToast.error('Vui lòng nhập nội dung phản hồi khách hàng')
            return
        }

        try {
            setSubmittingReply(true)
            const res = await dispatch(
                replyToFeedback({
                    id: selectedFeedback.feedbackId,
                    replyContent: trimmed,
                })
            )
            if (replyToFeedback.fulfilled.match(res)) {
                AppToast.success('Đã gửi phản hồi tới khách hàng thành công!')
                setReplyModalOpen(false)
                setSelectedFeedback(null)
                setReplyText('')
                loadData(page)
            }
        } finally {
            setSubmittingReply(false)
        }
    }

    const handleToggleVisibility = async (id, currentVisible) => {
        try {
            setTogglingId(id)
            const res = await dispatch(toggleFeedbackVisibility(id))
            if (toggleFeedbackVisibility.fulfilled.match(res)) {
                AppToast.success(
                    currentVisible ? 'Đã ẩn đánh giá khỏi trang sản phẩm' : 'Đã hiện đánh giá công khai'
                )
            }
        } finally {
            setTogglingId(null)
        }
    }

    return (
        <div className="space-y-4">
            {/* Header Box */}
            <div className="rounded-3xl bg-white p-4 sm:p-5 shadow-sm border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <span>Đánh giá & Phản hồi Khách hàng</span>
                        <button
                            type="button"
                            onClick={() => loadData(page)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                            title="Tải lại danh sách"
                        >
                            <SyncOutlined spin={loading} className="text-base" />
                        </button>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        Xem nhận xét từ khách đặt online và gửi phản hồi chăm sóc khách hàng
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Select
                        placeholder="Lọc theo sao"
                        allowClear
                        value={ratingFilter}
                        onChange={(val) => setRatingFilter(val)}
                        className="w-40 h-10"
                        options={[
                            { value: 5, label: '⭐⭐⭐⭐⭐ 5 Sao' },
                            { value: 4, label: '⭐⭐⭐⭐ 4 Sao' },
                            { value: 3, label: '⭐⭐⭐ 3 Sao' },
                            { value: 2, label: '⭐⭐ 2 Sao' },
                            { value: 1, label: '⭐ 1 Sao' },
                        ]}
                    />
                </div>
            </div>

            {/* List of Feedback Cards */}
            {loading && feedbacks.length === 0 ? (
                <div className="flex h-64 items-center justify-center rounded-3xl bg-white border border-slate-200/60">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                        <SyncOutlined spin className="text-3xl text-amber-500" />
                        <span className="text-sm font-medium">Đang tải đánh giá khách hàng...</span>
                    </div>
                </div>
            ) : feedbacks.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-3xl bg-white border border-slate-200/60 p-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 text-3xl mb-3">
                        <MessageOutlined />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">Chưa có đánh giá nào phù hợp</h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Khi khách đặt hàng online để lại nhận xét, danh sách sẽ hiển thị tại đây.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {feedbacks.map((fb) => {
                        const hasReply = Boolean(fb.adminReply?.replyContent)
                        const isVisible = Boolean(fb.isVisible)
                        const isToggling = togglingId === fb.feedbackId

                        return (
                            <div
                                key={fb.feedbackId}
                                className="rounded-3xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-start justify-between gap-4"
                            >
                                {/* Left Content */}
                                <div className="space-y-2.5 flex-1">
                                    {/* User header & rating */}
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-sm">
                                            {(fb.userName || 'K').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                <span>{fb.userName || 'Khách hàng'}</span>
                                                <span className="text-[11px] font-normal text-slate-400">
                                                    {fb.createdAt ? dayjs(fb.createdAt).format('DD/MM/YYYY HH:mm') : ''}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Rate disabled defaultValue={fb.rating} className="text-xs text-amber-400" />
                                                <span className="text-xs font-bold text-amber-600">{fb.rating} sao</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product badge */}
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-xl text-xs font-semibold border border-amber-200/50">
                                        <CoffeeOutlined />
                                        <span>{fb.productName}</span>
                                        {fb.sizeName && <span className="text-amber-600 font-normal">({fb.sizeName})</span>}
                                    </div>

                                    {/* Comment text */}
                                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                                        {fb.comment || <span className="text-slate-400 italic">Khách hàng không để lại nhận xét bằng lời.</span>}
                                    </p>

                                    {/* Images if any */}
                                    {fb.images && fb.images.length > 0 && (
                                        <div className="flex items-center gap-2 flex-wrap pt-1">
                                            <Image.PreviewGroup>
                                                {fb.images.map((img, idx) => (
                                                    <Image
                                                        key={idx}
                                                        src={img}
                                                        width={60}
                                                        height={60}
                                                        className="object-cover rounded-xl border border-slate-200"
                                                    />
                                                ))}
                                            </Image.PreviewGroup>
                                        </div>
                                    )}

                                    {/* Existing Store Reply */}
                                    {hasReply && (
                                        <div className="mt-2 p-3 rounded-2xl bg-sky-50/70 border border-sky-100 text-xs text-slate-700 space-y-1">
                                            <div className="flex items-center gap-1.5 font-bold text-sky-800">
                                                <CheckCircleFilled className="text-sky-600" />
                                                <span>Phản hồi từ quán:</span>
                                            </div>
                                            <p className="pl-5 text-slate-600 leading-normal">{fb.adminReply.replyContent}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Actions */}
                                <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => handleOpenReply(fb)}
                                        className={`flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                            hasReply
                                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/20'
                                        }`}
                                    >
                                        <MessageOutlined />
                                        <span>{hasReply ? 'Chỉnh sửa phản hồi' : 'Trả lời đánh giá'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        disabled={isToggling}
                                        onClick={() => handleToggleVisibility(fb.feedbackId, isVisible)}
                                        className={`flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                                            isVisible
                                                ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                                : 'text-emerald-600 hover:bg-emerald-50'
                                        }`}
                                        title={isVisible ? 'Ẩn đánh giá' : 'Hiện đánh giá'}
                                    >
                                        {isVisible ? (
                                            <>
                                                <EyeInvisibleOutlined /> <span>Ẩn</span>
                                            </>
                                        ) : (
                                            <>
                                                <EyeOutlined /> <span>Hiện</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Pagination */}
            {total > pageSize && (
                <div className="flex justify-end pt-2">
                    <AppPagination
                        currentPage={page}
                        totalPages={Math.ceil(total / pageSize)}
                        onPageChange={(p) => loadData(p)}
                    />
                </div>
            )}

            {/* Reply Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-base font-black text-slate-800">
                        <MessageOutlined className="text-amber-500" />
                        <span>Phản hồi đánh giá của {selectedFeedback?.userName || 'khách hàng'}</span>
                    </div>
                }
                open={replyModalOpen}
                onCancel={() => setReplyModalOpen(false)}
                footer={null}
                centered
                destroyOnClose
            >
                <div className="space-y-4 pt-2">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600">
                        <div className="font-bold text-slate-800 mb-1">Đánh giá của khách:</div>
                        <p className="italic">"{selectedFeedback?.comment || 'Không có bình luận'}"</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                            Nội dung phản hồi từ nhân viên / quán <span className="text-rose-500">*</span>
                        </label>
                        <Input.TextArea
                            rows={4}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Cảm ơn quý khách đã ủng hộ quán! Quán rất tiếc về trải nghiệm chưa tốt..."
                            maxLength={500}
                            showCount
                            className="rounded-xl"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button onClick={() => setReplyModalOpen(false)}>Hủy</Button>
                        <Button
                            type="primary"
                            loading={submittingReply}
                            onClick={handleSubmitReply}
                            className="bg-amber-500 hover:bg-amber-600 border-none font-bold"
                        >
                            <SendOutlined /> Gửi phản hồi
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
