import { createSlice } from '@reduxjs/toolkit'
import { buyNowOrder, cancelOrder, checkoutOrder, getMyOrders } from '../../actions/user/orderAction'
import { normalizePagedResult } from '../../../utils/helpers/api'

const initialState = {
    lastOrder: null,
    submitting: false,
    error: null,
    successMessage: null,

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
            // ── Buy Now ──────────────────────────────────────────────────
            .addCase(buyNowOrder.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(buyNowOrder.fulfilled, (state, action) => {
                state.submitting = false
                state.lastOrder = action.payload
                state.successMessage = action.payload?.message || action.payload?.Message || 'Đặt hàng thành công'
            })
            .addCase(buyNowOrder.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })

            // ── Checkout ─────────────────────────────────────────────────
            .addCase(checkoutOrder.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(checkoutOrder.fulfilled, (state, action) => {
                state.submitting = false
                state.lastOrder = action.payload
                state.successMessage = action.payload?.message || action.payload?.Message || 'Chốt đơn thành công'
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
                const paged = normalizePagedResult(action.payload)
                state.myOrders = paged.items
                state.myOrdersTotal = paged.total
                state.myOrdersPage = paged.page
                state.myOrdersPageSize = paged.pageSize
                state.myOrdersTotalPages = paged.totalPages
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
                // Cập nhật status local ngay lập tức, không cần fetch lại
                state.myOrders = state.myOrders.map((o) =>
                    o.orderId === cancelledId
                        ? { ...o, currentStatus: 'Cancelled' }
                        : o
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
