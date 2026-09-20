import { BaseServices } from '../BaseService'

export class AdminVoucherService extends BaseServices {
    basePath = '/api/admin/voucher'

    getVouchers = (params) => this.get(this.basePath, { params, __skipGlobalLoading: true })

    createVoucher = (body) => this.post(this.basePath, body)

    updateVoucher = (id, body) => this.put(`${this.basePath}/${id}`, body)

    toggleActive = (id) => this.patch(`${this.basePath}/${id}/toggle-active`)

    assignUser = (body) => this.post(`${this.basePath}/assign-user`, body)
}

export const adminVoucherService = new AdminVoucherService()
