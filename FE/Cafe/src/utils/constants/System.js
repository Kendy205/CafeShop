export const DOMAIN = import.meta.env.VITE_API_URL || 'https://localhost:7198'

export const TOKEN = 'accessToken'
export const REFRESH_TOKEN = 'refreshToken'
export const USER_ROLE = 'userRole'
export const USER_INFO = 'userInfo'

/** Role theo API (login trả `"Customer"`; admin quản lý voucher) */
export const ROLE_CUSTOMER = 'CUSTOMER'
export const ROLE_USER = 'USER'
export const ROLE_ADMIN = 'ADMIN'
export const ROLE_ADMINISTRATOR = 'ADMINISTRATOR'

export const ADMIN_ROLES = [ROLE_ADMIN, ROLE_ADMINISTRATOR]
export const CUSTOMER_ROLES = [ROLE_CUSTOMER, ROLE_USER, ROLE_ADMIN, ROLE_ADMINISTRATOR]
