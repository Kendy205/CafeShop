import { createSlice } from '@reduxjs/toolkit'
import { getPublicNews, getLatestNews, getPublicNewsBySlug } from '../../actions/user/newsAction'
import { normalizePagedResult } from '../../../utils/helpers/api'

const initialState = {
    // Danh sách tin tức (list page)
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
    loading: false,
    error: null,

    // Tin mới nhất (sidebar / home section)
    latest: [],
    latestLoading: false,

    // Chi tiết bài viết (detail page)
    detail: null,
    detailLoading: false,
    detailError: null,
}

const newsSlice = createSlice({
    name: 'news',
    initialState,
    reducers: {
        clearNewsDetail: (state) => {
            state.detail = null
            state.detailError = null
        },
    },
    extraReducers: (builder) => {
        builder
            // ── getPublicNews (list) ──────────────────────────────────
            .addCase(getPublicNews.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getPublicNews.fulfilled, (state, action) => {
                state.loading = false
                const paged = normalizePagedResult(action.payload, state.pageSize || 10)
                state.items     = paged.items
                state.total     = paged.total
                state.page      = paged.page
                state.pageSize  = paged.pageSize
                state.totalPages = paged.totalPages
            })
            .addCase(getPublicNews.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // ── getLatestNews ─────────────────────────────────────────
            .addCase(getLatestNews.pending, (state) => {
                state.latestLoading = true
            })
            .addCase(getLatestNews.fulfilled, (state, action) => {
                state.latestLoading = false
                state.latest = Array.isArray(action.payload) ? action.payload : []
            })
            .addCase(getLatestNews.rejected, (state) => {
                state.latestLoading = false
            })

            // ── getPublicNewsBySlug (detail) ──────────────────────────
            .addCase(getPublicNewsBySlug.pending, (state) => {
                state.detailLoading = true
                state.detailError = null
                state.detail = null
            })
            .addCase(getPublicNewsBySlug.fulfilled, (state, action) => {
                state.detailLoading = false
                state.detail = action.payload
            })
            .addCase(getPublicNewsBySlug.rejected, (state, action) => {
                state.detailLoading = false
                state.detailError = action.payload
            })
    },
})

export const { clearNewsDetail } = newsSlice.actions
export default newsSlice.reducer
