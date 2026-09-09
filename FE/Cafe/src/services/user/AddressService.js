import { BaseServices } from '../BaseService'

export class AddressService extends BaseServices {
    getAddresses = () => this.get('/api/Address')

    createAddress = (body) => this.post('/api/Address', body)

    updateAddress = (id, body) => this.put(`/api/Address/${id}`, body)

    deleteAddress = (id) => this.delete(`/api/Address/${id}`)

    setDefaultAddress = (id) => this.patch(`/api/Address/${id}/default`)
}

export const addressService = new AddressService()
