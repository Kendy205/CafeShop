import { BaseServices } from '../BaseService'

class AdminSizeService extends BaseServices {
    basePath = '/api/admin/Size'

    getAllSizes() {
        return this.get(this.basePath, { __skipGlobalLoading: true })
    }

    createSize(data) {
        return this.post(this.basePath, data)
    }

    updateSize(id, data) {
        return this.put(`${this.basePath}/${id}`, data)
    }

    deleteSize(id) {
        return this.delete(`${this.basePath}/${id}`)
    }
}

export const adminSizeService = new AdminSizeService()
