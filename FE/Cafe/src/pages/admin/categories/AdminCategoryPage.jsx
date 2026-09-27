import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { message, Modal, Space, Button } from 'antd'
import AdminTooltip from '../../../components/admin/common/AdminTooltip'
import { EditOutlined, DeleteOutlined, PlusOutlined, AppstoreOutlined, FolderOpenOutlined } from '@ant-design/icons'
import {
    fetchAdminCategories,
    createAdminCategory,
    updateAdminCategory,
    deleteAdminCategory,
} from '../../../redux/actions/admin/adminCategoryAction'
import AdminPageBanner from '../../../components/admin/common/AdminPageBanner'
import AdminTable from '../../../components/admin/common/AdminTable'
import AdminModalBanner from '../../../components/admin/common/AdminModalBanner'
import AppButton from '../../../components/common/AppButton'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'

const categorySchema = Yup.object().shape({
    name: Yup.string().required('Vui lòng nhập tên danh mục'),
    description: Yup.string().nullable()
})

export default function AdminCategoryPage() {
    const dispatch = useDispatch()
    const { items, loading, submitting } = useSelector((s) => s.adminCategory)

    const [isModalVisible, setIsModalVisible] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [searchText, setSearchText] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    useEffect(() => {
        dispatch(fetchAdminCategories())
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
            const res = await dispatch(updateAdminCategory({ id: editingItem.categoryId, data: values }))
            if (updateAdminCategory.fulfilled.match(res)) {
                message.success('Cập nhật thành công!')
                closeModal()
                resetForm()
            } else {
                message.error(res.payload || 'Cập nhật thất bại')
            }
        } else {
            const res = await dispatch(createAdminCategory(values))
            if (createAdminCategory.fulfilled.match(res)) {
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
    const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

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
                    <AdminTooltip title="Chỉnh sửa danh mục">
                        <Button
                            type="text"
                            icon={<EditOutlined className="text-sky-600" />}
                            className="bg-sky-50 hover:bg-sky-100 border-none rounded-2xl h-9 w-9 flex items-center justify-center transition-all shadow-2xs hover:shadow-xs"
                            onClick={() => openModal(record)}
                        />
                    </AdminTooltip>
                    <AdminTooltip title="Xóa danh mục">
                        <Button
                            type="text"
                            icon={<DeleteOutlined className="text-rose-500" />}
                            className="bg-rose-50 hover:bg-rose-100 border-none rounded-2xl h-9 w-9 flex items-center justify-center transition-all shadow-2xs hover:shadow-xs"
                            onClick={() => handleDelete(record.categoryId)}
                        />
                    </AdminTooltip>
                </Space>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <AdminPageBanner
                badge="Quản Lý Phân Loại Sản Phẩm"
                title="Danh Mục Đồ Uống"
                description="Tổ chức, phân nhóm thức uống khoa học (Cà phê, Trà sữa, Nước ép...) giúp khách hàng dễ dàng tìm kiếm."
                icon={<AppstoreOutlined className="text-cyan-400 text-xl" />}
                extra={
                    <AppButton onClick={() => openModal()} className="!px-5">
                        <PlusOutlined />
                        <span>Thêm danh mục mới</span>
                    </AppButton>
                }
                stats={
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-xs">
                        <span className="text-slate-300 font-medium">Tổng danh mục:</span>
                        <strong className="text-white text-sm font-black">{items.length}</strong>
                    </div>
                }
            />

            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 shadow-xs">
                <div className="relative flex-1 min-w-[220px] max-w-md">
                    <input
                        type="text"
                        placeholder="Tìm kiếm danh mục theo tên hoặc mô tả..."
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
                    Đang hiển thị: <strong className="text-sky-700">{filteredItems.length}</strong> danh mục
                </div>
            </div>

            <AdminTable
                columns={columns}
                dataSource={paginatedItems}
                rowKey="categoryId"
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
                width={500}
                destroyOnClose
                className="custom-admin-modal"
                closeIcon={null}
            >
                <AdminModalBanner 
                    title={editingItem ? 'Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
                    subtitle="Tổ chức menu đồ uống chuyên nghiệp"
                    icon={<AppstoreOutlined className="text-2xl" />}
                    badgeText={editingItem ? 'CẬP NHẬT' : 'THÊM MỚI'}
                    onClose={closeModal}
                />

                <Formik
                    enableReinitialize
                    initialValues={{
                        name: editingItem?.name || '',
                        description: editingItem?.description || ''
                    }}
                    validationSchema={categorySchema}
                    onSubmit={handleSubmit}
                >
                    {({ errors, touched }) => (
                        <Form className="px-6 py-6 space-y-5 bg-white">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                    Tên danh mục <span className="text-red-500">*</span>
                                </label>
                                <Field
                                    name="name"
                                    placeholder="VD: Cà phê, Trà sữa..."
                                    className={`custom-admin-input ${touched.name && errors.name ? 'custom-admin-input-error' : ''}`}
                                />
                                {touched.name && errors.name && (
                                    <p className="mt-1 text-xs font-medium text-red-500">{errors.name}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                    Mô tả chi tiết
                                </label>
                                <Field
                                    as="textarea"
                                    name="description"
                                    rows={4}
                                    placeholder="Thêm mô tả cho danh mục này..."
                                    className="custom-admin-input custom-scrollbar resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-6 mt-2">
                                <AppButton type="button" variant="ghost" onClick={closeModal}>
                                    Hủy bỏ
                                </AppButton>
                                <AppButton type="submit" variant="primary" disabled={submitting}>
                                    {submitting ? 'Đang lưu...' : 'Lưu danh mục'}
                                </AppButton>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </div>
    )
}
