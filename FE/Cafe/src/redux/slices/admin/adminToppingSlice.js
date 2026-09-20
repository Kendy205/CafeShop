import { createSlice } from '@reduxjs/toolkit'
import {
    fetchAdminToppings,
    createAdminTopping,
    updateAdminTopping,
    toggleToppingAvailability,
} from '../../actions/admin/adminToppingAction'

const initialState = {
    items: [],
    loading: false,
    error: null,
    submitting: false,
}

const adminToppingSlice = createSlice({
    name: 'adminTopping',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchAdminToppings.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchAdminToppings.fulfilled, (state, action) => {
                state.loading = false
                state.items = action.payload ?? []
            })
            .addCase(fetchAdminToppings.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Create
            .addCase(createAdminTopping.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(createAdminTopping.fulfilled, (state, action) => {
                state.submitting = false
                if (action.payload?.toppingId) {
                    state.items.push(action.payload)
                }
            })
            .addCase(createAdminTopping.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            // Update
            .addCase(updateAdminTopping.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(updateAdminTopping.fulfilled, (state, action) => {
                state.submitting = false
                const updated = action.payload
                if (updated?.toppingId) {
                    const idx = state.items.findIndex((x) => x.toppingId === updated.toppingId)
                    if (idx !== -1) state.items[idx] = updated
                }
            })
            .addCase(updateAdminTopping.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            // Toggle Availability
            .addCase(toggleToppingAvailability.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(toggleToppingAvailability.fulfilled, (state, action) => {
                state.submitting = false
                const { id, data } = action.payload
                const idx = state.items.findIndex((x) => x.toppingId === id)
                if (idx !== -1) {
                    state.items[idx] = data?.toppingId ? data : { ...state.items[idx], isAvailable: !state.items[idx].isAvailable }
                }
            })
            .addCase(toggleToppingAvailability.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
    },
})

export default adminToppingSlice.reducer
