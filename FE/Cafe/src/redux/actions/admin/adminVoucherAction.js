import { createAsyncThunk } from '@reduxjs/toolkit'
import { adminVoucherService } from '../../../services/admin/AdminVoucherService'
import { pickErrorMessage, unwrapApi } from '../../../utils/helpers/api'

export const getAdminVouchers = createAsyncThunk(
    'adminVoucher/getList',
    async (params, { rejectWithValue }) => {
        try {
            const res = await adminVoucherService.getVouchers(params)
            return unwrapApi(res)
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Không tải được danh sách mã'))
        }
    }
)

export const createAdminVoucher = createAsyncThunk(
    'adminVoucher/create',
    async (body, { rejectWithValue }) => {
        try {
            const res = await adminVoucherService.createVoucher(body)
            return unwrapApi(res)
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Tạo mã giảm giá thất bại'))
        }
    }
)

export const updateAdminVoucher = createAsyncThunk(
    'adminVoucher/update',
    async ({ id, body }, { rejectWithValue }) => {
        try {
            const res = await adminVoucherService.updateVoucher(id, body)
            return unwrapApi(res)
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Cập nhật mã thất bại'))
        }
    }
)

export const toggleAdminVoucher = createAsyncThunk(
    'adminVoucher/toggle',
    async (id, { rejectWithValue }) => {
        try {
            const res = await adminVoucherService.toggleActive(id)
            return { id, data: unwrapApi(res) }
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Bật/tắt mã thất bại'))
        }
    }
)
