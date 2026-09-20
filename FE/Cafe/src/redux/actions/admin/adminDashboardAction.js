import { createAsyncThunk } from '@reduxjs/toolkit'
import { adminDashboardService } from '../../../services/admin/AdminDashboardService'
import { pickErrorMessage, unwrapApi } from '../../../utils/helpers/api'

export const fetchDashboardData = createAsyncThunk(
    'adminDashboard/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const [summaryRes, chartRes, topProductsRes, orderStatsRes] = await Promise.all([
                adminDashboardService.getSummary(params),
                adminDashboardService.getRevenueChart(params),
                adminDashboardService.getTopProducts({ top: 5, ...params }),
                adminDashboardService.getOrderStats(params),
            ])

            return {
                summary: unwrapApi(summaryRes),
                revenueChart: unwrapApi(chartRes),
                topProducts: unwrapApi(topProductsRes),
                orderStats: unwrapApi(orderStatsRes),
            }
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi tải dữ liệu Dashboard'))
        }
    }
)
