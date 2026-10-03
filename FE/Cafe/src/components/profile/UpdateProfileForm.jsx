import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { message } from 'antd'
import { getProfile, updateProfile } from '../../redux/actions/user/userAction'

export default function UpdateProfileForm({ currentAvatarUrl, onAvatarChange }) {
    const dispatch = useDispatch()
    const { user } = useSelector((s) => s.app.auth)
    const { profile, updating } = useSelector((s) => s.user.profile)

    const [fullName, setFullName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [avatarFile, setAvatarFile] = useState(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        if (profile) {
            setFullName(profile.fullName || '')
            setPhoneNumber(profile.phoneNumber || '')
        } else if (user) {
            setFullName(user.fullName || '')
            setPhoneNumber(user.phone || '')
        }
    }, [profile, user])

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
        if (onAvatarChange) onAvatarChange(previewUrl)
    }

    const handleCancelAvatar = () => {
        setAvatarFile(null)
        if (onAvatarChange) onAvatarChange(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

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
        }
    }

    return (
        <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div className="flex flex-col sm:flex-row items-center gap-5 rounded-2xl border border-sky-200/60 bg-sky-50/30 p-4">
                <div className="relative h-20 w-20 shrink-0">
                    {currentAvatarUrl ? (
                        <img
                            src={currentAvatarUrl}
                            alt="Avatar Preview"
                            className="h-full w-full rounded-full object-cover border-2 border-white shadow-md"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-sky-800 text-2xl font-bold text-white shadow-md">
                            {(fullName || 'U').charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center sm:text-left">
                    <label className="block text-xs font-bold text-slate-800">Ảnh đại diện</label>
                    <p className="mt-0.5 text-[11px] text-slate-500">Hỗ trợ định dạng JPG, JPEG, PNG. Dung lượng tối đa 5MB.</p>

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
                            className="rounded-3xl bg-white border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            📁 Chọn ảnh mới
                        </button>

                        {avatarFile && (
                            <button
                                type="button"
                                onClick={handleCancelAvatar}
                                className="rounded-3xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                            >
                                ✕ Hủy chọn
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Họ và tên <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-800 outline-none transition-all focus:border-sky-600 focus:bg-white focus:ring-1 focus:ring-sky-200"
                    required
                />
            </div>

            <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Số điện thoại</label>
                <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Ví dụ: 0987654321"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-800 outline-none transition-all focus:border-sky-600 focus:bg-white focus:ring-1 focus:ring-sky-200"
                />
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={updating}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-800 px-6 py-3 text-xs font-bold text-white shadow-md shadow-sky-900/20 hover:bg-sky-900 disabled:opacity-60 transition-all cursor-pointer"
                >
                    <span>{updating ? '⏳' : '💾'}</span>
                    <span>{updating ? 'Đang lưu cập nhật...' : 'Lưu thay đổi hồ sơ'}</span>
                </button>
            </div>
        </form>
    )
}