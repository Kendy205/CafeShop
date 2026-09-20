import { createSlice } from '@reduxjs/toolkit'
import { getProfile, updateProfile, changePassword } from '../../actions/user/userAction'

const initialState = {
    profile: null,
    loading: false,
    updating: false,
    changingPassword: false,
    error: null,
    updateError: null,
    passwordError: null,
    passwordSuccess: false,
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearUserErrors: (state) => {
            state.error = null
            state.updateError = null
            state.passwordError = null
        },
        resetPasswordStatus: (state) => {
            state.passwordError = null
            state.passwordSuccess = false
        },
    },
    extraReducers: (builder) => {
        builder
            // ── Get Profile ──────────────────────────────────────────────
            .addCase(getProfile.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getProfile.fulfilled, (state, action) => {
                state.loading = false
                state.profile = action.payload
            })
            .addCase(getProfile.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // ── Update Profile ───────────────────────────────────────────
            .addCase(updateProfile.pending, (state) => {
                state.updating = true
                state.updateError = null
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.updating = false
                state.profile = { ...state.profile, ...action.payload }
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.updating = false
                state.updateError = action.payload
            })

            // ── Change Password ──────────────────────────────────────────
            .addCase(changePassword.pending, (state) => {
                state.changingPassword = true
                state.passwordError = null
                state.passwordSuccess = false
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.changingPassword = false
                state.passwordSuccess = true
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.changingPassword = false
                state.passwordError = action.payload
                state.passwordSuccess = false
            })
    },
})

export const { clearUserErrors, resetPasswordStatus } = userSlice.actions
export default userSlice.reducer
