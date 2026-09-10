import { createSlice } from '@reduxjs/toolkit'
import { getAvailableToppings } from '../../actions/user/toppingAction'
import { asList } from '../../../utils/helpers/api'

const toppingSlice = createSlice({
    name: 'topping',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAvailableToppings.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getAvailableToppings.fulfilled, (state, action) => {
                state.loading = false
                state.items = asList(action.payload)
            })
            .addCase(getAvailableToppings.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export default toppingSlice.reducer
