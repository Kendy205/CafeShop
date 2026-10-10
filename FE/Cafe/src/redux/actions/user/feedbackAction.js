import { createAsyncThunk } from '@reduxjs/toolkit'
import { feedbackService } from '../../../services/user/FeedbackService'
import { pickErrorMessage, unwrapApi } from '../../../utils/helpers/api'

export const fetchProductFeedbackSummary = createAsyncThunk(
    'feedback/fetchSummary',
    async (productId, { rejectWithValue }) => {
        try {
            return await feedbackService.getProductSummary(productId)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi tải thống kê đánh giá'))
        }
    }
)

export const fetchProductFeedbacks = createAsyncThunk(
    'feedback/fetchList',
    async ({ productId, params }, { rejectWithValue }) => {
        try {
            return await feedbackService.getProductFeedbacks(productId, params)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi tải danh sách đánh giá'))
        }
    }
)

export const createFeedback = createAsyncThunk(
    'feedback/create',
    async (data, { rejectWithValue }) => {
        try {
            const response = await feedbackService.addFeedback(data)
            return response // this should be feedbackId
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi gửi đánh giá'))
        }
    }
)

export const uploadFeedbackImages = createAsyncThunk(
    'feedback/uploadImages',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            return await feedbackService.uploadFeedbackImages(id, formData)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi tải ảnh đính kèm'))
        }
    }
)
