import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { register } from '../../redux/actions/authAction'
import { clearAuthError } from '../../redux/slices/authSlice'
import { useEffect, useState } from 'react'
import LoadingLink from '../loading/LoadingLink'

const schema = Yup.object({
    username: Yup.string().min(3, 'Tối thiểu 3 ký tự').required('Vui lòng nhập tên đăng nhập'),
    fullName: Yup.string().required('Vui lòng nhập họ tên'),
    email: Yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
    phone: Yup.string()
        .matches(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ')
        .required('Vui lòng nhập số điện thoại'),
    password: Yup.string().min(6, 'Tối thiểu 6 ký tự').required('Vui lòng nhập mật khẩu'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Mật khẩu xác nhận không khớp')
        .required('Vui lòng xác nhận mật khẩu'),
})

export default function RegisterForm({ onSwitchLogin, onSuccess, isModal = false }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { error, submitting, isAuthenticated } = useSelector((s) => s.auth)
    const [success, setSuccess] = useState('')
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
            navigate('/', { replace: true })
        }
    }, [isAuthenticated, navigate, isModal, onSuccess])

    return (
        <Formik
            initialValues={{
                username: '',
                fullName: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: '',
            }}
            validationSchema={schema}
            onSubmit={async (values, { resetForm }) => {
                const payload = {
                    username: values.username.trim(),
                    fullName: values.fullName.trim(),
                    email: values.email.trim(),
                    phone: values.phone.trim(),
                    password: values.password,
                }
                const result = await dispatch(register(payload))
                if (register.fulfilled.match(result)) {
                    if (result.payload?.accessToken) {
                        if (onSuccess) onSuccess()
                        return
                    }
                    setSuccess(result.payload?.message || 'Tạo tài khoản thành công!')
                    resetForm()
                    setTimeout(() => {
                        if (onSwitchLogin) {
                            onSwitchLogin()
                        } else {
                            navigate('/login')
                        }
                    }, 1200)
                }
            }}
        >
            <Form className="space-y-3">
                {error && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-700">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-2.5 text-xs font-medium text-green-700">
                        <span>✅</span>
                        <span>{success} Đang chuyển sang màn hình đăng nhập...</span>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-stone-700">Tên đăng nhập</label>
                        <Field
                            name="username"
                            className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-3 py-2 text-xs outline-none transition-all focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-200"
                            placeholder="vd: tung123"
                        />
                        <ErrorMessage name="username" component="p" className="mt-0.5 text-[11px] text-red-600" />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-stone-700">Họ và tên</label>
                        <Field
                            name="fullName"
                            className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-3 py-2 text-xs outline-none transition-all focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-200"
                            placeholder="Nguyễn Văn A"
                        />
                        <ErrorMessage name="fullName" component="p" className="mt-0.5 text-[11px] text-red-600" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-stone-700">Email</label>
                        <Field
                            name="email"
                            type="email"
                            className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-3 py-2 text-xs outline-none transition-all focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-200"
                            placeholder="email@example.com"
                        />
                        <ErrorMessage name="email" component="p" className="mt-0.5 text-[11px] text-red-600" />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-stone-700">Số điện thoại</label>
                        <Field
                            name="phone"
                            className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-3 py-2 text-xs outline-none transition-all focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-200"
                            placeholder="0987654321"
                        />
                        <ErrorMessage name="phone" component="p" className="mt-0.5 text-[11px] text-red-600" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-stone-700">Mật khẩu</label>
                        <Field
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-3 py-2 text-xs outline-none transition-all focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-200"
                            placeholder="Tối thiểu 6 ký tự"
                        />
                        <ErrorMessage name="password" component="p" className="mt-0.5 text-[11px] text-red-600" />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-stone-700">Xác nhận mật khẩu</label>
                        <Field
                            name="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-3 py-2 text-xs outline-none transition-all focus:border-amber-600 focus:bg-white focus:ring-1 focus:ring-amber-200"
                            placeholder="Nhập lại mật khẩu"
                        />
                        <ErrorMessage name="confirmPassword" component="p" className="mt-0.5 text-[11px] text-red-600" />
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-500">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={(e) => setShowPassword(e.target.checked)}
                            className="h-3.5 w-3.5 rounded-sm accent-amber-800"
                        />
                        <span>Hiện mật khẩu</span>
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-amber-800 py-2.5 text-sm font-bold text-white shadow-md shadow-amber-900/20 transition-all hover:bg-amber-900 active:scale-[0.99] disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                >
                    {submitting ? '⏳ Đang tạo tài khoản...' : 'Tạo tài khoản ngay'}
                </button>

                <div className="pt-1 text-center text-xs text-stone-600">
                    Đã có tài khoản?{' '}
                    {onSwitchLogin ? (
                        <button
                            type="button"
                            onClick={onSwitchLogin}
                            className="font-bold text-amber-800 hover:text-amber-900 hover:underline cursor-pointer"
                        >
                            Đăng nhập
                        </button>
                    ) : (
                        <LoadingLink to="/login" className="font-bold text-amber-800 hover:underline">
                            Đăng nhập
                        </LoadingLink>
                    )}
                </div>
            </Form>
        </Formik>
    )
}
