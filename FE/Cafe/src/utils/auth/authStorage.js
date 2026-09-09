import { REFRESH_TOKEN, TOKEN, USER_INFO, USER_ROLE } from '../constants/System'

export function readAuthFromStorage() {
    try {
        let user = null
        const rawUser = localStorage.getItem(USER_INFO)
        if (rawUser) {
            try {
                user = JSON.parse(rawUser)
            } catch {
                user = null
            }
        }
        return {
            accessToken: localStorage.getItem(TOKEN),
            refreshToken: localStorage.getItem(REFRESH_TOKEN),
            role: localStorage.getItem(USER_ROLE),
            user,
        }
    } catch {
        return {
            accessToken: null,
            refreshToken: null,
            role: null,
            user: null,
        }
    }
}

export function writeAuthToStorage(partial) {
    try {
        if ('accessToken' in partial) {
            if (partial.accessToken) localStorage.setItem(TOKEN, partial.accessToken)
            else localStorage.removeItem(TOKEN)
        }
        if ('refreshToken' in partial) {
            if (partial.refreshToken) localStorage.setItem(REFRESH_TOKEN, partial.refreshToken)
            else localStorage.removeItem(REFRESH_TOKEN)
        }
        if ('role' in partial) {
            const r = partial.role
            if (r == null || r === '') localStorage.removeItem(USER_ROLE)
            else localStorage.setItem(USER_ROLE, String(r))
        }
        if ('user' in partial) {
            if (partial.user) localStorage.setItem(USER_INFO, JSON.stringify(partial.user))
            else localStorage.removeItem(USER_INFO)
        }
    } catch {
        /* private mode / quota */
    }
}

export function saveFullAuth({ accessToken, refreshToken, role, user }) {
    writeAuthToStorage({ accessToken, refreshToken, role, user })
}

export function clearAuthStorage() {
    try {
        localStorage.removeItem(TOKEN)
        localStorage.removeItem(REFRESH_TOKEN)
        localStorage.removeItem(USER_ROLE)
        localStorage.removeItem(USER_INFO)
    } catch {
        /* ignore */
    }
}
