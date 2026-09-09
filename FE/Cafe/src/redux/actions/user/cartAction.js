import { createAsyncThunk } from '@reduxjs/toolkit'
import { cartService } from '../../../services/user/CartService'
import { pickErrorMessage, unwrapApi } from '../../../utils/helpers/api'

export const getCart = createAsyncThunk('cart/getCart', async (_, { rejectWithValue }) => {
    try {
        const res = await cartService.getCart()
        return unwrapApi(res)
    } catch (e) {
        return rejectWithValue(pickErrorMessage(e, 'Không tải được giỏ hàng'))
    }
})

export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async (body, { dispatch, rejectWithValue }) => {
        try {
            const res = await cartService.addToCart(body)
            const data = unwrapApi(res)
            await dispatch(getCart())
            return data
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Thêm vào giỏ thất bại'))
        }
    }
)

export const updateCartItem = createAsyncThunk(
    'cart/updateCartItem',
    async ({ cartItemId, quantity }, { dispatch, rejectWithValue }) => {
        try {
            const res = await cartService.updateQuantity({ cartItemId, quantity })
            const data = unwrapApi(res)
            await dispatch(getCart())
            return data
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Cập nhật số lượng thất bại'))
        }
    }
)

export const removeCartItem = createAsyncThunk(
    'cart/removeCartItem',
    async (cartItemId, { dispatch, rejectWithValue }) => {
        try {
            const res = await cartService.removeItem(cartItemId)
            const data = unwrapApi(res)
            await dispatch(getCart())
            return data
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Xóa món khỏi giỏ thất bại'))
        }
    }
)

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { rejectWithValue }) => {
    try {
        const res = await cartService.clearCart()
        return unwrapApi(res)
    } catch (e) {
        return rejectWithValue(pickErrorMessage(e, 'Không xóa được giỏ hàng'))
    }
})
