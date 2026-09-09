import LoadingLink from '../../components/loading/LoadingLink'
import { PageHeader } from './adminShared'

export default function DashboardAdminPage() {
    return (
        <div>
            <PageHeader title="Tổng quan" />
            <div className="grid gap-4 sm:grid-cols-2">
                <LoadingLink
                    to="/admin/vouchers"
                    className="rounded-2xl bg-white p-5 shadow-sm hover:shadow"
                >
                    <p className="text-sm text-stone-500">Quản lý</p>
                    <p className="mt-1 text-lg font-semibold">Mã giảm giá</p>
                    <p className="mt-2 text-sm text-stone-500">Tạo, sửa, bật/tắt voucher</p>
                </LoadingLink>
            </div>
            <p className="mt-6 text-sm text-stone-500">
                Đặc tả API hiện có CRUD voucher cho admin. Các module sản phẩm/đơn admin sẽ thêm khi backend
                bổ sung endpoint.
            </p>
        </div>
    )
}
