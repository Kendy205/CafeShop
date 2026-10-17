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
        const handleNewOrder = (e) => {
            const type = e?.detail?.notificationType || e?.detail?.NotificationType
            // Chỉ tăng badge khi chính xác là sự kiện đơn hàng mới (NewOrder)
            if (type === 'NewOrder') {
                setNewOrderAlert((prev) => prev + 1)
            }
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
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F5F5F7] font-sans antialiased text-[#1D1D1F]">
            {/* Top Navigation Bar with Apple Glassmorphism */}
            <header className="flex h-16 sm:h-18 shrink-0 items-center justify-between border-b border-black/[0.06] bg-white/80 backdrop-blur-2xl px-4 sm:px-6 z-30 transition-all">
                {/* Brand & Segmented Nav */}
                <div className="flex items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#0071E3] to-[#0077ED] text-white shadow-[0_2px_10px_rgba(0,113,227,0.3)]">
                            <CoffeeOutlined className="text-xl" />
                        </div>
                        <div>
                            <div className="text-base sm:text-lg font-bold tracking-tight text-[#1D1D1F] leading-tight flex items-center gap-1">
                                <span>Cafe</span>
                                <span className="text-[#0071E3] font-extrabold">Staff</span>
                            </div>
                            <span className="inline-block text-[10px] font-semibold text-[#86868B] tracking-wide uppercase">
                                Vận hành Quầy & Bếp
                            </span>
                        </div>
                    </div>

                    {/* Apple Segmented Nav for Desktop/Tablet */}
                    <nav className="hidden md:flex items-center gap-1 p-1 bg-[#000000]/[0.05] rounded-[16px]">
                        {navItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.path)
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-[12px] text-xs sm:text-sm transition-all duration-200 select-none ${
                                        isActive
                                            ? 'bg-white text-[#0071E3] font-bold shadow-[0_2px_8px_rgba(0,113,227,0.12)] border border-[#0071E3]/15'
                                            : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-white/40 font-medium'
                                    }`}
                                >
                                    <span className="text-sm">{item.icon}</span>
                                    <span>{item.label}</span>
                                    {Boolean(item.badge) && item.badge > 0 && (
                                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#FF3B30] text-white text-[10px] font-bold">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2.5 sm:gap-3.5">
                    {/* Realtime Status Indicator */}
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#34C759]/10 border border-[#34C759]/20 rounded-full text-[#248A3D] text-xs font-semibold">
                        <span className="h-2 w-2 rounded-full bg-[#34C759] animate-pulse"></span>
                        <span>KDS Online</span>
                    </div>

                    {/* Switch back to Admin if Admin */}
                    {isAdmin && (
                        <Link
                            to="/admin"
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1D1D1F] bg-[#000000]/[0.04] hover:bg-[#000000]/[0.08] rounded-[12px] transition-colors"
                            title="Quay lại Admin Dashboard"
                        >
                            <SettingOutlined />
                            <span>Về Admin</span>
                        </Link>
                    )}

                    <Link
                        to="/"
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1D1D1F] bg-[#000000]/[0.04] hover:bg-[#000000]/[0.08] rounded-[12px] transition-colors"
                        title="Về trang đặt món khách hàng"
                    >
                        <HomeOutlined />
                        <span>Trang khách</span>
                    </Link>

                    <div className="h-5 w-px bg-black/[0.08] hidden sm:block"></div>

                    {/* User profile & Logout */}
                    <div className="flex items-center gap-2.5 pl-1">
                        <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0071E3]/15 to-[#0077ED]/25 text-[#0071E3] text-xs sm:text-sm font-bold border border-[#0071E3]/30 shadow-2xs">
                            {(user?.fullName || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div className="hidden sm:flex flex-col text-left">
                            <span className="text-xs font-bold text-[#1D1D1F] truncate max-w-[120px]">
                                {user?.fullName || 'Nhân viên'}
                            </span>
                            <span className="text-[10px] text-[#86868B] font-medium">
                                {isAdmin ? 'Quản lý' : 'Nhân viên'}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                dispatch(logout())
                                navigate('/login')
                            }}
                            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-[12px] text-[#86868B] hover:bg-[#FF3B30]/10 hover:text-[#FF3B30] transition-colors cursor-pointer"
                            title="Đăng xuất"
                        >
                            <LogoutOutlined className="text-sm sm:text-base" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Segmented Nav */}
            <div className="md:hidden flex border-b border-black/[0.06] bg-white/90 backdrop-blur-xl px-2 py-1.5 justify-around shrink-0 z-20">
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path)
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-1 items-center justify-center gap-1.5 py-1.5 px-2 rounded-[12px] text-xs font-semibold transition-all ${
                                isActive ? 'bg-[#000000]/[0.06] text-[#1D1D1F]' : 'text-[#86868B]'
                            }`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                            {Boolean(item.badge) && item.badge > 0 && (
                                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#FF3B30] text-white text-[10px] font-bold">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </div>

            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-7 max-w-[1600px] mx-auto w-full no-scrollbar">
                <Outlet />
            </main>
        </div>
    )
}
