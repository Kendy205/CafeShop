import { createSlice } from '@reduxjs/toolkit'
import { getSizes } from '../../actions/user/sizeAction'
import { asList } from '../../../utils/helpers/api'

const sizeSlice = createSlice({
    name: 'size',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getSizes.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getSizes.fulfilled, (state, action) => {
                state.loading = false
                state.items = asList(action.payload)
            })
            .addCase(getSizes.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export default sizeSlice.reducer
