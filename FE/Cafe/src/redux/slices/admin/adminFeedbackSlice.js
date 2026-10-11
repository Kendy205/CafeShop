import { createSlice } from '@reduxjs/toolkit'
import { fetchAllFeedbacks, toggleFeedbackVisibility, replyToFeedback } from '../../actions/admin/adminFeedbackAction'

const initialState = {
    feedbacks: [],
    total: 0,
    page: 1,
    pageSize: 10,
    loading: false,
    error: null,
    actionLoading: false,
}

const adminFeedbackSlice = createSlice({
    name: 'adminFeedback',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchAllFeedbacks.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchAllFeedbacks.fulfilled, (state, action) => {
                state.loading = false
                state.feedbacks = action.payload.items || []
                state.total = action.payload.total || 0
                state.page = action.payload.page || 1
                state.pageSize = action.payload.pageSize || 10
            })
            .addCase(fetchAllFeedbacks.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Toggle Visibility
            .addCase(toggleFeedbackVisibility.pending, (state) => {
                state.actionLoading = true
            })
            .addCase(toggleFeedbackVisibility.fulfilled, (state, action) => {
                state.actionLoading = false
                const id = action.payload
                const index = state.feedbacks.findIndex(f => f.feedbackId === id)
                if (index !== -1) {
                    state.feedbacks[index].isVisible = !state.feedbacks[index].isVisible
                }
            })
            .addCase(toggleFeedbackVisibility.rejected, (state) => {
                state.actionLoading = false
            })
            // Reply
            .addCase(replyToFeedback.pending, (state) => {
                state.actionLoading = true
            })
            .addCase(replyToFeedback.fulfilled, (state, action) => {
                state.actionLoading = false
                const { id } = action.payload
                // Usually we'd update the specific feedback's adminReply object here
                // Or we can just let the component refetch the list
            })
            .addCase(replyToFeedback.rejected, (state) => {
                state.actionLoading = false
            })
    },
})

export default adminFeedbackSlice.reducer
