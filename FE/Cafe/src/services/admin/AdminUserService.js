import { BaseServices } from '../BaseService'

export class AdminUserService extends BaseServices {
    basePath = '/api/admin/user'

    /**
     * Lấy danh sách khách hàng
     * @param {{ searchKeyword?: string, pageNumber?: number, pageSize?: number }} params 
     */
    getUsers = (params = {}) => this.get(this.basePath, { params, __skipGlobalLoading: true })

    /**
     * Khóa/Mở khóa tài khoản khách hàng
     * @param {number|string} id 
     */
    toggleUserStatus = (id) => this.patch(`${this.basePath}/${id}/toggle-status`)
}

export const adminUserService = new AdminUserService()
