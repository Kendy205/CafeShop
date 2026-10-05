import { BaseServices } from './BaseService'

export class StoreProfileService extends BaseServices {
    basePath = '/api/StoreProfiles'

    /**
     * Lấy thông tin cấu hình cửa hàng (Public)
     */
    getStoreProfile = () => this.get(this.basePath, { __skipGlobalLoading: true })

    /**
     * Cập nhật thông tin cấu hình cửa hàng (Admin)
     * @param {Object} data 
     */
    updateStoreProfile = (data) => this.put(this.basePath, data)
}

export const storeProfileService = new StoreProfileService()
