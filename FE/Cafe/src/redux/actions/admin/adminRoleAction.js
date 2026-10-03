import { createAsyncThunk } from '@reduxjs/toolkit'
import { adminRoleService } from '../../../services/admin/AdminRoleService'
import { pickErrorMessage, unwrapApi } from '../../../utils/helpers/api'

export const fetchPermissions = createAsyncThunk(
    'adminRole/fetchPermissions',
    async (_, { rejectWithValue }) => {
        try {
            const res = await adminRoleService.getPermissions()
            return unwrapApi(res)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Không thể lấy danh sách quyền hệ thống'))
        }
    }
)

export const fetchRoles = createAsyncThunk(
    'adminRole/fetchRoles',
    async (_, { rejectWithValue }) => {
        try {
            const res = await adminRoleService.getRoles()
            return unwrapApi(res)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Không thể lấy danh sách vai trò'))
        }
    }
)

export const fetchRoleById = createAsyncThunk(
    'adminRole/fetchRoleById',
    async (id, { rejectWithValue }) => {
        try {
            const res = await adminRoleService.getRoleById(id)
            return unwrapApi(res)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Không thể lấy chi tiết vai trò'))
        }
    }
)

export const createRole = createAsyncThunk(
    'adminRole/createRole',
    async (data, { rejectWithValue }) => {
        try {
            const res = await adminRoleService.createRole(data)
            return unwrapApi(res)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Không thể tạo mới vai trò'))
        }
    }
)

export const updateRole = createAsyncThunk(
    'adminRole/updateRole',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const res = await adminRoleService.updateRole(id, data)
            return unwrapApi(res)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Không thể cập nhật vai trò'))
        }
    }
)

export const deleteRole = createAsyncThunk(
    'adminRole/deleteRole',
    async (id, { rejectWithValue }) => {
        try {
            await adminRoleService.deleteRole(id)
            return id
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Không thể xóa vai trò'))
        }
    }
)
