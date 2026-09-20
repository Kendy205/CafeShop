import { createSlice } from '@reduxjs/toolkit'
import {
    addToCart,
    clearCart,
    getCart,
    removeCartItem,
    updateCartItem,
} from '../../actions/user/cartAction'
import { logout } from '../authSlice'

function emptyCart() {
    return {
        cartId: null,
        status: null,
        totalPrice: 0,
        items: [],
    }
}

function applyCart(state, payload) {
    const data = payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {}
    state.cartId     = data.cartId ?? null
    state.status     = data.status ?? null
    state.totalPrice = Number(data.totalPrice ?? 0)
    state.items      = data.items ?? []
}

const initialState = {
    ...emptyCart(),
    loading: false,
    submitting: false,
    error: null,
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        resetCart: (state) => {
            Object.assign(state, initialState)
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCart.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getCart.fulfilled, (state, action) => {
                state.loading = false
                applyCart(state, action.payload)
            })
            .addCase(getCart.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(addToCart.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(addToCart.fulfilled, (state) => {
                state.submitting = false
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            .addCase(updateCartItem.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(updateCartItem.fulfilled, (state) => {
                state.submitting = false
            })
            .addCase(updateCartItem.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            .addCase(removeCartItem.pending, (state) => {
                state.submitting = true
            })
            .addCase(removeCartItem.fulfilled, (state) => {
                state.submitting = false
            })
            .addCase(removeCartItem.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            .addCase(clearCart.pending, (state) => {
                state.submitting = true
            })
            .addCase(clearCart.fulfilled, (state) => {
                Object.assign(state, { ...initialState, submitting: false })
            })
            .addCase(clearCart.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            .addCase(logout, (state) => {
                Object.assign(state, initialState)
            })
    },
})

export const { resetCart } = cartSlice.actions
export default cartSlice.reducer
