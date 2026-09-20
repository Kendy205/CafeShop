import { createAsyncThunk } from '@reduxjs/toolkit'
import { adminSizeService } from '../../../services/admin/AdminSizeService'
import { pickErrorMessage, unwrapApi } from '../../../utils/helpers/api'

export const fetchAdminSizes = createAsyncThunk(
    'adminSize/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminSizeService.getAllSizes()
            return unwrapApi(response)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi khi tải danh sách kích cỡ'))
        }
    }
)

export const createAdminSize = createAsyncThunk(
    'adminSize/create',
    async (data, { rejectWithValue }) => {
        try {
            const response = await adminSizeService.createSize(data)
            return unwrapApi(response) 
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi khi tạo kích cỡ'))
        }
    }
)

export const updateAdminSize = createAsyncThunk(
    'adminSize/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await adminSizeService.updateSize(id, data)
            return unwrapApi(response) 
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi khi cập nhật kích cỡ'))
        }
    }
)

export const deleteAdminSize = createAsyncThunk(
    'adminSize/delete',
    async (id, { rejectWithValue }) => {
        try {
            await adminSizeService.deleteSize(id)
            return id
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi khi xóa kích cỡ'))
        }
    }
)
