import { createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '../../services/user/AuthService'
import { resolveRoleFromAuth } from '../../utils/auth/authRole'
import {
    pickAccessToken,
    pickErrorMessage,
    pickRefreshToken,
    unwrapApi,
} from '../../utils/helpers/api'

function mapAuthPayload(payload) {
    const accessToken = pickAccessToken(payload)
    return {
        accessToken,
        refreshToken: pickRefreshToken(payload),
        role: resolveRoleFromAuth(payload, accessToken),
        user: {
            userId: payload?.userId ?? payload?.UserId ?? null,
            fullName: payload?.fullName ?? payload?.FullName ?? null,
            username: payload?.username ?? payload?.Username ?? null,
            email: payload?.email ?? payload?.Email ?? null,
        },
        message: payload?.message || payload?.Message,
    }
}

export const login = createAsyncThunk(
    'auth/login',
    async ({ username, password }, { rejectWithValue }) => {
        try {
            const res = await authService.login({ username, password })
            const payload = unwrapApi(res)
            const mapped = mapAuthPayload(payload)
            if (!mapped.accessToken) {
                return rejectWithValue('Không nhận được token từ máy chủ')
            }
            return mapped
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Đăng nhập thất bại'))
        }
    }
)

export const register = createAsyncThunk(
    'auth/register',
    async (body, { rejectWithValue }) => {
        try {
            const res = await authService.register(body)
            const payload = unwrapApi(res)
            return {
                ...mapAuthPayload(payload || {}),
                message: payload?.message || 'Đăng ký thành công, vui lòng đăng nhập',
            }
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Đăng ký thất bại'))
        }
    }
)

export const refreshAuth = createAsyncThunk(
    'auth/refreshAuth',
    async (_, { getState, rejectWithValue }) => {
        const { accessToken, refreshToken } = getState().auth
        if (!refreshToken) {
            return rejectWithValue('Phiên đăng nhập đã hết hạn')
        }
        try {
            const res = await authService.refreshTokens({
                accessToken,
                refreshToken,
                token: accessToken,
            })
            const payload = unwrapApi(res)
            const mapped = mapAuthPayload(payload)
            if (!mapped.accessToken) {
                return rejectWithValue('Không nhận được token mới')
            }
            return mapped
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Không thể làm mới phiên đăng nhập'))
        }
    }
)
