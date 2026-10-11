import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, Table, Button, Input, Card, Tag, Space, Switch, Select, Checkbox, message } from 'antd'
import AdminTooltip from '../../../components/admin/common/AdminTooltip'
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, PictureOutlined, CoffeeOutlined } from '@ant-design/icons'
import {
    fetchAdminProducts,
    toggleProductAvailability,
    deleteAdminProduct,
} from '../../../redux/actions/admin/adminProductAction'
import { fetchAdminCategories } from '../../../redux/actions/admin/adminCategoryAction'
import { fetchAdminSizes } from '../../../redux/actions/admin/adminSizeAction'
import { fetchAdminToppings } from '../../../redux/actions/admin/adminToppingAction'
import { formatVnd } from '../../../utils/helpers/format'
import ProductFormModal from '../../../components/admin/ProductAdmin/ProductFormModal'
import AdminPageBanner from '../../../components/admin/common/AdminPageBanner'
import AdminTable from '../../../components/admin/common/AdminTable'
import FeedbackDrawer from '../../../components/admin/FeedbackAdmin/FeedbackDrawer'
import AppSearchBox from '../../../components/common/AppSearchBox'

/**
 * AdminProductPage Component
 * Trang quản lý Sản phẩm (Menu) lớn nhất của Admin.
 * Hiển thị danh sách sản phẩm, lọc theo danh mục, giá, tìm kiếm tên.
 * Gồm chức năng Thêm mới, Sửa, Đổi trạng thái hiển thị (Còn/Hết hàng) và xem Feedbacks.
 */
export default function AdminProductPage() {
    const dispatch = useDispatch()
    const { items, total, totalPages, pageSize, loading } = useSelector((s) => s.admin.product)
    const { items: categories } = useSelector((s) => s.admin.category)
    const { items: masterSizes } = useSelector((s) => s.admin.size)
    const { items: masterToppings } = useSelector((s) => s.admin.topping)

    // filter states
    const [keyword, setKeyword] = useState('')
    const [categoryId, setCategoryId] = useState(null)
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [isAvailable, setIsAvailable] = useState('ALL')
    const [outOfStock, setOutOfStock] = useState(false)
    const [sortBy, setSortBy] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    // modal states
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    
    // feedback drawer states
    const [isFeedbackDrawerVisible, setIsFeedbackDrawerVisible] = useState(false)
    const [selectedProductId, setSelectedProductId] = useState(null)

    useEffect(() => {
        dispatch(fetchAdminCategories())
        dispatch(fetchAdminSizes())
        dispatch(fetchAdminToppings())
    }, [dispatch])

    const loadData = useCallback(
        (p) => {
            dispatch(
                fetchAdminProducts({
                    pageNumber: p,
                    pageSize: 10,
                    keyword: keyword.trim() || undefined,
                    categoryId: categoryId || undefined,
                    minPrice: minPrice !== '' ? Number(minPrice) : undefined,
                    maxPrice: maxPrice !== '' ? Number(maxPrice) : undefined,
                    isAvailable: isAvailable !== 'ALL' ? isAvailable === 'true' : undefined,
                    outOfStock: outOfStock ? true : undefined,
                    sortBy: sortBy || undefined,
                })
            )
        },
        [dispatch, keyword, categoryId, minPrice, maxPrice, isAvailable, outOfStock, sortBy]
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
            /* API Error Modal will handle this */
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
                    /* API Error Modal will handle this */
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
                <div className="space-y-1.5">
                    {record.basePrice !== undefined && record.basePrice !== null && (
                        <div className="text-xs text-slate-500 font-medium">
                            Giá gốc: <span className="font-bold text-slate-800 font-mono">{formatVnd(record.basePrice)}</span>
                        </div>
                    )}
                    <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {record.productSizes?.map((sz) => (
                            <AdminTooltip key={sz.sizeId} title={`Tồn kho: ${sz.stockQuantity ?? 0}`}>
                                <span className="inline-flex items-center rounded-2xl bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-800 border border-sky-200">
                                    {sz.name ?? sz.sizeName ?? '?'}: {formatVnd(sz.price)}
                                </span>
                            </AdminTooltip>
                        ))}
                    </div>
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
                        className={`custom-admin-switch ${isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}
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
            width: 150,
            align: 'right',
            render: (_, record) => (
                <div className="flex items-center justify-end gap-2">
                    <AdminTooltip title="Xem đánh giá">
                        <button
                            onClick={() => {
                                setSelectedProductId(record.productId)
                                setIsFeedbackDrawerVisible(true)
                            }}
                            className="admin-action-btn flex items-center justify-center rounded-lg bg-pink-50 p-2 text-pink-600 hover:bg-pink-100 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                            </svg>
                        </button>
                    </AdminTooltip>
                    <AdminTooltip title="Chỉnh sửa sản phẩm">
                        <button
                            onClick={() => openModal(record)}
                            className="admin-action-btn admin-action-btn-edit"
                        >
                            <EditOutlined />
                        </button>
                    </AdminTooltip>
                    <AdminTooltip title="Xóa sản phẩm">
                        <button
                            onClick={() => handleDelete(record.productId)}
                            className="admin-action-btn admin-action-btn-delete"
                        >
                            <DeleteOutlined className="text-red-600" />
                        </button>
                    </AdminTooltip>
                </div>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            {/* Header Banner cao cấp */}
            <AdminPageBanner
                badge="Quản Lý Thực Đơn & Kho Hàng"
                title="Sản Phẩm & Thức Uống"
                description="Thêm mới đồ uống, cấu hình hình ảnh, giá bán theo từng kích cỡ (S/M/L) và kiểm soát số lượng kho."
                icon={<CoffeeOutlined className="text-amber-400 text-xl" />}
                extra={
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 rounded-2xl bg-sky-500 hover:bg-sky-400 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-sky-500/30 transition-all cursor-pointer active:scale-95"
                    >
                        <PlusOutlined />
                        <span>Thêm sản phẩm mới</span>
                    </button>
                }
                stats={
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-xs">
                        <span className="text-slate-300 font-medium">Tổng sản phẩm:</span>
                        <strong className="text-white text-sm font-black">{total}</strong>
                    </div>
                }
            />

            {/* Filter Toolbar */}
            <div className="flex flex-col gap-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 shadow-xs mb-6">
                {/* Hàng 1: Tìm kiếm & Phân loại cơ bản */}
                <div className="flex flex-wrap items-center gap-3">
                    <AppSearchBox
                        initialValue={keyword}
                        placeholder="Tìm kiếm theo tên..."
                        onSearch={(val) => { setKeyword(val); setCurrentPage(1); }}
                        className="flex-1 min-w-[200px] max-w-sm"
                    />

                    <Select
                        placeholder="Tất cả danh mục"
                        allowClear
                        value={categoryId}
                        onChange={(val) => { setCategoryId(val); }}
                        className="min-w-[160px]"
                        options={categories.map((c) => ({ value: c.categoryId, label: c.name }))}
                    />

                    <Select
                        value={sortBy}
                        onChange={(val) => setSortBy(val)}
                        className="min-w-[160px]"
                        options={[
                            { value: '', label: 'Mới nhất (Mặc định)' },
                            { value: 'name_asc', label: 'Tên A-Z' },
                            { value: 'price_asc', label: 'Giá tăng dần' },
                            { value: 'price_desc', label: 'Giá giảm dần' },
                            { value: 'stock_asc', label: 'Tồn kho ít nhất' },
                            { value: 'stock_desc', label: 'Tồn kho nhiều nhất' }
                        ]}
                    />
                </div>

                {/* Hàng 2: Bộ lọc nâng cao */}
                <div className="flex flex-wrap items-center gap-4 py-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">Giá:</span>
                        <Input
                            type="number"
                            placeholder="Từ (VNĐ)"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-24 text-xs"
                        />
                        <span className="text-slate-400">-</span>
                        <Input
                            type="number"
                            placeholder="Đến (VNĐ)"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-24 text-xs"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">Trạng thái:</span>
                        <Select
                            value={isAvailable}
                            onChange={setIsAvailable}
                            className="w-[120px]"
                            options={[
                                { value: 'ALL', label: 'Tất cả' },
                                { value: 'true', label: 'Đang bán' },
                                { value: 'false', label: 'Đã ẩn' }
                            ]}
                        />
                    </div>

                    <div className="flex items-center gap-2 ml-2">
                        <Checkbox checked={outOfStock} onChange={(e) => setOutOfStock(e.target.checked)}>
                            <span className="text-xs font-semibold text-rose-600">Hết hàng</span>
                        </Checkbox>
                    </div>

                    <div className="ml-auto">
                        <button
                            onClick={handleSearch}
                            className="rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 px-6 py-2 text-xs font-bold transition-all cursor-pointer"
                        >
                            Lọc dữ liệu
                        </button>
                    </div>
                </div>
            </div>

            <AdminTable
                columns={columns}
                dataSource={items}
                rowKey="productId"
                loading={loading}
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={total}
                onPageChange={(p) => setCurrentPage(p)}
            />

            <ProductFormModal
                open={isModalVisible}
                editingItem={editingItem}
                onClose={closeModal}
                onSuccess={() => loadData(currentPage)}
                categories={categories}
                masterSizes={masterSizes}
                masterToppings={masterToppings}
            />

            <FeedbackDrawer 
                open={isFeedbackDrawerVisible}
                productId={selectedProductId}
                onClose={() => {
                    setIsFeedbackDrawerVisible(false)
                    setSelectedProductId(null)
                }}
            />
        </div>
    )
}
