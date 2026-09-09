import { createAsyncThunk } from '@reduxjs/toolkit'
import { toppingService } from '../../../services/user/ToppingService'
import { pickErrorMessage, unwrapApi } from '../../../utils/helpers/api'

export const getAvailableToppings = createAsyncThunk(
    'topping/getAvailable',
    async (_, { rejectWithValue }) => {
        try {
            const res = await toppingService.getAvailable()
            return unwrapApi(res)
        } catch (e) {
            return rejectWithValue(pickErrorMessage(e, 'Không tải được danh sách topping'))
        }
    }
)
