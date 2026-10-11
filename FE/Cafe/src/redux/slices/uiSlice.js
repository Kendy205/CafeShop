import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    loadingCount: 0,
    routeLoadingCount: 0,
    apiError: {
        show: false,
        message: '',
        statusCode: null,
    },
}

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        startGlobalLoading: (state) => {
            state.loadingCount += 1
        },
        stopGlobalLoading: (state) => {
            state.loadingCount = Math.max(0, state.loadingCount - 1)
        },
        startRouteLoading: (state) => {
            state.routeLoadingCount += 1
        },
        stopRouteLoading: (state) => {
            state.routeLoadingCount = Math.max(0, state.routeLoadingCount - 1)
        },
        showApiError: (state, action) => {
            state.apiError.show = true
            state.apiError.message = action.payload?.message || 'Đã có lỗi xảy ra'
            state.apiError.statusCode = action.payload?.statusCode || null
        },
        hideApiError: (state) => {
            state.apiError.show = false
            state.apiError.message = ''
            state.apiError.statusCode = null
        },
    },
})

export const {
    startGlobalLoading,
    stopGlobalLoading,
    startRouteLoading,
    stopRouteLoading,
    showApiError,
    hideApiError,
} = uiSlice.actions

export default uiSlice.reducer
