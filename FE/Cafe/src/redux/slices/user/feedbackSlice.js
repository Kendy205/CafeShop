import { createSlice } from '@reduxjs/toolkit'
import { 
    fetchProductFeedbackSummary, 
    fetchProductFeedbacks,
    createFeedback,
    uploadFeedbackImages
} from '../../actions/user/feedbackAction'

const initialState = {
    summary: {
        totalFeedbacks: 0,
        averageRating: 0,
        starCounts: {},
        starPercentages: {}
    },
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    loading: false,
    error: null,
    submitLoading: false,
}

const feedbackSlice = createSlice({
    name: 'feedback',
    initialState,
    reducers: {
        resetFeedbackState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            // Summary
            .addCase(fetchProductFeedbackSummary.fulfilled, (state, action) => {
                state.summary = action.payload
            })
            // List
            .addCase(fetchProductFeedbacks.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchProductFeedbacks.fulfilled, (state, action) => {
                state.loading = false
                state.items = action.payload.items || []
                state.total = action.payload.total || 0
                state.page = action.payload.page || 1
                state.pageSize = action.payload.pageSize || 10
            })
            .addCase(fetchProductFeedbacks.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Create
            .addCase(createFeedback.pending, (state) => {
                state.submitLoading = true
            })
            .addCase(createFeedback.fulfilled, (state) => {
                state.submitLoading = false
            })
            .addCase(createFeedback.rejected, (state) => {
                state.submitLoading = false
            })
            // Upload
            .addCase(uploadFeedbackImages.pending, (state) => {
                state.submitLoading = true
            })
            .addCase(uploadFeedbackImages.fulfilled, (state) => {
                state.submitLoading = false
            })
            .addCase(uploadFeedbackImages.rejected, (state) => {
                state.submitLoading = false
            })
    },
})

export const { resetFeedbackState } = feedbackSlice.actions
export default feedbackSlice.reducer
