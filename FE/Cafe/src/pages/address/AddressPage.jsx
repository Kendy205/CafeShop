import AddressManager from '../../components/address/AddressManager'

/**
 * AddressPage Component
 * Trang quản lý địa chỉ của người dùng.
 * Bao gồm danh sách địa chỉ và form thêm/sửa địa chỉ.
 */
export default function AddressPage() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-6">
            <AddressManager />
        </div>
    )
}
