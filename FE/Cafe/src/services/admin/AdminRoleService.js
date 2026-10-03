import { BaseServices } from '../BaseService'

export class AdminRoleService extends BaseServices {
    basePath = '/api/admin/Role'

    /**
     * Lấy danh sách chức năng (permissions)
     */
    getPermissions = () => this.get(`${this.basePath}/permissions`)

    /**
     * Lấy danh sách vai trò
     */
    getRoles = () => this.get(this.basePath)

    /**
     * Lấy chi tiết vai trò
     * @param {number|string} id 
     */
    getRoleById = (id) => this.get(`${this.basePath}/${id}`)

    /**
     * Tạo mới vai trò
     * @param {{ name: string, description: string, permissionIds: number[] }} data 
     */
    createRole = (data) => this.post(this.basePath, data)

    /**
     * Cập nhật vai trò
     * @param {number|string} id 
     * @param {{ name: string, description: string, permissionIds: number[] }} data 
     */
    updateRole = (id, data) => this.put(`${this.basePath}/${id}`, data)

    /**
     * Xóa vai trò
     * @param {number|string} id 
     */
    deleteRole = (id) => this.delete(`${this.basePath}/${id}`)
}

export const adminRoleService = new AdminRoleService()
