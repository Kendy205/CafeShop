import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { login } from '../../redux/actions/authAction'
import { clearAuthError } from '../../redux/slices/authSlice'
import { isAdminRole } from '../../utils/auth/authRole'
import { useEffect } from 'react'

const schema = Yup.object({
    username: Yup.string().required('Vui lòng nhập tên đăng nhập'),
    password: Yup.string().required('Vui lòng nhập mật khẩu'),
})

export default function LoginForm() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const { error, submitting, isAuthenticated, role } = useSelector((s) => s.auth)

    useEffect(() => {
        dispatch(clearAuthError())
    }, [dispatch])

    useEffect(() => {
        if (!isAuthenticated) return
        const from = location.state?.from
        if (from) navigate(from, { replace: true })
        else navigate(isAdminRole(role) ? '/admin' : '/', { replace: true })
    }, [isAuthenticated, role, navigate, location.state])

    return (
        <Formik
            initialValues={{ username: '', password: '' }}
            validationSchema={schema}
            onSubmit={async (values) => {
                await dispatch(login(values))
            }}
        >
            <Form className="space-y-4">
                {error && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                )}
                <div>
                    <label className="mb-1 block text-sm font-medium">Tên đăng nhập</label>
                    <Field
                        name="username"
                        className="w-full rounded-xl border border-stone-200 px-3 py-2 outline-none focus:border-amber-700"
                        placeholder="tung123"
                    />
                    <ErrorMessage name="username" component="p" className="mt-1 text-xs text-red-600" />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Mật khẩu</label>
                    <Field
                        name="password"
                        type="password"
                        className="w-full rounded-xl border border-stone-200 px-3 py-2 outline-none focus:border-amber-700"
                    />
                    <ErrorMessage name="password" component="p" className="mt-1 text-xs text-red-600" />
                </div>
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-amber-800 py-2.5 font-medium text-white hover:bg-amber-900 disabled:opacity-60"
                >
                    {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
            </Form>
        </Formik>
    )
}
