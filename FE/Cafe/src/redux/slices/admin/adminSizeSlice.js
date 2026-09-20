import { createSlice } from '@reduxjs/toolkit'
import {
    fetchAdminSizes,
    createAdminSize,
    updateAdminSize,
    deleteAdminSize,
} from '../../actions/admin/adminSizeAction'

const initialState = {
    items: [],
    loading: false,
    error: null,
    submitting: false,
}

const adminSizeSlice = createSlice({
    name: 'adminSize',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchAdminSizes.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchAdminSizes.fulfilled, (state, action) => {
                state.loading = false
                state.items = action.payload ?? []
            })
            .addCase(fetchAdminSizes.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Create
            .addCase(createAdminSize.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(createAdminSize.fulfilled, (state, action) => {
                state.submitting = false
                if (action.payload?.sizeId) {
                    state.items.push(action.payload)
                }
            })
            .addCase(createAdminSize.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            // Update
            .addCase(updateAdminSize.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(updateAdminSize.fulfilled, (state, action) => {
                state.submitting = false
                const updated = action.payload
                if (updated?.sizeId) {
                    const idx = state.items.findIndex((x) => x.sizeId === updated.sizeId)
                    if (idx !== -1) state.items[idx] = updated
                }
            })
            .addCase(updateAdminSize.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            // Delete
            .addCase(deleteAdminSize.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(deleteAdminSize.fulfilled, (state, action) => {
                state.submitting = false
                state.items = state.items.filter((x) => x.sizeId !== action.payload)
            })
            .addCase(deleteAdminSize.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
    },
})

export default adminSizeSlice.reducer
