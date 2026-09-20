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
import MapboxAddressPicker from '../map/MapboxAddressPicker'
import LoadingLink from '../loading/LoadingLink'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

// Tự động tìm tọa độ (Forward Geocoding) nếu người dùng gõ tay hoặc chưa có tọa độ
async function geocodeAddress(query) {
    if (!query || !MAPBOX_TOKEN) return null
    try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=VN&limit=1`
        const res = await fetch(url)
        if (!res.ok) return null
        const data = await res.json()
        if (data.features && data.features.length > 0) {
            const [lng, lat] = data.features[0].center
            return { lat, lng }
        }
    } catch (err) {
        console.warn('Geocoding failed:', err)
    }
    return null
}

// ── Tab kiểu nhập địa chỉ ─────────────────────────────────────────────────────
const INPUT_TAB_MAP = 'map'
const INPUT_TAB_MANUAL = 'manual'

export default function AddressManager({ hideTitle = false }) {
    const dispatch = useDispatch()
    const { items: addresses, loading, submitting } = useSelector((s) => s.address)

    // Trạng thái đang sửa địa chỉ
    const [editingId, setEditingId] = useState(null)

    // Form fields
    const [recipientName, setRecipientName] = useState('')
    const [phone, setPhone] = useState('')
    const [fullAddress, setFullAddress] = useState('')
    const [isDefault, setIsDefault] = useState(false)
    const [latitude, setLatitude] = useState(null)
    const [longitude, setLongitude] = useState(null)

    // Tab phương thức nhập địa chỉ: 'map' (bản đồ) hoặc 'manual' (nhập tay)
    const [inputTab, setInputTab] = useState(INPUT_TAB_MAP)

    // Dữ liệu vị trí từ Mapbox
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
        setLatitude(null)
        setLongitude(null)
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
        setLatitude(addr.latitude != null && addr.latitude !== 0 ? addr.latitude : null)
        setLongitude(addr.longitude != null && addr.longitude !== 0 ? addr.longitude : null)
        setMapInfo(
            addr.latitude && addr.longitude
                ? { address: addr.fullAddress, lat: addr.latitude, lng: addr.longitude }
                : null
        )
        setInputTab(INPUT_TAB_MANUAL)

        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Xử lý khi chọn xong địa chỉ từ Mapbox
    const handleMapAddressSelected = (info) => {
        setMapInfo(info)
        if (info?.address) {
            setFullAddress(info.address)
        }
        if (info?.lat != null && info?.lng != null) {
            setLatitude(info.lat)
            setLongitude(info.lng)
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

        let finalLat = latitude != null && latitude !== 0 ? Number(latitude) : null
        let finalLng = longitude != null && longitude !== 0 ? Number(longitude) : null

        // Nếu chưa có tọa độ (ví dụ người dùng gõ tay), tự động geocode từ Mapbox
        if ((finalLat == null || finalLng == null) && trimmedAddress) {
            const coords = await geocodeAddress(trimmedAddress)
            if (coords) {
                finalLat = coords.lat
                finalLng = coords.lng
                setLatitude(coords.lat)
                setLongitude(coords.lng)
            }
        }

        const payload = {
            recipientName: trimmedName,
            phone: trimmedPhone,
            fullAddress: trimmedAddress,
            isDefault: Boolean(isDefault),
            latitude: finalLat != null ? finalLat : 0,
            longitude: finalLng != null ? finalLng : 0,
        }

        if (editingId) {
            const res = await dispatch(updateAddress({ id: editingId, body: payload }))
            if (updateAddress.fulfilled.match(res)) {
                message.success('Cập nhật địa chỉ thành công!')
                resetForm()
                dispatch(getAddresses())
            } else {
                message.error(res.payload || 'Cập nhật địa chỉ thất bại!')
            }
        } else {
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
        <div>
            {/* ── Tiêu đề (nếu không bị ẩn) ── */}
            {!hideTitle && (
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div>
                        <h1 className="text-xl font-black text-slate-800 sm:text-2xl flex items-center gap-2">
                            <span>📍</span>
                            <span>Sổ địa chỉ nhận hàng</span>
                        </h1>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Quản lý các địa chỉ nhận hàng của bạn để thanh toán nhanh chóng hơn
                        </p>
                    </div>

                    <LoadingLink
                        to="/checkout"
                        className="inline-flex items-center gap-1.5 rounded-3xl bg-sky-800 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-sky-900 transition-colors"
                    >
                        <span>🛒 Vào thanh toán</span>
                    </LoadingLink>
                </div>
            )}

            {/* ── Layout 2 Cột: Danh sách bên trái & Form bên phải ── */}
            <div className="grid gap-6 lg:grid-cols-12 items-start">
                {/* ══ CỘT TRÁI: Danh sách địa chỉ đã lưu ══ */}
                <div className="lg:col-span-5 space-y-3.5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                            <span>📋</span>
                            <span>Địa chỉ đã lưu ({addresses.length})</span>
                        </h3>
                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="text-xs font-semibold text-sky-800 hover:underline cursor-pointer"
                            >
                                + Thêm mới
                            </button>
                        )}
                    </div>

                    {loading && addresses.length === 0 && (
                        <div className="space-y-2.5">
                            {[1, 2].map((i) => (
                                <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100 border border-slate-200" />
                            ))}
                        </div>
                    )}

                    {!loading && addresses.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
                            <span className="text-3xl block mb-1.5">📍</span>
                            <p className="text-xs text-slate-500 font-medium">Bạn chưa lưu địa chỉ nào.</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Hãy điền thông tin vào biểu mẫu bên cạnh để tạo địa chỉ đầu tiên!
                            </p>
                        </div>
                    )}

                    <div className="space-y-2.5">
                        {addresses.map((addr) => {
                            const isSelected = editingId === addr.addressId

                            return (
                                <div
                                    key={addr.addressId}
                                    className={`relative overflow-hidden rounded-2xl border-2 p-3.5 transition-all ${
                                        isSelected
                                            ? 'border-sky-700 bg-sky-50/70 shadow-xs'
                                            : 'border-slate-200/90 bg-white shadow-2xs hover:border-sky-300'
                                    }`}
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-sm text-slate-800">
                                                {addr.recipientName}
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <span className="font-mono text-xs text-slate-600 font-semibold">
                                                {addr.phone}
                                            </span>
                                        </div>

                                        {addr.isDefault && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-extrabold text-sky-900 border border-sky-300/80">
                                                <span>⭐</span>
                                                <span>Mặc định</span>
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-xs text-slate-600 leading-relaxed pr-1">
                                        {addr.fullAddress}
                                    </p>

                                    {addr.latitude && addr.longitude ? (
                                        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                                            <span>📍</span>
                                            <span>Tọa độ: <span className="font-mono">{Number(addr.latitude).toFixed(4)}, {Number(addr.longitude).toFixed(4)}</span></span>
                                        </div>
                                    ) : (
                                        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400">
                                            <span>📍</span>
                                            <span>Chưa có tọa độ GPS</span>
                                        </div>
                                    )}

                                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleStartEdit(addr)}
                                                className="inline-flex items-center gap-1 font-bold text-sky-800 hover:text-sky-950 transition-colors cursor-pointer"
                                            >
                                                <span>✏️</span>
                                                <span>Sửa</span>
                                            </button>

                                            <span className="text-slate-200">|</span>

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(addr)}
                                                className="inline-flex items-center gap-1 font-bold text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                                            >
                                                <span>🗑️</span>
                                                <span>Xóa</span>
                                            </button>
                                        </div>

                                        {!addr.isDefault && (
                                            <button
                                                type="button"
                                                onClick={() => handleSetDefault(addr.addressId)}
                                                className="rounded-2xl border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-sky-50 hover:text-sky-900 hover:border-sky-300 transition-colors cursor-pointer"
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

                {/* ══ CỘT PHẢI: Form Thêm / Sửa Địa Chỉ ══ */}
                <div className="lg:col-span-7">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                    <span>{editingId ? '✏️' : '➕'}</span>
                                    <span>{editingId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ nhận hàng'}</span>
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    {editingId
                                        ? 'Chỉnh sửa thông tin người nhận hoặc chọn lại vị trí'
                                        : 'Nhập thông tin người nhận và lựa chọn phương thức định vị'}
                                </p>
                            </div>

                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded-3xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                    ✕ Hủy sửa
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            {/* Tên & SĐT */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-700">
                                        Tên người nhận <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={recipientName}
                                        onChange={(e) => setRecipientName(e.target.value)}
                                        placeholder="Ví dụ: Nguyễn Văn A"
                                        className="w-full rounded-3xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-sky-600 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-700">
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Ví dụ: 0987654321"
                                        className="w-full rounded-3xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-sky-600 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phương thức chọn địa chỉ: Mapbox vs Nhập tay */}
                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                                    Phương thức chọn địa chỉ <span className="text-red-500">*</span>
                                </label>

                                <div className="grid grid-cols-2 gap-2 mb-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setInputTab(INPUT_TAB_MAP)}
                                        className={`flex items-center justify-center gap-1.5 rounded-3xl py-2 text-xs font-bold transition-all cursor-pointer ${
                                            inputTab === INPUT_TAB_MAP
                                                ? 'bg-sky-800 text-white shadow-xs'
                                                : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        <span>🗺️</span>
                                        <span>Chọn trên bản đồ (Mapbox)</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setInputTab(INPUT_TAB_MANUAL)}
                                        className={`flex items-center justify-center gap-1.5 rounded-3xl py-2 text-xs font-bold transition-all cursor-pointer ${
                                            inputTab === INPUT_TAB_MANUAL
                                                ? 'bg-sky-800 text-white shadow-xs'
                                                : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        <span>✍️</span>
                                        <span>Nhập tay thủ công</span>
                                    </button>
                                </div>

                                {/* Tab Mapbox */}
                                {inputTab === INPUT_TAB_MAP && (
                                    <div className="space-y-2.5 rounded-3xl border border-sky-200/70 bg-sky-50/30 p-3">
                                        <p className="text-[11px] text-sky-900 font-medium">
                                            💡 Click trực tiếp lên bản đồ hoặc tìm kiếm để lấy vị trí và tự động tính khoảng cách!
                                        </p>
                                        <MapboxAddressPicker onAddressSelected={handleMapAddressSelected} />

                                        {fullAddress && (
                                            <div className="rounded-3xl border border-slate-200 bg-white p-2.5 shadow-2xs">
                                                <label className="mb-1 block text-[10px] font-bold text-slate-600">
                                                    Địa chỉ lấy từ bản đồ (có thể bổ sung số nhà/tầng nếu cần):
                                                </label>
                                                <textarea
                                                    value={fullAddress}
                                                    onChange={(e) => setFullAddress(e.target.value)}
                                                    rows={2}
                                                    className="w-full rounded-2xl border border-slate-200 p-2 text-xs text-slate-800 focus:border-sky-600 focus:outline-hidden"
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Tab Nhập tay */}
                                {inputTab === INPUT_TAB_MANUAL && (
                                    <div className="space-y-1.5 rounded-3xl border border-slate-200 bg-slate-50/50 p-3.5">
                                        <label className="block text-xs font-bold text-slate-700">
                                            Địa chỉ chi tiết <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={fullAddress}
                                            onChange={(e) => setFullAddress(e.target.value)}
                                            rows={3}
                                            placeholder="Ví dụ: Số 123 đường Cầu Giấy, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội..."
                                            className="w-full rounded-3xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-sky-600 focus:outline-hidden"
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Mặc định */}
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pt-0.5">
                                <input
                                    type="checkbox"
                                    checked={isDefault}
                                    onChange={(e) => setIsDefault(e.target.checked)}
                                    className="h-3.5 w-3.5 rounded-md accent-sky-800 cursor-pointer"
                                />
                                <span>Đặt làm địa chỉ giao hàng mặc định</span>
                            </label>

                            {/* Tọa độ GPS preview */}
                            {latitude != null && longitude != null ? (
                                <div className="flex items-center gap-1.5 rounded-3xl bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 text-xs text-emerald-800">
                                    <span>📍</span>
                                    <span>Tọa độ GPS: <b className="font-mono">{Number(latitude).toFixed(5)}, {Number(longitude).toFixed(5)}</b></span>
                                </div>
                            ) : (
                                <p className="text-[11px] text-slate-400 italic">
                                    💡 Hệ thống sẽ tự động xác định tọa độ GPS từ Mapbox khi bấm lưu địa chỉ.
                                </p>
                            )}

                            {/* Nút Submit */}
                            <div className="flex items-center gap-2.5 pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-3xl bg-sky-800 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-sky-900 disabled:opacity-50 transition-all cursor-pointer"
                                >
                                    <span>{submitting ? '⏳' : editingId ? '💾' : '➕'}</span>
                                    <span>{submitting ? 'Đang lưu...' : editingId ? 'Lưu cập nhật' : 'Thêm địa chỉ'}</span>
                                </button>

                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="rounded-3xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
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
