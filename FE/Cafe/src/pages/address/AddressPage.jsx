import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { message, Modal } from 'antd'
import {
    createAddress,
    deleteAddress,
    getAddresses,
    setDefaultAddress,
    updateAddress,
} from '../../redux/actions/user/addressAction'
import MapboxAddressPicker from '../../components/map/MapboxAddressPicker'
import LoadingLink from '../../components/loading/LoadingLink'

// ── Tab kiểu nhập địa chỉ ─────────────────────────────────────────────────────
const INPUT_TAB_MAP = 'map'
const INPUT_TAB_MANUAL = 'manual'

export default function AddressPage() {
    const dispatch = useDispatch()
    const { items: addresses, loading, submitting } = useSelector((s) => s.address)

    // Trạng thái đang sửa địa chỉ
    const [editingId, setEditingId] = useState(null)

    // Form fields
    const [recipientName, setRecipientName] = useState('')
    const [phone, setPhone] = useState('')
    const [fullAddress, setFullAddress] = useState('')
    const [isDefault, setIsDefault] = useState(false)

    // Tab phương thức nhập địa chỉ: 'map' (bản đồ) hoặc 'manual' (nhập tay)
    const [inputTab, setInputTab] = useState(INPUT_TAB_MAP)

    // Dữ liệu vị trí từ Mapbox (khoảng cách, phí ship ước tính, v.v.)
    const [mapInfo, setMapInfo] = useState(null)

    // Tải danh sách địa chỉ khi mở trang
    useEffect(() => {
        dispatch(getAddresses())
    }, [dispatch])

    // Đặt form về trạng thái thêm mới
    const resetForm = () => {
        setEditingId(null)
        setRecipientName('')
        setPhone('')
        setFullAddress('')
        setIsDefault(false)
        setMapInfo(null)
        setInputTab(INPUT_TAB_MAP)
    }

    // Khi bấm "Sửa" một địa chỉ
    const handleStartEdit = (addr) => {
        setEditingId(addr.addressId)
        setRecipientName(addr.recipientName || '')
        setPhone(addr.phone || '')
        setFullAddress(addr.fullAddress || '')
        setIsDefault(Boolean(addr.isDefault))
        setMapInfo(null)
        // Mặc định cho người dùng xem dạng nhập tay để thấy ngay địa chỉ cũ, hoặc chuyển map tùy thích
        setInputTab(INPUT_TAB_MANUAL)

        // Cuộn mượt đến form
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Xử lý khi chọn xong địa chỉ từ Mapbox
    const handleMapAddressSelected = (info) => {
        setMapInfo(info)
        if (info?.address) {
            setFullAddress(info.address)
        }
    }

    // Submit form (Tạo mới hoặc Cập nhật)
    const handleSubmit = async (e) => {
        e.preventDefault()

        const trimmedName = recipientName.trim()
        const trimmedPhone = phone.trim()
        const trimmedAddress = fullAddress.trim()

        // Validation
        if (!trimmedName) {
            message.warning('Vui lòng nhập tên người nhận!')
            return
        }

        const phoneRegex = /^(0|\+84)\d{9,10}$/
        if (!phoneRegex.test(trimmedPhone)) {
            message.warning('Số điện thoại không hợp lệ (VD: 0912345678)!')
            return
        }

        if (!trimmedAddress) {
            message.warning('Vui lòng nhập hoặc chọn địa chỉ trên bản đồ!')
            return
        }

        const payload = {
            recipientName: trimmedName,
            phone: trimmedPhone,
            fullAddress: trimmedAddress,
            isDefault: Boolean(isDefault),
        }

        if (editingId) {
            // Cập nhật địa chỉ
            const res = await dispatch(updateAddress({ id: editingId, body: payload }))
            if (updateAddress.fulfilled.match(res)) {
                message.success('Cập nhật địa chỉ thành công!')
                resetForm()
                dispatch(getAddresses())
            } else {
                message.error(res.payload || 'Cập nhật địa chỉ thất bại!')
            }
        } else {
            // Tạo mới địa chỉ
            const res = await dispatch(createAddress(payload))
            if (createAddress.fulfilled.match(res)) {
                message.success('Đã thêm địa chỉ mới thành công!')
                resetForm()
                dispatch(getAddresses())
            } else {
                message.error(res.payload || 'Thêm địa chỉ thất bại!')
            }
        }
    }

    // Đặt làm địa chỉ mặc định
    const handleSetDefault = async (addressId) => {
        const res = await dispatch(setDefaultAddress(addressId))
        if (setDefaultAddress.fulfilled.match(res)) {
            message.success('Đã đặt làm địa chỉ mặc định!')
            dispatch(getAddresses())
        } else {
            message.error(res.payload || 'Không thể đặt mặc định!')
        }
    }

    // Xóa địa chỉ với Modal xác nhận Ant Design
    const handleDelete = (addr) => {
        Modal.confirm({
            title: 'Xóa địa chỉ này?',
            content: `Bạn có chắc chắn muốn xóa địa chỉ của "${addr.recipientName}" (${addr.fullAddress}) không?`,
            okText: 'Xóa vĩnh viễn',
            cancelText: 'Giữ lại',
            okType: 'danger',
            centered: true,
            onOk: async () => {
                const res = await dispatch(deleteAddress(addr.addressId))
                if (deleteAddress.fulfilled.match(res)) {
                    message.success('Đã xóa địa chỉ thành công!')
                    if (editingId === addr.addressId) resetForm()
                    dispatch(getAddresses())
                } else {
                    message.error(res.payload || 'Xóa địa chỉ thất bại!')
                }
            },
        })
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            {/* ── Tiêu đề trang ── */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-5">
                <div>
                    <h1 className="text-2xl font-black text-stone-800 sm:text-3xl flex items-center gap-2.5">
                        <span>📍</span>
                        <span>Sổ địa chỉ giao hàng</span>
                    </h1>
                    <p className="mt-1 text-xs text-stone-500">
                        Quản lý địa chỉ nhận hàng dễ dàng — vừa có thể nhập tay vừa định vị trực quan trên bản đồ Mapbox
                    </p>
                </div>

                <LoadingLink
                    to="/checkout"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-800 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-900 transition-colors"
                >
                    <span>🛒 Vào thanh toán</span>
                </LoadingLink>
            </div>

            {/* ── Layout 2 Cột: Cột Trái Danh sách - Cột Phải Form Mapbox ── */}
            <div className="grid gap-8 lg:grid-cols-12 items-start">
                {/* ══ CỘT TRÁI: Danh sách địa chỉ đã lưu (5 cols) ══ */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-stone-800 flex items-center gap-2">
                            <span>📋</span>
                            <span>Địa chỉ của bạn ({addresses.length})</span>
                        </h2>
                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="text-xs font-semibold text-amber-800 hover:underline"
                            >
                                + Thêm địa chỉ mới
                            </button>
                        )}
                    </div>

                    {/* Trạng thái tải */}
                    {loading && addresses.length === 0 && (
                        <div className="space-y-3">
                            {[1, 2].map((i) => (
                                <div key={i} className="h-28 animate-pulse rounded-3xl bg-stone-100 border border-stone-200" />
                            ))}
                        </div>
                    )}

                    {/* Danh sách rỗng */}
                    {!loading && addresses.length === 0 && (
                        <div className="rounded-3xl border border-dashed border-stone-200 bg-white p-8 text-center">
                            <span className="text-4xl block mb-2">📍</span>
                            <p className="text-xs text-stone-500 font-medium">Bạn chưa lưu địa chỉ giao hàng nào.</p>
                            <p className="text-[11px] text-stone-400 mt-1">
                                Hãy dùng biểu mẫu bên cạnh để tạo địa chỉ đầu tiên của bạn!
                            </p>
                        </div>
                    )}

                    {/* Danh sách các thẻ địa chỉ */}
                    <div className="space-y-3">
                        {addresses.map((addr) => {
                            const isSelected = editingId === addr.addressId

                            return (
                                <div
                                    key={addr.addressId}
                                    className={`relative overflow-hidden rounded-3xl border-2 p-4 transition-all ${
                                        isSelected
                                            ? 'border-amber-700 bg-amber-50/70 shadow-sm'
                                            : 'border-stone-200/90 bg-white shadow-xs hover:border-amber-300'
                                    }`}
                                >
                                    {/* Header thẻ: Tên + SĐT + Badge mặc định */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-stone-800">
                                                {addr.recipientName}
                                            </span>
                                            <span className="text-stone-300">•</span>
                                            <span className="font-mono text-xs text-stone-600 font-semibold">
                                                {addr.phone}
                                            </span>
                                        </div>

                                        {addr.isDefault && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-900 border border-amber-300/80">
                                                <span>⭐</span>
                                                <span>Mặc định</span>
                                            </span>
                                        )}
                                    </div>

                                    {/* Địa chỉ chi tiết */}
                                    <p className="text-xs text-stone-600 leading-relaxed pr-2">
                                        {addr.fullAddress}
                                    </p>

                                    {/* Các nút thao tác */}
                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-2.5 text-xs">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleStartEdit(addr)}
                                                className="inline-flex items-center gap-1 font-bold text-amber-800 hover:text-amber-950 transition-colors"
                                            >
                                                <span>✏️</span>
                                                <span>Sửa</span>
                                            </button>

                                            <span className="text-stone-200">|</span>

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(addr)}
                                                className="inline-flex items-center gap-1 font-bold text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                <span>🗑️</span>
                                                <span>Xóa</span>
                                            </button>
                                        </div>

                                        {!addr.isDefault && (
                                            <button
                                                type="button"
                                                onClick={() => handleSetDefault(addr.addressId)}
                                                className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-bold text-stone-600 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 transition-colors shadow-2xs"
                                            >
                                                Đặt mặc định
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* ══ CỘT PHẢI: Form Thêm / Sửa Địa Chỉ Với Tư Duy Mapbox (7 cols) ══ */}
                <div className="lg:col-span-7">
                    <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm p-6">
                        <div className="mb-5 flex items-center justify-between border-b border-stone-100 pb-4">
                            <div>
                                <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                                    <span>{editingId ? '✏️' : '➕'}</span>
                                    <span>{editingId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ nhận hàng'}</span>
                                </h2>
                                <p className="text-xs text-stone-500 mt-0.5">
                                    {editingId
                                        ? 'Chỉnh sửa thông tin người nhận hoặc chọn lại vị trí trên bản đồ'
                                        : 'Nhập thông tin người nhận và lựa chọn phương thức định vị phù hợp'}
                                </p>
                            </div>

                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
                                >
                                    ✕ Hủy sửa
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Thông tin người nhận: Tên & SĐT */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-stone-700">
                                        Tên người nhận <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={recipientName}
                                        onChange={(e) => setRecipientName(e.target.value)}
                                        placeholder="Ví dụ: Nguyễn Văn A"
                                        className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:border-amber-600 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-bold text-stone-700">
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Ví dụ: 0987654321"
                                        className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:border-amber-600 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* ── Tab Switcher: Chọn Mapbox hoặc Nhập Tay ── */}
                            <div>
                                <label className="mb-2 block text-xs font-bold text-stone-700">
                                    Phương thức chọn địa chỉ <span className="text-red-500">*</span>
                                </label>

                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => setInputTab(INPUT_TAB_MAP)}
                                        className={`flex items-center justify-center gap-2 rounded-2xl py-2.5 text-xs font-bold transition-all ${
                                            inputTab === INPUT_TAB_MAP
                                                ? 'bg-amber-800 text-white shadow-xs'
                                                : 'border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                                        }`}
                                    >
                                        <span>🗺️</span>
                                        <span>Chọn trên bản đồ (Mapbox)</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setInputTab(INPUT_TAB_MANUAL)}
                                        className={`flex items-center justify-center gap-2 rounded-2xl py-2.5 text-xs font-bold transition-all ${
                                            inputTab === INPUT_TAB_MANUAL
                                                ? 'bg-amber-800 text-white shadow-xs'
                                                : 'border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                                        }`}
                                    >
                                        <span>✍️</span>
                                        <span>Nhập tay thủ công</span>
                                    </button>
                                </div>

                                {/* ── Nội dung Tab 1: Bản đồ Mapbox ── */}
                                {inputTab === INPUT_TAB_MAP && (
                                    <div className="space-y-3 rounded-2xl border border-amber-200/70 bg-amber-50/30 p-3.5">
                                        <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                                            💡 Bạn có thể tìm địa chỉ, nhấn nút <strong>Vị trí của tôi</strong> hoặc click trực tiếp lên bản đồ để lấy tọa độ và tự động tính khoảng cách!
                                        </p>

                                        {/* Component MapboxAddressPicker */}
                                        <MapboxAddressPicker onAddressSelected={handleMapAddressSelected} />

                                        {/* Hiển thị địa chỉ đã chọn từ bản đồ & cho phép tinh chỉnh */}
                                        {fullAddress && (
                                            <div className="rounded-xl border border-stone-200 bg-white p-3 shadow-2xs">
                                                <label className="mb-1 block text-[11px] font-bold text-stone-600">
                                                    Địa chỉ lấy từ bản đồ (có thể bổ sung số nhà/tầng/phòng nếu cần):
                                                </label>
                                                <textarea
                                                    value={fullAddress}
                                                    onChange={(e) => setFullAddress(e.target.value)}
                                                    rows={2}
                                                    className="w-full rounded-xl border border-stone-200 p-2 text-xs text-stone-800 focus:border-amber-600 focus:outline-hidden"
                                                    placeholder="Địa chỉ..."
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── Nội dung Tab 2: Nhập tay thủ công ── */}
                                {inputTab === INPUT_TAB_MANUAL && (
                                    <div className="space-y-2 rounded-2xl border border-stone-200 bg-stone-50/50 p-4">
                                        <label className="block text-xs font-bold text-stone-700">
                                            Địa chỉ chi tiết đầy đủ <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={fullAddress}
                                            onChange={(e) => setFullAddress(e.target.value)}
                                            rows={3}
                                            placeholder="Ví dụ: Số 123 đường Cầu Giấy, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội..."
                                            className="w-full rounded-2xl border border-stone-200 bg-white p-3 text-xs text-stone-800 placeholder-stone-400 focus:border-amber-600 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                                            required
                                        />
                                        <p className="text-[11px] text-stone-400">
                                            Gợi ý: Nếu bạn muốn biết chính xác khoảng cách và phí vận chuyển, hãy chuyển sang tab <strong>Bản đồ Mapbox</strong>.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Checkbox Đặt làm mặc định */}
                            <label className="flex items-center gap-2.5 text-xs font-bold text-stone-700 cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={isDefault}
                                    onChange={(e) => setIsDefault(e.target.checked)}
                                    className="h-4 w-4 rounded-md accent-amber-800 cursor-pointer"
                                />
                                <span>Đặt làm địa chỉ giao hàng mặc định</span>
                            </label>

                            {/* Nút hành động Submit */}
                            <div className="flex items-center gap-3 pt-3">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-800 py-3 text-xs font-bold text-white shadow-sm hover:bg-amber-900 disabled:opacity-50 transition-all cursor-pointer"
                                >
                                    <span>{submitting ? '⏳' : editingId ? '💾' : '➕'}</span>
                                    <span>{submitting ? 'Đang lưu...' : editingId ? 'Lưu cập nhật' : 'Thêm địa chỉ'}</span>
                                </button>

                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="rounded-2xl border border-stone-200 bg-white px-5 py-3 text-xs font-bold text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
                                    >
                                        Hủy
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
