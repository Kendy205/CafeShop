import { BaseServices } from '../BaseService'

export class ProductService extends BaseServices {
    getProducts = (params, config = {}) =>
        this.get('/api/Product', { params, __skipGlobalLoading: true, ...config })

    getProductById = (id, config = {}) =>
        this.get(`/api/Product/${id}`, { __skipGlobalLoading: true, ...config })

    // Lấy gợi ý tìm kiếm mặc định (Top 5 bán chạy & Top 5 mới ra mắt)
    getSuggestions = (config = {}) =>
        this.get('/api/Product/suggestions', { __skipGlobalLoading: true, ...config })

    // Tìm kiếm tự động điền (Autocomplete)
    getAutocomplete = (keyword, config = {}) => {
        if (!keyword || !keyword.trim()) {
            return Promise.resolve({ data: { success: true, data: [] } })
        }
        return this.get('/api/Product/autocomplete', {
            params: { keyword: keyword.trim() },
            __skipGlobalLoading: true,
            ...config,
        })
    }

    // Lấy toàn bộ danh sách danh mục (dùng cho bộ lọc)
    getCategories = (config = {}) =>
        this.get('/api/Category', { __skipGlobalLoading: true, ...config })
}

export const productService = new ProductService()
