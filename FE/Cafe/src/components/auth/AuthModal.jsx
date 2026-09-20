import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import { closeAuthModal, setAuthModalTab } from '../../redux/slices/authSlice'

/**
 * AuthModal Component
 * Popup Đăng nhập & Đăng ký tài khoản hiện đại, chuyển đổi tab mượt mà
 */
export default function AuthModal({
    open: propOpen,
    onClose: propClose,
    initialTab: propInitialTab,
}) {
    const dispatch = useDispatch()
    const { authModalOpen, authModalTab } = useSelector((s) => s.auth)

    // Hỗ trợ cả 2 cách: điều khiển qua Redux store hoặc qua props
    const isOpen = propOpen !== undefined ? propOpen : authModalOpen
    const currentTab = propInitialTab || authModalTab || 'login'

    const handleClose = () => {
        if (propClose) propClose()
        else dispatch(closeAuthModal())
    }

    const handleSwitchTab = (tab) => {
        dispatch(setAuthModalTab(tab))
    }

    // Đóng popup khi ấn phím ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                handleClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={handleClose}
        >
            <div
                className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 sm:p-7 shadow-2xl transition-all animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Nút đóng góc phải */}
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 cursor-pointer"
                    title="Đóng (ESC)"
                >
                    ✕
                </button>

                {/* Header thương hiệu */}
                <div className="mb-5 text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-700 to-sky-900 text-2xl text-white shadow-md shadow-sky-900/30">
                        ☕
                    </div>
                    <h3 className="text-xl font-black text-slate-800">Chào mừng bạn đến với Cafe</h3>
                    <p className="mt-1 text-xs text-slate-500">
                        {currentTab === 'login'
                            ? 'Đăng nhập để đặt món và theo dõi đơn hàng'
                            : 'Tạo tài khoản mới nhận ngay ưu đãi thành viên'}
                    </p>
                </div>

                {/* Pill Tab Switcher */}
                <div className="mb-5 flex rounded-2xl bg-slate-100 p-1">
                    <button
                        type="button"
                        onClick={() => handleSwitchTab('login')}
                        className={`flex-1 rounded-3xl py-2 text-xs font-bold transition-all cursor-pointer ${
                            currentTab === 'login'
                                ? 'bg-white text-sky-900 shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Đăng nhập
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSwitchTab('register')}
                        className={`flex-1 rounded-3xl py-2 text-xs font-bold transition-all cursor-pointer ${
                            currentTab === 'register'
                                ? 'bg-white text-sky-900 shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Đăng ký tài khoản
                    </button>
                </div>

                {/* Nội dung form */}
                {currentTab === 'login' ? (
                    <LoginForm
                        isModal
                        onSwitchRegister={() => handleSwitchTab('register')}
                        onSuccess={handleClose}
                    />
                ) : (
                    <RegisterForm
                        isModal
                        onSwitchLogin={() => handleSwitchTab('login')}
                        onSuccess={handleClose}
                    />
                )}
            </div>
        </div>
    )
}
