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
                const newRole = action.payload
                if (newRole) {
                    const newId = newRole.roleId ?? newRole.id
                    const exists = newId ? state.roles.some(r => (r.roleId ?? r.id) === newId) : false
                    if (!exists) {
                        state.roles.push(newRole)
                    }
                }
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
                if (updatedRole) {
                    const targetId = updatedRole.roleId ?? updatedRole.id
                    if (targetId !== undefined && targetId !== null) {
                        const index = state.roles.findIndex(r => (r.roleId ?? r.id) === targetId)
                        if (index !== -1) {
                            state.roles[index] = updatedRole
                        }
                    }
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
                if (deletedId !== undefined && deletedId !== null) {
                    state.roles = state.roles.filter(r => (r.roleId ?? r.id) !== deletedId)
                }
            })
            .addCase(deleteRole.rejected, (state, action) => {
                state.submitting = false
                state.error = action.payload
            })
    },
})

export const { clearRoleDetail } = adminRoleSlice.actions
export default adminRoleSlice.reducer
