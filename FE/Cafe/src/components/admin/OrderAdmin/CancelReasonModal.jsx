import { useState, useRef, useEffect } from 'react'

/**
 * CancelReasonModal
 * Modal nhỏ để admin nhập lý do hủy đơn hàng trước khi gọi API.
 * Backend bắt buộc phải có cancelReason khi status = CANCELLED.
 */
export default function CancelReasonModal({ orderId, onConfirm, onClose, isLoading }) {
    const [reason, setReason] = useState('')
    const [error, setError] = useState('')
    const textareaRef = useRef(null)

    useEffect(() => {
        textareaRef.current?.focus()
    }, [])

    const handleConfirm = () => {
        const trimmed = reason.trim()
        if (!trimmed) {
            setError('Vui lòng nhập lý do hủy đơn hàng.')
            return
        }
        onConfirm(trimmed)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose()
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleConfirm()
    }

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px] p-4 animate-in fade-in duration-150"
            onClick={(e) => e.target === e.currentTarget && onClose()}
            onKeyDown={handleKeyDown}
        >
            <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-rose-50/60">
                    <div>
                        <h3 className="text-base font-black text-slate-800">Hủy đơn hàng #{orderId}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Nhập lý do để thông báo đến khách hàng</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-3">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                        Lý do hủy <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                        ref={textareaRef}
                        value={reason}
                        onChange={(e) => { setReason(e.target.value); setError('') }}
                        rows={3}
                        placeholder="VD: Hết nguyên liệu, khách hủy yêu cầu, đơn vị giao không phục vụ..."
                        className={`w-full resize-none rounded-2xl border px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-2 ${
                            error
                                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                                : 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                        }`}
                    />
                    {error && (
                        <p className="text-xs text-rose-500 font-medium">{error}</p>
                    )}
                    <p className="text-[11px] text-slate-400">Ctrl+Enter để xác nhận nhanh</p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="rounded-2xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
                    >
                        Đóng
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isLoading || !reason.trim()}
                        className="rounded-2xl border border-rose-400 bg-rose-500 hover:bg-rose-600 px-5 py-2 text-xs font-bold text-white transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {isLoading ? '⏳ Đang hủy...' : '✕ Xác nhận hủy đơn'}
                    </button>
                </div>
            </div>
        </div>
    )
}
