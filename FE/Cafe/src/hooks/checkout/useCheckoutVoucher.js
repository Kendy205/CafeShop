import { useCallback, useEffect, useRef, useState } from 'react'
import { voucherService } from '../../services/user/VoucherService'
import { pickErrorMessage, unwrapApi } from '../../utils/helpers/api'

export function useCheckoutVoucher(isBuyNow, buyNowItems, currentDistanceKm) {
    const [voucherCode, setVoucherCode] = useState('')
    const [voucherInput, setVoucherInput] = useState('')
    const [voucherResult, setVoucherResult] = useState(null)
    const [voucherChecking, setVoucherChecking] = useState(false)
    const [showVoucherModal, setShowVoucherModal] = useState(false)
    const [isAutoApplied, setIsAutoApplied] = useState(false)

    const voucherDebounceRef = useRef(null)
    const userClearedRef = useRef(false)
    const manualAppliedRef = useRef(false)

    const buildCheckItems = useCallback(() => {
        return isBuyNow
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
    }, [isBuyNow, buyNowItems])

    const runVoucherCheck = useCallback(
        async (code) => {
            const cleanCode = (code || '').trim().toUpperCase()
            if (!cleanCode) {
                setVoucherResult(null)
                return
            }
            setVoucherChecking(true)
            const checkItems = buildCheckItems()

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
                    voucherId: obj.voucherId ?? obj.VoucherId ?? null,
                    discountAmount: Number(obj.discountAmount ?? obj.DiscountAmount ?? 0),
                    finalTotal: obj.finalTotal != null ? Number(obj.finalTotal) : null,
                    finalOrderAmount: obj.finalOrderAmount != null ? Number(obj.finalOrderAmount) : null,
                    finalShippingFee: obj.finalShippingFee != null ? Number(obj.finalShippingFee) : null,
                    applyType: obj.applyType ?? obj.ApplyType ?? null,
                    isAutoApplied: false,
                    message: obj.message || obj.Message || 'Áp dụng mã giảm giá thành công!',
                })
            } catch (err) {
                setVoucherResult({
                    isValid: false,
                    discountAmount: 0,
                    isAutoApplied: false,
                    message: pickErrorMessage(err, 'Mã không hợp lệ hoặc đã hết hạn'),
                })
            } finally {
                setVoucherChecking(false)
            }
        },
        [isBuyNow, buildCheckItems, currentDistanceKm]
    )

    // Tự động quét và áp dụng mã ưu đãi tốt nhất cho đơn hàng
    const fetchBestVoucher = useCallback(
        async (distance) => {
            // Nếu người dùng đã tự tay xoá mã, không tự động ép lại
            if (userClearedRef.current) return
            // Nếu người dùng đã chủ động áp dụng mã thủ công, giữ nguyên
            if (manualAppliedRef.current) return

            const checkItems = buildCheckItems()

            try {
                setVoucherChecking(true)
                const res = await voucherService.getBestForCheckout({
                    isBuyNow: Boolean(isBuyNow),
                    distanceKm: Number(distance ?? 0),
                    items: checkItems,
                })
                const data = unwrapApi(res)

                if (data && data.voucher) {
                    const v = data.voucher
                    const code = (v.code || '').trim().toUpperCase()
                    setVoucherCode(code)
                    setVoucherInput(code)
                    setIsAutoApplied(true)
                    setVoucherResult({
                        isValid: true,
                        voucherId: v.voucherId,
                        voucher: v,
                        discountAmount: Number(data.discountAmount ?? 0),
                        finalTotal: data.finalTotal != null ? Number(data.finalTotal) : null,
                        finalOrderAmount: data.finalOrderAmount != null ? Number(data.finalOrderAmount) : null,
                        finalShippingFee: data.finalShippingFee != null ? Number(data.finalShippingFee) : null,
                        applyType: v.applyType ?? null,
                        isAutoApplied: true,
                        message: `Đã tự động áp dụng ưu đãi tốt nhất: ${code || 'Mã ưu đãi'}`,
                    })
                } else {
                    // Nếu trước đó là auto-applied nhưng cập nhật mới không còn mã nào thỏa mãn
                    if (isAutoApplied) {
                        setVoucherCode('')
                        setVoucherInput('')
                        setVoucherResult(null)
                        setIsAutoApplied(false)
                    }
                }
            } catch (err) {
                // Bỏ qua lỗi âm thầm khi tự động gợi ý để không gián đoạn checkout
            } finally {
                setVoucherChecking(false)
            }
        },
        [isBuyNow, buildCheckItems, isAutoApplied]
    )

    // Tự động quét voucher khi vào checkout hoặc khi khoảng cách (distanceKm) thay đổi
    useEffect(() => {
        fetchBestVoucher(currentDistanceKm)
    }, [currentDistanceKm, fetchBestVoucher])

    const applyVoucher = useCallback(
        (code) => {
            userClearedRef.current = false
            manualAppliedRef.current = true
            setIsAutoApplied(false)
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
        manualAppliedRef.current = true
        setIsAutoApplied(false)
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
            userClearedRef.current = false
            manualAppliedRef.current = true
            setIsAutoApplied(false)
            setVoucherCode(voucherInput.trim().toUpperCase())
            runVoucherCheck(voucherInput.trim().toUpperCase())
        }
    }

    const handleClearVoucher = () => {
        clearTimeout(voucherDebounceRef.current)
        userClearedRef.current = true
        manualAppliedRef.current = false
        setIsAutoApplied(false)
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
        isAutoApplied,
        setShowVoucherModal,
        handleVoucherInputChange,
        handleApplyManual,
        handleClearVoucher,
        applyVoucher,
        fetchBestVoucher,
    }
}
