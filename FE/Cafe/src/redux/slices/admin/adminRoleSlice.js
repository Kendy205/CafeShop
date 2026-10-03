import { createSlice } from '@reduxjs/toolkit'
import {
    fetchPermissions,
    fetchRoles,
    fetchRoleById,
    createRole,
    updateRole,
    deleteRole
} from '../../actions/admin/adminRoleAction'

const initialState = {
    roles: [],
    permissions: [],
    roleDetail: null,
    loading: false,
    submitting: false,
    error: null,
}

const adminRoleSlice = createSlice({
    name: 'adminRole',
    initialState,
    reducers: {
        clearRoleDetail: (state) => {
            state.roleDetail = null
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Permissions
            .addCase(fetchPermissions.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchPermissions.fulfilled, (state, action) => {
                state.loading = false
                state.permissions = action.payload || []
            })
            .addCase(fetchPermissions.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Fetch Roles
            .addCase(fetchRoles.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchRoles.fulfilled, (state, action) => {
                state.loading = false
                state.roles = action.payload || []
            })
            .addCase(fetchRoles.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Fetch Role By Id
            .addCase(fetchRoleById.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchRoleById.fulfilled, (state, action) => {
                state.loading = false
                state.roleDetail = action.payload
            })
            .addCase(fetchRoleById.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Create Role
            .addCase(createRole.pending, (state) => {
                state.submitting = true
            })
            .addCase(createRole.fulfilled, (state, action) => {
                state.submitting = false
                state.roles.push(action.payload)
            })
            .addCase(createRole.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            // Update Role
            .addCase(updateRole.pending, (state) => {
                state.submitting = true
            })
            .addCase(updateRole.fulfilled, (state, action) => {
                state.submitting = false
                const updatedRole = action.payload
                const index = state.roles.findIndex(r => r.roleId === updatedRole.roleId || r.id === updatedRole.id)
                if (index !== -1) {
                    state.roles[index] = updatedRole
                }
            })
            .addCase(updateRole.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
            // Delete Role
            .addCase(deleteRole.pending, (state) => {
                state.submitting = true
            })
            .addCase(deleteRole.fulfilled, (state, action) => {
                state.submitting = false
                const deletedId = action.payload
                state.roles = state.roles.filter(r => r.roleId !== deletedId && r.id !== deletedId)
            })
            .addCase(deleteRole.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
    },
})

export const { clearRoleDetail } = adminRoleSlice.actions
export default adminRoleSlice.reducer
