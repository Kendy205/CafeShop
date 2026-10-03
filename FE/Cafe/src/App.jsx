import { Provider } from 'react-redux'
import { Route, Routes, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { store } from './redux/store'
import Loading from './components/loading/Loading'
import ApiErrorModal from './components/error/ApiErrorModal'
import AuthModal from './components/auth/AuthModal'
import RealtimeNotificationHandler from './components/notification/RealtimeNotificationHandler'
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
import ProfilePage from './pages/profile/ProfilePage'
import DashboardAdminPage from './pages/admin/DashboardAdminPage'
import VoucherAdminPage from './pages/admin/voucher/VoucherAdminPage'
import AdminMenuConfigPage from './pages/admin/menu-config/AdminMenuConfigPage'
import AdminProductPage from './pages/admin/products/AdminProductPage'
import AdminOrderPage from './pages/admin/orders/AdminOrderPage'
import AdminUsersPage from './pages/admin/users/AdminUsersPage'
import AdminSettingsPage from './pages/admin/settings/AdminSettingsPage'
import AdminNewsPage from './pages/admin/news/AdminNewsPage'
import NotFoundPage from './pages/error/NotFoundPage'
import NewsListPage from './pages/news/NewsListPage'
import NewsDetailPage from './pages/news/NewsDetailPage'

function App() {
    return (
        <Provider store={store}>
            <RealtimeNotificationHandler />
            <ToastContainer position="top-right" autoClose={5000} />
            <Loading />
            <ApiErrorModal />
            <Routes>
                <Route element={<UserTemplate />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/home" element={<Navigate to="/" replace />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/news" element={<NewsListPage />} />
                    <Route path="/news/:slug" element={<NewsDetailPage />} />
                    <Route path="/menu/:id" element={<ProductDetailPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route element={<ProtectedRoute allowedRoles={CUSTOMER_ROLES} />}>
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/addresses" element={<AddressPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/order-success" element={<OrderSuccessPage />} />
                        <Route path="/orders" element={<OrderHistoryPage />} />
                        <Route path="/vouchers" element={<MyVouchersPage />} />
                    </Route>
                    {/* 404 Catch-all Route for Client */}
                    <Route path="*" element={<NotFoundPage />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={ADMIN_ROLES} />}>
                    <Route path="/admin" element={<AdminTemplate />}>
                        <Route index element={<DashboardAdminPage />} />
                        <Route path="vouchers" element={<VoucherAdminPage />} />
                        <Route path="menu-config" element={<AdminMenuConfigPage />} />
                        <Route path="products" element={<AdminProductPage />} />
                        <Route path="orders" element={<AdminOrderPage />} />
                        <Route path="users" element={<AdminUsersPage />} />
                        <Route path="settings" element={<AdminSettingsPage />} />
                        <Route path="news" element={<AdminNewsPage />} />
                    </Route>
                </Route>
            </Routes>
            <AuthModal />
        </Provider>
    )
}

export default App
