import { createSlice } from '@reduxjs/toolkit'
import { fetchShippingConfig, updateShippingConfig } from '../../actions/admin/adminShippingConfigAction'

const initialState = {
    config: null,
    loading: false,
    submitting: false,
    error: null,
}

const adminShippingConfigSlice = createSlice({
    name: 'adminShippingConfig',
    initialState,
    reducers: {
        clearShippingConfigError: (state) => {
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchShippingConfig.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchShippingConfig.fulfilled, (state, action) => {
                state.loading = false
                state.config = action.payload
            })
            .addCase(fetchShippingConfig.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Update
            .addCase(updateShippingConfig.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(updateShippingConfig.fulfilled, (state, action) => {
                state.submitting = false
                state.config = action.payload
            })
            .addCase(updateShippingConfig.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
    }
})

export const { clearShippingConfigError } = adminShippingConfigSlice.actions
export default adminShippingConfigSlice.reducer
