import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import productReducer from './slices/user/productSlice'
import addressReducer from './slices/user/addressSlice'
import orderReducer from './slices/user/orderSlice'
import voucherReducer from './slices/user/voucherSlice'
import cartReducer from './slices/user/cartSlice'
import sizeReducer from './slices/user/sizeSlice'
import toppingReducer from './slices/user/toppingSlice'
import userReducer from './slices/user/userSlice'
import adminVoucherReducer from './slices/admin/adminVoucherSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        ui: uiReducer,
        user: userReducer,
        product: productReducer,
        address: addressReducer,
        order: orderReducer,
        voucher: voucherReducer,
        cart: cartReducer,
        size: sizeReducer,
        topping: toppingReducer,
        adminVoucher: adminVoucherReducer,
    },
})
