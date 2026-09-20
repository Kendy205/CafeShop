import { createAsyncThunk } from '@reduxjs/toolkit'
import { categoryService } from '../../../services/user/CategoryService'
import { asList, pickErrorMessage, unwrapApi } from '../../../utils/helpers/api'

/**
 * Lấy toàn bộ danh sách danh mục (GET /api/Category)
 */
export const getCategories = createAsyncThunk(
    'category/getCategories',
    async (_, { rejectWithValue }) => {
        try {
            const res = await categoryService.getCategories()
            const data = unwrapApi(res)
            return asList(data)
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Không tải được danh mục'))
        }
    }
)

/**
 * Lấy thông tin chi tiết một danh mục theo ID (GET /api/Category/{id})
 */
export const getCategoryDetail = createAsyncThunk(
    'category/getCategoryDetail',
    async (id, { rejectWithValue }) => {
        try {
            const res = await categoryService.getCategoryById(id)
            return unwrapApi(res)
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Không tải được chi tiết danh mục'))
        }
    }
)

