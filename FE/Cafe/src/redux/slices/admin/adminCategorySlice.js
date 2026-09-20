import { createSlice } from '@reduxjs/toolkit'
import {
    fetchAdminCategories,
    createAdminCategory,
    updateAdminCategory,
    deleteAdminCategory,
} from '../../actions/admin/adminCategoryAction'

const initialState = {
    items: [],
    loading: false,
    error: null,
    submitting: false,
}

const adminCategorySlice = createSlice({
    name: 'adminCategory',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchAdminCategories.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchAdminCategories.fulfilled, (state, action) => {
                state.loading = false
                state.items = action.payload ?? []
            })
            .addCase(fetchAdminCategories.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Create
            .addCase(createAdminCategory.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(createAdminCategory.fulfilled, (state, action) => {
                state.submitting = false
                if (action.payload?.categoryId) {
                    state.items.push(action.payload)
                }
            })
            .addCase(createAdminCategory.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            // Update
            .addCase(updateAdminCategory.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(updateAdminCategory.fulfilled, (state, action) => {
                state.submitting = false
                const updated = action.payload
                if (updated?.categoryId) {
                    const idx = state.items.findIndex((x) => x.categoryId === updated.categoryId)
                    if (idx !== -1) state.items[idx] = updated
                }
            })
            .addCase(updateAdminCategory.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            // Delete
            .addCase(deleteAdminCategory.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(deleteAdminCategory.fulfilled, (state, action) => {
                state.submitting = false
                state.items = state.items.filter((x) => x.categoryId !== action.payload)
            })
            .addCase(deleteAdminCategory.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
    },
})

export default adminCategorySlice.reducer
