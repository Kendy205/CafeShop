import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    loadingCount: 0,
    routeLoadingCount: 0,
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
    },
})

export const {
    startGlobalLoading,
    stopGlobalLoading,
    startRouteLoading,
    stopRouteLoading,
} = uiSlice.actions

export default uiSlice.reducer
