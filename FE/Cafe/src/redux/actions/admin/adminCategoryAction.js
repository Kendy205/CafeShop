import { createAsyncThunk } from '@reduxjs/toolkit'
import { adminCategoryService } from '../../../services/admin/AdminCategoryService'
import { pickErrorMessage, unwrapApi } from '../../../utils/helpers/api'

export const fetchAdminCategories = createAsyncThunk(
    'adminCategory/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminCategoryService.getAllCategories()
            return unwrapApi(response)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi khi tải danh mục'))
        }
    }
)

export const createAdminCategory = createAsyncThunk(
    'adminCategory/create',
    async (data, { rejectWithValue }) => {
        try {
            const response = await adminCategoryService.createCategory(data)
            return unwrapApi(response) // the created category
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi khi tạo danh mục'))
        }
    }
)

export const updateAdminCategory = createAsyncThunk(
    'adminCategory/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await adminCategoryService.updateCategory(id, data)
            return unwrapApi(response) // the updated category
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi khi cập nhật danh mục'))
        }
    }
)

export const deleteAdminCategory = createAsyncThunk(
    'adminCategory/delete',
    async (id, { rejectWithValue }) => {
        try {
            await adminCategoryService.deleteCategory(id)
            return id // return the id to remove from state
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi khi xóa danh mục'))
        }
    }
)
