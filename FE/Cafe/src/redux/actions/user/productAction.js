import { createAsyncThunk } from '@reduxjs/toolkit'
import { productService } from '../../../services/user/ProductService'
import { pickErrorMessage, unwrapApi } from '../../../utils/helpers/api'

export const getProducts = createAsyncThunk(
    'product/getProducts',
    async (params, { rejectWithValue }) => {
        try {
            const res = await productService.getProducts(params)
            return unwrapApi(res)
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Không tải được danh sách món'))
        }
    }
)

export const getProductDetail = createAsyncThunk(
    'product/getProductDetail',
    async (id, { rejectWithValue }) => {
        try {
            const res = await productService.getProductById(id)
            return unwrapApi(res)
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Không tải được chi tiết món'))
        }
    }
)

// Re-export getCategories từ categoryAction để đảm bảo tương thích ngược
export { getCategories } from './categoryAction'
