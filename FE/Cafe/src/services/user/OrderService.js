import { BaseServices } from '../BaseService'

export class OrderService extends BaseServices {
    /**
     * 1. Tính phí vận chuyển (Public): POST /api/Order/calculate-fee
     * @param {Object} params - { distanceKm, orderTotal }
     */
    calculateShippingFee = ({ distanceKm, orderTotal }) =>
        this.post(
            '/api/Order/calculate-fee',
            {
                distanceKm: Number(distanceKm || 0),
                orderTotal: Number(orderTotal || 0),
            },
            { __skipGlobalLoading: true }
        )

    /**
     * 2. Đặt hàng gộp chung 2 luồng: POST /api/Order/checkout
     * @param {Object} body
     */
    submitOrder = (body) => this.post('/api/Order/checkout', body)

    // Tương thích ngược các luồng gọi cũ
    buyNow = (body) => this.submitOrder({ ...body, isBuyNow: true })

    checkout = (body) => this.submitOrder({ ...body, isBuyNow: false })

    /**
     * 3. Lấy lịch sử đơn hàng: GET /api/Order/my-orders
     */
    getMyOrders = ({ pageNumber = 1, pageSize = 10, status } = {}) => {
        const query = new URLSearchParams({ pageNumber, pageSize })
        if (status && status !== 'ALL') {
            query.append('status', status)
        }
        return this.get(`/api/Order/my-orders?${query.toString()}`)
    }

    cancelOrder = (orderId) => this.put(`/api/Order/cancel/${orderId}`)
}

export const orderService = new OrderService()
