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

function NavItem({ to, icon, label, className = '' }) {
    return (
        <LoadingLink
            to={to}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-stone-700 transition hover:bg-amber-50 hover:text-amber-900 ${className}`}
        >
            <span className="text-base leading-none">{icon}</span>
            <span className="hidden sm:inline">{label}</span>
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
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
                    <LoadingLink
                        to="/"
                        className="inline-flex items-center gap-2 text-xl font-bold text-amber-900"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-800 text-lg text-white">
                            <CoffeeOutlined />
                        </span>
                        <span className="hidden xs:inline sm:inline">Cafe Order</span>
                    </LoadingLink>

                    <nav className="flex flex-wrap items-center gap-1 text-sm font-medium">
                        <NavItem to="/" icon={<CoffeeOutlined />} label="Thực đơn" />
                        <NavItem to="/search" icon={<SearchOutlined />} label="Tìm kiếm" />
                        {isAuthenticated && (
                            <>
                                <NavItem to="/addresses" icon={<EnvironmentOutlined />} label="Địa chỉ" />
                                <NavItem to="/orders"    icon={<OrderedListOutlined />} label="Đơn hàng" />
                                <NavItem to="/vouchers"  icon={<TagOutlined />}         label="Voucher" />
                            </>
                        )}

                        <LoadingLink
                            to="/cart"
                            className="relative inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-stone-700 transition hover:bg-amber-50 hover:text-amber-900"
                            aria-label="Giỏ hàng"
                        >
                            <span className="relative inline-flex text-lg leading-none">
                                <ShoppingCartOutlined />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-800 px-1 text-[10px] font-semibold text-white">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </span>
                            <span className="hidden sm:inline">Giỏ hàng</span>
                        </LoadingLink>

                        {isAdminRole(role) && (
                            <NavItem to="/admin" icon={<SettingOutlined />} label="Admin" />
                        )}

                        {isAuthenticated ? (
                            <>
                                <span className="ml-1 hidden items-center gap-1.5 rounded-lg bg-stone-50 px-2.5 py-1.5 text-stone-600 md:inline-flex">
                                    <UserOutlined />
                                    {user?.fullName || 'Khách'}
                                </span>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-2.5 py-1.5 text-stone-700 hover:bg-stone-50"
                                    onClick={() => {
                                        dispatch(logout())
                                        navigate('/')
                                    }}
                                >
                                    <LogoutOutlined />
                                    <span className="hidden sm:inline">Đăng xuất</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => dispatch(openAuthModal('login'))}
                                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-stone-700 transition hover:bg-amber-50 hover:text-amber-900 cursor-pointer"
                                >
                                    <LoginOutlined className="text-base leading-none" />
                                    <span className="hidden sm:inline">Đăng nhập</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => dispatch(openAuthModal('register'))}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-800 px-3.5 py-1.5 text-white transition hover:bg-amber-900 cursor-pointer shadow-xs"
                                >
                                    <UserAddOutlined className="text-base leading-none" />
                                    <span className="hidden sm:inline">Đăng ký</span>
                                </button>
                            </>
                        )}
                    </nav>
                </div>
            </header>
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
                <Outlet />
            </main>
            <footer className="border-t border-stone-200 bg-white py-6 text-center text-sm text-stone-500">
                Cafe Ordering System © {new Date().getFullYear()}
            </footer>

            {/* Popup Đăng nhập & Đăng ký */}
            <AuthModal />
        </div>
    )
}
