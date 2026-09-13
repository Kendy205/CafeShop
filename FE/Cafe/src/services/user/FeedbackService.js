import { BaseServices } from '../BaseService'
import { unwrapApi, normalizePagedResult } from '../../utils/helpers/api'

export class FeedbackService extends BaseServices {
    /**
     * 1. Gửi đánh giá cho món: POST /api/Feedback
     * @param {Object} body - { productId, orderDetailId, rating, comment }
     */
    addFeedback = async (body) => {
        const res = await this.post('/api/Feedback', body)
        const raw = res?.data !== undefined ? res.data : res
        if (raw && (raw.success === false || (raw.statusCode && raw.statusCode >= 400))) {
            const err = new Error(raw.message || 'Gửi đánh giá thất bại')
            err.response = { data: raw }
            throw err
        }
        return raw
    }

    /**
     * 2. Lấy thống kê đánh giá của sản phẩm: GET /api/Feedback/product/{productId}/summary
     * @param {number} productId
     */
    getProductSummary = async (productId) => {
        const res = await this.get(`/api/Feedback/product/${productId}/summary`, {
            __skipGlobalLoading: true,
        })
        return unwrapApi(res)
    }

    /**
     * 3. Lấy danh sách bình luận: GET /api/Feedback/product/{productId}?pageNumber={pageNumber}&pageSize={pageSize}
     * @param {number} productId
     * @param {Object} params - { pageNumber, pageSize }
     */
    getProductFeedbacks = async (productId, params = {}) => {
        const pageSize = params.pageSize || 10
        const pageNumber = params.pageNumber || 1
        const res = await this.get(`/api/Feedback/product/${productId}`, {
            params: { pageNumber, pageSize },
            __skipGlobalLoading: true,
        })
        const data = unwrapApi(res)
        return normalizePagedResult(data, pageSize)
    }
}

export const feedbackService = new FeedbackService()
