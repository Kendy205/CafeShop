import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Rate, Modal, Input, Image, Select, Button, Avatar } from 'antd'
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
    SendOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    ShoppingOutlined,
    PictureOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons'

export default function StaffFeedbackPage() {
    const dispatch = useDispatch()
    const { feedbacks, total, page, pageSize, loading, actionLoading } = useSelector(
        (s) => s.admin.feedback
    )

    const [ratingFilter, setRatingFilter] = useState(null)
    const [hasImagesFilter, setHasImagesFilter] = useState(null)
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
                    hasImages: hasImagesFilter,
                })
            )
        },
        [dispatch, ratingFilter, hasImagesFilter]
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
        <div className="space-y-5">
            {/* Header Box - Apple Card */}
            <div className="rounded-[26px] bg-white/80 backdrop-blur-2xl p-5 sm:p-6 border border-black/[0.05] shadow-[0_2px_16px_rgba(0,0,0,0.02)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight flex items-center gap-3">
                        <span>Đánh giá & Phản hồi Khách hàng</span>
                        {total > 0 && (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-black/[0.04] text-[#86868B]">
                                {total} đánh giá
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={() => loadData(page)}
                            className="w-8 h-8 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#1D1D1F] flex items-center justify-center transition-all cursor-pointer active:scale-95"
                            title="Tải lại danh sách"
                        >
                            <SyncOutlined spin={loading} className="text-sm" />
                        </button>
                    </h1>
                    <p className="text-xs sm:text-sm text-[#86868B] mt-1 font-normal">
                        Theo dõi nhận xét của khách đặt online, xem hình ảnh thực tế và gửi phản hồi chăm sóc khách hàng
                    </p>
                </div>

                {/* Filter Controls (Apple style) */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <Select
                        placeholder="Lọc số sao"
                        allowClear
                        value={ratingFilter}
                        onChange={(val) => setRatingFilter(val)}
                        className="w-36 h-10"
                        options={[
                            { value: 5, label: '⭐⭐⭐⭐⭐ 5 Sao' },
                            { value: 4, label: '⭐⭐⭐⭐ 4 Sao' },
                            { value: 3, label: '⭐⭐⭐ 3 Sao' },
                            { value: 2, label: '⭐⭐ 2 Sao' },
                            { value: 1, label: '⭐ 1 Sao' },
                        ]}
                    />

                    <Select
                        placeholder="Hình ảnh đính kèm"
                        allowClear
                        value={hasImagesFilter}
                        onChange={(val) => setHasImagesFilter(val)}
                        className="w-40 h-10"
                        options={[
                            { value: true, label: '📸 Có hình ảnh' },
                            { value: false, label: '📝 Chỉ có chữ' },
                        ]}
                    />
                </div>
            </div>

            {/* List of Feedback Cards */}
            {loading && feedbacks.length === 0 ? (
                <div className="flex h-64 items-center justify-center rounded-[26px] bg-white border border-black/[0.05]">
                    <div className="flex flex-col items-center gap-2 text-[#86868B]">
                        <SyncOutlined spin className="text-3xl text-amber-500" />
                        <span className="text-sm font-medium">Đang tải đánh giá khách hàng...</span>
                    </div>
                </div>
            ) : feedbacks.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-[26px] bg-white border border-black/[0.05] p-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-amber-50 text-amber-500 text-3xl mb-3">
                        <MessageOutlined />
                    </div>
                    <h3 className="text-base font-bold text-[#1D1D1F]">Chưa có đánh giá nào phù hợp</h3>
                    <p className="text-xs text-[#86868B] mt-1">
                        Khi khách đặt hàng online để lại nhận xét, danh sách sẽ hiển thị tại đây.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {feedbacks.map((fb) => {
                        const hasReply = Boolean(fb.isReplied || fb.adminReply?.replyContent)
                        const isVisible = Boolean(fb.isVisible)
                        const isToggling = togglingId === fb.feedbackId

                        return (
                            <div
                                key={fb.feedbackId}
                                className="rounded-[24px] bg-white p-5 sm:p-6 border border-black/[0.05] shadow-[0_2px_14px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.06)] hover:border-black/[0.08] transition-all flex flex-col gap-4.5"
                            >
                                {/* Header: Customer info & Status Badges */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.04]">
                                    {/* Left: Customer Profile */}
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            src={fb.userAvatar}
                                            icon={<UserOutlined />}
                                            size={44}
                                            className="shrink-0 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 border border-black/[0.06] shadow-2xs font-bold"
                                        >
                                            {(fb.userName || 'K').charAt(0).toUpperCase()}
                                        </Avatar>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-bold text-[#1D1D1F] text-sm sm:text-base">
                                                    {fb.userName || 'Khách hàng'}
                                                </span>
                                                {fb.userId && (
                                                    <span className="px-2 py-0.5 rounded-[8px] bg-black/[0.04] text-[11px] font-medium text-[#86868B]">
                                                        #UID-{fb.userId}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-[#86868B] mt-0.5">
                                                <ClockCircleOutlined className="text-[11px]" />
                                                <span>{fb.createdAt ? dayjs(fb.createdAt).format('DD/MM/YYYY HH:mm') : ''}</span>
                                                {fb.updatedAt && (
                                                    <span className="text-amber-600 italic text-[11px]">
                                                        (Đã sửa: {dayjs(fb.updatedAt).format('DD/MM HH:mm')})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Identifiers & Status Pills */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="px-2.5 py-1 rounded-[10px] bg-black/[0.04] text-[11px] font-bold text-[#1D1D1F]">
                                            #FB-{fb.feedbackId}
                                        </span>

                                        {hasReply ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[10px] bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20 text-[11px] font-bold">
                                                <CheckCircleFilled className="text-[11px]" /> Đã phản hồi
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[10px] bg-[#FF9500]/10 text-[#FF9500] border border-[#FF9500]/20 text-[11px] font-bold">
                                                <ClockCircleOutlined className="text-[11px]" /> Chưa phản hồi
                                            </span>
                                        )}

                                        {isVisible ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[10px] bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/20 text-[11px] font-bold">
                                                <EyeOutlined className="text-[11px]" /> Hiển thị
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[10px] bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20 text-[11px] font-bold">
                                                <EyeInvisibleOutlined className="text-[11px]" /> Đã ẩn
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Product & Order Strip */}
                                <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-3.5 rounded-[18px] bg-[#F9F9FB] border border-black/[0.04]">
                                    {/* Product Thumbnail & Details */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-11 w-11 shrink-0 rounded-[12px] overflow-hidden bg-white border border-black/[0.06] shadow-2xs flex items-center justify-center">
                                            {fb.productImage ? (
                                                <img
                                                    src={fb.productImage}
                                                    alt={fb.productName}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none'
                                                        e.target.parentElement.innerHTML = '<span class="text-base">☕</span>'
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-base">☕</span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-[#1D1D1F] truncate" title={fb.productName}>
                                                    {fb.productName || 'Sản phẩm'}
                                                </span>
                                                {fb.sizeName && (
                                                    <span className="px-2 py-0.5 rounded-[8px] bg-amber-50 text-amber-900 border border-amber-200/60 text-[11px] font-bold shrink-0">
                                                        Size {fb.sizeName}
                                                    </span>
                                                )}
                                            </div>
                                            {fb.productId && (
                                                <div className="text-[11px] text-[#86868B] font-medium mt-0.5">
                                                    Mã món: #{fb.productId}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Details Badge */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {fb.orderId && (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-[#0071E3]/[0.08] text-[#0071E3] border border-[#0071E3]/15 text-xs font-bold">
                                                <ShoppingOutlined className="text-sm" />
                                                <span>Đơn hàng #{fb.orderId}</span>
                                            </div>
                                        )}
                                        {fb.orderDetailId && (
                                            <span className="text-[11px] font-medium text-[#86868B] bg-white px-2.5 py-1 rounded-[10px] border border-black/[0.04]">
                                                Chi tiết #{fb.orderDetailId}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Review Content: Stars & Comment */}
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2">
                                        <Rate disabled defaultValue={fb.rating} className="text-xs text-amber-400" />
                                        <span className="text-xs font-bold text-amber-600">
                                            {fb.rating} / 5 sao
                                        </span>
                                    </div>

                                    {/* Comment text bubble */}
                                    <div className="p-4 rounded-[18px] bg-[#F5F5F7]/70 border border-black/[0.03]">
                                        {fb.comment ? (
                                            <p className="text-sm text-[#1D1D1F] leading-relaxed whitespace-pre-wrap">
                                                {fb.comment}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-[#86868B] italic">
                                                (Khách hàng không để lại nhận xét bằng lời)
                                            </p>
                                        )}
                                    </div>

                                    {/* Attached Customer Photos */}
                                    {((fb.images && fb.images.length > 0) || fb.hasImages) && (
                                        <div className="pt-1">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1D1D1F] mb-2">
                                                <PictureOutlined className="text-amber-500" />
                                                <span>Hình ảnh thực tế đính kèm:</span>
                                            </div>
                                            {fb.images && fb.images.length > 0 ? (
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Image.PreviewGroup>
                                                        {fb.images.map((img, idx) => (
                                                            <Image
                                                                key={idx}
                                                                src={img}
                                                                width={68}
                                                                height={68}
                                                                className="object-cover rounded-[14px] border border-black/[0.06] hover:scale-105 transition-transform shadow-2xs"
                                                            />
                                                        ))}
                                                    </Image.PreviewGroup>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-[#86868B] italic">
                                                    (Đánh giá có đính kèm ảnh)
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Store Reply Content (if already replied) */}
                                    {fb.adminReply?.replyContent && (
                                        <div className="p-4 rounded-[18px] bg-[#0071E3]/[0.05] border border-[#0071E3]/15 text-xs space-y-1.5 mt-2">
                                            <div className="flex items-center justify-between gap-2 text-[#0071E3] font-bold">
                                                <div className="flex items-center gap-1.5">
                                                    <CheckCircleFilled className="text-sm" />
                                                    <span>Phản hồi từ quán {fb.adminReply.adminName ? `(${fb.adminReply.adminName})` : ''}:</span>
                                                </div>
                                                {fb.adminReply.createdAt && (
                                                    <span className="text-[11px] font-normal text-[#86868B]">
                                                        {dayjs(fb.adminReply.createdAt).format('DD/MM/YYYY HH:mm')}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-[#1D1D1F] pl-5 leading-relaxed whitespace-pre-wrap">
                                                {fb.adminReply.replyContent}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Bottom Actions Bar */}
                                <div className="flex items-center justify-between pt-3 border-t border-black/[0.04] gap-2 flex-wrap">
                                    {/* Left: Visibility Toggle */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-[#86868B] font-medium">Trạng thái công khai:</span>
                                        <button
                                            type="button"
                                            disabled={isToggling}
                                            onClick={() => handleToggleVisibility(fb.feedbackId, isVisible)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-xs font-semibold transition-all active:scale-[0.97] cursor-pointer ${
                                                isVisible
                                                    ? 'bg-black/[0.04] text-[#1D1D1F] hover:bg-rose-50 hover:text-rose-600'
                                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                            }`}
                                        >
                                            {isVisible ? (
                                                <>
                                                    <EyeInvisibleOutlined /> <span>Ẩn khỏi trang món</span>
                                                </>
                                            ) : (
                                                <>
                                                    <EyeOutlined /> <span>Hiện công khai</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Right: Reply button */}
                                    <button
                                        type="button"
                                        onClick={() => handleOpenReply(fb)}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-[14px] text-xs font-bold transition-all active:scale-[0.97] cursor-pointer ${
                                            hasReply
                                                ? 'bg-black/[0.05] hover:bg-black/[0.08] text-[#1D1D1F]'
                                                : 'bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-[0_2px_10px_rgba(0,113,227,0.25)]'
                                        }`}
                                    >
                                        <MessageOutlined />
                                        <span>{hasReply ? 'Sửa câu trả lời' : 'Gửi phản hồi'}</span>
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Pagination with AppPagination */}
            <div className="flex justify-center sm:justify-end pt-4 pb-2">
                <AppPagination
                    current={page}
                    pageSize={pageSize || 10}
                    total={total}
                    totalPages={Math.ceil(total / (pageSize || 10))}
                    onChange={(p) => {
                        loadData(p)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                />
            </div>

            {/* Reply Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-base font-extrabold text-[#1D1D1F]">
                        <MessageOutlined className="text-[#0071E3]" />
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
                    {/* Feedback Context Preview */}
                    <div className="p-3.5 bg-[#F9F9FB] rounded-[18px] border border-black/[0.05] text-xs space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-[#1D1D1F]">
                                {selectedFeedback?.productName} {selectedFeedback?.sizeName ? `(Size ${selectedFeedback.sizeName})` : ''}
                            </span>
                            {selectedFeedback?.orderId && (
                                <span className="font-semibold text-[#0071E3]">
                                    Đơn #{selectedFeedback.orderId}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Rate disabled value={selectedFeedback?.rating} className="text-[11px] text-amber-400" />
                            <span className="font-bold text-amber-600">({selectedFeedback?.rating}/5)</span>
                        </div>
                        <p className="text-[#1D1D1F] italic bg-white p-2.5 rounded-[12px] border border-black/[0.03]">
                            "{selectedFeedback?.comment || 'Không có nhận xét bằng lời'}"
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#1D1D1F] uppercase tracking-wide mb-1.5">
                            Nội dung phản hồi từ nhân viên / quán <span className="text-rose-500">*</span>
                        </label>
                        <Input.TextArea
                            rows={4}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Cảm ơn quý khách đã ủng hộ quán! Quán rất tiếc về trải nghiệm chưa tốt..."
                            maxLength={500}
                            showCount
                            className="rounded-[14px]"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            onClick={() => setReplyModalOpen(false)}
                            className="rounded-[12px] font-semibold"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            loading={submittingReply}
                            onClick={handleSubmitReply}
                            className="bg-[#0071E3] hover:bg-[#0077ED] border-none font-bold rounded-[12px]"
                        >
                            <SendOutlined /> Gửi phản hồi
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
