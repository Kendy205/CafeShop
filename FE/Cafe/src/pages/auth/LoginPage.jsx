import LoginForm from '../../components/auth/LoginForm'
import LoadingLink from '../../components/loading/LoadingLink'
import {
    CoffeeOutlined,
    SafetyCertificateOutlined,
    ThunderboltOutlined,
    GiftOutlined,
} from '@ant-design/icons'

/**
 * LoginPage Component
 * Trang Đăng nhập hệ thống (dành cho cả Khách hàng, Staff và Admin).
 * Giao diện 2 cột hiện đại phong cách Apple & Glassmorphism, tối ưu visual và trải nghiệm người dùng.
 */
export default function LoginPage() {
    return (
        <div className="flex min-h-[calc(100vh-180px)] items-center justify-center py-4 px-2 sm:px-4">
            <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-12 transition-all">
                {/* ── Cột trái: Branding & Showcase Panel ── */}
                <div className="relative md:col-span-5 bg-gradient-to-br from-slate-900 via-sky-950 to-blue-900 p-8 sm:p-10 text-white flex flex-col justify-between overflow-hidden">
                    {/* Hiệu ứng đốm sáng nền */}
                    <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-sky-500/25 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-blue-500/25 blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        {/* Logo thương hiệu */}
                        <LoadingLink to="/" className="inline-flex items-center gap-3 group">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-2xl text-white shadow-lg shadow-sky-500/30 group-hover:scale-105 transition-transform">
                                <CoffeeOutlined />
                            </span>
                            <span className="text-2xl font-black tracking-tight text-white">
                                Cafe<span className="text-sky-400">Order</span>
                            </span>
                        </LoadingLink>

                        {/* Tiêu đề & Thông điệp */}
                        <div className="mt-8 sm:mt-10 space-y-3">
                            <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight text-white">
                                Thưởng thức trọn vị cà phê mỗi ngày
                            </h2>
                            <p className="text-sm leading-relaxed text-sky-100/80 font-normal">
                                Đặt món nhanh chóng, giao hàng tận nơi và trải nghiệm đồ uống tươi mới chuẩn phong cách.
                            </p>
                        </div>

                        {/* Điểm nổi bật */}
                        <div className="mt-8 space-y-3.5">
                            <div className="flex items-center gap-3 text-xs font-semibold text-slate-200">
                                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/10 text-sky-300 border border-white/10 shrink-0">
                                    <ThunderboltOutlined />
                                </span>
                                <span>Giao hàng hỏa tốc trong 30 phút</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-semibold text-slate-200">
                                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/10 text-sky-300 border border-white/10 shrink-0">
                                    <GiftOutlined />
                                </span>
                                <span>Tích điểm đổi quà & Voucher ưu đãi</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-semibold text-slate-200">
                                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/10 text-sky-300 border border-white/10 shrink-0">
                                    <SafetyCertificateOutlined />
                                </span>
                                <span>Thanh toán an toàn qua VNPAY / COD</span>
                            </div>
                        </div>
                    </div>

                    {/* Chân cột trái: Quay về trang chủ */}
                    <div className="relative z-10 mt-10 pt-6 border-t border-white/10">
                        <LoadingLink
                            to="/"
                            className="inline-flex items-center gap-2 text-xs font-bold text-sky-300 hover:text-white transition-colors"
                        >
                            <span>←</span>
                            <span>Quay lại trang chủ xem thực đơn</span>
                        </LoadingLink>
                    </div>
                </div>

                {/* ── Cột phải: Form Đăng nhập ── */}
                <div className="md:col-span-7 p-7 sm:p-10 flex flex-col justify-center bg-white">
                    <div className="mb-6">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-100 px-3 py-1 text-[11px] font-bold text-sky-700 mb-2">
                            👋 Chào mừng trở lại
                        </span>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                            Đăng nhập tài khoản
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Sử dụng tài khoản Khách hàng, Nhân viên hoặc Quản trị viên để tiếp tục.
                        </p>
                    </div>

                    <LoginForm />
                </div>
            </div>
        </div>
    )
}
