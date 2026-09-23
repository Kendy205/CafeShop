import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { message, Modal, Space, Tooltip, Button } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, ColumnWidthOutlined } from '@ant-design/icons'
import {
    fetchAdminSizes,
    createAdminSize,
    updateAdminSize,
    deleteAdminSize,
} from '../../../redux/actions/admin/adminSizeAction'
import AdminPageBanner from '../../../components/admin/common/AdminPageBanner'
import AdminTable from '../../../components/admin/common/AdminTable'
import AdminModalBanner from '../../../components/admin/common/AdminModalBanner'
import AppButton from '../../../components/common/AppButton'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'

const sizeSchema = Yup.object().shape({
    name: Yup.string().required('Vui lòng nhập tên kích cỡ'),
    pricePercent: Yup.number().min(0, 'Tỷ lệ tăng giá không được âm').required('Vui lòng nhập tỷ lệ')
})

export default function AdminSizePage() {
    const dispatch = useDispatch()
    const { items, loading, submitting } = useSelector((s) => s.adminSize)

    const [isModalVisible, setIsModalVisible] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [searchText, setSearchText] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    useEffect(() => {
        dispatch(fetchAdminSizes())
    }, [dispatch])

    const openModal = (item = null) => {
        setEditingItem(item)
        setIsModalVisible(true)
    }

    const closeModal = () => {
        setIsModalVisible(false)
        setEditingItem(null)
    }

    const handleSubmit = async (values, { resetForm }) => {
        if (editingItem) {
            const res = await dispatch(updateAdminSize({ id: editingItem.sizeId, data: values }))
            if (updateAdminSize.fulfilled.match(res)) {
                message.success('Cập nhật thành công!')
                closeModal()
                resetForm()
            } else {
                message.error(res.payload || 'Cập nhật thất bại')
            }
        } else {
            const res = await dispatch(createAdminSize(values))
            if (createAdminSize.fulfilled.match(res)) {
                message.success('Thêm mới thành công!')
                closeModal()
                resetForm()
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
    const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-700">
                        <span className="font-black text-lg">{text.charAt(0)}</span>
                    </div>
                    <span className="font-bold text-slate-800 text-base">{text}</span>
                </div>
            ),
        },
        {
            title: 'Tỷ lệ tăng giá',
            dataIndex: 'pricePercent',
            key: 'pricePercent',
            render: (percent) => (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-mono text-sm font-semibold text-slate-700">
                    <span className="text-slate-400">+</span>
                    {percent}%
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
            <AdminPageBanner
                badge="Cấu Hình Sản Phẩm"
                title="Kích Cỡ Đồ Uống"
                description="Thiết lập các tùy chọn kích cỡ (Size S, M, L...) và tỷ lệ tăng giá tương ứng cho từng kích cỡ."
                icon={<ColumnWidthOutlined className="text-cyan-400 text-xl" />}
                extra={
                    <AppButton onClick={() => openModal()} className="!px-5">
                        <PlusOutlined />
                        <span>Thêm kích cỡ mới</span>
                    </AppButton>
                }
                stats={
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-xs">
                        <span className="text-slate-300 font-medium">Tổng số size:</span>
                        <strong className="text-white text-sm font-black">{items.length}</strong>
                    </div>
                }
            />

            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 shadow-xs">
                <div className="relative flex-1 min-w-[220px] max-w-md">
                    <input
                        type="text"
                        placeholder="Tìm kiếm kích cỡ theo tên..."
                        className="custom-admin-input pl-9"
                        value={searchText}
                        onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">🔍</span>
                    {searchText && (
                        <button
                            onClick={() => setSearchText('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="text-xs text-slate-500 font-semibold">
                    Đang hiển thị: <strong className="text-sky-700">{filteredItems.length}</strong> kích cỡ
                </div>
            </div>

            <AdminTable
                columns={columns}
                dataSource={paginatedItems}
                rowKey="sizeId"
                loading={loading}
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={filteredItems.length}
                onPageChange={setCurrentPage}
            />

            <Modal
                open={isModalVisible}
                onCancel={closeModal}
                footer={null}
                centered
                width={450}
                destroyOnClose
                className="custom-admin-modal"
                closeIcon={null}
            >
                <AdminModalBanner 
                    title={editingItem ? 'Sửa Kích Cỡ' : 'Thêm Kích Cỡ Mới'}
                    subtitle="Thiết lập tên size và tỷ lệ phần trăm cộng thêm"
                    icon={<ColumnWidthOutlined className="text-2xl" />}
                    badgeText={editingItem ? 'CẬP NHẬT' : 'THÊM MỚI'}
                    onClose={closeModal}
                />

                <Formik
                    enableReinitialize
                    initialValues={{
                        name: editingItem?.name || '',
                        pricePercent: editingItem?.pricePercent ?? 0
                    }}
                    validationSchema={sizeSchema}
                    onSubmit={handleSubmit}
                >
                    {({ errors, touched }) => (
                        <Form className="px-6 py-6 space-y-5 bg-white">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                    Tên kích cỡ <span className="text-red-500">*</span>
                                </label>
                                <Field
                                    name="name"
                                    placeholder="VD: S, M, L, XL..."
                                    className={`custom-admin-input ${touched.name && errors.name ? 'custom-admin-input-error' : ''}`}
                                />
                                {touched.name && errors.name && (
                                    <p className="mt-1 text-xs font-medium text-red-500">{errors.name}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                    Tỷ lệ tăng giá (%) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Field
                                        type="number"
                                        name="pricePercent"
                                        placeholder="0"
                                        className={`custom-admin-input pr-10 ${touched.pricePercent && errors.pricePercent ? 'custom-admin-input-error' : ''}`}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                </div>
                                {touched.pricePercent && errors.pricePercent && (
                                    <p className="mt-1 text-xs font-medium text-red-500">{errors.pricePercent}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-6 mt-2">
                                <AppButton type="button" variant="ghost" onClick={closeModal}>
                                    Hủy bỏ
                                </AppButton>
                                <AppButton type="submit" variant="primary" disabled={submitting}>
                                    {submitting ? 'Đang lưu...' : 'Lưu kích cỡ'}
                                </AppButton>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </div>
    )
}
