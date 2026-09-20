import { createSlice } from '@reduxjs/toolkit'
import { getProductDetail, getProducts } from '../../actions/user/productAction'
import { normalizePagedResult } from '../../../utils/helpers/api'

const initialState = {
    items: [],
    total: 0,
    totalPages: 0,
    page: 1,
    pageSize: 8,
    detail: null,
    loading: false,
    detailLoading: false,
    error: null,
}

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        clearProductDetail: (state) => {
            state.detail = null
        },
    },
    extraReducers: (builder) => {
        builder
            // ── getProducts ──────────────────────────────────────────
            .addCase(getProducts.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getProducts.fulfilled, (state, action) => {
                state.loading = false
                const paged = normalizePagedResult(action.payload, state.pageSize || 8)
                state.items = paged.items
                state.total = paged.total
                state.totalPages = paged.totalPages
                state.page = paged.page
                state.pageSize = paged.pageSize
            })
            .addCase(getProducts.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // ── getProductDetail ─────────────────────────────────────
            .addCase(getProductDetail.pending, (state) => {
                state.detailLoading = true
                state.error = null
            })
            .addCase(getProductDetail.fulfilled, (state, action) => {
                state.detailLoading = false
                state.detail = action.payload
            })
            .addCase(getProductDetail.rejected, (state, action) => {
                state.detailLoading = false
                state.error = action.payload
            })
    },
})

export const { clearProductDetail } = productSlice.actions
export default productSlice.reducer
