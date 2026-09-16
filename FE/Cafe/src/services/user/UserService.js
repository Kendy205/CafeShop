import { BaseServices } from '../BaseService'

/**
 * UserService
 * Quản lý hồ sơ người dùng theo đặc tả API:
 * 1. GET /api/User/profile - Lấy thông tin cá nhân
 * 2. PUT /api/User/profile - Cập nhật thông tin & upload ảnh đại diện (FormData)
 * 3. PUT /api/User/change-password - Đổi mật khẩu
 */
export class UserService extends BaseServices {
    // 1. Lấy thông tin cá nhân
    getProfile = () => this.get('/api/User/profile')

    // 2. Cập nhật hồ sơ & Ảnh đại diện (Content-Type: multipart/form-data)
    updateProfile = (formData) =>
        this.put('/api/User/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })

    // 3. Đổi mật khẩu
    changePassword = (body) => this.put('/api/User/change-password', body)
}

export const userService = new UserService()
