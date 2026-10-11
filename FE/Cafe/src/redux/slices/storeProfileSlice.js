import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { storeProfileService } from '../../services/StoreProfileService'
import { unwrapApi, pickErrorMessage } from '../../utils/helpers/api'

export const fetchStoreProfile = createAsyncThunk(
    'storeProfile/fetchStoreProfile',
    async (_, { rejectWithValue }) => {
        try {
            const res = await storeProfileService.getStoreProfile()
            return unwrapApi(res)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error))
        }
    }
)

export const updateStoreProfileAsync = createAsyncThunk(
    'storeProfile/updateStoreProfileAsync',
    async (data, { rejectWithValue }) => {
        try {
            const res = await storeProfileService.updateStoreProfile(data)
            return unwrapApi(res)
        } catch (error) {
            return rejectWithValue(pickErrorMessage(error))
        }
    }
)

const initialState = {
    profile: null,
    loading: false,
    submitting: false,
    error: null,
}

const storeProfileSlice = createSlice({
    name: 'storeProfile',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // fetchStoreProfile
            .addCase(fetchStoreProfile.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchStoreProfile.fulfilled, (state, action) => {
                state.loading = false
                state.profile = action.payload
            })
            .addCase(fetchStoreProfile.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // updateStoreProfileAsync
            .addCase(updateStoreProfileAsync.pending, (state) => {
                state.submitting = true
                state.error = null
            })
            .addCase(updateStoreProfileAsync.fulfilled, (state, action) => {
                state.submitting = false
                state.profile = action.payload
            })
            .addCase(updateStoreProfileAsync.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
    }
})

export default storeProfileSlice.reducer
