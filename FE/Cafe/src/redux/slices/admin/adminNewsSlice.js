import { createSlice } from '@reduxjs/toolkit'
import {
    fetchAdminNews,
    createAdminNews,
    updateAdminNews,
    deleteAdminNews,
} from '../../actions/admin/adminNewsAction'

const initialState = {
    items: [],
    total: 0,
    loading: false,
    error: null,
    submitting: false,
}

const adminNewsSlice = createSlice({
    name: 'adminNews',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchAdminNews.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchAdminNews.fulfilled, (state, action) => {
                state.loading = false
                state.items = action.payload?.items || []
                state.total = action.payload?.total || 0
            })
            .addCase(fetchAdminNews.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Create
            .addCase(createAdminNews.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(createAdminNews.fulfilled, (state, action) => {
                state.submitting = false
                if (action.payload?.newsId) {
                    state.items.unshift(action.payload)
                    state.total += 1
                }
            })
            .addCase(createAdminNews.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            // Update
            .addCase(updateAdminNews.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(updateAdminNews.fulfilled, (state, action) => {
                state.submitting = false
                const updated = action.payload
                if (updated?.newsId) {
                    const idx = state.items.findIndex(x => x.newsId === updated.newsId)
                    if (idx !== -1) state.items[idx] = updated
                }
            })
            .addCase(updateAdminNews.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            // Delete
            .addCase(deleteAdminNews.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(deleteAdminNews.fulfilled, (state, action) => {
                state.submitting = false
                state.items = state.items.filter(x => x.newsId !== action.payload)
                state.total -= 1
            })
            .addCase(deleteAdminNews.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
    }
})

export default adminNewsSlice.reducer
