import { createAsyncThunk } from '@reduxjs/toolkit'
import { userService } from '../../../services/user/UserService'
import { pickErrorMessage, unwrapApi } from '../../../utils/helpers/api'
import { updateUserProfile } from '../../slices/authSlice'

// 1. Lấy thông tin cá nhân
export const getProfile = createAsyncThunk(
    'user/getProfile',
    async (_, { rejectWithValue }) => {
        try {
            const res = await userService.getProfile()
            return unwrapApi(res)
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Không lấy được thông tin người dùng'))
        }
    }
)

// 2. Cập nhật hồ sơ & ảnh đại diện (FormData)
export const updateProfile = createAsyncThunk(
    'user/updateProfile',
    async (formData, { dispatch, rejectWithValue }) => {
        try {
            const res = await userService.updateProfile(formData)
            const updated = unwrapApi(res)
            // Đồng bộ sang authSlice để cập nhật avatar và tên tức thì trên Header
            if (updated) {
                dispatch(updateUserProfile(updated))
            }
            return updated
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Cập nhật hồ sơ thất bại'))
        }
    }
)

// 3. Đổi mật khẩu
export const changePassword = createAsyncThunk(
    'user/changePassword',
    async (body, { rejectWithValue }) => {
        try {
            const res = await userService.changePassword(body)
            return unwrapApi(res)
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Đổi mật khẩu thất bại'))
        }
    }
)
