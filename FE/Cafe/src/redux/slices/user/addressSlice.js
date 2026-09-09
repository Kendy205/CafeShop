import { createSlice } from '@reduxjs/toolkit'
import {
    createAddress,
    deleteAddress,
    getAddresses,
    setDefaultAddress,
    updateAddress,
} from '../../actions/user/addressAction'
import { asList } from '../../../utils/helpers/api'

const initialState = {
    items: [],
    loading: false,
    submitting: false,
    error: null,
}

const addressSlice = createSlice({
    name: 'address',
    initialState,
    reducers: {
        clearAddressError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAddresses.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getAddresses.fulfilled, (state, action) => {
                state.loading = false
                state.items = asList(action.payload)
            })
            .addCase(getAddresses.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(createAddress.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(createAddress.fulfilled, (state) => {
                state.submitting = false
            })
            .addCase(createAddress.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            .addCase(updateAddress.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(updateAddress.fulfilled, (state) => {
                state.submitting = false
            })
            .addCase(updateAddress.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            .addCase(deleteAddress.pending, (state) => {
                state.submitting = true
            })
            .addCase(deleteAddress.fulfilled, (state, action) => {
                state.submitting = false
                state.items = state.items.filter((a) => a.addressId !== action.payload)
            })
            .addCase(deleteAddress.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            .addCase(setDefaultAddress.fulfilled, (state, action) => {
                const id = typeof action.payload === 'number' ? action.payload : action.payload?.addressId
                if (id != null) {
                    state.items = state.items.map((a) => ({
                        ...a,
                        isDefault: a.addressId === id,
                    }))
                }
            })
    },
})

export const { clearAddressError } = addressSlice.actions
export default addressSlice.reducer
