import { BaseServices } from '../BaseService'

export class CartService extends BaseServices {
    getCart = () => this.get('/api/Cart')

    addToCart = (body) => this.post('/api/Cart/add', body)

    updateQuantity = (body) =>
        this.put('/api/Cart/update', body, { __skipGlobalLoading: true })

    removeItem = (cartItemId) => this.delete(`/api/Cart/remove/${cartItemId}`)

    clearCart = () => this.delete('/api/Cart/clear')
}

export const cartService = new CartService()
