import { BaseServices } from '../BaseService'

export class AdminDashboardService extends BaseServices {
    basePath = '/api/admin/dashboard'

    getSummary = (params) => this.get(`${this.basePath}/summary`, { params, __skipGlobalLoading: true })

    getRevenueChart = (params) => this.get(`${this.basePath}/revenue-chart`, { params, __skipGlobalLoading: true })

    getTopProducts = (params) => this.get(`${this.basePath}/top-products`, { params, __skipGlobalLoading: true })

    getOrderStats = (params) => this.get(`${this.basePath}/order-stats`, { params, __skipGlobalLoading: true })
}

export const adminDashboardService = new AdminDashboardService()
