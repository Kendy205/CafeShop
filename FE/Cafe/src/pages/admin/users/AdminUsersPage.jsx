import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Input, Card, Tag, Switch, message, Avatar } from 'antd'
import AdminTooltip from '../../../components/admin/common/AdminTooltip'
import { SearchOutlined, UserOutlined } from '@ant-design/icons'
import { fetchAdminUsers, toggleAdminUserStatus } from '../../../redux/actions/admin/adminUserAction'
import AdminPageBanner from '../../../components/admin/common/AdminPageBanner'
import AdminTable from '../../../components/admin/common/AdminTable'

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
            /* API Error Modal will handle this */
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
                <AdminTooltip title={record.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}>
                    <Switch
                        checked={record.isActive}
                        onChange={() => handleToggleStatus(record.userId || record.id)}
                        disabled={submitting}
                        checkedChildren="Hoạt động"
                        unCheckedChildren="Đã khóa"
                        className="custom-switch"
                    />
                </AdminTooltip>
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
                <div className="relative flex-1 min-w-[220px] max-w-md">
                    <input
                        type="text"
                        placeholder="Tìm theo tên, email, số điện thoại, username..."
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 pl-9 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none shadow-xs focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
                        value={searchKeyword}
                        onChange={handleSearchChange}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">🔍</span>
                    {searchKeyword && (
                        <button
                            onClick={() => { setSearchKeyword(''); loadData(1, ''); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="text-xs text-slate-500 font-semibold">
                    Hiển thị: <strong className="text-sky-700">{items.length}</strong> / {total} tài khoản
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
        </div>
    )
}
