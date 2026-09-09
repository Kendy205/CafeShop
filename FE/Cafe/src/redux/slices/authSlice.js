import { createSlice } from '@reduxjs/toolkit'
import { login, refreshAuth, register } from '../actions/authAction'
import {
    clearAuthStorage,
    readAuthFromStorage,
    saveFullAuth,
    writeAuthToStorage,
} from '../../utils/auth/authStorage'

const stored = readAuthFromStorage()

const initialState = {
    accessToken: stored.accessToken,
    refreshToken: stored.refreshToken,
    role: stored.role,
    user: stored.user,
    isAuthenticated: Boolean(stored.accessToken),
    error: null,
    submitting: false,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.accessToken = null
            state.refreshToken = null
            state.role = null
            state.user = null
            state.isAuthenticated = false
            state.error = null
            state.submitting = false
            clearAuthStorage()
        },
        clearAuthError: (state) => {
            state.error = null
        },
        hydrateTokens: (state, action) => {
            const { accessToken, refreshToken, role, user } = action.payload
            state.accessToken = accessToken
            state.refreshToken = refreshToken
            state.isAuthenticated = Boolean(accessToken)
            const patch = { accessToken, refreshToken }
            if (role !== undefined) {
                state.role = role ?? null
                patch.role = role ?? null
            }
            if (user !== undefined) {
                state.user = user
                patch.user = user
            }
            writeAuthToStorage(patch)
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.error = null
                state.submitting = true
            })
            .addCase(login.fulfilled, (state, action) => {
                state.submitting = false
                state.accessToken = action.payload.accessToken
                state.refreshToken = action.payload.refreshToken
                state.role = action.payload.role ?? null
                state.user = action.payload.user ?? null
                state.isAuthenticated = true
                saveFullAuth({
                    accessToken: action.payload.accessToken,
                    refreshToken: action.payload.refreshToken,
                    role: state.role,
                    user: state.user,
                })
            })
            .addCase(login.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload ?? 'Đăng nhập thất bại'
            })
            .addCase(register.pending, (state) => {
                state.error = null
                state.submitting = true
            })
            .addCase(register.fulfilled, (state, action) => {
                state.submitting = false
                state.error = null
                const accessToken = action.payload.accessToken ?? null
                if (accessToken) {
                    state.accessToken = accessToken
                    state.refreshToken = action.payload.refreshToken ?? null
                    state.role = action.payload.role ?? null
                    state.user = action.payload.user ?? null
                    state.isAuthenticated = true
                    saveFullAuth({
                        accessToken,
                        refreshToken: state.refreshToken,
                        role: state.role,
                        user: state.user,
                    })
                }
            })
            .addCase(register.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload ?? 'Đăng ký thất bại'
            })
            .addCase(refreshAuth.fulfilled, (state, action) => {
                state.accessToken = action.payload.accessToken
                state.refreshToken = action.payload.refreshToken
                state.isAuthenticated = true
                writeAuthToStorage({
                    accessToken: action.payload.accessToken,
                    refreshToken: action.payload.refreshToken,
                })
                if (action.payload.role != null) {
                    state.role = action.payload.role
                    writeAuthToStorage({ role: action.payload.role })
                }
            })
            .addCase(refreshAuth.rejected, (state) => {
                state.accessToken = null
                state.refreshToken = null
                state.role = null
                state.user = null
                state.isAuthenticated = false
                clearAuthStorage()
            })
    },
})

export const { logout, clearAuthError, hydrateTokens } = authSlice.actions
export default authSlice.reducer
