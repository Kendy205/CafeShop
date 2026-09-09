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
    const data = payload && typeof payload === 'object' ? payload : {}
    if (Array.isArray(data)) {
        state.items = data
        state.cartId = null
        state.status = null
        state.totalPrice = 0
        return
    }
    state.cartId = data.cartId ?? data.CartId ?? null
    state.status = data.status ?? data.Status ?? null
    state.totalPrice = Number(
        data.totalPrice ??
        data.TotalPrice ??
        data.totalAmount ??
        data.TotalAmount ??
        0
    )
    state.items = Array.isArray(data.items)
        ? data.items
        : Array.isArray(data.Items)
          ? data.Items
          : []
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
        clearCartError: (state) => {
            state.error = null
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
                state.submitting = false
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

export const { resetCart, clearCartError } = cartSlice.actions
export default cartSlice.reducer
