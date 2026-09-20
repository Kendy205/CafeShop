import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { message, Modal, Table, Button, Input, Card, Tag, Space, Tooltip } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, AppstoreOutlined, SearchOutlined, FolderOpenOutlined } from '@ant-design/icons'
import {
    fetchAdminCategories,
    createAdminCategory,
    updateAdminCategory,
    deleteAdminCategory,
} from '../../../redux/actions/admin/adminCategoryAction'
import AppPagination from '../../../components/common/AppPagination'

export default function AdminCategoryPage() {
    const dispatch = useDispatch()
    const { items, loading, submitting } = useSelector((s) => s.adminCategory)

    const [isModalVisible, setIsModalVisible] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [form, setForm] = useState({ name: '', description: '' })
    const [searchText, setSearchText] = useState('')

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    useEffect(() => {
        dispatch(fetchAdminCategories())
    }, [dispatch])

    const openModal = (item = null) => {
        setEditingItem(item)
        setForm(item ? { name: item.name, description: item.description || '' } : { name: '', description: '' })
        setIsModalVisible(true)
    }

    const closeModal = () => {
        setIsModalVisible(false)
        setEditingItem(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name.trim()) {
            message.warning('Vui lòng nhập tên danh mục!')
            return
        }

        if (editingItem) {
            const res = await dispatch(updateAdminCategory({ id: editingItem.categoryId, data: form }))
            if (updateAdminCategory.fulfilled.match(res)) {
                message.success('Cập nhật thành công!')
                closeModal()
            } else {
                message.error(res.payload || 'Cập nhật thất bại')
            }
        } else {
            const res = await dispatch(createAdminCategory(form))
            if (createAdminCategory.fulfilled.match(res)) {
                message.success('Thêm mới thành công!')
                closeModal()
            } else {
                message.error(res.payload || 'Thêm mới thất bại')
            }
        }
    }

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Xác nhận xóa danh mục',
            content: 'Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            centered: true,
            onOk: async () => {
                const res = await dispatch(deleteAdminCategory(id))
                if (deleteAdminCategory.fulfilled.match(res)) {
                    message.success('Xóa danh mục thành công!')
                } else {
                    message.error(res.payload || 'Xóa thất bại')
                }
            },
        })
    }

    const filteredItems = items.filter(cat => cat.name.toLowerCase().includes(searchText.toLowerCase()))

    // Client-side pagination
    const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchText])

    const columns = [
        {
            title: 'ID',
            dataIndex: 'categoryId',
            key: 'categoryId',
            width: 80,
            render: (id) => <span className="font-mono text-slate-500">#{id}</span>,
        },
        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            key: 'name',
            render: (text) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-3xl bg-sky-50 text-sky-700">
                        <FolderOpenOutlined className="text-lg" />
                    </div>
                    <span className="font-bold text-slate-800 text-base">{text}</span>
                </div>
            ),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            render: (text) => text ? <span className="text-slate-600">{text}</span> : <span className="text-slate-400 italic">Không có mô tả</span>,
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
                            onClick={() => handleDelete(record.categoryId)}
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
                    <h1 className="text-2xl font-black text-slate-800">Quản lý Danh mục</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Tổ chức và phân loại các sản phẩm trong cửa hàng của bạn.
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 rounded-3xl bg-gradient-to-r from-sky-700 to-sky-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-900/30 hover:scale-105 transition-all duration-300"
                >
                    <PlusOutlined /> Thêm danh mục mới
                </button>
            </div>

            <Card className="rounded-3xl border-none shadow-sm overflow-hidden" bodyStyle={{ padding: 0 }}>
                <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center">
                    <Input
                        placeholder="Tìm kiếm danh mục..."
                        prefix={<SearchOutlined className="text-slate-400" />}
                        className="max-w-md rounded-3xl px-4 py-2 hover:border-sky-500 focus:border-sky-500"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                    />
                    <Tag color="orange" className="rounded-full px-3 py-1 font-semibold border-none bg-sky-50 text-sky-700">
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
                        rowKey="categoryId"
                        pagination={false}
                        className="custom-admin-table"
                    />
                )}
                <AppPagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredItems.length}
                    onChange={(p) => setCurrentPage(p)}
                />
            </Card>

            <Modal
                title={<div className="text-xl font-black text-slate-800 border-b border-slate-100 pb-4 mb-2">{editingItem ? 'Sửa danh mục' : 'Thêm danh mục mới'}</div>}
                open={isModalVisible}
                onCancel={closeModal}
                footer={null}
                centered
                width={500}
                className="custom-admin-modal"
                closeIcon={<div className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500">✕</div>}
            >
                <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                    <div>
                        <label className="mb-1.5 block text-sm font-bold text-slate-700">Tên danh mục <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Nhập tên danh mục (VD: Cà phê, Trà sữa...)"
                            className="w-full rounded-3xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-bold text-slate-700">Mô tả chi tiết</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Thêm mô tả cho danh mục này..."
                            rows={4}
                            className="w-full rounded-3xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 transition-all custom-scrollbar"
                        />
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
                            className="rounded-3xl bg-gradient-to-r from-sky-700 to-sky-900 px-8 py-2.5 font-bold text-white shadow-lg shadow-sky-900/30 hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 transition-all duration-300"
                        >
                            {submitting ? 'Đang lưu...' : 'Lưu danh mục'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
