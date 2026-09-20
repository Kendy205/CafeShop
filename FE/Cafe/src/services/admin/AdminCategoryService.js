import { BaseServices } from '../BaseService'

class AdminCategoryService extends BaseServices {
    basePath = '/api/admin/Category'

    getAllCategories() {
        return this.get(this.basePath, { __skipGlobalLoading: true })
    }

    createCategory(data) {
        return this.post(this.basePath, data)
    }

    updateCategory(id, data) {
        return this.put(`${this.basePath}/${id}`, data)
    }

    deleteCategory(id) {
        return this.delete(`${this.basePath}/${id}`)
    }
}

export const adminCategoryService = new AdminCategoryService()
