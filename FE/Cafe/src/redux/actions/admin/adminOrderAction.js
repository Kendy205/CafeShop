import { createAsyncThunk } from '@reduxjs/toolkit'
import { adminOrderService } from '../../../services/admin/AdminOrderService'
import { pickErrorMessage, unwrapApi } from '../../../utils/helpers/api'

export const fetchAdminOrders = createAsyncThunk(
    'adminOrder/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const res = await adminOrderService.getAllOrders(params)
            return unwrapApi(res)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Không tải được danh sách đơn hàng'))
        }
    }
)

export const fetchAdminOrderDetail = createAsyncThunk(
    'adminOrder/fetchDetail',
    async (orderId, { rejectWithValue }) => {
        try {
            const res = await adminOrderService.getOrderById(orderId)
            return unwrapApi(res)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Không tải được chi tiết đơn hàng'))
        }
    }
)

export const updateAdminOrderStatus = createAsyncThunk(
    'adminOrder/updateStatus',
    async ({ orderId, status }, { rejectWithValue }) => {
        try {
            const res = await adminOrderService.updateStatus(orderId, status)
            return { orderId, status, data: unwrapApi(res) }
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error, 'Cập nhật trạng thái thất bại'))
        }
    }
)

