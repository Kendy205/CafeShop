import { BaseServices } from '../BaseService'
import { unwrapApi, normalizePagedResult } from '../../utils/helpers/api'

export class FeedbackService extends BaseServices {
    /**
     * 1. Gửi đánh giá cho món: POST /api/Feedback
     * @param {Object} body - { productId, orderDetailId, rating, comment }
     */
    addFeedback = async (body) => {
        const res = await this.post('/api/Feedback', body)
        return unwrapApi(res)
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
            params: { pageNumber, pageSize, rating: params.rating, hasImages: params.hasImages },
            __skipGlobalLoading: true,
        })
        const data = unwrapApi(res)
        return normalizePagedResult(data, pageSize)
    }

    /**
     * 4. Upload ảnh cho đánh giá (sau khi tạo text thành công): POST /api/Feedback/{id}/images
     */
    uploadFeedbackImages = async (feedbackId, formData) => {
        const res = await this.post(`/api/Feedback/${feedbackId}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            __skipGlobalLoading: true,
        })
        return unwrapApi(res)
    }
}

export const feedbackService = new FeedbackService()
