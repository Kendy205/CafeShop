import { BaseServices } from '../BaseService'

class AdminProductService extends BaseServices {
    basePath = '/api/admin/Product'

    getProducts(params) {
        return this.get(this.basePath, { params, __skipGlobalLoading: true })
    }

    getProductById(id) {
        return this.get(`${this.basePath}/${id}`)
    }

    createProduct(formData) {
        return this.post(this.basePath, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    }

    updateProduct(id, formData) {
        return this.put(`${this.basePath}/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    }

    toggleAvailability(id) {
        return this.patch(`${this.basePath}/${id}/toggle-availability`)
    }

    deleteProduct(id) {
        return this.delete(`${this.basePath}/${id}`)
    }
}

export const adminProductService = new AdminProductService()
