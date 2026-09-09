import { BaseServices } from '../BaseService'

export class AdminVoucherService extends BaseServices {
    getVouchers = (params) => this.get('/api/Voucher', { params })

    createVoucher = (body) => this.post('/api/Voucher', body)

    updateVoucher = (id, body) => this.put(`/api/Voucher/${id}`, body)

    toggleActive = (id) => this.patch(`/api/Voucher/${id}/toggle-active`)
}

export const adminVoucherService = new AdminVoucherService()
