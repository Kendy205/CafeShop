import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { register } from '../../redux/actions/authAction'
import { clearAuthError } from '../../redux/slices/authSlice'
import { useEffect, useState } from 'react'

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

export default function RegisterForm() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { error, submitting, isAuthenticated } = useSelector((s) => s.auth)
    const [success, setSuccess] = useState('')

    useEffect(() => {
        dispatch(clearAuthError())
    }, [dispatch])

    useEffect(() => {
        if (isAuthenticated) navigate('/', { replace: true })
    }, [isAuthenticated, navigate])

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
                    username: values.username,
                    fullName: values.fullName,
                    email: values.email,
                    phone: values.phone,
                    password: values.password,
                }
                const result = await dispatch(register(payload))
                if (register.fulfilled.match(result)) {
                    if (result.payload?.accessToken) return
                    setSuccess(result.payload?.message || 'Đăng ký thành công, vui lòng đăng nhập')
                    resetForm()
                    setTimeout(() => navigate('/login'), 1200)
                }
            }}
        >
            <Form className="space-y-3">
                {error && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                )}
                {success && (
                    <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>
                )}
                {[
                    ['username', 'Tên đăng nhập'],
                    ['fullName', 'Họ và tên'],
                    ['email', 'Email', 'email'],
                    ['phone', 'Số điện thoại'],
                    ['password', 'Mật khẩu', 'password'],
                    ['confirmPassword', 'Xác nhận mật khẩu', 'password'],
                ].map(([name, label, type]) => (
                    <div key={name}>
                        <label className="mb-1 block text-sm font-medium">{label}</label>
                        <Field
                            name={name}
                            type={type || 'text'}
                            className="w-full rounded-xl border border-stone-200 px-3 py-2 outline-none focus:border-amber-700"
                        />
                        <ErrorMessage name={name} component="p" className="mt-1 text-xs text-red-600" />
                    </div>
                ))}
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-amber-800 py-2.5 font-medium text-white hover:bg-amber-900 disabled:opacity-60"
                >
                    {submitting ? 'Đang đăng ký...' : 'Tạo tài khoản'}
                </button>
            </Form>
        </Formik>
    )
}
