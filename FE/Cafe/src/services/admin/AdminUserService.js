import { BaseServices } from '../BaseService'

export class AdminUserService extends BaseServices {
    basePath = '/api/admin/User'

    /**
     * Lấy danh sách khách hàng
     * @param {{ keyword?: string, pageNumber?: number, pageSize?: number }} params 
     */
    getUsers = (params = {}) => this.get(this.basePath, { params, __skipGlobalLoading: true })

    /**
     * Lấy chi tiết khách hàng
     */
    getUserById = (id) => this.get(`${this.basePath}/${id}`)

    /**
     * Tạo mới tài khoản
     */
    createUser = (data) => this.post(this.basePath, data)

    /**
     * Cập nhật thông tin tài khoản (hỗ trợ multipart/form-data)
     */
    updateUserInfo = (id, data) => {
        const isFormData = typeof FormData !== 'undefined' && data instanceof FormData
        return this.put(`${this.basePath}/${id}`, data, {
            ...(isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {})
        })
    }

    /**
     * Cập nhật quyền (Gán roles)
     */
    assignRoles = (id, data) => this.post(`${this.basePath}/${id}/roles`, data)

    /**
     * Khóa/Mở khóa tài khoản khách hàng
     * @param {number|string} id 
     */
    toggleUserStatus = (id) => this.patch(`${this.basePath}/${id}/toggle-status`)
}

export const adminUserService = new AdminUserService()
