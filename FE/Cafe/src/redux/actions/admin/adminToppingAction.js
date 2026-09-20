import { createAsyncThunk } from '@reduxjs/toolkit'
import { adminToppingService } from '../../../services/admin/AdminToppingService'
import { pickErrorMessage, unwrapApi } from '../../../utils/helpers/api'

export const fetchAdminToppings = createAsyncThunk(
    'adminTopping/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminToppingService.getAllToppings()
            return unwrapApi(response)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi khi tải danh sách topping'))
        }
    }
)

export const createAdminTopping = createAsyncThunk(
    'adminTopping/create',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await adminToppingService.createTopping(formData)
            return unwrapApi(response) 
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi khi tạo topping'))
        }
    }
)

export const updateAdminTopping = createAsyncThunk(
    'adminTopping/update',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const response = await adminToppingService.updateTopping(id, formData)
            return unwrapApi(response) 
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi khi cập nhật topping'))
        }
    }
)

export const toggleToppingAvailability = createAsyncThunk(
    'adminTopping/toggleAvailability',
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminToppingService.toggleAvailability(id)
            return { id, data: unwrapApi(response) }
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi khi đổi trạng thái topping'))
        }
    }
)
