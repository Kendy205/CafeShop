import { BaseServices } from '../BaseService'

export class SizeService extends BaseServices {
    getSizes = (config = {}) => this.get('/api/Size', { __skipGlobalLoading: true, ...config })
}

export const sizeService = new SizeService()
