import { BaseServices } from '../BaseService'

export class SizeService extends BaseServices {
    getSizes = () => this.get('/api/Size')
}

export const sizeService = new SizeService()
