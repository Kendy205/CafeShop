import { BaseServices } from '../BaseService'

export class ProductService extends BaseServices {
    getProducts = (params) => this.get('/api/Product', { params })

    getProductById = (id) => this.get(`/api/Product/${id}`)

    // Lấy toàn bộ danh sách danh mục (dùng cho bộ lọc)
    getCategories = () => this.get('/api/Category')
}

export const productService = new ProductService()
