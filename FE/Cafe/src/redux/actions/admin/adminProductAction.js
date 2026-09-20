import { createAsyncThunk } from '@reduxjs/toolkit'
import { adminProductService } from '../../../services/admin/AdminProductService'
import { pickErrorMessage, unwrapApi } from '../../../utils/helpers/api'

export const fetchAdminProducts = createAsyncThunk(
    'adminProduct/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const response = await adminProductService.getProducts(params)
            return unwrapApi(response)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi khi tải danh sách sản phẩm'))
        }
    }
)

export const fetchAdminProductDetail = createAsyncThunk(
    'adminProduct/fetchDetail',
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminProductService.getProductById(id)
            return unwrapApi(response)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi khi tải chi tiết sản phẩm'))
        }
    }
)

export const createAdminProduct = createAsyncThunk(
    'adminProduct/create',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await adminProductService.createProduct(formData)
            return unwrapApi(response) 
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi khi tạo sản phẩm'))
        }
    }
)

export const updateAdminProduct = createAsyncThunk(
    'adminProduct/update',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const response = await adminProductService.updateProduct(id, formData)
            return unwrapApi(response) 
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi khi cập nhật sản phẩm'))
        }
    }
)

export const toggleProductAvailability = createAsyncThunk(
    'adminProduct/toggleAvailability',
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminProductService.toggleAvailability(id)
            return { id, data: unwrapApi(response) }
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi khi đổi trạng thái bán sản phẩm'))
        }
    }
)

export const deleteAdminProduct = createAsyncThunk(
    'adminProduct/delete',
    async (id, { rejectWithValue }) => {
        try {
            await adminProductService.deleteProduct(id)
            return id // soft delete successful
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi khi xóa sản phẩm'))
        }
    }
)
