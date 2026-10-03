import { useDispatch, useSelector } from 'react-redux'
import { hideApiError } from '../../redux/slices/uiSlice'

export default function ApiErrorModal() {
    const dispatch = useDispatch()
    const { show, message, statusCode } = useSelector((state) => state.app.ui.apiError)

    if (!show) return null

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-100">
                <div className="flex flex-col items-center p-6 text-center">
                    {/* Icon Lỗi */}
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
                        <svg className="h-8 w-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <h3 className="mb-2 text-lg font-black text-slate-800">
                        {statusCode === 500 ? 'Lỗi Hệ Thống' : 'Thất bại'}
                    </h3>
                    
                    <p className="mb-6 text-sm text-slate-600">
                        {message}
                    </p>

                    <button
                        onClick={() => dispatch(hideApiError())}
                        className="w-full rounded-2xl bg-rose-500 hover:bg-rose-600 px-6 py-3 text-sm font-bold text-white transition-all active:scale-95 shadow-sm shadow-rose-200"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    )
}
