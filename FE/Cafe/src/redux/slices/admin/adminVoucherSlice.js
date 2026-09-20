import { createSlice } from '@reduxjs/toolkit'
import {
    createAdminVoucher,
    getAdminVouchers,
    toggleAdminVoucher,
    updateAdminVoucher,
} from '../../actions/admin/adminVoucherAction'
import { asList } from '../../../utils/helpers/api'

const initialState = {
    items: [],
    loading: false,
    submitting: false,
    error: null,
}

const adminVoucherSlice = createSlice({
    name: 'adminVoucher',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAdminVouchers.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getAdminVouchers.fulfilled, (state, action) => {
                state.loading = false
                state.items = asList(action.payload)
            })
            .addCase(getAdminVouchers.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(createAdminVoucher.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(createAdminVoucher.fulfilled, (state, action) => {
                state.submitting = false
                if (action.payload?.voucherId) {
                    state.items.push(action.payload)
                }
            })
            .addCase(createAdminVoucher.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            .addCase(updateAdminVoucher.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(updateAdminVoucher.fulfilled, (state, action) => {
                state.submitting = false
                const updated = action.payload
                if (updated?.voucherId) {
                    const idx = state.items.findIndex((x) => x.voucherId === updated.voucherId)
                    if (idx !== -1) state.items[idx] = updated
                }
            })
            .addCase(updateAdminVoucher.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            .addCase(toggleAdminVoucher.fulfilled, (state, action) => {
                const { id } = action.payload
                const idx = state.items.findIndex((x) => x.voucherId === id)
                if (idx !== -1) {
                    state.items[idx] = { ...state.items[idx], isActive: !state.items[idx].isActive }
                }
            })
    },
})

export default adminVoucherSlice.reducer
