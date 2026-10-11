import { createAsyncThunk } from '@reduxjs/toolkit'
import { adminFeedbackService } from '../../../services/admin/AdminFeedbackService'
import { pickErrorMessage, unwrapApi } from '../../../utils/helpers/api'

export const fetchAllFeedbacks = createAsyncThunk(
    'adminFeedback/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const response = await adminFeedbackService.getAll(params)
            return unwrapApi(response)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi tải danh sách đánh giá'))
        }
    }
)

export const toggleFeedbackVisibility = createAsyncThunk(
    'adminFeedback/toggleVisibility',
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminFeedbackService.toggleVisibility(id)
            unwrapApi(response)
            return id // Return id to update state
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi thay đổi trạng thái đánh giá'))
        }
    }
)

export const replyToFeedback = createAsyncThunk(
    'adminFeedback/reply',
    async ({ id, replyContent }, { rejectWithValue }) => {
        try {
            const response = await adminFeedbackService.replyFeedback(id, replyContent)
            return { id, data: unwrapApi(response) } 
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi trả lời đánh giá'))
        }
    }
)
