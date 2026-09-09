import axios from 'axios'
import { DOMAIN, REFRESH_TOKEN, TOKEN } from '../utils/constants/System'
import { resolveRoleFromAuth } from '../utils/auth/authRole'
import { startGlobalLoading, stopGlobalLoading } from '../redux/slices/uiSlice'

export const http = axios.create({
    baseURL: DOMAIN,
    headers: {
        'Content-Type': 'application/json',
    },
})

function isPublicAuthPath(url) {
    const u = String(url || '')
    return (
        u.includes('Auth/login') ||
        u.includes('Auth/register') ||
        u.includes('Auth/refresh')
    )
}

let storePromise = null
function getStore() {
    if (!storePromise) {
        storePromise = import('../redux/store').then((m) => m.store)
    }
    return storePromise
}

async function dispatchStartLoading() {
    const store = await getStore()
    store.dispatch(startGlobalLoading())
}

async function dispatchStopLoading() {
    const store = await getStore()
    store.dispatch(stopGlobalLoading())
}

http.interceptors.request.use(async (config) => {
    if (!config.__skipGlobalLoading) {
        config.__globalLoadingCountered = true
        await dispatchStartLoading()
    }

    if (!isPublicAuthPath(config.url)) {
        const token = localStorage.getItem(TOKEN)
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
    }
    return config
})

let isRefreshing = false
let failedQueue = []

function processQueue(error, token) {
    failedQueue.forEach((p) => {
        if (error) p.reject(error)
        else p.resolve(token)
    })
    failedQueue = []
}

async function dispatchLogout() {
    const { store } = await import('../redux/store')
    const { logout } = await import('../redux/slices/authSlice')
    store.dispatch(logout())
}

http.interceptors.response.use(
    async (response) => {
        if (response?.config?.__globalLoadingCountered) {
            await dispatchStopLoading()
        }
        return response
    },
    async (error) => {
        const originalRequest = error.config
        const status = error.response?.status
        const shouldStopLoading = Boolean(originalRequest?.__globalLoadingCountered)

        if (status !== 401 || !originalRequest) {
            if (shouldStopLoading) await dispatchStopLoading()
            return Promise.reject(error)
        }

        if (isPublicAuthPath(originalRequest.url) || originalRequest.__skipRefresh) {
            if (shouldStopLoading) await dispatchStopLoading()
            return Promise.reject(error)
        }

        if (originalRequest._retry) {
            await dispatchLogout()
            if (shouldStopLoading) await dispatchStopLoading()
            return Promise.reject(error)
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject })
            })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    originalRequest.__skipGlobalLoading = true
                    originalRequest.__globalLoadingCountered = false
                    originalRequest._retry = true
                    return http(originalRequest).finally(async () => {
                        if (shouldStopLoading) await dispatchStopLoading()
                    })
                })
                .catch(async (err) => {
                    if (shouldStopLoading) await dispatchStopLoading()
                    return Promise.reject(err)
                })
        }

        const accessToken = localStorage.getItem(TOKEN)
        const refreshToken = localStorage.getItem(REFRESH_TOKEN)

        if (!accessToken || !refreshToken) {
            await dispatchLogout()
            if (shouldStopLoading) await dispatchStopLoading()
            return Promise.reject(error)
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
            const { data: body } = await axios.post(
                `${DOMAIN}/api/Auth/refresh`,
                { accessToken, refreshToken, token: accessToken },
                { headers: { 'Content-Type': 'application/json' } }
            )

            const payload = body?.data ?? body
            const newAccess = payload?.token ?? payload?.accessToken
            if (body?.success === false || !newAccess) {
                throw new Error(body?.message || 'Làm mới phiên đăng nhập thất bại')
            }

            const newRefresh = payload?.refreshToken ?? refreshToken
            const newRole = resolveRoleFromAuth(payload, newAccess)

            const { store } = await import('../redux/store')
            const { hydrateTokens } = await import('../redux/slices/authSlice')
            store.dispatch(
                hydrateTokens({
                    accessToken: newAccess,
                    refreshToken: newRefresh,
                    ...(newRole != null ? { role: newRole } : {}),
                })
            )

            processQueue(null, newAccess)
            isRefreshing = false

            originalRequest.headers.Authorization = `Bearer ${newAccess}`
            originalRequest.__skipGlobalLoading = true
            originalRequest.__globalLoadingCountered = false
            originalRequest._retry = true

            return http(originalRequest).finally(async () => {
                if (shouldStopLoading) await dispatchStopLoading()
            })
        } catch (refreshErr) {
            processQueue(refreshErr, null)
            isRefreshing = false
            await dispatchLogout()
            if (shouldStopLoading) await dispatchStopLoading()
            return Promise.reject(refreshErr)
        }
    }
)

export class BaseServices {
    get = (url, config = {}) => http.get(url, config)

    post = (url, model, config = {}) => http.post(url, model, config)

    put = (url, model, config = {}) => http.put(url, model, config)

    patch = (url, model, config = {}) => http.patch(url, model, config)

    delete = (url, config = {}) => http.delete(url, config)
}

export const baseServices = new BaseServices()
