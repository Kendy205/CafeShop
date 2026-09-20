import { createSlice } from '@reduxjs/toolkit'
import {
    buyNowOrder,
    cancelOrder,
    checkoutOrder,
    getMyOrders,
    submitOrder,
    calculateShippingFee,
} from '../../actions/user/orderAction'

// Tọa độ quán cafe — đọc từ .env, fallback về Hà Nội
export const CAFE_LAT = parseFloat(import.meta.env.VITE_STORE_LAT ?? '21.0285')
export const CAFE_LNG = parseFloat(import.meta.env.VITE_STORE_LNG ?? '105.8542')

const initialState = {
    cafeLat: CAFE_LAT,
    cafeLng: CAFE_LNG,

    lastOrder: null,
    submitting: false,
    error: null,
    successMessage: null,

    // Phí ship tính từ API calculate-fee
    shippingFee: 0,
    calculatingFee: false,

    // Lịch sử đơn hàng
    myOrders: [],
    myOrdersTotal: 0,
    myOrdersPage: 1,
    myOrdersPageSize: 10,
    myOrdersTotalPages: 1,
    myOrdersLoading: false,
    myOrdersError: null,

    // Hủy đơn
    cancelling: false,
    cancelError: null,
}

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        clearOrderStatus: (state) => {
            state.error = null
            state.successMessage = null
        },
        clearCancelError: (state) => {
            state.cancelError = null
        },
    },
    extraReducers: (builder) => {
        builder
            // ── Submit Order ──────────────────────────────────────────────
            .addCase(submitOrder.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(submitOrder.fulfilled, (state, action) => {
                state.submitting = false
                state.lastOrder = action.payload
                state.successMessage = action.payload?.message ?? 'Đặt hàng thành công'
            })
            .addCase(submitOrder.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })

            // ── Calculate Shipping Fee ────────────────────────────────────
            .addCase(calculateShippingFee.pending, (state) => {
                state.calculatingFee = true
            })
            .addCase(calculateShippingFee.fulfilled, (state, action) => {
                state.calculatingFee = false
                state.shippingFee = Number(action.payload ?? 0)
            })
            .addCase(calculateShippingFee.rejected, (state) => {
                state.calculatingFee = false
            })

            // ── Buy Now ───────────────────────────────────────────────────
            .addCase(buyNowOrder.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(buyNowOrder.fulfilled, (state, action) => {
                state.submitting = false
                state.lastOrder = action.payload
                state.successMessage = action.payload?.message ?? 'Đặt hàng thành công'
            })
            .addCase(buyNowOrder.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })

            // ── Checkout ──────────────────────────────────────────────────
            .addCase(checkoutOrder.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(checkoutOrder.fulfilled, (state, action) => {
                state.submitting = false
                state.lastOrder = action.payload
                state.successMessage = action.payload?.message ?? 'Chốt đơn thành công'
            })
            .addCase(checkoutOrder.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })

            // ── Get My Orders ─────────────────────────────────────────────
            .addCase(getMyOrders.pending, (state) => {
                state.myOrdersLoading = true
                state.myOrdersError = null
            })
            .addCase(getMyOrders.fulfilled, (state, action) => {
                state.myOrdersLoading = false
                const payload = action.payload ?? {}
                state.myOrders = payload.items ?? []
                state.myOrdersTotal = payload.total ?? 0
                state.myOrdersPage = payload.page ?? 1
                state.myOrdersPageSize = payload.pageSize ?? 10
                state.myOrdersTotalPages = payload.totalPages ?? Math.max(1, Math.ceil((payload.total ?? 0) / (payload.pageSize ?? 10)))
            })
            .addCase(getMyOrders.rejected, (state, action) => {
                state.myOrdersLoading = false
                state.myOrdersError = action.payload
            })

            // ── Cancel Order ──────────────────────────────────────────────
            .addCase(cancelOrder.pending, (state) => {
                state.cancelling = true
                state.cancelError = null
            })
            .addCase(cancelOrder.fulfilled, (state, action) => {
                state.cancelling = false
                const cancelledId = action.payload
                state.myOrders = state.myOrders.map((o) =>
                    o.orderId === cancelledId ? { ...o, currentStatus: 'Cancelled' } : o
                )
            })
            .addCase(cancelOrder.rejected, (state, action) => {
                state.cancelling = false
                state.cancelError = action.payload
            })
    },
})

export const { clearOrderStatus, clearCancelError } = orderSlice.actions
export default orderSlice.reducer
