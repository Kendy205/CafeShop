import { BaseServices } from '../BaseService'

export class ProductService extends BaseServices {
    getProducts = (params) => this.get('/api/Product', { params })

    getProductById = (id) => this.get(`/api/Product/${id}`)
}

export const productService = new ProductService()
