import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Input, Card, Tag, Switch, message, Tooltip, Avatar } from 'antd'
import { SearchOutlined, UserOutlined } from '@ant-design/icons'
import { fetchAdminUsers, toggleAdminUserStatus } from '../../../redux/actions/admin/adminUserAction'
import CustomPagination from '../../../components/common/CustomPagination'
import AppPagination from '../../../components/common/AppPagination'

export default function AdminUsersPage() {
    const dispatch = useDispatch()
    const { items, total, page, pageSize, loading, submitting } = useSelector((s) => s.adminUser)

    const [searchKeyword, setSearchKeyword] = useState('')
    const [typingTimeout, setTypingTimeout] = useState(null)

    // Helper to call API
    const loadData = (p = 1, search = '') => {
        dispatch(fetchAdminUsers({ searchKeyword: search, pageNumber: p, pageSize }))
    }

    // Initial load
    useEffect(() => {
        loadData(page, searchKeyword)
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Handle Search with debounce
    const handleSearchChange = (e) => {
        const value = e.target.value
        setSearchKeyword(value)

        if (typingTimeout) clearTimeout(typingTimeout)

        setTypingTimeout(
            setTimeout(() => {
                loadData(1, value)
            }, 500)
        )
    }

    const handlePageChange = (newPage) => {
        loadData(newPage, searchKeyword)
    }

    const handleToggleStatus = async (userId) => {
        const res = await dispatch(toggleAdminUserStatus(userId))
        if (toggleAdminUserStatus.fulfilled.match(res)) {
            message.success('Đã cập nhật trạng thái khách hàng')
        } else {
            message.error(res.payload || 'Không thể thay đổi trạng thái')
        }
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
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role === 'Admin' || role === 'Administrator' ? 'volcano' : 'blue'} className="rounded-full font-semibold border-none px-3">
                    {role || 'User'}
                </Tag>
            )
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
                <Tooltip title={record.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}>
                    <Switch
                        checked={record.isActive}
                        onChange={() => handleToggleStatus(record.userId || record.id)}
                        disabled={submitting}
                        checkedChildren="Hoạt động"
                        unCheckedChildren="Đã khóa"
                        className="custom-switch"
                    />
                </Tooltip>
            )
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Quản lý Khách hàng</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Danh sách khách hàng đăng ký trên hệ thống.
                    </p>
                </div>
            </div>

            <Card className="rounded-3xl border-none shadow-sm overflow-hidden" bodyStyle={{ padding: 0 }}>
                <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center">
                    <Input
                        placeholder="Tìm theo tên, SĐT, username..."
                        prefix={<SearchOutlined className="text-slate-400" />}
                        className="max-w-md rounded-3xl px-4 py-2 hover:border-sky-500 focus:border-sky-500"
                        value={searchKeyword}
                        onChange={handleSearchChange}
                        allowClear
                    />
                    <Tag color="orange" className="rounded-full px-3 py-1 font-semibold border-none bg-sky-50 text-sky-700">
                        Tổng số: {total}
                    </Tag>
                </div>

                {loading ? (
                    <div className="p-5 space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-16 w-full animate-pulse rounded-3xl bg-slate-100/80" />
                        ))}
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={items}
                        rowKey={(record) => record.userId || record.id}
                        pagination={false}
                        className="custom-admin-table"
                    />
                )}

                {total > 0 && (
                    <CustomPagination
                        current={page}
                        pageSize={pageSize}
                        total={total}
                        onChange={handlePageChange}
                    />
                )}
                <AppPagination
                    current={page}
                    pageSize={pageSize}
                    total={total}
                    onChange={handlePageChange}
                />
            </Card>
        </div>
    )
}
