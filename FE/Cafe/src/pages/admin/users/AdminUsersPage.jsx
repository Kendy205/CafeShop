import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Input, Card, Tag, Switch, message, Avatar, Space } from 'antd'
import AdminTooltip from '../../../components/admin/common/AdminTooltip'
import { SearchOutlined, UserOutlined, PlusOutlined, EditOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { fetchAdminUsers, toggleAdminUserStatus } from '../../../redux/actions/admin/adminUserAction'
import { fetchRoles } from '../../../redux/actions/admin/adminRoleAction'
import AdminPageBanner from '../../../components/admin/common/AdminPageBanner'
import AdminTable from '../../../components/admin/common/AdminTable'
import AppSearchBox from '../../../components/common/AppSearchBox'
import AdminUserModal from './AdminUserModal'
import AdminAssignRoleModal from './AdminAssignRoleModal'
import { AppToast, AppConfirm } from '../../../components/common/AppNotification'


/**
 * AdminUsersPage Component
 * Trang quản lý Người dùng / Nhân viên (User Management) của Admin.
 * Hiển thị danh sách tài khoản, Khóa/Mở tài khoản, và nút Phân quyền (Assign Role).
 */
export default function AdminUsersPage() {
    const dispatch = useDispatch()
    const { items, total, page, pageSize, loading, submitting } = useSelector((s) => s.admin.user)
    const { roles } = useSelector((s) => s.admin.role)

    const [searchKeyword, setSearchKeyword] = useState('')
    const [userModalVisible, setUserModalVisible] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [roleModalVisible, setRoleModalVisible] = useState(false)
    const [assigningUser, setAssigningUser] = useState(null)

    const loadData = (p = 1, search = '') => {
        dispatch(fetchAdminUsers({ keyword: search, pageNumber: p, pageSize }))
    }

    // Initial load
    useEffect(() => {
        loadData(page, searchKeyword)
        dispatch(fetchRoles())
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const handlePageChange = (newPage) => {
        loadData(newPage, searchKeyword)
    }

    const handleToggleStatus = async (userId) => {
        const res = await dispatch(toggleAdminUserStatus(userId))
        if (toggleAdminUserStatus.fulfilled.match(res)) {
            AppToast.success('Đã cập nhật trạng thái khách hàng')
        }
    }

    const handleOpenCreate = () => {
        setEditingUser(null)
        setUserModalVisible(true)
    }

    const handleOpenEdit = (user) => {
        setEditingUser(user)
        setUserModalVisible(true)
    }

    const handleOpenAssignRole = (user) => {
        setAssigningUser(user)
        setRoleModalVisible(true)
    }

    const columns = [
        {
            title: 'Khách hàng',
            key: 'customer',
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <Avatar
                        size="large"
                        icon={<UserOutlined />}
                        className="bg-sky-100 text-sky-700 font-bold"
                    >
                        {record.fullName ? record.fullName.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{record.fullName || 'Chưa cập nhật'}</span>
                        <span className="text-xs text-slate-500">@{record.username}</span>
                    </div>
                </div>
            )
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            render: (text) => text ? <span className="font-medium text-slate-700">{text}</span> : <span className="text-slate-400 italic">Trống</span>
        },
        {
            title: 'Vai trò',
            dataIndex: 'roles',
            key: 'roles',
            render: (roles) => {
                if (!roles || roles.length === 0) {
                    return <Tag color="blue" className="rounded-full font-semibold border-none px-3">User</Tag>
                }
                return (
                    <div className="flex flex-wrap gap-1">
                        {roles.map(role => (
                            <Tag 
                                key={role} 
                                color={role === 'Admin' || role === 'Administrator' ? 'volcano' : 'purple'} 
                                className="rounded-full font-semibold border-none px-3 m-0"
                            >
                                {role}
                            </Tag>
                        ))}
                    </div>
                )
            }
        },
        {
            title: 'Ngày tham gia',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => (
                <span className="text-slate-600 text-sm">
                    {date ? new Date(date).toLocaleDateString('vi-VN') : '—'}
                </span>
            )
        },
        {
            title: 'Trạng thái',
            key: 'isActive',
            align: 'center',
            render: (_, record) => (
                <AdminTooltip title={record.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}>
                    <Switch
                        checked={record.isActive}
                        onChange={() => handleToggleStatus(record.userId || record.id)}
                        disabled={submitting}
                        className={record.isActive ? 'bg-emerald-500' : 'bg-slate-300'}
                    />
                </AdminTooltip>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            width: 180,
            render: (_, record) => (
                <div className="flex items-center justify-center gap-2">
                    <AdminTooltip title="Sửa thông tin">
                        <button
                            onClick={() => handleOpenEdit(record)}
                            className="admin-action-btn admin-action-btn-edit"
                        >
                            <EditOutlined />
                            <span>Sửa</span>
                        </button>
                    </AdminTooltip>
                    <AdminTooltip title="Cấp quyền truy cập hệ thống">
                        <button
                            onClick={() => handleOpenAssignRole(record)}
                            className="admin-action-btn admin-action-btn-assign"
                        >
                            <SafetyCertificateOutlined className="text-purple-600" />
                            <span>Cấp quyền</span>
                        </button>
                    </AdminTooltip>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-6">
            <AdminPageBanner
                badge="Cơ Sở Dữ Liệu Khách Hàng"
                title="Quản Lý Khách Hàng"
                description="Theo dõi danh sách tài khoản người dùng, thông tin liên hệ, ngày tham gia và kiểm soát trạng thái hoạt động."
                icon={<UserOutlined className="text-indigo-400 text-xl" />}
                stats={
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-xs">
                        <span className="text-slate-300 font-medium">Tổng khách hàng:</span>
                        <strong className="text-white text-sm font-black">{total}</strong>
                    </div>
                }
            />

            {/* Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 shadow-xs">
                <AppSearchBox
                    initialValue={searchKeyword}
                    placeholder="Tìm theo tên, email, số điện thoại, username..."
                    onSearch={(val) => { setSearchKeyword(val); loadData(1, val); }}
                    className="flex-1 min-w-[220px] max-w-md"
                />

                <div className="flex items-center gap-4">
                    <div className="text-xs text-slate-500 font-semibold">
                        Hiển thị: <strong className="text-sky-700">{items.length}</strong> / {total} tài khoản
                    </div>
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-sky-600/20 hover:bg-sky-700 transition-all active:scale-95"
                    >
                        <PlusOutlined />
                        Thêm Khách Hàng
                    </button>
                </div>
            </div>

            <AdminTable
                columns={columns}
                dataSource={items}
                rowKey={(record) => record.userId || record.id}
                loading={loading}
                currentPage={page}
                pageSize={pageSize}
                totalItems={total}
                onPageChange={handlePageChange}
            />

            <AdminUserModal 
                visible={userModalVisible} 
                onClose={() => setUserModalVisible(false)} 
                editingUser={editingUser} 
                roles={roles} 
            />

            <AdminAssignRoleModal 
                visible={roleModalVisible} 
                onClose={() => setRoleModalVisible(false)} 
                assigningUser={assigningUser} 
                roles={roles} 
            />
        </div>
    )
}
