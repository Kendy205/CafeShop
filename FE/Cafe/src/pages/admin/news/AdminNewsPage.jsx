import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { message, Modal, Space, Button, Upload } from 'antd'
import AdminTooltip from '../../../components/admin/common/AdminTooltip'
import { EditOutlined, DeleteOutlined, PlusOutlined, FileTextOutlined, PictureOutlined, UploadOutlined } from '@ant-design/icons'
import {
    fetchAdminNews,
    createAdminNews,
    updateAdminNews,
    deleteAdminNews,
} from '../../../redux/actions/admin/adminNewsAction'
import AdminPageBanner from '../../../components/admin/common/AdminPageBanner'
import AdminTable from '../../../components/admin/common/AdminTable'
import AdminModalBanner from '../../../components/admin/common/AdminModalBanner'
import AppButton from '../../../components/common/AppButton'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'

const newsSchema = Yup.object().shape({
    title: Yup.string().required('Vui lòng nhập tiêu đề bài viết'),
    summary: Yup.string().nullable(),
    content: Yup.string().required('Vui lòng nhập nội dung bài viết'),
    status: Yup.string().nullable(),
    scheduledPublishAt: Yup.string().nullable()
})

export default function AdminNewsPage() {
    const dispatch = useDispatch()
    const { items, loading, submitting } = useSelector((s) => s.adminNews)

    const [isModalVisible, setIsModalVisible] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [searchText, setSearchText] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [previewUrl, setPreviewUrl] = useState('')
    const pageSize = 10

    useEffect(() => {
        dispatch(fetchAdminNews({ pageNumber: 1, pageSize: 100 })) // Fetching all for simple client side search
    }, [dispatch])

    const openModal = (item = null) => {
        setEditingItem(item)
        setPreviewUrl(item?.imageUrl || '')
        setIsModalVisible(true)
    }

    const closeModal = () => {
        setIsModalVisible(false)
        setEditingItem(null)
        setPreviewUrl('')
    }

    const handleSubmit = async (values, { resetForm }) => {
        const formData = new FormData();
        formData.append('title', values.title || '');
        if (values.summary) formData.append('summary', values.summary);
        formData.append('content', values.content || '');
        if (values.imageFile) formData.append('imageFile', values.imageFile);
        if (values.status) formData.append('status', values.status);
        if (values.scheduledPublishAt) formData.append('scheduledPublishAt', values.scheduledPublishAt);

        if (editingItem) {
            const res = await dispatch(updateAdminNews({ id: editingItem.newsId, data: formData }))
            if (updateAdminNews.fulfilled.match(res)) {
                message.success('Cập nhật thành công!')
                closeModal()
                resetForm()
            } else {
                /* API Error Modal will handle this */
            }
        } else {
            const res = await dispatch(createAdminNews(formData))
            if (createAdminNews.fulfilled.match(res)) {
                message.success('Thêm mới thành công!')
                closeModal()
                resetForm()
            } else {
                /* API Error Modal will handle this */
            }
        }
    }

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Xác nhận xóa bài viết',
            content: 'Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            centered: true,
            onOk: async () => {
                const res = await dispatch(deleteAdminNews(id))
                if (deleteAdminNews.fulfilled.match(res)) {
                    message.success('Xóa bài viết thành công!')
                } else {
                    /* API Error Modal will handle this */
                }
            },
        })
    }

    const filteredItems = items.filter(news => news.title.toLowerCase().includes(searchText.toLowerCase()))
    const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    useEffect(() => {
        setCurrentPage(1)
    }, [searchText])

    const columns = [
        {
            title: 'ID',
            dataIndex: 'newsId',
            key: 'newsId',
            width: 80,
            render: (id) => <span className="font-mono text-slate-500">#{id}</span>,
        },
        {
            title: 'Hình ảnh',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            width: 100,
            render: (url) => url ? <img src={url} alt="News" className="w-12 h-12 rounded object-cover" /> : <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-400">No Img</div>,
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            render: (text) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{text}</span>
                </div>
            ),
        },
        {
            title: 'Tóm tắt',
            dataIndex: 'summary',
            key: 'summary',
            render: (text) => <span className="text-slate-600 line-clamp-2">{text}</span>,
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            align: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <AdminTooltip title="Chỉnh sửa bài viết">
                        <Button
                            type="text"
                            icon={<EditOutlined className="text-sky-600" />}
                            className="bg-sky-50 hover:bg-sky-100 border-none rounded-2xl h-9 w-9 flex items-center justify-center transition-all shadow-2xs hover:shadow-xs"
                            onClick={() => openModal(record)}
                        />
                    </AdminTooltip>
                    <AdminTooltip title="Xóa bài viết">
                        <Button
                            type="text"
                            icon={<DeleteOutlined className="text-rose-500" />}
                            className="bg-rose-50 hover:bg-rose-100 border-none rounded-2xl h-9 w-9 flex items-center justify-center transition-all shadow-2xs hover:shadow-xs"
                            onClick={() => handleDelete(record.newsId)}
                        />
                    </AdminTooltip>
                </Space>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <AdminPageBanner
                badge="Quản Lý Bài Viết"
                title="Tin Tức & Sự Kiện"
                description="Quản lý các bài viết tin tức, thông báo, hoặc sự kiện của quán."
                icon={<FileTextOutlined className="text-cyan-400 text-xl" />}
                extra={
                    <AppButton onClick={() => openModal()} className="!px-5">
                        <PlusOutlined />
                        <span>Thêm bài viết mới</span>
                    </AppButton>
                }
                stats={
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-xs">
                        <span className="text-slate-300 font-medium">Tổng bài viết:</span>
                        <strong className="text-white text-sm font-black">{items.length}</strong>
                    </div>
                }
            />

            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 shadow-xs">
                <div className="relative flex-1 min-w-[220px] max-w-md">
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài viết theo tiêu đề..."
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
                    Đang hiển thị: <strong className="text-sky-700">{filteredItems.length}</strong> bài viết
                </div>
            </div>

            <AdminTable
                columns={columns}
                dataSource={paginatedItems}
                rowKey="newsId"
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
                width={700}
                destroyOnClose
                className="custom-admin-modal"
                closeIcon={null}
            >
                <AdminModalBanner 
                    title={editingItem ? 'Sửa Bài Viết' : 'Thêm Bài Viết Mới'}
                    subtitle="Đăng bài viết mới để khách hàng luôn cập nhật"
                    icon={<FileTextOutlined className="text-2xl" />}
                    badgeText={editingItem ? 'CẬP NHẬT' : 'THÊM MỚI'}
                    onClose={closeModal}
                />

                <Formik
                    enableReinitialize
                    initialValues={{
                        title: editingItem?.title || '',
                        summary: editingItem?.summary || '',
                        content: editingItem?.content || '',
                        status: editingItem?.status || 'PUBLISHED',
                        scheduledPublishAt: editingItem?.scheduledPublishAt ? new Date(editingItem.scheduledPublishAt).toISOString().slice(0, 16) : '',
                        imageFile: null
                    }}
                    validationSchema={newsSchema}
                    onSubmit={handleSubmit}
                >
                    {({ errors, touched, setFieldValue }) => {
                        const handleFileChange = (info) => {
                            const file = info.file.originFileObj || info.file
                            if (!file) return
                            if (!file.type.startsWith('image/')) {
                                message.error('Chỉ được phép upload file ảnh!')
                                return
                            }
                            setFieldValue('imageFile', file)
                            const reader = new FileReader()
                            reader.onload = (e) => setPreviewUrl(e.target.result)
                            reader.readAsDataURL(file)
                        }

                        return (
                            <Form className="px-6 py-6 space-y-5 bg-white max-h-[75vh] overflow-y-auto no-scrollbar">
                                <div className="flex flex-col items-center justify-center mb-4">
                                    <div className="relative group cursor-pointer">
                                        <div className="h-40 w-72 overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition-all group-hover:border-sky-500 group-hover:bg-sky-50">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full flex-col items-center justify-center text-slate-400">
                                                    <PictureOutlined className="text-4xl mb-2 opacity-50" />
                                                    <span className="text-[11px] font-bold">Tải ảnh lên</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-3 -right-3">
                                            <Upload showUploadList={false} beforeUpload={() => false} onChange={handleFileChange}>
                                                <Button
                                                    shape="circle"
                                                    icon={<UploadOutlined />}
                                                    className="bg-white shadow-md border-slate-200 text-slate-600 hover:text-sky-600 hover:border-sky-600"
                                                />
                                            </Upload>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                            Tiêu đề bài viết <span className="text-red-500">*</span>
                                        </label>
                                        <Field
                                            name="title"
                                            placeholder="Nhập tiêu đề..."
                                            className={`custom-admin-input ${touched.title && errors.title ? 'custom-admin-input-error' : ''}`}
                                        />
                                        {touched.title && errors.title && (
                                            <p className="mt-1 text-xs font-medium text-red-500">{errors.title}</p>
                                        )}
                                    </div>
                                
                                    <div className="sm:col-span-1">
                                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                            Trạng thái
                                        </label>
                                        <Field as="select" name="status" className="custom-admin-input h-[46px]">
                                            <option value="DRAFT">Bản nháp</option>
                                            <option value="PUBLISHED">Xuất bản</option>
                                            <option value="ARCHIVED">Lưu trữ</option>
                                            <option value="SCHEDULED">Lên lịch</option>
                                        </Field>
                                    </div>
                                    
                                    <div className="sm:col-span-1">
                                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                            Thời gian lên lịch
                                        </label>
                                        <Field
                                            type="datetime-local"
                                            name="scheduledPublishAt"
                                            className="custom-admin-input h-[46px]"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                            Tóm tắt
                                        </label>
                                        <Field
                                            as="textarea"
                                            name="summary"
                                            rows={2}
                                            placeholder="Tóm tắt nội dung..."
                                            className={`custom-admin-input custom-scrollbar resize-none ${touched.summary && errors.summary ? 'custom-admin-input-error' : ''}`}
                                        />
                                        {touched.summary && errors.summary && (
                                            <p className="mt-1 text-xs font-medium text-red-500">{errors.summary}</p>
                                        )}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                            Nội dung chi tiết <span className="text-red-500">*</span>
                                        </label>
                                        <Field
                                            as="textarea"
                                            name="content"
                                            rows={6}
                                            placeholder="Nội dung đầy đủ..."
                                            className={`custom-admin-input custom-scrollbar resize-y min-h-[100px] ${touched.content && errors.content ? 'custom-admin-input-error' : ''}`}
                                        />
                                        {touched.content && errors.content && (
                                            <p className="mt-1 text-xs font-medium text-red-500">{errors.content}</p>
                                        )}
                                    </div>
                                </div>

                            <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-slate-100">
                                <AppButton type="button" variant="ghost" onClick={closeModal}>
                                    Hủy bỏ
                                </AppButton>
                                <AppButton type="submit" variant="primary" disabled={submitting}>
                                    {submitting ? 'Đang lưu...' : 'Lưu bài viết'}
                                </AppButton>
                            </div>
                        </Form>
                    )}}
                </Formik>
            </Modal>
        </div>
    )
}
