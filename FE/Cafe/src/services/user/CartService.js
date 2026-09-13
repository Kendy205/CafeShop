import { BaseServices } from '../BaseService'

export class CartService extends BaseServices {
    getCart = () => this.get('/api/Cart')

    addToCart = (body) => this.post('/api/Cart/add', body)

    updateQuantity = (cartItemIdOrObj, quantityMaybe) => {
        let cartItemId = cartItemIdOrObj
        let quantity = quantityMaybe
        if (typeof cartItemIdOrObj === 'object' && cartItemIdOrObj !== null) {
            cartItemId = cartItemIdOrObj.cartItemId
            quantity = cartItemIdOrObj.quantity
        }
        return this.put(`/api/Cart/update-quantity/${cartItemId}?quantity=${quantity}`, null, {
            __skipGlobalLoading: true,
        })
    }

    removeItem = (cartItemId) => this.delete(`/api/Cart/remove/${cartItemId}`)

    clearCart = () => this.delete('/api/Cart/clear')
}

export const cartService = new CartService()
