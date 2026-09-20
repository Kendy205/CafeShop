import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, Table, Button, Input, Card, Tag, Space, Tooltip, Switch, Select, message } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, PictureOutlined } from '@ant-design/icons'
import {
    fetchAdminProducts,
    toggleProductAvailability,
    deleteAdminProduct,
} from '../../../redux/actions/admin/adminProductAction'
import { fetchAdminCategories } from '../../../redux/actions/admin/adminCategoryAction'
import { fetchAdminSizes } from '../../../redux/actions/admin/adminSizeAction'
import { formatVnd } from '../../../utils/helpers/format'
import AppPagination from '../../../components/common/AppPagination'
import ProductFormModal from '../../../components/admin/ProductFormModal'

export default function AdminProductPage() {
    const dispatch = useDispatch()
    const { items, total, totalPages, pageSize, loading } = useSelector((s) => s.adminProduct)
    const { items: categories } = useSelector((s) => s.adminCategory)
    const { items: masterSizes } = useSelector((s) => s.adminSize)

    // filter states
    const [keyword, setKeyword] = useState('')
    const [categoryId, setCategoryId] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)

    // modal states
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [editingItem, setEditingItem] = useState(null)

    useEffect(() => {
        dispatch(fetchAdminCategories())
        dispatch(fetchAdminSizes())
    }, [dispatch])

    const loadData = useCallback(
        (p) => {
            dispatch(
                fetchAdminProducts({
                    page: p,
                    pageSize: 10,
                    keyword: keyword.trim() || undefined,
                    categoryId: categoryId || undefined,
                })
            )
        },
        [dispatch, keyword, categoryId]
    )

    useEffect(() => {
        loadData(currentPage)
    }, [currentPage, loadData])

    const handleSearch = () => {
        if (currentPage === 1) loadData(1)
        else setCurrentPage(1)
    }

    const openModal = (item = null) => {
        setEditingItem(item)
        setIsModalVisible(true)
    }

    const closeModal = () => {
        setIsModalVisible(false)
        setEditingItem(null)
    }

    const handleToggle = async (id, checked) => {
        const res = await dispatch(toggleProductAvailability(id))
        if (toggleProductAvailability.fulfilled.match(res)) {
            message.success(`Đã ${checked ? 'bật' : 'tắt'} hiển thị sản phẩm!`)
        } else {
            message.error(res.payload || 'Đổi trạng thái thất bại')
        }
    }

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Xác nhận xóa sản phẩm',
            content: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            centered: true,
            onOk: async () => {
                const res = await dispatch(deleteAdminProduct(id))
                if (deleteAdminProduct.fulfilled.match(res)) {
                    message.success('Xóa sản phẩm thành công!')
                    loadData(currentPage)
                } else {
                    message.error(res.payload || 'Xóa thất bại')
                }
            },
        })
    }

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div className="flex items-center gap-4 py-1">
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-3xl border-2 border-white shadow-sm ring-1 ring-slate-200">
                        {record.imageUrl ? (
                            <img src={record.imageUrl} alt={text} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                                <PictureOutlined className="text-xl" />
                            </div>
                        )}
                    </div>
                    <div>
                        <span className="font-bold text-slate-800 text-base block">{text}</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400 font-mono">#{record.productId}</span>
                            <Tag color="cyan" className="rounded-full border-none bg-cyan-50 text-cyan-700 m-0">
                                {record.categoryName}
                            </Tag>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Giá / Kích cỡ',
            key: 'sizes',
            render: (_, record) => (
                <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                    {record.productSizes?.map((sz) => (
                        <Tooltip key={sz.sizeId} title={`Tồn kho: ${sz.stockQuantity ?? 0}`}>
                            <span className="inline-flex items-center rounded-2xl bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-800 border border-sky-200">
                                {sz.name ?? sz.sizeName ?? '?'}: {formatVnd(sz.price)}
                            </span>
                        </Tooltip>
                    ))}
                </div>
            ),
        },
        {
            title: 'Mô tả ngắn',
            dataIndex: 'description',
            key: 'description',
            width: 200,
            render: (text) => (
                <div className="text-xs text-slate-500 line-clamp-2 max-w-[200px]" title={text}>
                    {text || <span className="italic text-slate-400">Không có</span>}
                </div>
            ),
        },
        {
            title: 'Thống kê',
            key: 'stats',
            render: (_, record) => (
                <div className="flex flex-col text-[11px] text-slate-500 gap-1">
                    {record.createdAt && (
                        <div>
                            <span className="font-semibold text-slate-600">Ngày tạo:</span>{' '}
                            {new Date(record.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                    )}
                    {record.viewCount !== undefined && (
                        <div>
                            <span className="font-semibold text-slate-600">Lượt xem:</span> {record.viewCount}
                        </div>
                    )}
                    {record.salesCount !== undefined && (
                        <div>
                            <span className="font-semibold text-slate-600">Đã bán:</span> {record.salesCount}
                        </div>
                    )}
                </div>
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
                        onChange={(checked) => handleToggle(record.productId, checked)}
                        className={isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}
                    />
                    {isAvailable ? (
                        <span className="text-xs font-semibold text-emerald-600 min-w-[60px] text-left">Đang bán</span>
                    ) : (
                        <span className="text-xs font-semibold text-slate-400 min-w-[60px] text-left">Đã ẩn</span>
                    )}
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
                            onClick={() => handleDelete(record.productId)}
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
                    <h1 className="text-2xl font-black text-slate-800">Quản lý Sản phẩm</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Thêm mới đồ uống, cấu hình giá bán và kho theo từng kích cỡ.
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 rounded-3xl bg-gradient-to-r from-cyan-600 to-cyan-800 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-900/30 hover:scale-105 transition-all duration-300"
                >
                    <PlusOutlined /> Thêm Sản phẩm
                </button>
            </div>

            <Card className="rounded-3xl border-none shadow-sm overflow-hidden" bodyStyle={{ padding: 0 }}>
                <div className="p-5 border-b border-slate-100 bg-white flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 w-full max-w-sm">
                        <Input
                            placeholder="Tìm tên sản phẩm..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onPressEnter={handleSearch}
                            className="rounded-3xl px-4 py-2 hover:border-cyan-500 focus:border-cyan-500"
                        />
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={handleSearch}
                            className="rounded-3xl h-10 bg-cyan-600 hover:bg-cyan-700 shadow-none"
                        />
                    </div>

                    <Select
                        placeholder="Lọc theo Danh mục"
                        allowClear
                        value={categoryId}
                        onChange={setCategoryId}
                        className="min-w-[200px]"
                        options={categories.map((c) => ({ value: c.categoryId, label: c.name }))}
                    />

                    <div className="ml-auto">
                        <Tag color="cyan" className="rounded-full px-3 py-1 font-semibold border-none bg-cyan-50 text-cyan-700 m-0">
                            Tổng: {total} SP
                        </Tag>
                    </div>
                </div>

                {loading ? (
                    <div className="p-5 space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-20 w-full animate-pulse rounded-3xl bg-slate-100/80" />
                        ))}
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={items}
                        rowKey="productId"
                        pagination={false}
                        className="custom-admin-table"
                    />
                )}

                <AppPagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={total}
                    totalPages={totalPages}
                    onChange={(p) => setCurrentPage(p)}
                />
            </Card>

            <ProductFormModal
                open={isModalVisible}
                editingItem={editingItem}
                onClose={closeModal}
                onSuccess={() => loadData(currentPage)}
                categories={categories}
                masterSizes={masterSizes}
            />
        </div>
    )
}
