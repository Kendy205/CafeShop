import { BaseServices } from '../BaseService'

export class OrderService extends BaseServices {
    buyNow = (body) => this.post('/api/Order/buy-now', body)

    checkout = (body) => this.post('/api/Order/checkout', body)

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
