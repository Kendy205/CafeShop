import { Provider } from 'react-redux'
import { Route, Routes } from 'react-router-dom'
import { store } from './redux/store'
import Loading from './components/loading/Loading'
import UserTemplate from './templates/UserTemplate'
import AdminTemplate from './templates/AdminTemplate'
import ProtectedRoute from './utils/route/ProtectedRoute'
import { ADMIN_ROLES, CUSTOMER_ROLES } from './utils/constants/System'
import HomePage from './pages/home/HomePage'
import SearchPage from './pages/search/SearchPage'
import ProductDetailPage from './pages/product/ProductDetailPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import CartPage from './pages/cart/CartPage'
import CheckoutPage from './pages/checkout/CheckoutPage'
import AddressPage from './pages/address/AddressPage'
import OrderSuccessPage from './pages/order/OrderSuccessPage'
import OrderHistoryPage from './pages/order/OrderHistoryPage'
import MyVouchersPage from './pages/voucher/MyVouchersPage'
import DashboardAdminPage from './pages/admin/DashboardAdminPage'
import VoucherAdminPage from './pages/admin/voucher/VoucherAdminPage'

function App() {
    return (
        <Provider store={store}>
            <Loading />
            <Routes>
                <Route element={<UserTemplate />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/menu/:id" element={<ProductDetailPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route element={<ProtectedRoute allowedRoles={CUSTOMER_ROLES} />}>
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/addresses" element={<AddressPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/order-success" element={<OrderSuccessPage />} />
                        <Route path="/orders" element={<OrderHistoryPage />} />
                        <Route path="/vouchers" element={<MyVouchersPage />} />
                    </Route>
                </Route>

                <Route element={<ProtectedRoute allowedRoles={ADMIN_ROLES} />}>
                    <Route path="/admin" element={<AdminTemplate />}>
                        <Route index element={<DashboardAdminPage />} />
                        <Route path="vouchers" element={<VoucherAdminPage />} />
                    </Route>
                </Route>
            </Routes>
        </Provider>
    )
}

export default App
