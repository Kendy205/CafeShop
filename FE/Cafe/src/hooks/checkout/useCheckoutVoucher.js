import { useCallback, useRef, useState } from 'react'
import { voucherService } from '../../services/user/VoucherService'
import { pickErrorMessage, unwrapApi } from '../../utils/helpers/api'

export function useCheckoutVoucher(isBuyNow, buyNowItems, currentDistanceKm) {
    const [voucherCode, setVoucherCode] = useState('')
    const [voucherInput, setVoucherInput] = useState('')
    const [voucherResult, setVoucherResult] = useState(null)
    const [voucherChecking, setVoucherChecking] = useState(false)
    const [showVoucherModal, setShowVoucherModal] = useState(false)
    const voucherDebounceRef = useRef(null)

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

    const applyVoucher = useCallback(
        (code) => {
            setVoucherCode(code)
            setVoucherInput(code)
            runVoucherCheck(code)
        },
        [runVoucherCheck]
    )

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

    return {
        voucherCode,
        voucherInput,
        voucherResult,
        voucherChecking,
        showVoucherModal,
        discountAmount,
        setShowVoucherModal,
        handleVoucherInputChange,
        handleApplyManual,
        handleClearVoucher,
        applyVoucher
    }
}
