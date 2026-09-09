import { createAsyncThunk } from '@reduxjs/toolkit'
import { addressService } from '../../../services/user/AddressService'
import { pickErrorMessage, unwrapApi } from '../../../utils/helpers/api'

export const getAddresses = createAsyncThunk(
    'address/getAddresses',
    async (_, { rejectWithValue }) => {
        try {
            const res = await addressService.getAddresses()
            return unwrapApi(res)
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Không tải được sổ địa chỉ'))
        }
    }
)

export const createAddress = createAsyncThunk(
    'address/createAddress',
    async (body, { rejectWithValue }) => {
        try {
            const res = await addressService.createAddress(body)
            return unwrapApi(res)
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Thêm địa chỉ thất bại'))
        }
    }
)

export const updateAddress = createAsyncThunk(
    'address/updateAddress',
    async ({ id, body }, { rejectWithValue }) => {
        try {
            const res = await addressService.updateAddress(id, body)
            return unwrapApi(res)
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Cập nhật địa chỉ thất bại'))
        }
    }
)

export const deleteAddress = createAsyncThunk(
    'address/deleteAddress',
    async (id, { rejectWithValue }) => {
        try {
            await addressService.deleteAddress(id)
            return id
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Xóa địa chỉ thất bại'))
        }
    }
)

export const setDefaultAddress = createAsyncThunk(
    'address/setDefaultAddress',
    async (id, { rejectWithValue }) => {
        try {
            const res = await addressService.setDefaultAddress(id)
            return unwrapApi(res) ?? id
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Đặt địa chỉ mặc định thất bại'))
        }
    }
)
