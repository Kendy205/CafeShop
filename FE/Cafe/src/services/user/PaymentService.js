import { BaseServices } from '../BaseService'

export class PaymentService extends BaseServices {
    /**
     * Tạo URL thanh toán VNPay cho đơn hàng: POST /api/Payment/vnpay/create-url
     * @param {Object} body - { orderId }
     */
    createPaymentUrl = (body) => this.post('/api/Payment/vnpay/create-url', body)

    /**
     * Xác thực kết quả giao dịch VNPay callback: GET /api/Payment/vnpay/callback?{queryString}
     * @param {string} queryString
     */
    getPaymentCallback = (queryString) => this.get(`/api/Payment/vnpay/callback?${queryString}`)
}

export const paymentService = new PaymentService()
