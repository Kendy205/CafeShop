import { createAsyncThunk } from '@reduxjs/toolkit'
import { orderService } from '../../../services/user/OrderService'
import { pickErrorMessage, unwrapApi } from '../../../utils/helpers/api'

export const buyNowOrder = createAsyncThunk(
    'order/buyNow',
    async (body, { rejectWithValue }) => {
        try {
            const res = await orderService.buyNow(body)
            return unwrapApi(res)
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Đặt hàng thất bại'))
        }
    }
)

export const checkoutOrder = createAsyncThunk(
    'order/checkout',
    async (body, { rejectWithValue }) => {
        try {
            const res = await orderService.checkout(body)
            return unwrapApi(res)
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Chốt đơn thất bại'))
        }
    }
)

export const getMyOrders = createAsyncThunk(
    'order/getMyOrders',
    async ({ pageNumber = 1, pageSize = 10, status } = {}, { rejectWithValue }) => {
        try {
            const res = await orderService.getMyOrders({ pageNumber, pageSize, status })
            return unwrapApi(res) // trả về PagedResult: { items, total, page, pageSize }
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Không thể tải lịch sử đơn hàng'))
        }
    }
)

export const cancelOrder = createAsyncThunk(
    'order/cancel',
    async (orderId, { rejectWithValue }) => {
        try {
            const res = await orderService.cancelOrder(orderId)
            unwrapApi(res)
            return orderId // trả về orderId để slice cập nhật trạng thái local
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Không thể hủy đơn hàng'))
        }
    }
)
