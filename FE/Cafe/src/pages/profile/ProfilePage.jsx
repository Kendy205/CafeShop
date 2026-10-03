import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { getProfile } from '../../redux/actions/user/userAction'
import AddressManager from '../../components/address/AddressManager'
import LoadingLink from '../../components/loading/LoadingLink'
import UpdateProfileForm from '../../components/profile/UpdateProfileForm'
import ChangePasswordForm from '../../components/profile/ChangePasswordForm'

const TAB_PROFILE = 'profile'
const TAB_ADDRESS = 'address'
const TAB_PASSWORD = 'password'

export default function ProfilePage({ defaultTab }) {
    const dispatch = useDispatch()
    const [searchParams, setSearchParams] = useSearchParams()

    const { user } = useSelector((s) => s.app.auth)
    const { profile, loading: profileLoading } = useSelector((s) => s.user.profile)

    const tabParam = searchParams.get('tab')
    const [activeTab, setActiveTab] = useState(
        defaultTab || (tabParam === 'address' ? TAB_ADDRESS : tabParam === 'password' ? TAB_PASSWORD : TAB_PROFILE)
    )

    useEffect(() => {
        if (tabParam === 'address') setActiveTab(TAB_ADDRESS)
        else if (tabParam === 'password') setActiveTab(TAB_PASSWORD)
        else if (tabParam === 'profile') setActiveTab(TAB_PROFILE)
    }, [tabParam])

    const handleSwitchTab = (tab) => {
        setActiveTab(tab)
        setSearchParams({ tab })
    }

    useEffect(() => {
        dispatch(getProfile())
    }, [dispatch])

    const [avatarPreview, setAvatarPreview] = useState(null)
    const currentAvatarUrl = avatarPreview || profile?.avatarUrl || user?.avatarUrl

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 sm:text-3xl flex items-center gap-2.5">
                        <span>☕</span>
                        <span>Tài khoản của tôi</span>
                    </h1>
                    <p className="mt-1 text-xs text-slate-500">
                        Quản lý thông tin cá nhân, cập nhật ảnh đại diện, sổ địa chỉ và bảo mật mật khẩu
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <LoadingLink
                        to="/orders"
                        className="inline-flex items-center gap-1.5 rounded-3xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-900 transition-colors shadow-2xs"
                    >
                        <span>📦 Lịch sử đơn hàng</span>
                    </LoadingLink>
                    <LoadingLink
                        to="/vouchers"
                        className="inline-flex items-center gap-1.5 rounded-3xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-900 transition-colors shadow-2xs"
                    >
                        <span>🎟️ Ví Voucher</span>
                    </LoadingLink>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12 items-start">
                <div className="lg:col-span-4 space-y-4">
                    <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs text-center">
                        <div className="relative mx-auto mb-3.5 h-24 w-24">
                            {currentAvatarUrl ? (
                                <img
                                    src={currentAvatarUrl}
                                    alt="Avatar"
                                    className="h-full w-full rounded-full object-cover border-4 border-sky-100 shadow-md"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-sky-700 to-sky-900 text-3xl font-bold text-white border-4 border-sky-100 shadow-md">
                                    {(profile?.fullName || user?.fullName || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => handleSwitchTab(TAB_PROFILE)}
                                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-sky-800 text-white shadow-md hover:bg-sky-900 transition-transform active:scale-95 cursor-pointer text-xs"
                                title="Đổi ảnh đại diện"
                            >
                                📷
                            </button>
                        </div>

                        <h2 className="text-base font-bold text-slate-800">
                            {profile?.fullName || user?.fullName || 'Khách hàng'}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500 font-mono">
                            {profile?.phoneNumber || user?.phone || 'Chưa cập nhật số điện thoại'}
                        </p>

                        <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-900 border border-sky-200/60">
                            <span>☕</span>
                            <span>Thành viên Cafe Club</span>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-2.5 shadow-xs">
                        <nav className="space-y-1">
                            <button
                                type="button"
                                onClick={() => handleSwitchTab(TAB_PROFILE)}
                                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === TAB_PROFILE
                                        ? 'bg-sky-800 text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-sky-50/60 hover:text-sky-900'
                                }`}
                            >
                                <span className="text-base">👤</span>
                                <span>Hồ sơ cá nhân</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSwitchTab(TAB_ADDRESS)}
                                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === TAB_ADDRESS
                                        ? 'bg-sky-800 text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-sky-50/60 hover:text-sky-900'
                                }`}
                            >
                                <span className="text-base">📍</span>
                                <span>Sổ địa chỉ nhận hàng</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSwitchTab(TAB_PASSWORD)}
                                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === TAB_PASSWORD
                                        ? 'bg-sky-800 text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-sky-50/60 hover:text-sky-900'
                                }`}
                            >
                                <span className="text-base">🔒</span>
                                <span>Đổi mật khẩu</span>
                            </button>
                        </nav>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    {activeTab === TAB_PROFILE && (
                        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs animate-in fade-in duration-200">
                            <div className="mb-6 border-b border-slate-100 pb-4">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <span>👤</span>
                                    <span>Thông tin cá nhân & Ảnh đại diện</span>
                                </h3>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    Cập nhật họ tên, số điện thoại và tải lên hình đại diện của bạn
                                </p>
                            </div>

                            {profileLoading && !profile ? (
                                <div className="space-y-4 py-8 text-center text-xs text-slate-400">
                                    <span>⏳ Đang tải thông tin hồ sơ...</span>
                                </div>
                            ) : (
                                <UpdateProfileForm currentAvatarUrl={currentAvatarUrl} onAvatarChange={(url) => setAvatarPreview(url)} />
                            )}
                        </div>
                    )}

                    {activeTab === TAB_ADDRESS && (
                        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs animate-in fade-in duration-200">
                            <div className="mb-6 border-b border-slate-100 pb-4">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <span>📍</span>
                                    <span>Quản lý sổ địa chỉ nhận hàng</span>
                                </h3>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    Danh sách địa chỉ của bạn được đồng bộ trực tiếp khi đặt hàng và tính khoảng cách Mapbox
                                </p>
                            </div>

                            <AddressManager hideTitle />
                        </div>
                    )}

                    {activeTab === TAB_PASSWORD && (
                        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs animate-in fade-in duration-200">
                            <div className="mb-6 border-b border-slate-100 pb-4">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <span>🔒</span>
                                    <span>Đổi mật khẩu tài khoản</span>
                                </h3>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác
                                </p>
                            </div>

                            <ChangePasswordForm />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}