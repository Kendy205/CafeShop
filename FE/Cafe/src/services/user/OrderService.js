import { BaseServices } from '../BaseService'

export class OrderService extends BaseServices {
    buyNow = (body) => this.post('/api/Order/buy-now', body)

    checkout = (body) => this.post('/api/Order/checkout', body)

    getMyOrders = ({ pageNumber = 1, pageSize = 10 } = {}) =>
        this.get(`/api/Order/my-orders?pageNumber=${pageNumber}&pageSize=${pageSize}`)

    cancelOrder = (orderId) => this.put(`/api/Order/cancel/${orderId}`)
}

export const orderService = new OrderService()
