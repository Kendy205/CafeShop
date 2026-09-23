import { BaseServices } from '../BaseService'

class AdminShippingConfigService extends BaseServices {
    basePath = '/api/admin/ShippingConfig'

    getShippingConfig() {
        return this.get(this.basePath, { __skipGlobalLoading: true })
    }

    updateShippingConfig(data) {
        return this.put(this.basePath, data)
    }
}

export const adminShippingConfigService = new AdminShippingConfigService()
