import axios from 'axios'
import { DOMAIN, REFRESH_TOKEN, TOKEN } from '../utils/constants/System'
import { resolveRoleFromAuth } from '../utils/auth/authRole'
import { AppToast } from '../components/common/AppNotification'
import { unwrapApi, pickAccessToken, pickRefreshToken } from '../utils/helpers/api'

export const http = axios.create({
    baseURL: DOMAIN,
    headers: {
        'Content-Type': 'application/json',
    },
})

function isPublicAuthPath(url) {
    const u = String(url || '').toLowerCase()
    return (
        u.includes('auth/login') ||
        u.includes('auth/register') ||
        u.includes('auth/refresh-token')
    )
}

// ── Store Injection để tránh Circular Dependency & Dynamic Import overhead ───
let appStore = null

export const injectStore = (store) => {
    appStore = store
}

function dispatchStartLoading() {
    if (appStore) {
        appStore.dispatch({ type: 'ui/startGlobalLoading' })
    }
}

function dispatchStopLoading() {
    if (appStore) {
        appStore.dispatch({ type: 'ui/stopGlobalLoading' })
    }
}

function dispatchLogout() {
    if (appStore) {
        appStore.dispatch({ type: 'auth/logout' })
    }
}

function dispatchHydrateTokens(payload) {
    if (appStore) {
        appStore.dispatch({ type: 'auth/hydrateTokens', payload })
    }
}

function setAuthHeader(headers, token) {
    if (!headers) return
    if (typeof headers.set === 'function') {
        headers.set('Authorization', `Bearer ${token}`)
    } else {
        headers.Authorization = `Bearer ${token}`
    }
}

// ── Request Interceptor (Hoàn toàn đồng bộ, không block luồng bằng await) ────
http.interceptors.request.use((config) => {
    if (!config.__skipGlobalLoading) {
        config.__globalLoadingCountered = true
        dispatchStartLoading()
    }

    if (!isPublicAuthPath(config.url)) {
        const token = localStorage.getItem(TOKEN)
        if (token) {
            setAuthHeader(config.headers, token)
        }
    }
    return config
})

// ── Queue & Mutex cho Refresh Token ──────────────────────────────────────────
let isRefreshing = false
let failedQueue = []

function processQueue(error, token) {
    failedQueue.forEach((p) => {
        if (error) p.reject(error)
        else p.resolve(token)
    })
    failedQueue = []
}

// ── Response Interceptor ─────────────────────────────────────────────────────
http.interceptors.response.use(
    (response) => {
        if (response?.config?.__globalLoadingCountered) {
            dispatchStopLoading()
        }
        return response
    },
    async (error) => {
        const originalRequest = error.config
        const status = error.response?.status
        const shouldStopLoading = Boolean(originalRequest?.__globalLoadingCountered)
        
        // // ── Xử lý Global Api Error ──
        if (status && status >= 400 && status !== 401) {
            const body = error.response?.data
            const msg = body?.Message || body?.message || error.message || 'Lỗi không xác định từ máy chủ'
            
            // Thay vì show popup to đùng, ta hiển thị dạng Toast
            AppToast.error(msg)
        }

        if (status !== 401 || !originalRequest) {
            if (shouldStopLoading) dispatchStopLoading()
            return Promise.reject(error)
        }

        if (isPublicAuthPath(originalRequest.url) || originalRequest.__skipRefresh) {
            if (shouldStopLoading) dispatchStopLoading()
            return Promise.reject(error)
        }

        if (originalRequest._retry) {
            dispatchLogout()
            if (shouldStopLoading) dispatchStopLoading()
            return Promise.reject(error)
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject })
            })
                .then((token) => {
                    setAuthHeader(originalRequest.headers, token)
                    originalRequest.__skipGlobalLoading = true
                    originalRequest.__globalLoadingCountered = false
                    originalRequest._retry = true
                    return http(originalRequest).finally(() => {
                        if (shouldStopLoading) dispatchStopLoading()
                    })
                })
                .catch((err) => {
                    if (shouldStopLoading) dispatchStopLoading()
                    return Promise.reject(err)
                })
        }

        const accessToken = localStorage.getItem(TOKEN)
        const refreshToken = localStorage.getItem(REFRESH_TOKEN)

        if (!refreshToken) {
            dispatchLogout()
            if (shouldStopLoading) dispatchStopLoading()
            return Promise.reject(error)
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
            const res = await axios.post(
                `${DOMAIN}/api/Auth/refresh-token`,
                {
                    refreshToken,
                    ...(accessToken ? { accessToken } : {}),
                },
                { headers: { 'Content-Type': 'application/json' } }
            )

            const payload = unwrapApi(res)
            const newAccess = pickAccessToken(payload)
            if (!newAccess) {
                throw new Error('Không nhận được access token mới từ máy chủ')
            }

            const newRefresh = pickRefreshToken(payload) ?? refreshToken
            const newRole = resolveRoleFromAuth(payload, newAccess)

            dispatchHydrateTokens({
                accessToken: newAccess,
                refreshToken: newRefresh,
                ...(newRole != null ? { role: newRole } : {}),
            })

            processQueue(null, newAccess)
            isRefreshing = false

            setAuthHeader(originalRequest.headers, newAccess)
            originalRequest.__skipGlobalLoading = true
            originalRequest.__globalLoadingCountered = false
            originalRequest._retry = true

            return http(originalRequest).finally(() => {
                if (shouldStopLoading) dispatchStopLoading()
            })
        } catch (refreshErr) {
            processQueue(refreshErr, null)
            isRefreshing = false
            dispatchLogout()
            const msg =
                refreshErr?.response?.data?.message ||
                refreshErr?.response?.data?.Message ||
                'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
            AppToast.warning(msg)
            if (shouldStopLoading) dispatchStopLoading()
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

