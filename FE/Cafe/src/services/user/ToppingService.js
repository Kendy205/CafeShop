import { BaseServices } from '../BaseService'

export class ToppingService extends BaseServices {
    getAvailable = () => this.get('/api/Topping/available')
}

export const toppingService = new ToppingService()
