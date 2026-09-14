import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { message } from 'antd'

// Redux Actions & Slices
import { getAddresses } from '../../redux/actions/user/addressAction'
import { getAvailableVouchers } from '../../redux/actions/user/voucherAction'
import { submitOrder } from '../../redux/actions/user/orderAction'
import { getCart } from '../../redux/actions/user/cartAction'
import {
    clearOrderStatus,
    CAFE_LAT as DEFAULT_CAFE_LAT,
    CAFE_LNG as DEFAULT_CAFE_LNG,
} from '../../redux/slices/user/orderSlice'

// Services & Helpers
import { voucherService } from '../../services/user/VoucherService'
import { orderService } from '../../services/user/OrderService'
import { mapService } from '../../services/map/MapService'
import { pickErrorMessage, unwrapApi } from '../../utils/helpers/api'
import { calcLineTotal } from '../../utils/helpers/format'

// Components
import LoadingLink from '../../components/loading/LoadingLink'
import MapboxAddressPicker from '../../components/map/MapboxAddressPicker'
import {
    VoucherModal,
    SavedAddressList,
    PaymentMethodSection,
    OrderSummarySidebar,
} from '../../components/order'

// Tab constants
const TAB_SAVED = 'saved'
const TAB_MAP = 'map'

/**
 * CheckoutPage Component
 * Trang thanh toán & đặt hàng tích hợp Mapbox tính khoảng cách và phí vận chuyển tự động
 */
export default function CheckoutPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()

    // ── Cart & Buy Now state ───────────────────────────────────────────────
    const isBuyNow = Boolean(location.state?.buyNow)
    const buyNowItems = location.state?.buyNowItems
    const cartItems = useSelector((s) => s.cart.items)
    const cartTotal = useSelector((s) => s.cart.totalPrice)
    const items = isBuyNow && buyNowItems?.length ? buyNowItems : cartItems

    // ── Redux Store selectors ──────────────────────────────────────────────
    const addresses = useSelector((s) => s.address.items)
    const vouchers = useSelector((s) => s.voucher.items)
    const { submitting, error, cafeLat: storeCafeLat, cafeLng: storeCafeLng } = useSelector((s) => s.order)
    const cafeLat = storeCafeLat || DEFAULT_CAFE_LAT
    const cafeLng = storeCafeLng || DEFAULT_CAFE_LNG

    // ── Address states ─────────────────────────────────────────────────────
    const [addressId, setAddressId] = useState('')
    const [addressTab, setAddressTab] = useState(TAB_SAVED)
    const [mapAddress, setMapAddress] = useState(null) // { address, lat, lng, distanceKm }
    const [savedDistanceKm, setSavedDistanceKm] = useState(null)
    const [distanceCalculating, setDistanceCalculating] = useState(false)

    // Thông tin người nhận khi chọn địa chỉ mới trên bản đồ
    const [recipientName, setRecipientName] = useState('')
    const [phone, setPhone] = useState('')

    // ── Payment & Voucher states ───────────────────────────────────────────
    const [paymentMethod, setPaymentMethod] = useState('COD')
    const [voucherCode, setVoucherCode] = useState('')
    const [voucherInput, setVoucherInput] = useState('')
    const [voucherResult, setVoucherResult] = useState(null) // { isValid, discountAmount, message }
    const [voucherChecking, setVoucherChecking] = useState(false)
    const [showVoucherModal, setShowVoucherModal] = useState(false)
    const voucherDebounceRef = useRef(null)

    const [note, setNote] = useState(location.state?.note || '')

    // ── Shipping fee & Error states ────────────────────────────────────────
    const [apiShippingFee, setApiShippingFee] = useState(null)
    const [feeCalculating, setFeeCalculating] = useState(false)
    const [shippingError, setShippingError] = useState('')
    const shipDebounceRef = useRef(null)

    // ── Bootstrap Data ─────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(clearOrderStatus())
        dispatch(getAddresses())
        dispatch(getAvailableVouchers())
        if (!isBuyNow) dispatch(getCart())
    }, [dispatch, isBuyNow])

    // Bước 1: Tự động tick chọn địa chỉ mặc định (hoặc địa chỉ đầu tiên)
    useEffect(() => {
        if (addresses.length > 0 && !addressId) {
            const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0]
            if (defaultAddr) {
                setAddressId(String(defaultAddr.addressId))
            }
        }
    }, [addresses, addressId])

    const selectedAddressId =
        addressId || String((addresses.find((a) => a.isDefault) || addresses[0])?.addressId ?? '')

    // Tạm tính tiền hàng
    const subtotal = useMemo(() => {
        if (!isBuyNow && cartTotal) return cartTotal
        return items.reduce((s, i) => s + calcLineTotal(i), 0)
    }, [isBuyNow, cartTotal, items])

    // Đối tượng địa chỉ đã lưu đang được chọn
    const selectedAddr = useMemo(() => {
        return addresses.find((a) => String(a.addressId) === String(selectedAddressId))
    }, [addresses, selectedAddressId])

    // Bước 2 & Bước 3: Tính khoảng cách Mapbox khi user chọn radio hoặc tick tự động
    useEffect(() => {
        if (addressTab !== TAB_SAVED || !selectedAddr) {
            return
        }

        const lat = selectedAddr.latitude
        const lng = selectedAddr.longitude

        if (!lat || !lng) {
            setSavedDistanceKm(0)
            setShippingError(
                'Địa chỉ đã lưu chưa có tọa độ vị trí (latitude/longitude). Vui lòng cập nhật lại địa chỉ hoặc chọn trên bản đồ.'
            )
            return
        }

        let cancelled = false
        setDistanceCalculating(true)
        setShippingError('') // Xóa lỗi cũ khi đổi địa chỉ

        mapService
            .getDrivingDistance(cafeLng, cafeLat, lng, lat)
            .then((dist) => {
                if (!cancelled) {
                    setSavedDistanceKm(dist ?? 0)
                    setDistanceCalculating(false)
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setDistanceCalculating(false)
                }
            })

        return () => {
            cancelled = true
        }
    }, [addressTab, selectedAddr, cafeLat, cafeLng])

    // Khoảng cách hiện tại dùng để tính phí ship (km)
    const currentDistanceKm = useMemo(() => {
        if (addressTab === TAB_MAP) {
            return Number(mapAddress?.distanceKm ?? 0)
        }
        return Number(savedDistanceKm ?? 0)
    }, [addressTab, mapAddress, savedDistanceKm])

    // Bước 4: Xin báo giá phí vận chuyển từ Backend (POST /api/Order/calculate-fee)
    useEffect(() => {
        clearTimeout(shipDebounceRef.current)

        if (!currentDistanceKm || currentDistanceKm <= 0) {
            setApiShippingFee(0)
            setFeeCalculating(false)
            return
        }

        setFeeCalculating(true)
        shipDebounceRef.current = setTimeout(async () => {
            try {
                const res = await orderService.calculateShippingFee({
                    distanceKm: currentDistanceKm,
                    orderTotal: subtotal,
                })
                const fee = unwrapApi(res)

                setApiShippingFee(Number(fee ?? 0))
                setShippingError('')
            } catch (err) {

                setApiShippingFee(0)
                const errMsg = pickErrorMessage(err, 'Quán chỉ hỗ trợ giao hàng trong vòng 10km')
                setShippingError(errMsg)
            } finally {
                setFeeCalculating(false)
            }
        }, 800)

        return () => clearTimeout(shipDebounceRef.current)
    }, [currentDistanceKm, subtotal])

    const shippingFee = shippingError ? 0 : apiShippingFee != null ? apiShippingFee : 0

    // ── Kiểm tra voucher ───────────────────────────────────────────────────
    const runVoucherCheck = useCallback(
        async (code) => {
            const cleanCode = (code || '').trim().toUpperCase()
            if (!cleanCode) {
                setVoucherResult(null)
                return
            }
            setVoucherChecking(true)

            const checkItems = isBuyNow
                ? (buyNowItems ?? []).map((i) => ({
                    productId: Number(i.productId),
                    sizeId: i.sizeId != null ? Number(i.sizeId) : null,
                    quantity: Number(i.quantity),
                    toppings: (i.toppings || []).map((t) => ({
                        toppingId: Number(t.toppingId),
                        quantity: Number(t.quantity || 1),
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
                const obj = data && typeof data === 'object' ? data : {}

                setVoucherResult({
                    isValid: true,
                    discountAmount: Number(obj.discountAmount ?? obj.DiscountAmount ?? 0),
                    finalTotal: obj.finalTotal != null ? Number(obj.finalTotal) : null,
                    finalOrderAmount: obj.finalOrderAmount != null ? Number(obj.finalOrderAmount) : null,
                    finalShippingFee: obj.finalShippingFee != null ? Number(obj.finalShippingFee) : null,
                    applyType: obj.applyType ?? obj.ApplyType ?? null,
                    message: obj.message || obj.Message || 'Áp dụng mã giảm giá thành công!',
                })
            } catch (err) {
                setVoucherResult({
                    isValid: false,
                    discountAmount: 0,
                    message: pickErrorMessage(err, 'Mã không hợp lệ hoặc đã hết hạn'),
                })
            } finally {
                setVoucherChecking(false)
            }
        },
        [isBuyNow, buyNowItems, currentDistanceKm]
    )

    // Áp dụng voucher từ modal chọn mã
    const applyVoucher = useCallback(
        (code) => {
            setVoucherCode(code)
            setVoucherInput(code)
            runVoucherCheck(code)
        },
        [runVoucherCheck]
    )

    // Xử lý ô nhập voucher tay với debounce
    const handleVoucherInputChange = (e) => {
        const val = e.target.value.toUpperCase()
        setVoucherInput(val)
        setVoucherCode(val)
        clearTimeout(voucherDebounceRef.current)
        if (!val.trim()) {
            setVoucherResult(null)
            return
        }
        voucherDebounceRef.current = setTimeout(() => runVoucherCheck(val), 700)
    }

    const handleApplyManual = () => {
        clearTimeout(voucherDebounceRef.current)
        if (voucherInput.trim()) {
            setVoucherCode(voucherInput.trim().toUpperCase())
            runVoucherCheck(voucherInput.trim().toUpperCase())
        }
    }

    const handleClearVoucher = () => {
        clearTimeout(voucherDebounceRef.current)
        setVoucherInput('')
        setVoucherCode('')
        setVoucherResult(null)
    }

    const discountAmount =
        voucherResult?.isValid && Number(voucherResult?.discountAmount) > 0
            ? Number(voucherResult.discountAmount)
            : 0

    // ── Kiểm tra điều kiện Submit ──────────────────────────────────────────
    const mapValid = Boolean(mapAddress) && Boolean(recipientName.trim()) && Boolean(phone.trim())
    const hasValidAddress =
        addressTab === TAB_SAVED
            ? Boolean(selectedAddressId) && !distanceCalculating
            : mapValid

    const canSubmit = hasValidAddress && !shippingError && !feeCalculating && !distanceCalculating

    // ── Submit Đơn Hàng ────────────────────────────────────────────────────
    const submit = async (e) => {
        e.preventDefault()
        if (!canSubmit) return

        let payload = {
            isBuyNow: Boolean(isBuyNow),
            paymentMethod: paymentMethod.toUpperCase() === 'VNPAY' ? 'VNPay' : 'COD',
            voucherCode: voucherCode.trim() || null,
            note: note.trim() || null,
        }

        if (addressTab === TAB_SAVED) {
            // Cách 1: Đặt bằng Địa chỉ đã lưu
            payload = {
                ...payload,
                addressId: Number(selectedAddressId),
                newAddressString: null,
                recipientName: null,
                phone: null,
                latitude: null,
                longitude: null,
                distanceKm: Number(savedDistanceKm ?? 0),
            }
        } else {
            // Cách 2: Đặt bằng Địa chỉ mới từ Mapbox
            payload = {
                ...payload,
                addressId: null,
                newAddressString: mapAddress.address,
                recipientName: recipientName.trim(),
                phone: phone.trim(),
                latitude: mapAddress.lat != null ? Number(mapAddress.lat) : null,
                longitude: mapAddress.lng != null ? Number(mapAddress.lng) : null,
                distanceKm: Number(mapAddress.distanceKm ?? 0),
            }
        }

        if (isBuyNow) {
            payload.items = items.map((i) => ({
                productId: Number(i.productId),
                sizeId: i.sizeId != null ? Number(i.sizeId) : null,
                quantity: Number(i.quantity),
                toppings: (i.toppings || []).map((t) => ({
                    toppingId: Number(t.toppingId),
                    quantity: Number(t.quantity || 1),
                })),
            }))
        } else {
            payload.items = null
        }

        const result = await dispatch(submitOrder(payload))
        if (submitOrder.fulfilled.match(result)) {
            if (!isBuyNow) {
                dispatch(getCart()) // Giỏ hàng tự động làm mới sau khi đặt thành công
            }
            const data = result.payload
            const paymentUrl = data?.paymentUrl || data?.vnpUrl || data?.url
            if (paymentUrl && paymentMethod.toUpperCase() === 'VNPAY') {
                window.location.href = paymentUrl
                return
            }
            navigate('/order-success')
        } else {
            message.error(result.payload || 'Đặt hàng thất bại!')
        }
    }

    // ── Guard giỏ hàng trống ───────────────────────────────────────────────
    if (!items.length) {
        return (
            <div className="rounded-2xl bg-white p-8 text-center shadow-xs">
                <p className="text-stone-600">Chưa có món nào để thanh toán.</p>
                <LoadingLink
                    to="/"
                    className="mt-3 inline-block font-semibold text-amber-800 hover:text-amber-900 underline"
                >
                    Về thực đơn
                </LoadingLink>
            </div>
        )
    }

    return (
        <>
            {/* Modal Chọn Voucher */}
            {showVoucherModal && (
                <VoucherModal
                    vouchers={vouchers}
                    onSelect={applyVoucher}
                    onClose={() => setShowVoucherModal(false)}
                />
            )}

            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <h1 className="text-2xl font-bold text-stone-800">Thanh toán</h1>
                    {error && (
                        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                            {error}
                        </p>
                    )}

                    {/* ── Khối Địa chỉ giao hàng ── */}
                    <section className="rounded-2xl bg-white p-5 shadow-xs">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-semibold text-stone-800">📍 Địa chỉ giao hàng</h2>
                            <LoadingLink
                                to="/addresses"
                                className="text-sm font-medium text-amber-800 hover:underline"
                            >
                                Quản lý địa chỉ
                            </LoadingLink>
                        </div>

                        {/* Bộ chuyển Tab: Địa chỉ đã lưu vs Chọn trên bản đồ */}
                        <div className="mb-4 flex gap-2">
                            <button
                                type="button"
                                onClick={() => setAddressTab(TAB_SAVED)}
                                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all cursor-pointer ${addressTab === TAB_SAVED
                                        ? 'bg-amber-800 text-white shadow-xs'
                                        : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
                                    }`}
                            >
                                📋 Địa chỉ đã lưu
                            </button>
                            <button
                                type="button"
                                onClick={() => setAddressTab(TAB_MAP)}
                                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all cursor-pointer ${addressTab === TAB_MAP
                                        ? 'bg-amber-800 text-white shadow-xs'
                                        : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
                                    }`}
                            >
                                🗺️ Chọn trên bản đồ
                            </button>
                        </div>

                        {/* Nội dung Tab: Địa chỉ đã lưu */}
                        {addressTab === TAB_SAVED && (
                            <SavedAddressList
                                addresses={addresses}
                                selectedAddressId={selectedAddressId}
                                onSelectAddress={setAddressId}
                                savedDistanceKm={savedDistanceKm}
                                distanceCalculating={distanceCalculating}
                                shippingError={shippingError}
                            />
                        )}

                        {/* Nội dung Tab: Bản đồ Mapbox */}
                        {addressTab === TAB_MAP && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-stone-700">
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
                                        <label className="mb-1 block text-xs font-semibold text-stone-700">
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

                                <MapboxAddressPicker
                                    onAddressSelected={setMapAddress}
                                    shippingFee={shippingFee}
                                    feeCalculating={feeCalculating}
                                    orderTotal={subtotal}
                                />

                                {!mapValid && (
                                    <p className="text-xs font-medium text-red-500">
                                        ⚠️ Vui lòng nhập tên, SĐT và chọn địa chỉ trên bản đồ.
                                    </p>
                                )}
                            </div>
                        )}
                    </section>

                    {/* ── Khối Phương thức thanh toán & Voucher ── */}
                    <PaymentMethodSection
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                        voucherInput={voucherInput}
                        onVoucherInputChange={handleVoucherInputChange}
                        onApplyManual={handleApplyManual}
                        onClearVoucher={handleClearVoucher}
                        onOpenVoucherModal={() => setShowVoucherModal(true)}
                        voucherChecking={voucherChecking}
                        voucherResult={voucherResult}
                        note={note}
                        setNote={setNote}
                    />
                </div>

                {/* ── Sidebar Tóm tắt đơn hàng ── */}
                <OrderSummarySidebar
                    items={items}
                    subtotal={subtotal}
                    currentDistanceKm={currentDistanceKm}
                    shippingFee={shippingFee}
                    feeCalculating={feeCalculating}
                    discountAmount={discountAmount}
                    submitting={submitting}
                    canSubmit={canSubmit}
                    shippingError={shippingError}
                    addressTab={addressTab}
                    mapValid={mapValid}
                />
            </form>
        </>
    )
}
