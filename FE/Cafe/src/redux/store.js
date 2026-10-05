import { configureStore, combineReducers } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import storeProfileReducer from './slices/storeProfileSlice'
import productReducer from './slices/user/productSlice'
import addressReducer from './slices/user/addressSlice'
import orderReducer from './slices/user/orderSlice'
import voucherReducer from './slices/user/voucherSlice'
import cartReducer from './slices/user/cartSlice'
import sizeReducer from './slices/user/sizeSlice'
import toppingReducer from './slices/user/toppingSlice'
import categoryReducer from './slices/user/categorySlice'
import userReducer from './slices/user/userSlice'
import newsReducer from './slices/user/newsSlice'
import adminVoucherReducer from './slices/admin/adminVoucherSlice'
import adminCategoryReducer from './slices/admin/adminCategorySlice'
import adminSizeReducer from './slices/admin/adminSizeSlice'
import adminToppingReducer from './slices/admin/adminToppingSlice'
import adminProductReducer from './slices/admin/adminProductSlice'
import adminUserReducer from './slices/admin/adminUserSlice'
import adminOrderReducer from './slices/admin/adminOrderSlice'
import adminDashboardReducer from './slices/admin/adminDashboardSlice'
import adminShippingConfigReducer from './slices/admin/adminShippingConfigSlice'
import adminNewsReducer from './slices/admin/adminNewsSlice'
import adminRoleReducer from './slices/admin/adminRoleSlice'

const appReducer = combineReducers({
    auth: authReducer,
    ui: uiReducer,
    storeProfile: storeProfileReducer,
})

const userAppReducer = combineReducers({
    profile: userReducer,
    product: productReducer,
    address: addressReducer,
    order: orderReducer,
    voucher: voucherReducer,
    cart: cartReducer,
    size: sizeReducer,
    topping: toppingReducer,
    category: categoryReducer,
    news: newsReducer,
})

const adminAppReducer = combineReducers({
    voucher: adminVoucherReducer,
    category: adminCategoryReducer,
    size: adminSizeReducer,
    topping: adminToppingReducer,
    product: adminProductReducer,
    user: adminUserReducer,
    order: adminOrderReducer,
    dashboard: adminDashboardReducer,
    shippingConfig: adminShippingConfigReducer,
    news: adminNewsReducer,
    role: adminRoleReducer,
})

export const store = configureStore({
    reducer: {
        app: appReducer,
        user: userAppReducer,
        admin: adminAppReducer,
    },
})
