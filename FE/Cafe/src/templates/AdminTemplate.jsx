import { Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
    DashboardOutlined,
    HomeOutlined,
    LogoutOutlined,
    TagOutlined,
    UserOutlined,
} from '@ant-design/icons'
import LoadingLink from '../components/loading/LoadingLink'
import { logout } from '../redux/slices/authSlice'

export default function AdminTemplate() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const user = useSelector((s) => s.auth.user)

    return (
        <div className="flex min-h-screen bg-stone-100">
            <aside className="hidden w-60 shrink-0 bg-stone-900 p-5 text-stone-100 md:block">
                <p className="mb-8 text-lg font-bold">Cafe Admin</p>
                <nav className="flex flex-col gap-2 text-sm">
                    <LoadingLink
                        to="/admin"
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-stone-800"
                    >
                        <DashboardOutlined />
                        Tổng quan
                    </LoadingLink>
                    <LoadingLink
                        to="/admin/vouchers"
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-stone-800"
                    >
                        <TagOutlined />
                        Mã giảm giá
                    </LoadingLink>
                    <LoadingLink
                        to="/"
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-stone-800"
                    >
                        <HomeOutlined />
                        Về trang khách
                    </LoadingLink>
                </nav>
            </aside>
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-3">
                    <p className="font-medium">Quản trị</p>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="inline-flex items-center gap-1.5 text-stone-600">
                            <UserOutlined />
                            {user?.fullName || 'Admin'}
                        </span>
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5"
                            onClick={() => {
                                dispatch(logout())
                                navigate('/login')
                            }}
                        >
                            <LogoutOutlined />
                            Đăng xuất
                        </button>
                    </div>
                </header>
                <div className="flex-1 p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
