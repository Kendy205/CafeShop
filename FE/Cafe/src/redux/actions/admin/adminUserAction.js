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

export const fetchAdminUserById = createAsyncThunk(
    'adminUser/fetchAdminUserById',
    async (id, { rejectWithValue }) => {
        try {
            const res = await adminUserService.getUserById(id)
            return unwrapApi(res)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Không thể lấy chi tiết người dùng'))
        }
    }
)

export const createAdminUser = createAsyncThunk(
    'adminUser/createAdminUser',
    async (data, { rejectWithValue }) => {
        try {
            const res = await adminUserService.createUser(data)
            return unwrapApi(res)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Không thể tạo tài khoản'))
        }
    }
)

export const updateAdminUserInfo = createAsyncThunk(
    'adminUser/updateAdminUserInfo',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const res = await adminUserService.updateUserInfo(id, data)
            return unwrapApi(res)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Không thể cập nhật thông tin'))
        }
    }
)

export const assignAdminRoles = createAsyncThunk(
    'adminUser/assignAdminRoles',
    async ({ id, roleIds }, { rejectWithValue }) => {
        try {
            await adminUserService.assignRoles(id, { roleIds })
            return { id, roleIds } // To trigger refetch if needed
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Không thể phân quyền'))
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
