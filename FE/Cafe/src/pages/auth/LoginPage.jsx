import LoginForm from '../../components/auth/LoginForm'
import LoadingLink from '../../components/loading/LoadingLink'

export default function LoginPage() {
    return (
        <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm">
            <h1 className="mb-1 text-2xl font-semibold">Đăng nhập</h1>
            <p className="mb-6 text-sm text-stone-500">Dùng tài khoản khách hàng hoặc quản trị.</p>
            <LoginForm />
            <p className="mt-4 text-center text-sm text-stone-600">
                Chưa có tài khoản?{' '}
                <LoadingLink to="/register" className="font-medium text-amber-800">
                    Đăng ký
                </LoadingLink>
            </p>
        </div>
    )
}
