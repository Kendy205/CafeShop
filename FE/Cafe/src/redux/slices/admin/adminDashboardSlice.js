import { createSlice } from '@reduxjs/toolkit'
import { fetchDashboardData } from '../../actions/admin/adminDashboardAction'

const initialState = {
    summary: {
        totalRevenue: 0,
        totalOrders: 0,
        newUsersCount: 0,
        totalProductsSold: 0,
    },
    revenueChart: [],
    topProducts: [],
    orderStats: [],
    loading: false,
    error: null,
}

const adminDashboardSlice = createSlice({
    name: 'adminDashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardData.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchDashboardData.fulfilled, (state, action) => {
                state.loading = false
                state.summary = action.payload.summary
                state.revenueChart = action.payload.revenueChart
                state.topProducts = action.payload.topProducts
                state.orderStats = action.payload.orderStats
            })
            .addCase(fetchDashboardData.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export default adminDashboardSlice.reducer
