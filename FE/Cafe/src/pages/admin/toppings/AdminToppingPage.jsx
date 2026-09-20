import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { message, Modal, Switch, Table, Button, Input, Card, Tag, Space, Tooltip, Upload } from 'antd'
import { EditOutlined, PlusOutlined, UploadOutlined, CoffeeOutlined, SearchOutlined } from '@ant-design/icons'
import {
    fetchAdminToppings,
    createAdminTopping,
    updateAdminTopping,
    toggleToppingAvailability,
} from '../../../redux/actions/admin/adminToppingAction'
import { formatVnd } from '../../../utils/helpers/format'
import CustomPagination from '../../../components/common/CustomPagination'
import AppPagination from '../../../components/common/AppPagination'

export default function AdminToppingPage() {
    const dispatch = useDispatch()
    const { items, loading, submitting } = useSelector((s) => s.adminTopping)

    const [isModalVisible, setIsModalVisible] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [form, setForm] = useState({ name: '', price: 0, imageFile: null })
    const [previewUrl, setPreviewUrl] = useState('')
    const [searchText, setSearchText] = useState('')

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    useEffect(() => {
        dispatch(fetchAdminToppings())
    }, [dispatch])

    const openModal = (item = null) => {
        setEditingItem(item)
        setForm(item ? { name: item.name, price: item.price, imageFile: null } : { name: '', price: 0, imageFile: null })
        setPreviewUrl(item?.imageUrl || '')
        setIsModalVisible(true)
    }

    const closeModal = () => {
        setIsModalVisible(false)
        setEditingItem(null)
        setForm({ name: '', price: 0, imageFile: null })
        setPreviewUrl('')
    }

    const handleFileChange = (info) => {
        const file = info.file.originFileObj || info.file
        if (!file) return

        if (!file.type.startsWith('image/')) {
            message.error('Chỉ được phép upload file ảnh!')
            return
        }

        setForm(prev => ({ ...prev, imageFile: file }))
        const reader = new FileReader()
        reader.onload = (e) => setPreviewUrl(e.target.result)
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name.trim()) {
            message.warning('Vui lòng nhập tên Topping!')
            return
        }
        if (form.price < 0) {
            message.warning('Giá không hợp lệ!')
            return
        }

        const formData = new FormData()
        formData.append('name', form.name.trim())
        formData.append('price', form.price)
        if (form.imageFile) {
            formData.append('imageFile', form.imageFile)
        }

        if (editingItem) {
            const res = await dispatch(updateAdminTopping({ id: editingItem.toppingId, formData }))
            if (updateAdminTopping.fulfilled.match(res)) {
                message.success('Cập nhật thành công!')
                closeModal()
            } else {
                message.error(res.payload || 'Cập nhật thất bại')
            }
        } else {
            if (!form.imageFile) {
                message.warning('Vui lòng chọn ảnh cho Topping!')
                return
            }
            const res = await dispatch(createAdminTopping(formData))
            if (createAdminTopping.fulfilled.match(res)) {
                message.success('Thêm mới thành công!')
                closeModal()
            } else {
                message.error(res.payload || 'Thêm mới thất bại')
            }
        }
    }

    const handleToggle = async (id, checked) => {
        const res = await dispatch(toggleToppingAvailability(id))
        if (toggleToppingAvailability.fulfilled.match(res)) {
            message.success(`Đã ${checked ? 'bật' : 'tắt'} hiển thị topping!`)
        } else {
            message.error(res.payload || 'Đổi trạng thái thất bại')
        }
    }

    const filteredItems = items.filter(t => t.name.toLowerCase().includes(searchText.toLowerCase()))

    // Client-side pagination
    const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchText])

    const columns = [
        {
            title: 'Ảnh & Tên',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div className="flex items-center gap-4 py-1">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-3xl border-2 border-white shadow-sm ring-1 ring-slate-200">
                        {record.imageUrl ? (
                            <img src={record.imageUrl} alt={text} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                                <CoffeeOutlined />
                            </div>
                        )}
                    </div>
                    <div>
                        <span className="font-bold text-slate-800 text-base">{text}</span>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">#{record.toppingId}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Mức Giá',
            dataIndex: 'price',
            key: 'price',
            render: (val) => (
                <span className="inline-flex items-center rounded-2xl bg-emerald-50 px-3 py-1 font-bold text-emerald-700">
                    {formatVnd(val)}
                </span>
            ),
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'isAvailable',
            key: 'isAvailable',
            align: 'center',
            render: (isAvailable, record) => (
                <div className="flex items-center justify-center gap-2">
                    <Switch
                        checked={isAvailable}
                        onChange={(checked) => handleToggle(record.toppingId, checked)}
                        className={isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}
                    />
                    {isAvailable ?
                        <span className="text-xs font-semibold text-emerald-600 min-w-[60px] text-left">Đang bán</span> :
                        <span className="text-xs font-semibold text-slate-400 min-w-[60px] text-left">Đã ẩn</span>
                    }
                </div>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 100,
            align: 'right',
            render: (_, record) => (
                <Tooltip title="Chỉnh sửa">
                    <Button
                        type="text"
                        icon={<EditOutlined className="text-emerald-600" />}
                        className="bg-emerald-50 hover:bg-emerald-100 border-none rounded-2xl h-9 w-9 flex items-center justify-center"
                        onClick={() => openModal(record)}
                    />
                </Tooltip>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Quản lý Topping</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Thêm các loại trân châu, thạch, kem cheese để khách hàng có thể mua kèm đồ uống.
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-800 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/30 hover:scale-105 transition-all duration-300"
                >
                    <PlusOutlined /> Thêm Topping mới
                </button>
            </div>

            <Card className="rounded-3xl border-none shadow-sm overflow-hidden" bodyStyle={{ padding: 0 }}>
                <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center">
                    <Input
                        placeholder="Tìm kiếm topping..."
                        prefix={<SearchOutlined className="text-slate-400" />}
                        className="max-w-md rounded-3xl px-4 py-2 hover:border-emerald-500 focus:border-emerald-500"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                    />
                    <Tag color="green" className="rounded-full px-3 py-1 font-semibold border-none bg-emerald-50 text-emerald-700">
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
                        rowKey="toppingId"
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
                title={<div className="text-xl font-black text-slate-800 border-b border-slate-100 pb-4 mb-2">{editingItem ? 'Sửa Topping' : 'Thêm Topping mới'}</div>}
                open={isModalVisible}
                onCancel={closeModal}
                footer={null}
                centered
                width={500}
                className="custom-admin-modal"
                closeIcon={<div className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500">✕</div>}
            >
                <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                    <div className="flex flex-col items-center justify-center mb-6">
                        <div className="relative group cursor-pointer mb-3">
                            <div className="h-28 w-28 overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition-all group-hover:border-emerald-500 group-hover:bg-emerald-50">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full flex-col items-center justify-center text-slate-400">
                                        <CoffeeOutlined className="text-3xl mb-1 opacity-50" />
                                        <span className="text-[10px] font-semibold">Tải ảnh lên</span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-3 -right-3">
                                <Upload
                                    showUploadList={false}
                                    beforeUpload={() => false}
                                    onChange={handleFileChange}
                                >
                                    <Button
                                        shape="circle"
                                        icon={<UploadOutlined />}
                                        className="bg-white shadow-md border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-600"
                                    />
                                </Upload>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-bold text-slate-700">Tên Topping <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="VD: Trân châu đen, Thạch phô mai..."
                            className="w-full rounded-3xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-bold text-slate-700">Giá bán (VNĐ) <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })}
                                className="w-full rounded-3xl border border-slate-200 bg-slate-50/50 px-4 py-3 pr-12 text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all font-mono text-lg font-semibold"
                                required
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                                đ
                            </div>
                        </div>
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
                            className="rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-800 px-8 py-2.5 font-bold text-white shadow-lg shadow-emerald-900/30 hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 transition-all duration-300"
                        >
                            {submitting ? 'Đang lưu...' : 'Lưu Topping'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
