import RegisterForm from '../../components/auth/RegisterForm'
import LoadingLink from '../../components/loading/LoadingLink'

export default function RegisterPage() {
    return (
        <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm">
            <h1 className="mb-1 text-2xl font-semibold">Đăng ký</h1>
            <p className="mb-6 text-sm text-stone-500">Tạo tài khoản để đặt món và lưu địa chỉ giao hàng.</p>
            <RegisterForm />
            <p className="mt-4 text-center text-sm text-stone-600">
                Đã có tài khoản?{' '}
                <LoadingLink to="/login" className="font-medium text-amber-800">
                    Đăng nhập
                </LoadingLink>
            </p>
        </div>
    )
}
