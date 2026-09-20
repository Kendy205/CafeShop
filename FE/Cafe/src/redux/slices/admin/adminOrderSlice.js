import { createSlice } from '@reduxjs/toolkit'
import {
    fetchAdminOrders,
    fetchAdminOrderDetail,
    updateAdminOrderStatus,
} from '../../actions/admin/adminOrderAction'
import { normalizePagedResult } from '../../../utils/helpers/api'

const initialState = {
    items: [],
    total: 0,
    totalPages: 0,
    page: 1,
    pageSize: 10,
    detail: null,
    loading: false,
    detailLoading: false,
    updating: false,
    error: null,
    detailError: null,
}

const adminOrderSlice = createSlice({
    name: 'adminOrder',
    initialState,
    reducers: {
        clearAdminOrderDetail: (state) => {
            state.detail = null
            state.detailError = null
        },
    },
    extraReducers: (builder) => {
        builder
            // ── fetchAdminOrders ──────────────────────────────────────────
            .addCase(fetchAdminOrders.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchAdminOrders.fulfilled, (state, action) => {
                state.loading = false
                const paged = normalizePagedResult(action.payload, state.pageSize || 10)
                state.items = paged.items
                state.total = paged.total
                state.totalPages = paged.totalPages
                state.page = paged.page
                state.pageSize = paged.pageSize
            })
            .addCase(fetchAdminOrders.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // ── fetchAdminOrderDetail ──────────────────────────────────────
            .addCase(fetchAdminOrderDetail.pending, (state) => {
                state.detailLoading = true
                state.detailError = null
            })
            .addCase(fetchAdminOrderDetail.fulfilled, (state, action) => {
                state.detailLoading = false
                state.detail = action.payload ?? null
            })
            .addCase(fetchAdminOrderDetail.rejected, (state, action) => {
                state.detailLoading = false
                state.detailError = action.payload
            })

            // ── updateAdminOrderStatus ────────────────────────────────────
            .addCase(updateAdminOrderStatus.pending, (state) => {
                state.updating = true
                state.detailError = null
            })
            .addCase(updateAdminOrderStatus.fulfilled, (state, action) => {
                state.updating = false
                const { orderId, status } = action.payload
                const idx = state.items.findIndex((o) => (o.orderId ?? o.id) === orderId)
                if (idx !== -1) {
                    state.items[idx] = { ...state.items[idx], status, currentStatus: status }
                }
                if (state.detail && (state.detail.orderId ?? state.detail.id) === orderId) {
                    state.detail = { ...state.detail, currentStatus: status, status }
                }
            })
            .addCase(updateAdminOrderStatus.rejected, (state, action) => {
                state.updating = false
                state.detailError = action.payload
            })
    },
})

export const { clearAdminOrderDetail } = adminOrderSlice.actions
export default adminOrderSlice.reducer

