import { BaseServices } from '../BaseService'

/**
 * Service xử lý các API danh mục phía User:
 * - GET /api/Category: Lấy toàn bộ danh sách danh mục
 * - GET /api/Category/{id}: Lấy thông tin chi tiết một danh mục theo ID
 */
export class CategoryService extends BaseServices {
    getCategories = () => this.get('/api/Category')

    getCategoryById = (id) => this.get(`/api/Category/${id}`)
}

export const categoryService = new CategoryService()

