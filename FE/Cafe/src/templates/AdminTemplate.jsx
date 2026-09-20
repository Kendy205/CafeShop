import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
    DashboardOutlined,
    HomeOutlined,
    LogoutOutlined,
    TagOutlined,
    UserOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    MenuOutlined,
    CloseOutlined,
    CoffeeOutlined,
    ShoppingOutlined,
    AppstoreOutlined,
    TeamOutlined,
    SettingOutlined
} from '@ant-design/icons'
import { Drawer } from 'antd'
import { logout } from '../redux/slices/authSlice'
import { useState } from 'react'

export default function AdminTemplate() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const user = useSelector((s) => s.auth.user)

    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    const navItems = [
        { path: '/admin', label: 'Tổng quan', icon: <DashboardOutlined /> },
        { path: '/admin/orders', label: 'Quản lý Đơn hàng', icon: <ShoppingOutlined /> },
        { path: '/admin/products', label: 'Quản lý Sản phẩm', icon: <CoffeeOutlined /> },
        { path: '/admin/categories', label: 'Danh mục', icon: <AppstoreOutlined /> },
        { path: '/admin/vouchers', label: 'Mã giảm giá', icon: <TagOutlined /> },
        { path: '/admin/users', label: 'Khách hàng', icon: <TeamOutlined /> },
        { path: '/admin/settings', label: 'Cài đặt hệ thống', icon: <SettingOutlined /> },
    ]

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans p-2 sm:p-4 gap-2 sm:gap-4">
            {/* Mobile Drawer Navigation */}
            <Drawer
                placement="left"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                closable={false}
                styles={{ body: { padding: 0 } }}
                width={280}
            >
                <div className="flex h-full flex-col bg-white">
                    {/* Logo & Close */}
                    <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/20">
                                <CoffeeOutlined className="text-xl" />
                            </div>
                            <span className="text-xl font-black tracking-wide text-slate-800">
                                Cafe<span className="text-sky-500">Admin</span>
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setMobileOpen(false)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        >
                            <CloseOutlined />
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-4 px-4 no-scrollbar">
                        <div className="mb-3 ml-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Menu Quản Trị
                        </div>
                        <nav className="flex flex-col gap-2">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 ${isActive
                                            ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                    >
                                        <span className={`text-xl ${isActive ? 'scale-110' : ''}`}>
                                            {item.icon}
                                        </span>
                                        <span className="font-medium whitespace-nowrap">{item.label}</span>
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-4 border-t border-slate-100 flex flex-col gap-2">
                        <Link
                            to="/"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            <HomeOutlined className="text-xl" />
                            <span className="font-medium whitespace-nowrap">Về cửa hàng</span>
                        </Link>
                        <button
                            type="button"
                            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-red-500 hover:bg-red-50 transition-colors font-medium"
                            onClick={() => {
                                setMobileOpen(false)
                                dispatch(logout())
                                navigate('/login')
                            }}
                        >
                            <LogoutOutlined className="text-xl" />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </Drawer>

            {/* Sidebar (Floating) */}
            <aside
                className={`flex flex-col bg-white/80 backdrop-blur-xl border border-white/40 shadow-apple rounded-3xl transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'
                    } hidden md:flex z-20 overflow-hidden relative`}
            >
                {/* Logo Area */}
                <div className="flex h-20 items-center justify-center border-b border-slate-100 bg-white/50">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/20">
                            <CoffeeOutlined className="text-xl" />
                        </div>
                        {!collapsed && (
                            <span className="text-xl font-black tracking-wide text-slate-800">Cafe<span className="text-sky-500">Admin</span></span>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar">
                    {!collapsed && <div className="mb-4 ml-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Menu Quản Trị</div>}
                    <nav className="flex flex-col gap-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`group flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 ${isActive
                                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                        } ${collapsed ? 'justify-center px-0' : ''}`}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                        {item.icon}
                                    </span>
                                    {!collapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-slate-100 bg-white/50">
                    <Link
                        to="/"
                        className={`flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors ${collapsed ? 'justify-center px-0' : ''}`}
                        title={collapsed ? "Về trang khách" : undefined}
                    >
                        <HomeOutlined className="text-xl" />
                        {!collapsed && <span className="font-medium whitespace-nowrap">Về cửa hàng</span>}
                    </Link>
                </div>
            </aside>

            {/* Main Content Container (Floating) */}
            <div className="flex flex-1 flex-col overflow-hidden bg-white/60 backdrop-blur-xl shadow-apple border border-white/60 rounded-3xl relative">
                {/* Header */}
                <header className="flex h-20 items-center justify-between border-b border-slate-100/50 bg-white/40 px-6 backdrop-blur-md z-10 rounded-t-3xl">
                    <div className="flex items-center gap-4">
                        {/* Desktop collapse toggle */}
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="hidden md:flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm border border-slate-100 hover:bg-slate-50 hover:text-sky-600 transition-colors"
                            title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
                        >
                            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        </button>
                        {/* Mobile drawer toggle */}
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="flex md:hidden h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm border border-slate-100 hover:bg-slate-50 hover:text-sky-600 transition-colors"
                            title="Mở menu quản trị"
                        >
                            <MenuOutlined />
                        </button>
                    </div>
                    <div className="flex items-center gap-6">
                        {/* Notification Bell */}
                        <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 text-slate-500 hover:text-sky-500 hover:shadow-md transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                            </svg>
                            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                        </button>

                        <div className="h-6 w-px bg-slate-200"></div>

                        {/* User Profile */}
                        <div className="group relative flex cursor-pointer items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-bold text-white shadow-sm">
                                {(user?.fullName || 'A').charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden flex-col md:flex">
                                <span className="text-sm font-bold text-slate-800">{user?.fullName || 'Administrator'}</span>
                                <span className="text-[10px] font-semibold text-sky-600">Quản trị viên</span>
                            </div>

                            {/* Dropdown Logout */}
                            <div className="absolute right-0 top-full mt-3 hidden w-48 rounded-2xl border border-slate-100 bg-white/90 backdrop-blur-xl p-2 shadow-apple group-hover:block transition-all">
                                <button
                                    type="button"
                                    className="flex w-full items-center gap-2 rounded-3xl px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                                    onClick={() => {
                                        dispatch(logout())
                                        navigate('/login')
                                    }}
                                >
                                    <LogoutOutlined />
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8 no-scrollbar bg-transparent">
                    <div className="w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
