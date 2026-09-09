import { createSlice } from '@reduxjs/toolkit'
import { claimVoucher, getAvailableVouchers, getMyVouchers } from '../../actions/user/voucherAction'
import { asList } from '../../../utils/helpers/api'

const initialState = {
    // Danh sách voucher khả dụng (public + personal được tặng)
    items: [],
    loading: false,
    error: null,

    // Ví voucher cá nhân (/api/UserVoucher/my-vouchers)
    myVouchers: [],
    myVouchersLoading: false,
    myVouchersError: null,

    // Claim voucher
    claiming: false,
    claimError: null,
    claimSuccess: null, // message từ server khi claim thành công
}

const voucherSlice = createSlice({
    name: 'voucher',
    initialState,
    reducers: {
        clearVoucherMessages: (state) => {
            state.claimError = null
            state.claimSuccess = null
        },
    },
    extraReducers: (builder) => {
        builder
            // ── Get Available ──────────────────────────────────────────────
            .addCase(getAvailableVouchers.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getAvailableVouchers.fulfilled, (state, action) => {
                state.loading = false
                state.items = asList(action.payload)
            })
            .addCase(getAvailableVouchers.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // ── Get My Vouchers ────────────────────────────────────────────
            .addCase(getMyVouchers.pending, (state) => {
                state.myVouchersLoading = true
                state.myVouchersError = null
            })
            .addCase(getMyVouchers.fulfilled, (state, action) => {
                state.myVouchersLoading = false
                state.myVouchers = Array.isArray(action.payload) ? action.payload : []
            })
            .addCase(getMyVouchers.rejected, (state, action) => {
                state.myVouchersLoading = false
                state.myVouchersError = action.payload
            })

            // ── Claim Voucher ──────────────────────────────────────────────
            .addCase(claimVoucher.pending, (state) => {
                state.claiming = true
                state.claimError = null
                state.claimSuccess = null
            })
            .addCase(claimVoucher.fulfilled, (state, action) => {
                state.claiming = false
                state.claimSuccess = `Đã lưu mã "${action.payload}" vào ví thành công!`
            })
            .addCase(claimVoucher.rejected, (state, action) => {
                state.claiming = false
                state.claimError = action.payload
            })
    },
})

export const { clearVoucherMessages } = voucherSlice.actions
export default voucherSlice.reducer
