import { createAsyncThunk } from '@reduxjs/toolkit'
import { newsService } from '../../../services/user/NewsService'
import { pickErrorMessage, unwrapApi } from '../../../utils/helpers/api'

export const getPublicNews = createAsyncThunk(
    'news/getPublicNews',
    async (params, { rejectWithValue }) => {
        try {
            const res = await newsService.getPublicNews(params)
            return unwrapApi(res)
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Không tải được danh sách tin tức'))
        }
    }
)

export const getLatestNews = createAsyncThunk(
    'news/getLatestNews',
    async (take = 5, { rejectWithValue }) => {
        try {
            const res = await newsService.getLatestNews(take)
            return unwrapApi(res)
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Không tải được tin tức mới nhất'))
        }
    }
)

export const getPublicNewsBySlug = createAsyncThunk(
    'news/getPublicNewsBySlug',
    async (slug, { rejectWithValue }) => {
        try {
            const res = await newsService.getPublicNewsBySlug(slug)
            return unwrapApi(res)
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Không tìm thấy bài viết'))
        }
    }
)

// POST /api/News/{id}/view — 204 No Content, fire-and-forget, không cần Redux state
export const incrementNewsView = (id) => async () => {
    try {
        await newsService.incrementView(id)
    } catch {
        // Lỗi view count không ảnh hưởng UX
    }
}
