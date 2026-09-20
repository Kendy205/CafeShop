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
import categoryReducer from './slices/user/categorySlice'
import userReducer from './slices/user/userSlice'
import adminVoucherReducer from './slices/admin/adminVoucherSlice'
import adminCategoryReducer from './slices/admin/adminCategorySlice'
import adminSizeReducer from './slices/admin/adminSizeSlice'
import adminToppingReducer from './slices/admin/adminToppingSlice'
import adminProductReducer from './slices/admin/adminProductSlice'
import adminUserReducer from './slices/admin/adminUserSlice'
import adminOrderReducer from './slices/admin/adminOrderSlice'
import adminDashboardReducer from './slices/admin/adminDashboardSlice'

export const store = configureStore({
    reducer: {
        //Public User Slices
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
        category: categoryReducer,
        //Admin Slices
        adminVoucher: adminVoucherReducer,
        adminCategory: adminCategoryReducer,
        adminSize: adminSizeReducer,
        adminTopping: adminToppingReducer,
        adminProduct: adminProductReducer,
        adminUser: adminUserReducer,
        adminOrder: adminOrderReducer,
        adminDashboard: adminDashboardReducer,
    },
})
