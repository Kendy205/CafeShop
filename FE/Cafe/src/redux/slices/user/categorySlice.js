import { createSlice } from '@reduxjs/toolkit'
import { getCategories, getCategoryDetail } from '../../actions/user/categoryAction'
import { asList } from '../../../utils/helpers/api'

const initialState = {
    items: [],
    detail: null,
    loading: false,
    detailLoading: false,
    error: null,
}

const categorySlice = createSlice({
    name: 'category',
    initialState,
    reducers: {
        clearCategoryDetail: (state) => {
            state.detail = null
        },
    },
    extraReducers: (builder) => {
        builder
            // ── getCategories ──────────────────────────
            .addCase(getCategories.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getCategories.fulfilled, (state, action) => {
                state.loading = false
                state.items = asList(action.payload)
            })
            .addCase(getCategories.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // ── getCategoryDetail ──────────────────────
            .addCase(getCategoryDetail.pending, (state) => {
                state.detailLoading = true
                state.error = null
            })
            .addCase(getCategoryDetail.fulfilled, (state, action) => {
                state.detailLoading = false
                state.detail = action.payload ?? null
            })
            .addCase(getCategoryDetail.rejected, (state, action) => {
                state.detailLoading = false
                state.error = action.payload
            })
    },
})

export const { clearCategoryDetail } = categorySlice.actions
export default categorySlice.reducer

