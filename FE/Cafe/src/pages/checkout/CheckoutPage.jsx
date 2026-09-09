import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { getAddresses } from '../../redux/actions/user/addressAction'
import { getAvailableVouchers } from '../../redux/actions/user/voucherAction'
import { voucherService } from '../../services/user/VoucherService'
import { pickErrorMessage, unwrapApi } from '../../utils/helpers/api'
import { buyNowOrder, checkoutOrder } from '../../redux/actions/user/orderAction'
import { getCart } from '../../redux/actions/user/cartAction'
import { clearOrderStatus } from '../../redux/slices/user/orderSlice'
import { calcLineTotal, formatVnd, itemDisplayName, toppingLabel, calculateShippingFee } from '../../utils/helpers/format'
import LoadingLink from '../../components/loading/LoadingLink'
import MapboxAddressPicker from '../../components/map/MapboxAddressPicker'
import { formatDiscount } from '../../utils/constants/VoucherConstants'

// ── Tab địa chỉ ────────────────────────────────────────────────────────────
const TAB_SAVED = 'saved'
const TAB_MAP = 'map'

// ── Voucher Picker Modal ────────────────────────────────────────────────────
function VoucherModal({ vouchers, onSelect, onClose }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-stone-800">🎟️ Chọn mã giảm giá</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200"
                    >
                        ✕
                    </button>
                </div>

                {vouchers.length === 0 ? (
                    <p className="py-6 text-center text-sm text-stone-400">Không có mã giảm giá khả dụng.</p>
                ) : (
                    <ul className="space-y-2 max-h-80 overflow-y-auto">
                        {vouchers.map((v) => {
                            const code = v.code ?? v.voucherCode
                            const expiry = v.endDate
                                ? new Date(v.endDate).toLocaleDateString('vi-VN')
                                : null
                            return (
                                <li key={code}>
                                    <button
                                        type="button"
                                        onClick={() => { onSelect(code); onClose() }}
                                        className="group w-full rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50 p-3 text-left transition-all hover:border-amber-500 hover:bg-amber-100"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <span className="font-mono text-sm font-bold text-amber-800">{code}</span>
                                                <p className="mt-0.5 text-xs text-stone-600">{v.description}</p>
                                                {v.minOrderValue > 0 && (
                                                    <p className="mt-0.5 text-[11px] text-stone-400">
                                                        Đơn tối thiểu {formatVnd(v.minOrderValue)}
                                                    </p>
                                                )}
                                                {expiry && (
                                                    <p className="mt-0.5 text-[11px] text-stone-400">HSD: {expiry}</p>
                                                )}
                                            </div>
                                            <span className="shrink-0 rounded-full bg-amber-800 px-2 py-0.5 text-[11px] font-semibold text-white">
                                                {formatDiscount(v.discountType, v.discountValue, formatVnd)}
                                            </span>
                                        </div>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                )}

                <button
                    type="button"
                    onClick={() => { onSelect(''); onClose() }}
                    className="mt-3 w-full rounded-xl border border-stone-200 py-2 text-sm text-stone-500 hover:bg-stone-50"
                >
                    Không dùng mã
                </button>
            </div>
        </div>
    )
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()

    const isBuyNow = Boolean(location.state?.buyNow)
    const buyNowItems = location.state?.buyNowItems
    const cartItems = useSelector((s) => s.cart.items)
    const cartTotal = useSelector((s) => s.cart.totalPrice)
    const items = isBuyNow && buyNowItems?.length ? buyNowItems : cartItems

    const addresses = useSelector((s) => s.address.items)
    const vouchers = useSelector((s) => s.voucher.items)
    const { submitting, error } = useSelector((s) => s.order)

    // ── Address state ──────────────────────────────────────────────────────
    const defaultAddressId = String(
        (addresses.find((a) => a.isDefault) || addresses[0])?.addressId ?? ''
    )
    const [addressId, setAddressId] = useState('')
    const selectedAddressId = addressId || defaultAddressId

    const [addressTab, setAddressTab] = useState(TAB_SAVED)
    const [mapAddress, setMapAddress] = useState(null) // { address, lat, lng, distanceKm }

    // Tên & SĐT khi dùng tab map (địa chỉ mới)
    const [recipientName, setRecipientName] = useState('')
    const [phone, setPhone] = useState('')

    // ── Payment & voucher state ────────────────────────────────────────────
    const [paymentMethod, setPaymentMethod] = useState('COD')
    const [voucherCode, setVoucherCode] = useState('')
    const [voucherInput, setVoucherInput] = useState('') // ô nhập tay
    const [voucherResult, setVoucherResult] = useState(null) // { isValid, discountAmount, message }
    const [voucherChecking, setVoucherChecking] = useState(false)
    const [showVoucherModal, setShowVoucherModal] = useState(false)
    const debounceRef = useRef(null)

    const [note, setNote] = useState(location.state?.note || '')

    // ── Bootstrap ──────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(clearOrderStatus())
        dispatch(getAddresses())
        dispatch(getAvailableVouchers())
        if (!isBuyNow) dispatch(getCart())
    }, [dispatch, isBuyNow])

    // ── Subtotal & shipping ──────────────────────────────────────────────
    const subtotal = useMemo(() => {
        if (!isBuyNow && cartTotal) return cartTotal
        return items.reduce((s, i) => s + calcLineTotal(i), 0)
    }, [isBuyNow, cartTotal, items])

    // Phí ship ước tính phía FE để hiển thị (backend tính chính xác khi đặt)
    const shippingFee = addressTab === TAB_MAP && mapAddress
        ? calculateShippingFee(mapAddress.distanceKm ?? 0)
        : 0

    // ── Voucher check ─────────────────────────────────────────────────────
    const runVoucherCheck = useCallback(async (code) => {
        const cleanCode = (code || '').trim().toUpperCase()
        if (!cleanCode) {
            setVoucherResult(null)
            return
        }
        setVoucherChecking(true)

        // distanceKm: lấy từ mapAddress khi dùng tab bản đồ, 0 khi dùng địa chỉ đã lưu
        const currentDistanceKm = addressTab === TAB_MAP ? (mapAddress?.distanceKm ?? 0) : 0

        // Build items payload cho buy-now (checkout từ giỏ → null)
        const checkItems = isBuyNow
            ? (buyNowItems ?? []).map((i) => ({
                productId: i.productId,
                sizeId: i.sizeId ?? null,
                quantity: i.quantity,
                toppings: (i.toppings || []).map((t) => ({
                    toppingId: t.toppingId,
                    quantity: t.quantity,
                })),
            }))
            : null

        try {
            const res = await voucherService.checkVoucher({
                voucherCode: cleanCode,
                isBuyNow: Boolean(isBuyNow),
                distanceKm: currentDistanceKm,
                items: checkItems,
            })
            const data = unwrapApi(res)
            const obj = (data && typeof data === 'object') ? data : {}

            const discountAmount     = Number(obj.discountAmount   ?? obj.DiscountAmount   ?? 0)
            const finalTotal         = obj.finalTotal        != null ? Number(obj.finalTotal)        : null
            const finalOrderAmount   = obj.finalOrderAmount  != null ? Number(obj.finalOrderAmount)  : null
            const finalShippingFee   = obj.finalShippingFee  != null ? Number(obj.finalShippingFee)  : null
            const applyType          = obj.applyType         ?? obj.ApplyType         ?? null
            const message            = obj.message || obj.Message || 'Áp dụng mã giảm giá thành công!'

            setVoucherResult({
                isValid: true,
                discountAmount,
                finalTotal,
                finalOrderAmount,
                finalShippingFee,
                applyType,
                message,
            })
        } catch (error) {
            setVoucherResult({
                isValid: false,
                discountAmount: 0,
                message: pickErrorMessage(error, 'Mã không hợp lệ hoặc đã hết hạn'),
            })
        } finally {
            setVoucherChecking(false)
        }
    }, [isBuyNow, buyNowItems, addressTab, mapAddress])

    // Apply voucher code từ modal
    const applyVoucher = useCallback((code) => {
        setVoucherCode(code)
        setVoucherInput(code)
        runVoucherCheck(code)
    }, [runVoucherCheck])

    // Xử lý nhập tay với debounce
    const handleVoucherInputChange = (e) => {
        const val = e.target.value.toUpperCase()
        setVoucherInput(val)
        setVoucherCode(val)
        clearTimeout(debounceRef.current)
        if (!val.trim()) {
            setVoucherResult(null)
            return
        }
        debounceRef.current = setTimeout(() => runVoucherCheck(val), 700)
    }

    const handleApplyManual = () => {
        clearTimeout(debounceRef.current)
        if (voucherInput.trim()) {
            setVoucherCode(voucherInput.trim().toUpperCase())
            runVoucherCheck(voucherInput.trim().toUpperCase())
        }
    }

    const handleClearVoucher = () => {
        clearTimeout(debounceRef.current)
        setVoucherInput('')
        setVoucherCode('')
        setVoucherResult(null)
    }

    const discountAmount = (voucherResult?.isValid && Number(voucherResult?.discountAmount) > 0)
        ? Number(voucherResult.discountAmount)
        : 0

    // ── Submit validation ──────────────────────────────────────────────────
    const mapValid = !!mapAddress && !!recipientName.trim() && !!phone.trim()
    const canSubmit = addressTab === TAB_SAVED ? !!selectedAddressId : mapValid

    // ── Build & submit ─────────────────────────────────────────────────────
    const submit = async (e) => {
        e.preventDefault()
        if (!canSubmit) return

        // Base payload theo spec — KHÔNG gửi shippingFee, KHÔNG gửi totalAmount
        const base = {
            note: note || '',
            paymentMethod,
            voucherCode: voucherCode.trim() || '',
        }

        if (addressTab === TAB_SAVED) {
            // Dùng địa chỉ đã lưu
            Object.assign(base, {
                addressId: Number(selectedAddressId),
                newAddressString: null,
                recipientName: null,
                phone: null,
                distanceKm: 0, // backend tính từ addressId
            })
        } else {
            // Địa chỉ mới từ bản đồ — backend tự lưu địa chỉ
            Object.assign(base, {
                addressId: null,
                newAddressString: mapAddress.address,
                recipientName: recipientName.trim(),
                phone: phone.trim(),
                distanceKm: mapAddress.distanceKm ?? 0,
            })
        }

        if (isBuyNow) {
            const result = await dispatch(
                buyNowOrder({
                    ...base,
                    items: items.map((i) => ({
                        productId: i.productId,
                        sizeId: i.sizeId ?? null,
                        quantity: i.quantity,
                        toppings: (i.toppings || []).map((t) => ({
                            toppingId: t.toppingId,
                            quantity: t.quantity,
                        })),
                    })),
                })
            )
            if (buyNowOrder.fulfilled.match(result)) navigate('/order-success')
            return
        }

        const result = await dispatch(checkoutOrder(base))
        if (checkoutOrder.fulfilled.match(result)) {
            await dispatch(getCart())
            navigate('/order-success')
        }
    }

    // ── Empty guard ────────────────────────────────────────────────────────
    if (!items.length) {
        return (
            <div className="rounded-2xl bg-white p-8 text-center">
                <p>Chưa có món để thanh toán.</p>
                <LoadingLink to="/" className="mt-3 inline-block text-amber-800">
                    Về thực đơn
                </LoadingLink>
            </div>
        )
    }

    return (
        <>
            {/* Voucher modal */}
            {showVoucherModal && (
                <VoucherModal
                    vouchers={vouchers}
                    onSelect={applyVoucher}
                    onClose={() => setShowVoucherModal(false)}
                />
            )}

            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <h1 className="text-2xl font-semibold">Thanh toán</h1>
                    {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

                    {/* ── Địa chỉ giao ── */}
                    <section className="rounded-2xl bg-white p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-semibold">📍 Địa chỉ giao hàng</h2>
                            <LoadingLink to="/addresses" className="text-sm text-amber-800 hover:underline">
                                Quản lý địa chỉ
                            </LoadingLink>
                        </div>

                        {/* Tab switcher */}
                        <div className="mb-4 flex gap-2">
                            <button
                                type="button"
                                onClick={() => setAddressTab(TAB_SAVED)}
                                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${addressTab === TAB_SAVED
                                    ? 'bg-amber-800 text-white shadow-sm'
                                    : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
                                    }`}
                            >
                                📋 Địa chỉ đã lưu
                            </button>
                            <button
                                type="button"
                                onClick={() => setAddressTab(TAB_MAP)}
                                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${addressTab === TAB_MAP
                                    ? 'bg-amber-800 text-white shadow-sm'
                                    : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
                                    }`}
                            >
                                🗺️ Chọn trên bản đồ
                            </button>
                        </div>

                        {/* Tab: Địa chỉ đã lưu */}
                        {addressTab === TAB_SAVED && (
                            addresses.length === 0 ? (
                                <p className="rounded-xl border border-dashed border-stone-200 p-4 text-center text-sm text-stone-400">
                                    Bạn chưa có địa chỉ.{' '}
                                    <LoadingLink to="/addresses" className="text-amber-800 underline">
                                        Thêm ngay
                                    </LoadingLink>
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {addresses.map((a) => (
                                        <label
                                            key={a.addressId}
                                            className={`flex cursor-pointer gap-3 rounded-xl border-2 p-3 transition-colors ${String(a.addressId) === selectedAddressId
                                                ? 'border-amber-700 bg-amber-50'
                                                : 'border-stone-100 hover:border-amber-200'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="address"
                                                value={a.addressId}
                                                checked={String(a.addressId) === selectedAddressId}
                                                onChange={() => setAddressId(String(a.addressId))}
                                                className="mt-1 accent-amber-800"
                                            />
                                            <div>
                                                <p className="text-sm font-semibold text-stone-800">
                                                    {a.recipientName}
                                                    <span className="mx-1.5 text-stone-300">·</span>
                                                    {a.phone}
                                                    {a.isDefault && (
                                                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                                                            Mặc định
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="mt-0.5 text-xs text-stone-500">{a.fullAddress}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )
                        )}

                        {/* Tab: Bản đồ */}
                        {addressTab === TAB_MAP && (
                            <div className="space-y-3">
                                {/* Tên & SĐT người nhận — bắt buộc khi dùng địa chỉ mới */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-stone-600">
                                            Tên người nhận <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={recipientName}
                                            onChange={(e) => setRecipientName(e.target.value)}
                                            placeholder="Nguyễn Văn A"
                                            className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
                                            required={addressTab === TAB_MAP}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-stone-600">
                                            Số điện thoại <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="0987654321"
                                            className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
                                            required={addressTab === TAB_MAP}
                                        />
                                    </div>
                                </div>

                                <MapboxAddressPicker onAddressSelected={setMapAddress} />

                                {mapAddress && (
                                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                        📏 Khoảng cách: <b>{mapAddress.distanceKm} km</b>
                                        <span className="ml-1 text-stone-400">(backend tự tính phí ship)</span>
                                    </div>
                                )}

                                {addressTab === TAB_MAP && !mapValid && (
                                    <p className="text-xs text-red-500">
                                        ⚠️ Vui lòng nhập tên, SĐT và chọn địa chỉ trên bản đồ.
                                    </p>
                                )}
                            </div>
                        )}
                    </section>

                    {/* ── Thanh toán ── */}
                    <section className="rounded-2xl bg-white p-5">
                        <h2 className="mb-4 font-semibold">💳 Thanh toán</h2>

                        {/* Phương thức */}
                        <div className="mb-4 flex gap-2">
                            {['COD', 'VNPAY'].map((method) => (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => setPaymentMethod(method)}
                                    className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-medium transition-all ${paymentMethod === method
                                        ? 'border-amber-700 bg-amber-50 text-amber-900'
                                        : 'border-stone-100 text-stone-500 hover:border-stone-200'
                                        }`}
                                >
                                    {method === 'COD' ? '💵 Tiền mặt (COD)' : '🏦 VNPAY'}
                                </button>
                            ))}
                        </div>

                        {/* Voucher */}
                        <div className="mb-4">
                            <label className="mb-1.5 block text-xs font-medium text-stone-600">
                                🎟️ Mã giảm giá
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={voucherInput}
                                        onChange={handleVoucherInputChange}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                handleApplyManual()
                                            }
                                        }}
                                        placeholder="Nhập mã giảm giá..."
                                        className={`w-full rounded-xl border px-3 py-2 pr-8 font-mono text-sm uppercase outline-none transition-colors focus:ring-1 ${voucherResult
                                            ? voucherResult.isValid
                                                ? 'border-green-500 bg-green-50 text-green-900 focus:ring-green-200'
                                                : 'border-red-400 bg-red-50 text-red-900 focus:ring-red-200'
                                            : 'border-stone-200 focus:border-amber-400 focus:ring-amber-100'
                                            }`}
                                    />
                                    {voucherInput && (
                                        <button
                                            type="button"
                                            onClick={handleClearVoucher}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-bold"
                                            title="Xoá mã"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleApplyManual}
                                    disabled={voucherChecking || !voucherInput.trim()}
                                    className="shrink-0 rounded-xl bg-amber-800 px-3.5 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-40 hover:bg-amber-900"
                                >
                                    {voucherChecking ? 'Kiểm tra...' : 'Áp dụng'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowVoucherModal(true)}
                                    className="shrink-0 rounded-xl border border-amber-700 px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50"
                                >
                                    Chọn mã
                                </button>
                            </div>

                            {/* Voucher feedback */}
                            {voucherChecking && (
                                <p className="mt-1.5 flex items-center gap-1 text-xs text-amber-700 animate-pulse">
                                    ⏳ Đang kiểm tra mã giảm giá...
                                </p>
                            )}
                            {voucherResult && !voucherChecking && (
                                <div
                                    className={`mt-2 flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium ${voucherResult.isValid
                                        ? 'bg-green-50 border border-green-200 text-green-800'
                                        : 'bg-red-50 border border-red-200 text-red-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span>{voucherResult.isValid ? '✅' : '❌'}</span>
                                        <span>{voucherResult.message}</span>
                                    </div>
                                    {voucherResult.isValid && voucherResult.discountAmount > 0 && (
                                        <span className="font-bold text-green-700">
                                            −{formatVnd(voucherResult.discountAmount)}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Ghi chú */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-stone-600">📝 Ghi chú</label>
                            <textarea
                                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100"
                                rows={2}
                                placeholder="Pha ít đá, ít đường, giao giờ hành chính..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>
                    </section>
                </div>

                {/* ── Sidebar: Đơn hàng ── */}
                <aside className="h-fit rounded-2xl bg-white p-5">
                    <h2 className="mb-3 font-semibold">🛒 Đơn hàng</h2>

                    <ul className="divide-y divide-stone-50 text-sm">
                        {items.map((i, idx) => (
                            <li key={i.cartItemId || idx} className="py-2.5">
                                <div className="flex justify-between gap-2">
                                    <span className="font-medium text-stone-800">
                                        {itemDisplayName(i)}{' '}
                                        <span className="text-stone-400">×{i.quantity}</span>
                                    </span>
                                    <span className="shrink-0">{formatVnd(i.totalItemPrice ?? calcLineTotal(i))}</span>
                                </div>
                                <p className="text-xs text-stone-400">
                                    Size: {i.sizeName || 'Mặc định'}
                                </p>
                                {i.toppings?.length > 0 && (
                                    <ul className="mt-0.5 text-xs text-stone-400">
                                        {i.toppings.map((t, tIdx) => (
                                            <li key={tIdx}>{toppingLabel(t)}</li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Tổng tiền */}
                    <div className="mt-3 space-y-1.5 border-t border-stone-100 pt-3 text-sm">
                        <div className="flex justify-between text-stone-500">
                            <span>Tạm tính</span>
                            <span>{formatVnd(subtotal)}</span>
                        </div>

                        {/* Phí vận chuyển (ước tính FE, backend tính chính xác) */}
                        {addressTab === TAB_MAP && mapAddress && (
                            <div className="flex justify-between text-stone-500">
                                <span className="flex items-center gap-1">
                                    Phí vận chuyển
                                    <span className="rounded bg-stone-100 px-1 text-[10px] text-stone-400">ước tính</span>
                                </span>
                                <span className="font-medium text-stone-700">{formatVnd(shippingFee)}</span>
                            </div>
                        )}

                        {/* Giảm giá */}
                        {discountAmount > 0 && (
                            <div className="flex justify-between font-medium text-green-700">
                                <span>Mã giảm giá</span>
                                <span>−{formatVnd(discountAmount)}</span>
                            </div>
                        )}

                        <div className="flex justify-between border-t border-stone-100 pt-2 text-base font-bold text-stone-900">
                            <span>Tổng cộng</span>
                            <span className="text-amber-900">
                                {formatVnd(Math.max(0, subtotal + shippingFee - discountAmount))}
                            </span>
                        </div>
                        {addressTab === TAB_MAP && mapAddress && (
                            <p className="text-right text-[11px] text-stone-400">
                                (phí ship có thể thay đổi khi xác nhận)
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || !canSubmit}
                        className="mt-4 w-full rounded-xl bg-amber-800 py-3 font-semibold text-white shadow-sm transition-opacity disabled:opacity-50 hover:bg-amber-900"
                    >
                        {submitting ? '⏳ Đang đặt...' : '✅ Đặt hàng'}
                    </button>

                    {addressTab === TAB_MAP && !mapValid && (
                        <p className="mt-2 text-center text-xs text-stone-400">
                            Vui lòng điền đủ thông tin giao hàng
                        </p>
                    )}
                </aside>
            </form>
        </>
    )
}
