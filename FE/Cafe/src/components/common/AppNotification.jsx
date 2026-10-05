import { message, Modal } from 'antd'

// ── TOAST (MESSAGE) ──────────────────────────────────────────────────────────
const SuccessIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
)
const ErrorIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
)
const WarningIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
)
const InfoIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-6 w-6 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
)

export const AppToast = {
    success: (msg) => {
        message.success({
            content: <span className="font-bold text-slate-700">{msg}</span>,
            className: 'app-toast-success',
            icon: SuccessIcon,
            duration: 3,
        })
    },
    error: (msg) => {
        message.error({
            content: <span className="font-bold text-slate-700">{msg}</span>,
            className: 'app-toast-error',
            icon: ErrorIcon,
            duration: 4,
        })
    },
    warning: (msg) => {
        message.warning({
            content: <span className="font-bold text-slate-700">{msg}</span>,
            className: 'app-toast-warning',
            icon: WarningIcon,
            duration: 4,
        })
    },
    info: (msg) => {
        message.info({
            content: <span className="font-bold text-slate-700">{msg}</span>,
            className: 'app-toast-info',
            icon: InfoIcon,
            duration: 3,
        })
    },
}

// ── CONFIRM MODAL ─────────────────────────────────────────────────────────────
export const AppConfirm = (props) => {
    const {
        title, content, okText = 'Xác nhận', cancelText = 'Hủy', 
        danger: propDanger, okType, className, okButtonProps, cancelButtonProps, ...rest
    } = props
    
    const isDanger = propDanger || okType === 'danger'

    const DangerSvg = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    )
    const InfoSvg = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )

    Modal.confirm({
        ...rest,
        // Chú ý: Bỏ okType để không bị AntD override CSS classes thành button viền đỏ mặc định!
        title: <span className="text-lg font-black text-slate-800">{title}</span>,
        content: <div className="mt-2 text-sm font-medium text-slate-500">{content}</div>,
        okText,
        cancelText,
        centered: true,
        className: 'app-confirm-modal ' + (className || ''),
        icon: (
            <div className={`mr-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl ${
                isDanger ? 'bg-red-50 text-red-500 border border-red-100 shadow-inner' : 'bg-sky-50 text-sky-500 border border-sky-100 shadow-inner'
            }`}>
                {isDanger ? DangerSvg : InfoSvg}
            </div>
        ),
        okButtonProps: {
            ...okButtonProps,
            className: isDanger
                ? 'bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold border-none shadow-md shadow-red-600/20 h-10 px-5 transition-all'
                : 'bg-sky-700 hover:bg-sky-800 text-white rounded-2xl font-bold border-none shadow-md shadow-sky-700/20 h-10 px-5 transition-all',
        },
        cancelButtonProps: {
            ...cancelButtonProps,
            className: 'rounded-2xl font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-none bg-slate-50 h-10 px-5 shadow-xs transition-all',
        },
    })
}
