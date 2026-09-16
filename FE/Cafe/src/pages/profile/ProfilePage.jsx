import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { message } from 'antd'
import { getProfile, updateProfile, changePassword } from '../../redux/actions/user/userAction'
import { resetPasswordStatus } from '../../redux/slices/user/userSlice'
import AddressManager from '../../components/address/AddressManager'
import LoadingLink from '../../components/loading/LoadingLink'

// Các tab trong trang Profile
const TAB_PROFILE = 'profile'
const TAB_ADDRESS = 'address'
const TAB_PASSWORD = 'password'

export default function ProfilePage({ defaultTab }) {
    const dispatch = useDispatch()
    const [searchParams, setSearchParams] = useSearchParams()

    const { user } = useSelector((s) => s.auth)
    const {
        profile,
        loading: profileLoading,
        updating,
        changingPassword,
    } = useSelector((s) => s.user)

    // Tab đang active: ưu tiên theo query param ?tab=... hoặc defaultTab
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

    // ── Lấy thông tin cá nhân khi tải trang ────────────────────────────────
    useEffect(() => {
        dispatch(getProfile())
    }, [dispatch])

    // ── Form State: Cập nhật thông tin cá nhân ─────────────────────────────
    const [fullName, setFullName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [avatarFile, setAvatarFile] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState(null)
    const fileInputRef = useRef(null)

    // Đồng bộ profile vào form khi fetch xong
    useEffect(() => {
        if (profile) {
            setFullName(profile.fullName || '')
            setPhoneNumber(profile.phoneNumber || '')
        } else if (user) {
            setFullName(user.fullName || '')
            setPhoneNumber(user.phone || '')
        }
    }, [profile, user])

    // Xử lý chọn ảnh đại diện từ máy tính
    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            message.error('Vui lòng chọn file ảnh hợp lệ (PNG, JPG, JPEG)!')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            message.error('Dung lượng ảnh không được vượt quá 5MB!')
            return
        }

        setAvatarFile(file)
        const previewUrl = URL.createObjectURL(file)
        setAvatarPreview(previewUrl)
    }

    // Hủy ảnh đại diện vừa chọn
    const handleCancelAvatar = () => {
        setAvatarFile(null)
        if (avatarPreview) {
            URL.revokeObjectURL(avatarPreview)
            setAvatarPreview(null)
        }
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    // Submit Cập nhật hồ sơ (PUT /api/User/profile - FormData)
    const handleUpdateProfile = async (e) => {
        e.preventDefault()

        const trimmedName = fullName.trim()
        if (!trimmedName) {
            message.warning('Vui lòng nhập họ và tên!')
            return
        }

        const trimmedPhone = phoneNumber.trim()
        if (trimmedPhone) {
            const phoneRegex = /^(0|\+84)\d{9,10}$/
            if (!phoneRegex.test(trimmedPhone)) {
                message.warning('Số điện thoại không hợp lệ (VD: 0912345678)!')
                return
            }
        }

        // Tạo FormData theo đúng đặc tả API (FullName, PhoneNumber, AvatarFile)
        const formData = new FormData()
        formData.append('FullName', trimmedName)
        if (trimmedPhone) {
            formData.append('PhoneNumber', trimmedPhone)
        }
        if (avatarFile) {
            formData.append('AvatarFile', avatarFile)
        }

        const res = await dispatch(updateProfile(formData))
        if (updateProfile.fulfilled.match(res)) {
            message.success('Cập nhật hồ sơ thành công!')
            handleCancelAvatar()
            dispatch(getProfile())
        } else {
            message.error(res.payload || 'Cập nhật hồ sơ thất bại!')
        }
    }

    // ── Form State: Đổi mật khẩu (PUT /api/User/change-password) ─────────────
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [passwordErrorAlert, setPasswordErrorAlert] = useState('')
    const [passwordSuccessAlert, setPasswordSuccessAlert] = useState('')

    const handleChangePassword = async (e) => {
        e.preventDefault()
        setPasswordErrorAlert('')
        setPasswordSuccessAlert('')

        if (!currentPassword) {
            setPasswordErrorAlert('Vui lòng nhập mật khẩu hiện tại!')
            return
        }

        if (newPassword.length < 6) {
            setPasswordErrorAlert('Mật khẩu mới bắt buộc từ 6 ký tự trở lên!')
            return
        }

        if (newPassword !== confirmNewPassword) {
            setPasswordErrorAlert('Mật khẩu mới và mật khẩu xác nhận không khớp!')
            return
        }

        const body = {
            currentPassword,
            newPassword,
            confirmNewPassword,
        }

        const res = await dispatch(changePassword(body))
        if (changePassword.fulfilled.match(res)) {
            const successMsg =
                res.payload?.message ||
                'Đổi mật khẩu thành công! Vui lòng sử dụng mật khẩu mới cho lần đăng nhập sau.'
            setPasswordSuccessAlert(successMsg)
            message.success(successMsg)
            setCurrentPassword('')
            setNewPassword('')
            setConfirmNewPassword('')
            dispatch(resetPasswordStatus())
        } else {
            const errMsg = res.payload || 'Đổi mật khẩu thất bại!'
            setPasswordErrorAlert(errMsg)
            message.error(errMsg)
        }
    }

    // Avatar hiển thị: ưu tiên preview ảnh mới chọn -> avatar từ API profile -> avatar từ Redux user
    const currentAvatarUrl = avatarPreview || profile?.avatarUrl || user?.avatarUrl

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            {/* ── Tiêu đề trang ── */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/80 pb-5">
                <div>
                    <h1 className="text-2xl font-black text-stone-800 sm:text-3xl flex items-center gap-2.5">
                        <span>☕</span>
                        <span>Tài khoản của tôi</span>
                    </h1>
                    <p className="mt-1 text-xs text-stone-500">
                        Quản lý thông tin cá nhân, cập nhật ảnh đại diện, sổ địa chỉ và bảo mật mật khẩu
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <LoadingLink
                        to="/orders"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-bold text-stone-700 hover:bg-amber-50 hover:text-amber-900 transition-colors shadow-2xs"
                    >
                        <span>📦 Lịch sử đơn hàng</span>
                    </LoadingLink>
                    <LoadingLink
                        to="/vouchers"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-bold text-stone-700 hover:bg-amber-50 hover:text-amber-900 transition-colors shadow-2xs"
                    >
                        <span>🎟️ Ví Voucher</span>
                    </LoadingLink>
                </div>
            </div>

            {/* ── Layout 2 Cột: Sidebar thông tin tóm tắt & Khối nội dung Tab ── */}
            <div className="grid gap-8 lg:grid-cols-12 items-start">
                {/* ══ CỘT TRÁI: User Summary & Menu Tabs (4 cols) ══ */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Thẻ tóm tắt thông tin người dùng */}
                    <div className="overflow-hidden rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs text-center">
                        <div className="relative mx-auto mb-3.5 h-24 w-24">
                            {currentAvatarUrl ? (
                                <img
                                    src={currentAvatarUrl}
                                    alt="Avatar"
                                    className="h-full w-full rounded-full object-cover border-4 border-amber-100 shadow-md"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-amber-700 to-amber-900 text-3xl font-bold text-white border-4 border-amber-100 shadow-md">
                                    {(profile?.fullName || user?.fullName || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}

                            {/* Badge icon camera để chọn ảnh nhanh */}
                            <button
                                type="button"
                                onClick={() => {
                                    handleSwitchTab(TAB_PROFILE)
                                    fileInputRef.current?.click()
                                }}
                                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-amber-800 text-white shadow-md hover:bg-amber-900 transition-transform active:scale-95 cursor-pointer text-xs"
                                title="Đổi ảnh đại diện"
                            >
                                📷
                            </button>
                        </div>

                        <h2 className="text-base font-bold text-stone-800">
                            {profile?.fullName || user?.fullName || 'Khách hàng'}
                        </h2>
                        <p className="mt-0.5 text-xs text-stone-500 font-mono">
                            {profile?.phoneNumber || user?.phone || 'Chưa cập nhật số điện thoại'}
                        </p>

                        <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-900 border border-amber-200/60">
                            <span>☕</span>
                            <span>Thành viên Cafe Club</span>
                        </div>
                    </div>

                    {/* Menu Tabs dọc */}
                    <div className="overflow-hidden rounded-3xl border border-stone-200/90 bg-white p-2.5 shadow-xs">
                        <nav className="space-y-1">
                            <button
                                type="button"
                                onClick={() => handleSwitchTab(TAB_PROFILE)}
                                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === TAB_PROFILE
                                        ? 'bg-amber-800 text-white shadow-sm'
                                        : 'text-stone-600 hover:bg-amber-50/60 hover:text-amber-900'
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
                                        ? 'bg-amber-800 text-white shadow-sm'
                                        : 'text-stone-600 hover:bg-amber-50/60 hover:text-amber-900'
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
                                        ? 'bg-amber-800 text-white shadow-sm'
                                        : 'text-stone-600 hover:bg-amber-50/60 hover:text-amber-900'
                                }`}
                            >
                                <span className="text-base">🔒</span>
                                <span>Đổi mật khẩu</span>
                            </button>
                        </nav>
                    </div>
                </div>

                {/* ══ CỘT PHẢI: Nội dung Tab chi tiết (8 cols) ══ */}
                <div className="lg:col-span-8">
                    {/* ── TAB 1: CẬP NHẬT HỒ SƠ CÁ NHÂN ── */}
                    {activeTab === TAB_PROFILE && (
                        <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-xs animate-in fade-in duration-200">
                            <div className="mb-6 border-b border-stone-100 pb-4">
                                <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                                    <span>👤</span>
                                    <span>Thông tin cá nhân & Ảnh đại diện</span>
                                </h3>
                                <p className="mt-0.5 text-xs text-stone-500">
                                    Cập nhật họ tên, số điện thoại và tải lên hình đại diện của bạn
                                </p>
                            </div>

                            {profileLoading && !profile ? (
                                <div className="space-y-4 py-8 text-center text-xs text-stone-400">
                                    <span>⏳ Đang tải thông tin hồ sơ...</span>
                                </div>
                            ) : (
                                <form onSubmit={handleUpdateProfile} className="space-y-5">
                                    {/* Khu vực chọn ảnh đại diện */}
                                    <div className="flex flex-col sm:flex-row items-center gap-5 rounded-2xl border border-amber-200/60 bg-amber-50/30 p-4">
                                        <div className="relative h-20 w-20 shrink-0">
                                            {currentAvatarUrl ? (
                                                <img
                                                    src={currentAvatarUrl}
                                                    alt="Avatar Preview"
                                                    className="h-full w-full rounded-full object-cover border-2 border-white shadow-md"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center rounded-full bg-amber-800 text-2xl font-bold text-white shadow-md">
                                                    {(fullName || 'U').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 text-center sm:text-left">
                                            <label className="block text-xs font-bold text-stone-800">
                                                Ảnh đại diện
                                            </label>
                                            <p className="mt-0.5 text-[11px] text-stone-500">
                                                Hỗ trợ định dạng JPG, JPEG, PNG. Dung lượng tối đa 5MB.
                                            </p>

                                            <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="rounded-xl bg-white border border-stone-200 px-3.5 py-1.5 text-xs font-bold text-stone-700 shadow-2xs hover:bg-stone-50 transition-colors cursor-pointer"
                                                >
                                                    📁 Chọn ảnh mới
                                                </button>

                                                {avatarFile && (
                                                    <button
                                                        type="button"
                                                        onClick={handleCancelAvatar}
                                                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                                                    >
                                                        ✕ Hủy chọn
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Họ và tên */}
                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-stone-700">
                                            Họ và tên <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Ví dụ: Nguyễn Văn A"
                                            className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-xs text-stone-800 outline-none transition-all focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-200"
                                            required
                                        />
                                    </div>

                                    {/* Số điện thoại */}
                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-stone-700">
                                            Số điện thoại
                                        </label>
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="Ví dụ: 0987654321"
                                            className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-xs text-stone-800 outline-none transition-all focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-200"
                                        />
                                    </div>

                                    {/* Nút Submit */}
                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={updating}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-800 px-6 py-3 text-xs font-bold text-white shadow-md shadow-amber-900/20 hover:bg-amber-900 disabled:opacity-60 transition-all cursor-pointer"
                                        >
                                            <span>{updating ? '⏳' : '💾'}</span>
                                            <span>{updating ? 'Đang lưu cập nhật...' : 'Lưu thay đổi hồ sơ'}</span>
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* ── TAB 2: SỔ ĐỊA CHỈ GIAO HÀNG (Nhúng AddressManager) ── */}
                    {activeTab === TAB_ADDRESS && (
                        <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-xs animate-in fade-in duration-200">
                            <div className="mb-6 border-b border-stone-100 pb-4">
                                <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                                    <span>📍</span>
                                    <span>Quản lý sổ địa chỉ nhận hàng</span>
                                </h3>
                                <p className="mt-0.5 text-xs text-stone-500">
                                    Danh sách địa chỉ của bạn được đồng bộ trực tiếp khi đặt hàng và tính khoảng cách Mapbox
                                </p>
                            </div>

                            <AddressManager hideTitle />
                        </div>
                    )}

                    {/* ── TAB 3: ĐỔI MẬT KHẨU BẢO MẬT ── */}
                    {activeTab === TAB_PASSWORD && (
                        <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-xs animate-in fade-in duration-200">
                            <div className="mb-6 border-b border-stone-100 pb-4">
                                <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                                    <span>🔒</span>
                                    <span>Đổi mật khẩu tài khoản</span>
                                </h3>
                                <p className="mt-0.5 text-xs text-stone-500">
                                    Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác
                                </p>
                            </div>

                            {/* Cảnh báo lỗi */}
                            {passwordErrorAlert && (
                                <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700">
                                    <span>⚠️</span>
                                    <span>{passwordErrorAlert}</span>
                                </div>
                            )}

                            {/* Thông báo thành công */}
                            {passwordSuccessAlert && (
                                <div className="mb-4 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-3.5 text-xs font-medium text-green-800">
                                    <span>✅</span>
                                    <span>{passwordSuccessAlert}</span>
                                </div>
                            )}

                            <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                                {/* Mật khẩu hiện tại */}
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-stone-700">
                                        Mật khẩu hiện tại <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Nhập mật khẩu đang sử dụng..."
                                            className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 pr-12 text-xs text-stone-800 outline-none transition-all focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-200"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Mật khẩu mới */}
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-stone-700">
                                        Mật khẩu mới <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Tối thiểu 6 ký tự..."
                                            className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 pr-12 text-xs text-stone-800 outline-none transition-all focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-200"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Xác nhận mật khẩu mới */}
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-stone-700">
                                        Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmNewPassword}
                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                            placeholder="Nhập lại mật khẩu mới..."
                                            className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 pr-12 text-xs text-stone-800 outline-none transition-all focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-200"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Toggle hiện mật khẩu */}
                                <div className="pt-0.5">
                                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={showPassword}
                                            onChange={(e) => setShowPassword(e.target.checked)}
                                            className="h-3.5 w-3.5 rounded-md accent-amber-800"
                                        />
                                        <span>Hiện các mật khẩu</span>
                                    </label>
                                </div>

                                {/* Nút Submit */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={changingPassword}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-800 px-6 py-3 text-xs font-bold text-white shadow-md shadow-amber-900/20 hover:bg-amber-900 disabled:opacity-60 transition-all cursor-pointer"
                                    >
                                        <span>{changingPassword ? '⏳' : '🔒'}</span>
                                        <span>{changingPassword ? 'Đang đổi mật khẩu...' : 'Cập nhật mật khẩu'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
