export const DOMAIN = import.meta.env.VITE_API_URL

export const TOKEN = 'accessToken'
export const REFRESH_TOKEN = 'refreshToken'
export const USER_ROLE = 'userRole'
export const USER_INFO = 'userInfo'

/** Role theo backend SystemRole */
export const ROLE_USER = 'USER'
export const ROLE_STAFF = 'STAFF'
export const ROLE_ADMIN = 'ADMIN'

export const ADMIN_ROLES = [ROLE_ADMIN]
export const STAFF_ROLES = [ROLE_STAFF, ROLE_ADMIN]
export const CUSTOMER_ROLES = [ROLE_USER, ROLE_STAFF, ROLE_ADMIN]
