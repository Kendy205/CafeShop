import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Button, Tag, Space, Modal, message } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { fetchRoles, deleteRole, fetchPermissions } from '../../../redux/actions/admin/adminRoleAction'
import AdminRoleModal from './AdminRoleModal'
import AdminTooltip from '../../../components/admin/common/AdminTooltip'

export default function AdminRoleTab() {
    const dispatch = useDispatch()
    const { roles, loading } = useSelector((s) => s.admin.role)
    const [modalVisible, setModalVisible] = useState(false)
    const [editingRole, setEditingRole] = useState(null)

    useEffect(() => {
        dispatch(fetchRoles())
        dispatch(fetchPermissions())
    }, [dispatch])

    const handleOpenCreate = () => {
        setEditingRole(null)
        setModalVisible(true)
    }

    const handleOpenEdit = (role) => {
        setEditingRole(role)
        setModalVisible(true)
    }

    const handleDelete = (role) => {
        if (role.name === 'Admin' || role.name === 'Administrator') {
            message.error('Không được phép xóa vai trò hệ thống!')
            return
        }
        Modal.confirm({
            title: 'Xóa vai trò?',
            content: `Bạn có chắc chắn muốn xóa vai trò "${role.name}"? Hành động này không thể hoàn tác.`,
            okText: 'Xóa',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: async () => {
                const roleId = role.roleId || role.id
                const res = await dispatch(deleteRole(roleId))
                if (deleteRole.fulfilled.match(res)) {
                    message.success('Xóa vai trò thành công!')
                } else {
                    message.error(res.payload || 'Không thể xóa vai trò này!')
                }
            }
        })
    }

    const columns = [
        {
            title: 'Vai trò',
            key: 'name',
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <SafetyCertificateOutlined className="text-xl" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{record.name}</span>
                        <span className="text-xs text-slate-500">{record.description || 'Không có mô tả'}</span>
                    </div>
                </div>
            )
        },
        {
            title: 'Quyền hạn (Permissions)',
            key: 'permissions',
            render: (_, record) => (
                <div className="flex flex-wrap gap-1 max-w-md">
                    {record.permissions?.length > 0 ? (
                        record.permissions.map(p => (
                            <Tag color="blue" key={p.permissionId || p.id} className="border-none bg-sky-50 text-sky-600 rounded-lg">
                                {p.code}
                            </Tag>
                        ))
                    ) : (
                        <span className="text-xs text-slate-400 italic">Chưa phân quyền</span>
                    )}
                </div>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            width: 180,
            render: (_, record) => {
                const isSystem = record.name === 'Admin' || record.name === 'Administrator'
                return (
                    <div className="flex items-center justify-center gap-2">
                        <AdminTooltip title="Sửa vai trò">
                            <button
                                onClick={() => handleOpenEdit(record)}
                                className="admin-action-btn admin-action-btn-edit"
                            >
                                <EditOutlined />
                                <span>Sửa</span>
                            </button>
                        </AdminTooltip>
                        {!isSystem && (
                            <AdminTooltip title="Xóa vai trò">
                                <button
                                    onClick={() => handleDelete(record)}
                                    className="admin-action-btn admin-action-btn-delete"
                                >
                                    <DeleteOutlined className="text-red-600" />
                                    <span>Xóa</span>
                                </button>
                            </AdminTooltip>
                        )}
                    </div>
                )
            }
        }
    ]

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
                <div>
                    <h3 className="text-sm font-black text-slate-800">Quản lý Vai trò & Phân quyền</h3>
                    <p className="text-xs text-slate-500">Tạo mới, phân quyền và kiểm soát truy cập hệ thống</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-sky-600/20 hover:bg-sky-700 transition-all active:scale-95"
                >
                    <PlusOutlined />
                    Thêm Vai Trò Mới
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={roles}
                    rowKey={(record) => record.roleId || record.id}
                    loading={loading}
                    pagination={false}
                    className="custom-admin-table"
                />
            </div>

            <AdminRoleModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                editingRole={editingRole}
            />
        </div>
    )
}
