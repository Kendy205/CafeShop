import { createSlice } from '@reduxjs/toolkit'
import { 
    fetchAdminUsers, 
    toggleAdminUserStatus, 
    fetchAdminUserById, 
    createAdminUser, 
    updateAdminUserInfo, 
    assignAdminRoles 
} from '../../actions/admin/adminUserAction'
import { normalizePagedResult } from '../../../utils/helpers/api'

const initialState = {
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    loading: false,
    submitting: false,
    error: null,
}

const adminUserSlice = createSlice({
    name: 'adminUser',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Users
            .addCase(fetchAdminUsers.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchAdminUsers.fulfilled, (state, action) => {
                state.loading = false
                const normalized = normalizePagedResult(action.payload)
                state.items = normalized.items
                state.total = normalized.total
                state.page = normalized.page
                state.pageSize = normalized.pageSize
            })
            .addCase(fetchAdminUsers.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Toggle User Status
            .addCase(toggleAdminUserStatus.pending, (state) => {
                state.submitting = true
            })
            .addCase(toggleAdminUserStatus.fulfilled, (state, action) => {
                state.submitting = false
                const updatedData = action.payload?.data || action.payload || {}
                const userId = action.payload.id || updatedData.userId || updatedData.id
                if (userId) {
                    const idx = state.items.findIndex(
                        (i) => i.userId === userId || i.id === userId
                    )
                    if (idx !== -1) {
                        state.items[idx].isActive = updatedData.isActive
                    }
                }
            })
            .addCase(toggleAdminUserStatus.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            // Fetch User By ID
            .addCase(fetchAdminUserById.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchAdminUserById.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(fetchAdminUserById.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Create User
            .addCase(createAdminUser.pending, (state) => {
                state.submitting = true
            })
            .addCase(createAdminUser.fulfilled, (state, action) => {
                state.submitting = false
                if (state.items.length < state.pageSize) {
                    state.items.unshift(action.payload)
                }
                state.total += 1
            })
            .addCase(createAdminUser.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            // Update User
            .addCase(updateAdminUserInfo.pending, (state) => {
                state.submitting = true
            })
            .addCase(updateAdminUserInfo.fulfilled, (state, action) => {
                state.submitting = false
                const updated = action.payload
                const index = state.items.findIndex(u => u.userId === updated.userId || u.id === updated.id)
                if (index !== -1) {
                    state.items[index] = { ...state.items[index], ...updated }
                }
            })
            .addCase(updateAdminUserInfo.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            // Assign Roles
            .addCase(assignAdminRoles.pending, (state) => {
                state.submitting = true
            })
            .addCase(assignAdminRoles.fulfilled, (state) => {
                state.submitting = false
            })
            .addCase(assignAdminRoles.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
    },
})

export default adminUserSlice.reducer
