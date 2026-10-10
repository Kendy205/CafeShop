import { BaseServices } from '../BaseService'

export class AdminFeedbackService extends BaseServices {
    basePath = '/api/admin/feedback'

    getAll = (params) => this.get(this.basePath, { params, __skipGlobalLoading: true })

    getById = (id) => this.get(`${this.basePath}/${id}`)

    toggleVisibility = (id) => this.put(`${this.basePath}/${id}/toggle-visibility`)

    replyFeedback = (id, replyContent) => this.post(`${this.basePath}/${id}/reply`, { replyContent })

    deleteReply = (id) => this.delete(`${this.basePath}/${id}/reply`)
}

export const adminFeedbackService = new AdminFeedbackService()
