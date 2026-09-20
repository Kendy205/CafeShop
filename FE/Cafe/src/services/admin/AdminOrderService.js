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
     * @param {string} status - 'Processing' | 'Shipping' | 'Delivered' | 'Completed' | 'Cancelled'
     */
    updateStatus = (orderId, status) =>
        this.put(`${this.basePath}/${orderId}/status`, { newStatus: status })
}

export const adminOrderService = new AdminOrderService()
