import { BaseServices } from '../BaseService'

export class ToppingService extends BaseServices {
    getAvailable = () => this.get('/api/Topping')
}

export const toppingService = new ToppingService()
