import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
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
import { logout, openAuthModal } from '../redux/slices/authSlice'
import { getCart } from '../redux/actions/user/cartAction'
import { getProfile } from '../redux/actions/user/userAction'
import { isAdminRole, isStaffRole } from '../utils/auth/authRole'
import { THEME } from '../utils/constants/Theme'

function NavItem({ to, icon, label, isActive = false, className = '' }) {
    return (
        <LoadingLink
            to={to}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 shrink-0 ${
                isActive
                    ? 'bg-white text-sky-600 shadow-2xs font-bold border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            } ${className}`}
        >
            <span className="text-sm leading-none shrink-0">{icon}</span>
            <span className="hidden lg:inline whitespace-nowrap">{label}</span>
        </LoadingLink>
    )
}

export default function UserTemplate() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const { isAuthenticated, user, role } = useSelector((s) => s.app.auth)
    const storeProfile = useSelector((s) => s.app.storeProfile.profile)
    const cartCount = useSelector((s) => s.user.cart.items.length)
    const [orderUpdateCount, setOrderUpdateCount] = useState(0)

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(getCart())
            dispatch(getProfile())
        }
    }, [isAuthenticated, dispatch])

    useEffect(() => {
        const handleUpdate = () => {
            setOrderUpdateCount((prev) => prev + 1)
        }
        window.addEventListener('app:user-order-update', handleUpdate)
        return () => {
            window.removeEventListener('app:user-order-update', handleUpdate)
        }
    }, [])

    const activeOrderCount = location.pathname === '/orders' ? 0 : orderUpdateCount

    return (
        <div className={`flex min-h-screen flex-col ${THEME.colors.background}`}>
            {/* Header Sticky - Apple Glassmorphism */}
            <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-2xs transition-all">
                <div className={`mx-auto flex items-center justify-between gap-2 lg:gap-4 py-2 sm:py-2.5 ${THEME.layout.container}`}>
                    {/* 1. Left: Brand Logo & Store Opening Hours */}
                    <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                        <LoadingLink
                            to="/"
                            className="group inline-flex items-center gap-2.5 text-slate-800 transition-transform hover:scale-[1.02]"
                            title={storeProfile?.storeName || 'CafeShop'}
                        >
                            <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-base sm:text-lg text-white shadow-sm shadow-sky-500/25 transition-shadow group-hover:shadow-sky-500/40">
                                <CoffeeOutlined />
                            </div>
                            <div className="hidden xs:flex sm:flex flex-col">
                                <span className="text-sm sm:text-base font-black tracking-tight bg-gradient-to-r from-slate-900 via-sky-900 to-blue-700 bg-clip-text text-transparent whitespace-nowrap max-w-[130px] sm:max-w-[160px] truncate leading-tight">
                                    {storeProfile?.storeName || 'CafeShop'}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none">
                                    Coffee & Bakery
                                </span>
                            </div>
                        </LoadingLink>

                        {/* Giờ mở cửa badge trên Header */}
                        {storeProfile?.openTime && storeProfile?.closeTime && (
                            <div 
                                className={`hidden md:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-all ${
                                    storeProfile.isOpenNow
                                        ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/80'
                                        : 'bg-amber-50/80 text-amber-800 border-amber-200/80'
                                }`}
                                title={storeProfile.isOpenNow ? 'Quán đang mở cửa đón khách' : 'Quán hiện đang nghỉ'}
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${storeProfile.isOpenNow ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${storeProfile.isOpenNow ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                </span>
                                <span className="font-bold">
                                    {storeProfile.isOpenNow ? 'Mở cửa' : 'Đóng cửa'}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="font-mono text-[11px] font-semibold text-slate-600">
                                    {storeProfile.openTime.slice(0, 5)} - {storeProfile.closeTime.slice(0, 5)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* 2. Center: Segmented Navigation Dock */}
                    <nav className="flex items-center gap-0.5 rounded-full bg-slate-100/90 p-1 border border-slate-200/70 overflow-x-auto no-scrollbar mx-1 shadow-2xs">
                        <NavItem to="/" icon={<CoffeeOutlined />} label="Thực đơn" isActive={location.pathname === '/'} />
                        <NavItem to="/search" icon={<SearchOutlined />} label="Tìm kiếm" isActive={location.pathname === '/search'} />

                        {isAuthenticated && (
                            <>
                                <NavItem to="/addresses" icon={<EnvironmentOutlined />} label="Địa chỉ" isActive={location.pathname === '/addresses'} />
                                <LoadingLink
                                    to="/orders"
                                    className={`relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 shrink-0 ${
                                        location.pathname === '/orders'
                                            ? 'bg-white text-sky-600 shadow-2xs font-bold border border-slate-200/60'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                    }`}
                                >
                                    <span className="relative inline-flex text-sm leading-none shrink-0">
                                        <OrderedListOutlined />
                                        {activeOrderCount > 0 && (
                                            <span className="absolute -top-2 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-bounce">
                                                {activeOrderCount > 9 ? '9+' : activeOrderCount}
                                            </span>
                                        )}
                                    </span>
                                    <span className="hidden lg:inline whitespace-nowrap">Đơn hàng</span>
                                </LoadingLink>
                                <NavItem to="/vouchers" icon={<TagOutlined />} label="Voucher" isActive={location.pathname === '/vouchers'} />
                            </>
                        )}

                        {(isAdminRole(role) || isStaffRole(role)) && (
                            <NavItem
                                to="/staff/orders"
                                icon={<CoffeeOutlined />}
                                label="Staff"
                                isActive={location.pathname.startsWith('/staff')}
                                className="text-amber-700 hover:text-amber-800 hover:bg-amber-100/50"
                            />
                        )}

                        {isAdminRole(role) && (
                            <NavItem
                                to="/admin"
                                icon={<SettingOutlined />}
                                label="Admin"
                                isActive={location.pathname.startsWith('/admin')}
                                className="text-sky-700 hover:text-sky-800 hover:bg-sky-100/50"
                            />
                        )}
                    </nav>

                    {/* 3. Right: User Actions (Pinned & shrink-0 - NEVER clipped) */}
                    <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                        <LoadingLink
                            to="/cart"
                            className="relative inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-slate-700 transition-all duration-200 hover:border-sky-300 hover:bg-sky-50/50 hover:text-sky-600 shadow-2xs shrink-0"
                            aria-label="Giỏ hàng"
                            title="Giỏ hàng"
                        >
                            <span className="relative inline-flex text-base leading-none shrink-0 text-slate-600">
                                <ShoppingCartOutlined />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </span>
                            <span className="hidden xl:inline text-xs font-semibold whitespace-nowrap">Giỏ hàng</span>
                        </LoadingLink>

                        <div className="w-px h-5 bg-slate-200 hidden sm:block"></div>

                        {isAuthenticated ? (
                            <div className="flex items-center gap-2 shrink-0">
                                <LoadingLink
                                    to="/profile"
                                    className="inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1 text-slate-700 transition-all hover:bg-sky-50 hover:text-sky-600 border border-slate-200/80 shadow-2xs shrink-0"
                                    title="Hồ sơ & Tài khoản của tôi"
                                >
                                    {user?.avatarUrl ? (
                                        <img
                                            src={user.avatarUrl}
                                            alt={user.fullName || 'User avatar'}
                                            className="h-6 w-6 rounded-full object-cover ring-1 ring-sky-200"
                                        />
                                    ) : (
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-blue-200 text-xs text-sky-800 font-bold">
                                            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <UserOutlined />}
                                        </span>
                                    )}
                                    <span className="hidden lg:inline font-bold text-xs max-w-[90px] sm:max-w-[120px] truncate text-slate-800">
                                        {user?.fullName || 'Hồ sơ'}
                                    </span>
                                </LoadingLink>

                                <button
                                    type="button"
                                    className="inline-flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all shadow-2xs cursor-pointer"
                                    onClick={() => {
                                        dispatch(logout())
                                        navigate('/')
                                    }}
                                    title="Đăng xuất"
                                >
                                    <LogoutOutlined className="text-base" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => dispatch(openAuthModal('login'))}
                                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-slate-600 text-xs font-semibold transition-all hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                                >
                                    <LoginOutlined className="text-sm" />
                                    <span className="hidden sm:inline">Đăng nhập</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => dispatch(openAuthModal('register'))}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-xs px-3.5 py-1.5 shadow-sm shadow-sky-500/25 hover:from-sky-600 hover:to-blue-700 hover:shadow-md transition-all cursor-pointer"
                                >
                                    <UserAddOutlined className="text-sm" />
                                    <span className="hidden sm:inline">Đăng ký</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className={`mx-auto w-full flex-1 ${THEME.layout.container} py-8`}>
                <div className="w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Outlet />
                </div>
            </main>

            <footer className="mt-auto border-t border-slate-200/80 bg-white/80 backdrop-blur-md py-8 text-slate-600">
                <div className={`mx-auto ${THEME.layout.container} grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center md:text-left`}>
                    <div className="space-y-1">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-base font-black text-slate-800">
                            <CoffeeOutlined className="text-sky-500" />
                            <span>{storeProfile?.storeName || 'CafeShop Premium & Bakery'}</span>
                        </div>
                        {storeProfile?.fullAddress && (
                            <p className="text-xs text-slate-500 flex items-center justify-center md:justify-start gap-1">
                                <span>📍</span>
                                <span>{storeProfile.fullAddress}</span>
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        {storeProfile?.hotline && (
                            <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 border border-sky-100 px-3.5 py-1 text-xs font-bold text-sky-800">
                                <span>📞 Hotline:</span>
                                <a href={`tel:${storeProfile.hotline}`} className="hover:underline">{storeProfile.hotline}</a>
                            </div>
                        )}
                        {storeProfile?.openTime && storeProfile?.closeTime && (
                            <p className="text-xs text-slate-400">
                                Giờ mở cửa: {storeProfile.openTime.slice(0, 5)} - {storeProfile.closeTime.slice(0, 5)}
                            </p>
                        )}
                    </div>

                    <div className="text-center md:text-right text-xs text-slate-400">
                        <span>© {new Date().getFullYear()} {storeProfile?.storeName || 'CafeShop'}. All rights reserved.</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
