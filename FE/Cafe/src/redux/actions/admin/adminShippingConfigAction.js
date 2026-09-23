import { createAsyncThunk } from '@reduxjs/toolkit'
import { adminShippingConfigService } from '../../../services/admin/AdminShippingConfigService'
import { pickErrorMessage, unwrapApi } from '../../../utils/helpers/api'

export const fetchShippingConfig = createAsyncThunk(
    'adminShippingConfig/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminShippingConfigService.getShippingConfig()
            return unwrapApi(response)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi khi tải cấu hình giao hàng'))
        }
    }
)

export const updateShippingConfig = createAsyncThunk(
    'adminShippingConfig/update',
    async (data, { rejectWithValue }) => {
        try {
            const response = await adminShippingConfigService.updateShippingConfig(data)
            return unwrapApi(response)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Lỗi khi cập nhật cấu hình giao hàng'))
        }
    }
)
