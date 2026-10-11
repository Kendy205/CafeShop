import { BaseServices } from '../BaseService'

export class AdminOrderService extends BaseServices {
    basePath = '/api/admin/Order'

    /**
     * Lấy danh sách tất cả đơn hàng (phân trang, lọc)
     * @param {{ pageNumber, pageSize, status, keyword }} params
     */
    getAllOrders = (params = {}) => this.get(this.basePath, { params, __skipGlobalLoading: true })

    /**
     * Lấy chi tiết 1 đơn hàng
     * @param {number|string} orderId
     */
    getOrderById = (orderId) => this.get(`${this.basePath}/${orderId}`)

    /**
     * Cập nhật trạng thái đơn hàng
     * @param {number|string} orderId
     * @param {string} status - 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED'
     * @param {string|null} cancelReason - Bắt buộc khi status = 'CANCELLED'
     */
    updateStatus = (orderId, status, cancelReason = null) =>
        this.put(`${this.basePath}/${orderId}/status`, { newStatus: status, cancelReason })

    /**
     * Lấy danh sách đơn hàng hoàn thành của 1 user
     * @param {number} userId 
     * @param {{ pageNumber, pageSize }} params 
     */
    getUserCompletedOrders = (userId, params = {}) => 
        this.get(`${this.basePath}/user/${userId}/completed`, { params, __skipGlobalLoading: true })
}

export const adminOrderService = new AdminOrderService()
