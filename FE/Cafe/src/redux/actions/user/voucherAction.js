import { createAsyncThunk } from '@reduxjs/toolkit'
import { voucherService } from '../../../services/user/VoucherService'
import { asList, pickErrorMessage, unwrapApi } from '../../../utils/helpers/api'

export const getAvailableVouchers = createAsyncThunk(
    'voucher/getAvailable',
    async (_, { rejectWithValue }) => {
        try {
            const res = await voucherService.getAvailable()
            return unwrapApi(res)
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Không tải được mã giảm giá'))
        }
    }
)

/**
 * Kiểm tra mã & xem trước số tiền giảm
 * Trả về: { isValid, discountAmount, finalOrderAmount, finalShippingFee, finalTotal, applyType, voucherId, message }
 */
export const checkVoucher = createAsyncThunk(
    'voucher/check',
    async ({ voucherCode, isBuyNow, distanceKm, items }, { rejectWithValue }) => {
        try {
            const res = await voucherService.checkVoucher({ voucherCode, isBuyNow, distanceKm, items })
            const data = unwrapApi(res)
            const obj = (data && typeof data === 'object') ? data : {}

            return {
                isValid: true,
                voucherId:          obj.voucherId         ?? obj.VoucherId         ?? null,
                code:               obj.code              ?? obj.Code              ?? voucherCode,
                applyType:          obj.applyType         ?? obj.ApplyType         ?? null,
                discountAmount:     Number(obj.discountAmount    ?? obj.DiscountAmount    ?? 0),
                finalOrderAmount:   obj.finalOrderAmount  != null ? Number(obj.finalOrderAmount)  : null,
                finalShippingFee:   obj.finalShippingFee  != null ? Number(obj.finalShippingFee)  : null,
                finalTotal:         obj.finalTotal        != null ? Number(obj.finalTotal)        : null,
                message:            obj.message || obj.Message || 'Áp dụng mã giảm giá thành công!',
            }
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Mã không hợp lệ hoặc không đủ điều kiện'))
        }
    }
)

/**
 * Lấy ví voucher cá nhân: GET /api/UserVoucher/my-vouchers
 */
export const getMyVouchers = createAsyncThunk(
    'voucher/getMyVouchers',
    async (_, { rejectWithValue }) => {
        try {
            const res = await voucherService.getMyVouchers()
            return asList(unwrapApi(res))
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Không tải được ví voucher'))
        }
    }
)

/**
 * Lưu mã Public vào ví: POST /api/UserVoucher/claim/{code}
 */
export const claimVoucher = createAsyncThunk(
    'voucher/claim',
    async (code, { rejectWithValue }) => {
        try {
            const res = await voucherService.claimVoucher(code)
            unwrapApi(res)
            return code
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Không thể lưu mã vào ví'))
        }
    }
)
