import { BaseServices } from '../BaseService'

class AdminToppingService extends BaseServices {
    basePath = '/api/admin/Topping'

    getAllToppings = () => this.get(this.basePath, { __skipGlobalLoading: true })

    createTopping = (formData) =>
        this.post(this.basePath, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })

    updateTopping = (id, formData) =>
        this.put(`${this.basePath}/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })

    toggleAvailability = (id) => this.patch(`${this.basePath}/${id}/toggle-availability`)
}

export const adminToppingService = new AdminToppingService()
