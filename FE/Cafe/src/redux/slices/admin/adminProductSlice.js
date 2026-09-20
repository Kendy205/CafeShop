import { createSlice } from '@reduxjs/toolkit'
import {
    fetchAdminProducts,
    fetchAdminProductDetail,
    createAdminProduct,
    updateAdminProduct,
    toggleProductAvailability,
    deleteAdminProduct,
} from '../../actions/admin/adminProductAction'
import { normalizePagedResult } from '../../../utils/helpers/api'

const initialState = {
    items: [],
    total: 0,
    totalPages: 0,
    page: 1,
    pageSize: 10,
    detail: null,
    loading: false,
    detailLoading: false,
    error: null,
    submitting: false,
}

const adminProductSlice = createSlice({
    name: 'adminProduct',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchAdminProducts.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchAdminProducts.fulfilled, (state, action) => {
                state.loading = false
                const paged = normalizePagedResult(action.payload, state.pageSize || 10)
                state.items = paged.items
                state.total = paged.total
                state.totalPages = paged.totalPages
                state.page = paged.page
                state.pageSize = paged.pageSize
            })
            .addCase(fetchAdminProducts.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Fetch Detail
            .addCase(fetchAdminProductDetail.pending, (state) => {
                state.detailLoading = true
                state.error = null
            })
            .addCase(fetchAdminProductDetail.fulfilled, (state, action) => {
                state.detailLoading = false
                state.detail = action.payload
            })
            .addCase(fetchAdminProductDetail.rejected, (state, action) => {
                state.detailLoading = false
                state.error = action.payload
            })
            // Create
            .addCase(createAdminProduct.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(createAdminProduct.fulfilled, (state) => {
                state.submitting = false
            })
            .addCase(createAdminProduct.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            // Update
            .addCase(updateAdminProduct.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(updateAdminProduct.fulfilled, (state, action) => {
                state.submitting = false
                const updated = action.payload
                if (updated?.productId) {
                    const idx = state.items.findIndex((x) => x.productId === updated.productId)
                    if (idx !== -1) state.items[idx] = updated
                    if (state.detail?.productId === updated.productId) state.detail = updated
                }
            })
            .addCase(updateAdminProduct.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            // Toggle Availability
            .addCase(toggleProductAvailability.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(toggleProductAvailability.fulfilled, (state, action) => {
                state.submitting = false
                const { id, data } = action.payload
                const idx = state.items.findIndex((x) => x.productId === id)
                if (idx !== -1) {
                    state.items[idx] = data?.productId ? data : { ...state.items[idx], isAvailable: !state.items[idx].isAvailable }
                }
                if (state.detail?.productId === id) {
                    state.detail = data?.productId ? data : { ...state.detail, isAvailable: !state.detail.isAvailable }
                }
            })
            .addCase(toggleProductAvailability.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            // Delete
            .addCase(deleteAdminProduct.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(deleteAdminProduct.fulfilled, (state, action) => {
                state.submitting = false
                state.items = state.items.filter((x) => x.productId !== action.payload)
            })
            .addCase(deleteAdminProduct.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
    },
})

export default adminProductSlice.reducer
