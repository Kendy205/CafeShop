import { createAsyncThunk } from '@reduxjs/toolkit'
import { adminUserService } from '../../../services/admin/AdminUserService'
import { pickErrorMessage, unwrapApi } from '../../../utils/helpers/api'

export const fetchAdminUsers = createAsyncThunk(
    'adminUser/fetchAdminUsers',
    async (params, { rejectWithValue }) => {
        try {
            const res = await adminUserService.getUsers(params)
            return unwrapApi(res)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Không thể lấy danh sách người dùng'))
        }
    }
)

export const toggleAdminUserStatus = createAsyncThunk(
    'adminUser/toggleAdminUserStatus',
    async (id, { rejectWithValue }) => {
        try {
            const res = await adminUserService.toggleUserStatus(id)
            return {
                id, // ID of the user toggled
                data: unwrapApi(res)
            }
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Không thể thay đổi trạng thái'))
        }
    }
)
