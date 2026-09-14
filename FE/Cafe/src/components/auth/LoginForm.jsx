import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { login } from '../../redux/actions/authAction'
import { clearAuthError } from '../../redux/slices/authSlice'
import { isAdminRole } from '../../utils/auth/authRole'
import { useEffect, useState } from 'react'
import LoadingLink from '../loading/LoadingLink'

const schema = Yup.object({
    username: Yup.string().required('Vui lòng nhập tên đăng nhập'),
    password: Yup.string().required('Vui lòng nhập mật khẩu'),
})

export default function LoginForm({ onSwitchRegister, onSuccess, isModal = false }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const { error, submitting, isAuthenticated, role } = useSelector((s) => s.auth)
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        dispatch(clearAuthError())
    }, [dispatch])

    useEffect(() => {
        if (!isAuthenticated) return
        if (onSuccess) {
            onSuccess()
        }
        if (!isModal) {
            const from = location.state?.from
            if (from) navigate(from, { replace: true })
            else navigate(isAdminRole(role) ? '/admin' : '/', { replace: true })
        }
    }, [isAuthenticated, role, navigate, location.state, isModal, onSuccess])

    return (
        <Formik
            initialValues={{ username: '', password: '' }}
            validationSchema={schema}
            onSubmit={async (values) => {
                const res = await dispatch(login(values))
                if (login.fulfilled.match(res) && onSuccess) {
                    onSuccess()
                }
            }}
        >
            <Form className="space-y-4">
                {error && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 animate-in fade-in duration-200">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <div>
                    <label className="mb-1 block text-xs font-semibold text-stone-700">Tên đăng nhập</label>
                    <div className="relative">
                        <Field
                            name="username"
                            className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-3.5 py-2.5 pl-10 text-sm outline-none transition-all focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-200"
                            placeholder="Nhập tên tài khoản..."
                        />
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none">
                            👤
                        </span>
                    </div>
                    <ErrorMessage name="username" component="p" className="mt-1 text-xs text-red-600" />
                </div>

                <div>
                    <div className="mb-1 flex items-center justify-between">
                        <label className="text-xs font-semibold text-stone-700">Mật khẩu</label>
                    </div>
                    <div className="relative">
                        <Field
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-3.5 py-2.5 pl-10 pr-10 text-sm outline-none transition-all focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-200"
                            placeholder="Nhập mật khẩu..."
                        />
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none">
                            🔒
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-medium cursor-pointer"
                            tabIndex={-1}
                        >
                            {showPassword ? 'Ẩn' : 'Hiện'}
                        </button>
                    </div>
                    <ErrorMessage name="password" component="p" className="mt-1 text-xs text-red-600" />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-amber-800 py-3 text-sm font-bold text-white shadow-md shadow-amber-900/20 transition-all hover:bg-amber-900 active:scale-[0.99] disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                >
                    {submitting ? '⏳ Đang đăng nhập...' : 'Đăng nhập ngay'}
                </button>

                <div className="pt-1 text-center text-xs text-stone-600">
                    Chưa có tài khoản?{' '}
                    {onSwitchRegister ? (
                        <button
                            type="button"
                            onClick={onSwitchRegister}
                            className="font-bold text-amber-800 hover:text-amber-900 hover:underline cursor-pointer"
                        >
                            Đăng ký tài khoản mới
                        </button>
                    ) : (
                        <LoadingLink to="/register" className="font-bold text-amber-800 hover:underline">
                            Đăng ký tài khoản mới
                        </LoadingLink>
                    )}
                </div>
            </Form>
        </Formik>
    )
}
