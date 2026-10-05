import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { message } from 'antd'
import { changePassword } from '../../redux/actions/user/userAction'
import { resetPasswordStatus } from '../../redux/slices/user/userSlice'
import { AppToast, AppConfirm } from '../common/AppNotification'


export default function ChangePasswordForm() {
    const dispatch = useDispatch()
    const { changingPassword } = useSelector((s) => s.user.profile)

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
            AppToast.success(successMsg)
            setCurrentPassword('')
            setNewPassword('')
            setConfirmNewPassword('')
            dispatch(resetPasswordStatus())
        } else {
            const errMsg = res.payload || 'Đổi mật khẩu thất bại!'
            setPasswordErrorAlert(errMsg)
            AppToast.error(errMsg)
        }
    }

    return (
        <>
            {passwordErrorAlert && (
                <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700">
                    <span>⚠️</span><span>{passwordErrorAlert}</span>
                </div>
            )}

            {passwordSuccessAlert && (
                <div className="mb-4 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-3.5 text-xs font-medium text-green-800">
                    <span>✅</span><span>{passwordSuccessAlert}</span>
                </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">Mật khẩu hiện tại <span className="text-red-500">*</span></label>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Nhập mật khẩu đang sử dụng..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 pr-12 text-xs text-slate-800 outline-none transition-all focus:border-sky-600 focus:bg-white focus:ring-1 focus:ring-sky-200"
                        required
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">Mật khẩu mới <span className="text-red-500">*</span></label>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Tối thiểu 6 ký tự..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 pr-12 text-xs text-slate-800 outline-none transition-all focus:border-sky-600 focus:bg-white focus:ring-1 focus:ring-sky-200"
                        required
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">Xác nhận mật khẩu mới <span className="text-red-500">*</span></label>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 pr-12 text-xs text-slate-800 outline-none transition-all focus:border-sky-600 focus:bg-white focus:ring-1 focus:ring-sky-200"
                        required
                    />
                </div>

                <div className="pt-0.5">
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={(e) => setShowPassword(e.target.checked)}
                            className="h-3.5 w-3.5 rounded-md accent-sky-800"
                        />
                        <span>Hiện các mật khẩu</span>
                    </label>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={changingPassword}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-800 px-6 py-3 text-xs font-bold text-white shadow-md shadow-sky-900/20 hover:bg-sky-900 disabled:opacity-60 transition-all cursor-pointer"
                    >
                        <span>{changingPassword ? '⏳' : '🔒'}</span>
                        <span>{changingPassword ? 'Đang đổi mật khẩu...' : 'Cập nhật mật khẩu'}</span>
                    </button>
                </div>
            </form>
        </>
    )
}