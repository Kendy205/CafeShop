import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { message, Modal, Space, Button } from 'antd'
import AdminTooltip from '../../../components/admin/common/AdminTooltip'
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
import AppSearchBox from '../../../components/common/AppSearchBox'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { AppToast, AppConfirm } from '../../../components/common/AppNotification'


const sizeSchema = Yup.object().shape({
    name: Yup.string().required('Vui lòng nhập tên kích cỡ')
})

export default function AdminSizePage() {
    const dispatch = useDispatch()
    const { items, loading, submitting } = useSelector((s) => s.admin.size)

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
                AppToast.success('Cập nhật thành công!')
                closeModal()
                resetForm()
            } else {
                /* API Error Modal will handle this */
            }
        } else {
            const res = await dispatch(createAdminSize(values))
            if (createAdminSize.fulfilled.match(res)) {
                AppToast.success('Thêm mới thành công!')
                closeModal()
                resetForm()
            } else {
                /* API Error Modal will handle this */
            }
        }
    }

    const handleDelete = (id) => {
        AppConfirm({
            title: 'Xác nhận xóa kích cỡ',
            content: 'Bạn có chắc chắn muốn xóa kích cỡ này? Hành động này không thể hoàn tác.',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            centered: true,
            onOk: async () => {
                const res = await dispatch(deleteAdminSize(id))
                if (deleteAdminSize.fulfilled.match(res)) {
                    AppToast.success('Xóa kích cỡ thành công!')
                } else {
                    /* API Error Modal will handle this */
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
            title: 'Thao tác',
            key: 'action',
            width: 120,
            align: 'right',
            render: (_, record) => (
                <div className="flex items-center justify-end gap-2">
                    <AdminTooltip title="Chỉnh sửa kích cỡ">
                        <button
                            onClick={() => openModal(record)}
                            className="admin-action-btn admin-action-btn-edit"
                        >
                            <EditOutlined />
                            <span>Sửa</span>
                        </button>
                    </AdminTooltip>
                    <AdminTooltip title="Xóa kích cỡ">
                        <button
                            onClick={() => handleDelete(record.sizeId)}
                            className="admin-action-btn admin-action-btn-delete"
                        >
                            <DeleteOutlined className="text-red-600" />
                            <span>Xóa</span>
                        </button>
                    </AdminTooltip>
                </div>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 shadow-xs">
                <AppSearchBox
                    initialValue={searchText}
                    placeholder="Tìm kiếm kích cỡ theo tên..."
                    onSearch={(val) => { setSearchText(val); setCurrentPage(1); }}
                    className="flex-1 min-w-[220px] max-w-md"
                />

                <div className="flex items-center gap-4">
                    <div className="text-xs text-slate-500 font-semibold hidden sm:block">
                        Đang hiển thị: <strong className="text-sky-700">{filteredItems.length}</strong> kích cỡ
                    </div>
                    <AppButton onClick={() => openModal()} className="!px-5">
                        <PlusOutlined />
                        <span>Thêm kích cỡ mới</span>
                    </AppButton>
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
                        name: editingItem?.name || ''
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
