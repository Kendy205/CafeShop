import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
    CoffeeOutlined,
    ShoppingOutlined,
    AppstoreOutlined,
    LogoutOutlined,
    HomeOutlined,
    SettingOutlined,
    BellOutlined,
    CheckCircleOutlined,
    MessageOutlined
} from '@ant-design/icons'
import { logout } from '../redux/slices/authSlice'
import { isAdminRole } from '../utils/auth/authRole'
import { useState, useEffect } from 'react'

/**
 * StaffTemplate Component
 * Giao diện tinh gọn dành riêng cho Nhân viên (Staff / Quầy / Bếp).
 * Tối ưu hiển thị cho thao tác nhanh: Xử lý đơn hàng & Bật/tắt trạng thái món hết hàng.
 */
export default function StaffTemplate() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const { user, role } = useSelector((s) => s.app.auth)
    const isAdmin = isAdminRole(role)

    const [newOrderAlert, setNewOrderAlert] = useState(0)

    useEffect(() => {
        const handleNewOrder = () => {
            setNewOrderAlert((prev) => prev + 1)
        }
        window.addEventListener('app:admin-new-order', handleNewOrder)
        return () => {
            window.removeEventListener('app:admin-new-order', handleNewOrder)
        }
    }, [])

    useEffect(() => {
        if (location.pathname.startsWith('/staff/orders')) {
            setNewOrderAlert(0)
        }
    }, [location.pathname])

    const navItems = [
        {
            path: '/staff/orders',
            label: 'Xử lý Đơn hàng',
            icon: <ShoppingOutlined />,
            badge: newOrderAlert,
        },
        {
            path: '/staff/products',
            label: 'Trạng thái Món (Bán / Hết)',
            icon: <CoffeeOutlined />,
        },
        {
            path: '/staff/feedbacks',
            label: 'Đánh giá & Phản hồi',
            icon: <MessageOutlined />,
        },
    ]

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans">
            {/* Top Navigation Bar */}
            <header className="flex h-16 sm:h-20 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-4 sm:px-6 shadow-sm z-30">
                {/* Brand & Mode */}
                <div className="flex items-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
                            <CoffeeOutlined className="text-xl sm:text-2xl" />
                        </div>
                        <div>
                            <div className="text-lg sm:text-xl font-black tracking-wide text-slate-800 leading-tight">
                                Cafe<span className="text-amber-500">Staff</span>
                            </div>
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                Vận hành Quầy & Bếp
                            </span>
                        </div>
                    </div>

                    {/* Nav tabs for Desktop/Tablet */}
                    <nav className="hidden md:flex items-center gap-2 ml-4">
                        {navItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.path)
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                                        isActive
                                            ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span>{item.label}</span>
                                    {Boolean(item.badge) && item.badge > 0 && (
                                        <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[11px] font-bold animate-pulse">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3 sm:gap-4">
                    {/* Realtime Status Indicator */}
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-semibold">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <span>Realtime KDS Online</span>
                    </div>

                    {/* Switch back to Admin if Admin */}
                    {isAdmin && (
                        <Link
                            to="/admin"
                            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                            title="Quay lại Admin Dashboard"
                        >
                            <SettingOutlined />
                            <span>Về Admin</span>
                        </Link>
                    )}

                    <Link
                        to="/"
                        className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        title="Về trang đặt món khách hàng"
                    >
                        <HomeOutlined />
                        <span>Trang khách</span>
                    </Link>

                    <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

                    {/* User profile & Logout */}
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-sm font-bold border border-amber-200">
                            {(user?.fullName || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div className="hidden sm:flex flex-col text-left">
                            <span className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[120px]">
                                {user?.fullName || 'Nhân viên'}
                            </span>
                            <span className="text-[10px] text-amber-600 font-semibold">
                                {isAdmin ? 'Admin (Quầy)' : 'Nhân viên'}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                dispatch(logout())
                                navigate('/login')
                            }}
                            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                            title="Đăng xuất"
                        >
                            <LogoutOutlined className="text-base sm:text-lg" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile bottom nav for small screens */}
            <div className="md:hidden flex border-b border-slate-200 bg-white px-2 py-1.5 justify-around shrink-0 z-20">
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path)
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-1 items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                                isActive ? 'bg-amber-500 text-white' : 'text-slate-600'
                            }`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                            {Boolean(item.badge) && item.badge > 0 && (
                                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px]">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </div>

            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-5 lg:p-6 no-scrollbar">
                <Outlet />
            </main>
        </div>
    )
}
