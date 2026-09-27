import { createAsyncThunk } from '@reduxjs/toolkit'
import { adminNewsService } from '../../../services/admin/AdminNewsService'
import { pickErrorMessage, unwrapApi } from '../../../utils/helpers/api'

export const fetchAdminNews = createAsyncThunk(
    'adminNews/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const response = await adminNewsService.getManagementNews(params)
            return unwrapApi(response) // { items: [], total: ... }
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi khi tải tin tức'))
        }
    }
)

export const createAdminNews = createAsyncThunk(
    'adminNews/create',
    async (data, { rejectWithValue }) => {
        try {
            const response = await adminNewsService.createNews(data)
            return unwrapApi(response)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi khi tạo tin tức'))
        }
    }
)

export const updateAdminNews = createAsyncThunk(
    'adminNews/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await adminNewsService.updateNews(id, data)
            return unwrapApi(response)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi khi cập nhật tin tức'))
        }
    }
)

export const deleteAdminNews = createAsyncThunk(
    'adminNews/delete',
    async (id, { rejectWithValue }) => {
        try {
            await adminNewsService.deleteNews(id)
            return id
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi khi xóa tin tức'))
        }
    }
)
