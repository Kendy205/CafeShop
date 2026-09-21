import { BaseServices } from '../BaseService'

export class ToppingService extends BaseServices {
    getAvailable = (config = {}) => this.get('/api/Topping', { __skipGlobalLoading: true, ...config })
}

export const toppingService = new ToppingService()
