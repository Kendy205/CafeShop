import { Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import {
    CoffeeOutlined,
    EnvironmentOutlined,
    LoginOutlined,
    LogoutOutlined,
    SearchOutlined,
    SettingOutlined,
    ShoppingCartOutlined,
    UserAddOutlined,
    UserOutlined,
    OrderedListOutlined,
    TagOutlined,
} from '@ant-design/icons'
import LoadingLink from '../components/loading/LoadingLink'
import AuthModal from '../components/auth/AuthModal'
import { logout, openAuthModal } from '../redux/slices/authSlice'
import { getCart } from '../redux/actions/user/cartAction'
import { isAdminRole } from '../utils/auth/authRole'
import { THEME, getButtonClass } from '../utils/constants/Theme'

function NavItem({ to, icon, label, className = '' }) {
    return (
        <LoadingLink
            to={to}
            className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-slate-600 transition-all duration-300 hover:bg-sky-50 hover:text-sky-600 ${className}`}
        >
            <span className="text-lg leading-none">{icon}</span>
            <span className="hidden sm:inline font-medium">{label}</span>
        </LoadingLink>
    )
}

export default function UserTemplate() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { isAuthenticated, user, role } = useSelector((s) => s.auth)
    const cartCount = useSelector((s) => s.cart.items.reduce((n, i) => n + (Number(i.quantity) || 0), 0))

    useEffect(() => {
        if (isAuthenticated) dispatch(getCart())
    }, [isAuthenticated, dispatch])

    return (
        <div className={`flex min-h-screen flex-col ${THEME.colors.background}`}>
            {/* Header Sticky - Glassmorphism */}
            <header className={`sticky top-0 z-40 ${THEME.effects.glassNavbar}`}>
                <div className={`mx-auto flex items-center justify-between gap-4 py-3 ${THEME.layout.container}`}>
                    <LoadingLink
                        to="/"
                        className="inline-flex items-center gap-3 text-2xl font-black text-slate-800 transition-transform hover:scale-105"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-xl text-white shadow-md shadow-sky-500/20">
                            <CoffeeOutlined />
                        </span>
                        <span className="hidden xs:inline sm:inline">Cafe<span className="text-sky-500">Order</span></span>
                    </LoadingLink>

                    <nav className="flex flex-wrap items-center gap-2 text-sm">
                        <NavItem to="/" icon={<CoffeeOutlined />} label="Thực đơn" />
                        <NavItem to="/search" icon={<SearchOutlined />} label="Tìm kiếm" />
                        
                        {isAuthenticated && (
                            <>
                                <NavItem to="/addresses" icon={<EnvironmentOutlined />} label="Địa chỉ" />
                                <NavItem to="/orders"    icon={<OrderedListOutlined />} label="Đơn hàng" />
                                <NavItem to="/vouchers"  icon={<TagOutlined />}         label="Voucher" />
                            </>
                        )}

                        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

                        <LoadingLink
                            to="/cart"
                            className="relative inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-slate-600 transition-all duration-300 hover:bg-sky-50 hover:text-sky-600"
                            aria-label="Giỏ hàng"
                        >
                            <span className="relative inline-flex text-xl leading-none">
                                <ShoppingCartOutlined />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white shadow-sm ring-2 ring-white">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </span>
                            <span className="hidden sm:inline font-medium">Giỏ hàng</span>
                        </LoadingLink>

                        {isAdminRole(role) && (
                            <NavItem to="/admin" icon={<SettingOutlined />} label="Admin" />
                        )}

                        {isAuthenticated ? (
                            <div className="flex items-center gap-2 ml-2">
                                <LoadingLink
                                    to="/profile"
                                    className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-slate-700 transition-all hover:bg-sky-50 hover:text-sky-600 border border-slate-200 shadow-sm"
                                    title="Hồ sơ & Tài khoản của tôi"
                                >
                                    {user?.avatarUrl ? (
                                        <img
                                            src={user.avatarUrl}
                                            alt={user.fullName || 'User avatar'}
                                            className="h-7 w-7 rounded-full object-cover ring-2 ring-sky-100"
                                        />
                                    ) : (
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sm text-sky-700 font-bold">
                                            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <UserOutlined />}
                                        </span>
                                    )}
                                    <span className="hidden sm:inline font-semibold text-sm max-w-[130px] truncate">
                                        {user?.fullName || 'Hồ sơ'}
                                    </span>
                                </LoadingLink>
                                <button
                                    type="button"
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                                    onClick={() => {
                                        dispatch(logout())
                                        navigate('/')
                                    }}
                                    title="Đăng xuất"
                                >
                                    <LogoutOutlined className="text-lg" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 ml-2">
                                <button
                                    type="button"
                                    onClick={() => dispatch(openAuthModal('login'))}
                                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-slate-600 font-semibold transition-all hover:bg-slate-100"
                                >
                                    <LoginOutlined className="text-lg" />
                                    <span className="hidden sm:inline">Đăng nhập</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => dispatch(openAuthModal('register'))}
                                    className={getButtonClass('primary')}
                                >
                                    <UserAddOutlined className="text-lg" />
                                    <span className="hidden sm:inline">Đăng ký</span>
                                </button>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            <main className={`mx-auto w-full flex-1 ${THEME.layout.container} py-8`}>
                <div className="w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Outlet />
                </div>
            </main>

            <footer className="mt-auto border-t border-slate-200 bg-white/80 backdrop-blur-sm py-8 text-center text-sm font-medium text-slate-500">
                <div className="flex items-center justify-center gap-2">
                    <CoffeeOutlined className="text-sky-500 text-lg" />
                    <span>Cafe Ordering System © {new Date().getFullYear()} - Designed with <span className="text-sky-500">Apple Style</span></span>
                </div>
            </footer>

            {/* Popup Đăng nhập & Đăng ký */}
            <AuthModal />
        </div>
    )
}
