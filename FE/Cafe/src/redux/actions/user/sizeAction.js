import { createAsyncThunk } from '@reduxjs/toolkit'
import { sizeService } from '../../../services/user/SizeService'
import { pickErrorMessage, unwrapApi } from '../../../utils/helpers/api'

export const getSizes = createAsyncThunk('size/getSizes', async (_, { rejectWithValue }) => {
    try {
        const res = await sizeService.getSizes()
        return unwrapApi(res)
    } catch (e) {
        return rejectWithValue(pickErrorMessage(e, 'Không tải được danh sách size'))
    }
})
