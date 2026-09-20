import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { message, Modal, Table, Button, Input, Card, Tag, Space, Tooltip } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, ColumnWidthOutlined, SearchOutlined } from '@ant-design/icons'
import {
    fetchAdminSizes,
    createAdminSize,
    updateAdminSize,
    deleteAdminSize,
} from '../../../redux/actions/admin/adminSizeAction'
import AppPagination from '../../../components/common/AppPagination'

export default function AdminSizePage() {
    const dispatch = useDispatch()
    const { items, loading, submitting } = useSelector((s) => s.adminSize)

    const [isModalVisible, setIsModalVisible] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [form, setForm] = useState({ name: '', pricePercent: 0 })
    const [searchText, setSearchText] = useState('')

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    useEffect(() => {
        dispatch(fetchAdminSizes())
    }, [dispatch])

    const openModal = (item = null) => {
        setEditingItem(item)
        setForm(item ? { name: item.name, pricePercent: item.pricePercent } : { name: '', pricePercent: 0 })
        setIsModalVisible(true)
    }

    const closeModal = () => {
        setIsModalVisible(false)
        setEditingItem(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name.trim()) {
            message.warning('Vui lòng nhập tên kích cỡ!')
            return
        }

        if (editingItem) {
            const res = await dispatch(updateAdminSize({ id: editingItem.sizeId, data: form }))
            if (updateAdminSize.fulfilled.match(res)) {
                message.success('Cập nhật thành công!')
                closeModal()
            } else {
                message.error(res.payload || 'Cập nhật thất bại')
            }
        } else {
            const res = await dispatch(createAdminSize(form))
            if (createAdminSize.fulfilled.match(res)) {
                message.success('Thêm mới thành công!')
                closeModal()
            } else {
                message.error(res.payload || 'Thêm mới thất bại')
            }
        }
    }

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Xác nhận xóa kích cỡ',
            content: 'Bạn có chắc chắn muốn xóa kích cỡ này? Hành động này không thể hoàn tác.',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            centered: true,
            onOk: async () => {
                const res = await dispatch(deleteAdminSize(id))
                if (deleteAdminSize.fulfilled.match(res)) {
                    message.success('Xóa kích cỡ thành công!')
                } else {
                    message.error(res.payload || 'Xóa thất bại')
                }
            },
        })
    }

    const filteredItems = items.filter(size => size.name.toLowerCase().includes(searchText.toLowerCase()))

    // Client-side pagination
    const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    
    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchText])

    const columns = [
        {
            title: 'ID',
            dataIndex: 'sizeId',
            key: 'sizeId',
            width: 80,
            render: (id) => <span className="font-mono text-slate-500">#{id}</span>,
        },
        {
            title: 'Tên kích cỡ',
            dataIndex: 'name',
            key: 'name',
            render: (text) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
                        <ColumnWidthOutlined className="text-lg" />
                    </div>
                    <span className="font-bold text-slate-800 text-base">{text}</span>
                </div>
            ),
        },
        {
            title: 'Tỷ lệ tăng giá',
            dataIndex: 'pricePercent',
            key: 'pricePercent',
            render: (val) => (
                <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-2 max-w-[100px] overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-full rounded-full" 
                            style={{ width: `${Math.min(100, Math.max(0, val * 100))}%` }} 
                        />
                    </div>
                    <span className="font-bold text-indigo-700">+{val * 100}%</span>
                </div>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            align: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa">
                        <Button 
                            type="text" 
                            icon={<EditOutlined className="text-blue-600" />} 
                            className="bg-blue-50 hover:bg-blue-100 border-none rounded-2xl h-9 w-9 flex items-center justify-center"
                            onClick={() => openModal(record)} 
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button 
                            type="text" 
                            icon={<DeleteOutlined className="text-red-600" />} 
                            className="bg-red-50 hover:bg-red-100 border-none rounded-2xl h-9 w-9 flex items-center justify-center"
                            onClick={() => handleDelete(record.sizeId)} 
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Quản lý Kích cỡ</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Cấu hình các loại kích cỡ (Size) cho sản phẩm và tỷ lệ tăng giá tương ứng.
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 rounded-3xl bg-gradient-to-r from-indigo-600 to-indigo-800 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-900/30 hover:scale-105 transition-all duration-300"
                >
                    <PlusOutlined /> Thêm kích cỡ mới
                </button>
            </div>

            <Card className="rounded-3xl border-none shadow-sm overflow-hidden" bodyStyle={{ padding: 0 }}>
                <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center">
                    <Input
                        placeholder="Tìm kiếm kích cỡ..."
                        prefix={<SearchOutlined className="text-slate-400" />}
                        className="max-w-md rounded-3xl px-4 py-2 hover:border-indigo-500 focus:border-indigo-500"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                    />
                    <Tag color="geekblue" className="rounded-full px-3 py-1 font-semibold border-none bg-indigo-50 text-indigo-700">
                        Tổng cộng: {items.length}
                    </Tag>
                </div>
                {loading ? (
                    <div className="p-5 space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-12 w-full animate-pulse rounded-3xl bg-slate-100/80" />
                        ))}
                    </div>
                ) : (
                    <Table 
                        columns={columns} 
                        dataSource={paginatedItems} 
                        rowKey="sizeId"
                        pagination={false}
                        className="custom-admin-table"
                    />
                )}
                <AppPagination 
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredItems.length}
                    onChange={(page) => setCurrentPage(page)}
                />
            </Card>

            <Modal
                title={<div className="text-xl font-black text-slate-800 border-b border-slate-100 pb-4 mb-2">{editingItem ? 'Sửa kích cỡ' : 'Thêm kích cỡ mới'}</div>}
                open={isModalVisible}
                onCancel={closeModal}
                footer={null}
                centered
                width={450}
                className="custom-admin-modal"
                closeIcon={<div className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500">✕</div>}
            >
                <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                    <div>
                        <label className="mb-1.5 block text-sm font-bold text-slate-700">Tên kích cỡ <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="VD: S, M, L, XL..."
                            className="w-full rounded-3xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-bold text-slate-700">Tỷ lệ tăng giá (so với giá gốc)</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.pricePercent}
                                onChange={(e) => setForm({ ...form, pricePercent: parseFloat(e.target.value) || 0 })}
                                className="w-full rounded-3xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono"
                            />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                            VD: Nhập <code>0</code> nghĩa là giữ nguyên giá (+0%). Nhập <code>0.2</code> nghĩa là tăng thêm +20% giá.
                        </p>
                    </div>
                    <div className="flex justify-end gap-3 pt-6 mt-2">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-3xl px-6 py-2.5 font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-3xl bg-gradient-to-r from-indigo-600 to-indigo-800 px-8 py-2.5 font-bold text-white shadow-lg shadow-indigo-900/30 hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 transition-all duration-300"
                        >
                            {submitting ? 'Đang lưu...' : 'Lưu kích cỡ'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
