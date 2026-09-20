import { BaseServices } from '../BaseService'
import { http } from '../BaseService' // use http directly for multipart formData if needed, or this.patch

class AdminToppingService extends BaseServices {
    basePath = '/api/admin/Topping'

    getAllToppings() {
        return this.get(this.basePath, { __skipGlobalLoading: true })
    }

    createTopping(formData) {
        return http.post(this.basePath, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    }

    updateTopping(id, formData) {
        return http.put(`${this.basePath}/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    }

    toggleAvailability(id) {
        return this.patch(`${this.basePath}/${id}/toggle-availability`)
    }
}

export const adminToppingService = new AdminToppingService()
