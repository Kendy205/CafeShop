import { BaseServices } from '../BaseService'

export class AdminNewsService extends BaseServices {
    getManagementNews = (params) => this.get('/api/admin/News', { params })

    getManagementNewsById = (id) => this.get(`/api/admin/News/${id}`)

    createNews = (data) => this.post('/api/admin/News', data, { headers: { 'Content-Type': 'multipart/form-data' } })

    updateNews = (id, data) => this.put(`/api/admin/News/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })

    deleteNews = (id) => this.delete(`/api/admin/News/${id}`)
}

export const adminNewsService = new AdminNewsService()
