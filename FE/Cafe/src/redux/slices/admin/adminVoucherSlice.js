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
    reducers: {
        clearAdminVoucherError: (state) => {
            state.error = null
        },
    },
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
            .addCase(createAdminVoucher.fulfilled, (state) => {
                state.submitting = false
            })
            .addCase(createAdminVoucher.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            .addCase(updateAdminVoucher.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(updateAdminVoucher.fulfilled, (state) => {
                state.submitting = false
            })
            .addCase(updateAdminVoucher.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            .addCase(toggleAdminVoucher.fulfilled, (state, action) => {
                const id = action.payload.id
                state.items = state.items.map((v) => {
                    const vid = v.voucherId ?? v.id
                    if (vid !== id) return v
                    return { ...v, isActive: !v.isActive }
                })
            })
    },
})

export const { clearAdminVoucherError } = adminVoucherSlice.actions
export default adminVoucherSlice.reducer
