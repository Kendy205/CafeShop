import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { message, Modal, Space, Button, Upload, Tag, Select } from 'antd'
import AdminTooltip from '../../../components/admin/common/AdminTooltip'
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    FileTextOutlined,
    PictureOutlined,
    UploadOutlined,
} from '@ant-design/icons'
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
import AppSearchBox from '../../../components/common/AppSearchBox'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { AppToast, AppConfirm } from '../../../components/common/AppNotification'


// ── Mapping Status → UI ───────────────────────────────────────────────────────
const STATUS_CONFIG = {
    Published: { label: 'Đã xuất bản', color: 'green' },
    Draft:     { label: 'Bản nháp',     color: 'orange' },
    Hidden:    { label: 'Đang ẩn',      color: 'default' },
}

function StatusTag({ status }) {
    const cfg = STATUS_CONFIG[status] || { label: status || '—', color: 'default' }
    return <Tag color={cfg.color} className="rounded-full font-semibold text-xs">{cfg.label}</Tag>
}

const newsSchema = Yup.object().shape({
    title:              Yup.string().required('Vui lòng nhập tiêu đề bài viết'),
    summary:            Yup.string().nullable(),
    content:            Yup.string().required('Vui lòng nhập nội dung bài viết'),
    status:             Yup.string().nullable(),
    scheduledPublishAt: Yup.string().nullable(),
})

const PAGE_SIZE = 10

export default function AdminNewsPage() {
    const dispatch = useDispatch()
    const { items, loading, submitting, total, page } = useSelector((s) => s.admin.news)

    const [isModalVisible, setIsModalVisible] = useState(false)
    const [editingItem, setEditingItem]       = useState(null)
    const [previewUrl, setPreviewUrl]         = useState('')
    const [currentPage, setCurrentPage]       = useState(1)
    const [keyword, setKeyword]               = useState('')
    const [filterStatus, setFilterStatus]     = useState('')

    // ── Fetch (server-side) ───────────────────────────────────────────────────
    const fetchNews = useCallback((pg = currentPage) => {
        dispatch(fetchAdminNews({
            pageNumber: pg,
            pageSize:   PAGE_SIZE,
            keyword:    keyword || undefined,
            status:     filterStatus || undefined,
        }))
    }, [dispatch, keyword, filterStatus, currentPage])

    useEffect(() => {
        fetchNews(currentPage)
    }, [dispatch, currentPage, keyword, filterStatus]) // eslint-disable-line

    // Reset về trang 1 khi filter thay đổi
    const handleKeywordChange = (val) => { setKeyword(val); setCurrentPage(1) }
    const handleStatusChange  = (val) => { setFilterStatus(val); setCurrentPage(1) }

    // ── Modal helpers ─────────────────────────────────────────────────────────
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

    // ── Submit form ───────────────────────────────────────────────────────────
    const handleSubmit = async (values, { resetForm }) => {
        const formData = new FormData()
        formData.append('Title',   values.title   || '')
        formData.append('Content', values.content || '')
        if (values.summary)            formData.append('Summary',            values.summary)
        if (values.status)             formData.append('Status',             values.status)
        if (values.imageFile)          formData.append('ImageFile',          values.imageFile)
        if (values.scheduledPublishAt) formData.append('ScheduledPublishAt', values.scheduledPublishAt)

        if (editingItem) {
            const res = await dispatch(updateAdminNews({ id: editingItem.newsId, data: formData }))
            if (updateAdminNews.fulfilled.match(res)) {
                AppToast.success('Cập nhật bài viết thành công!')
                closeModal()
                resetForm()
                fetchNews(currentPage)
            }
        } else {
            const res = await dispatch(createAdminNews(formData))
            if (createAdminNews.fulfilled.match(res)) {
                AppToast.success('Thêm bài viết thành công!')
                closeModal()
                resetForm()
                setCurrentPage(1)
                dispatch(fetchAdminNews({ pageNumber: 1, pageSize: PAGE_SIZE }))
            }
        }
    }

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDelete = (id) => {
        AppConfirm({
            title:      'Xác nhận xóa bài viết',
            content:    'Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.',
            okText:     'Xóa',
            okType:     'danger',
            cancelText: 'Hủy',
            centered:   true,
            onOk: async () => {
                const res = await dispatch(deleteAdminNews(id))
                if (deleteAdminNews.fulfilled.match(res)) {
                    AppToast.success('Xóa bài viết thành công!')
                    // Nếu xóa item cuối trên trang > 1, lùi về trang trước
                    const newPage = items.length === 1 && currentPage > 1
                        ? currentPage - 1
                        : currentPage
                    setCurrentPage(newPage)
                    dispatch(fetchAdminNews({
                        pageNumber: newPage,
                        pageSize:   PAGE_SIZE,
                        keyword:    keyword || undefined,
                        status:     filterStatus || undefined,
                    }))
                }
            },
        })
    }

    // ── Columns ───────────────────────────────────────────────────────────────
    const columns = [
        {
            title:     'ID',
            dataIndex: 'newsId',
            key:       'newsId',
            width:     70,
            render:    (id) => <span className="font-mono text-slate-400 text-xs">#{id}</span>,
        },
        {
            title:     'Hình ảnh',
            dataIndex: 'imageUrl',
            key:       'imageUrl',
            width:     90,
            render:    (url) =>
                url
                    ? <img src={url} alt="News" className="w-12 h-12 rounded-xl object-cover" />
                    : <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs">No img</div>,
        },
        {
            title:     'Tiêu đề',
            dataIndex: 'title',
            key:       'title',
            render:    (text, record) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-800 text-sm">{text}</span>
                    {record.summary && (
                        <span className="text-xs text-slate-400 line-clamp-1">{record.summary}</span>
                    )}
                </div>
            ),
        },
        {
            title:     'Trạng thái',
            dataIndex: 'status',
            key:       'status',
            width:     130,
            render:    (status) => <StatusTag status={status} />,
        },
        {
            title:     'Tác giả',
            dataIndex: 'authorName',
            key:       'authorName',
            width:     140,
            render:    (name) => <span className="text-xs text-slate-600">{name || '—'}</span>,
        },
        {
            title:     'Lượt xem',
            dataIndex: 'viewCount',
            key:       'viewCount',
            width:     90,
            align:     'center',
            render:    (v) => <span className="text-xs font-semibold text-sky-700">{v ?? 0}</span>,
        },
        {
            title:  'Thao tác',
            key:    'action',
            width:  110,
            align:  'right',
            render: (_, record) => (
                <div className="flex items-center justify-end gap-2">
                    <AdminTooltip title="Chỉnh sửa">
                        <button
                            onClick={() => openModal(record)}
                            className="admin-action-btn admin-action-btn-edit"
                        >
                            <EditOutlined />
                            <span>Sửa</span>
                        </button>
                    </AdminTooltip>
                    <AdminTooltip title="Xóa bài viết">
                        <button
                            onClick={() => handleDelete(record.newsId)}
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

    // ── Render ────────────────────────────────────────────────────────────────
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
                        <strong className="text-white text-sm font-black">{total}</strong>
                    </div>
                }
            />

            {/* ── Toolbar: search + filter ── */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 shadow-xs">
                <AppSearchBox
                    initialValue={keyword}
                    placeholder="Tìm kiếm theo tiêu đề..."
                    onSearch={handleKeywordChange}
                    className="flex-1 min-w-[220px] max-w-sm"
                />

                <Select
                    value={filterStatus || undefined}
                    placeholder="Tất cả trạng thái"
                    allowClear
                    onChange={(val) => handleStatusChange(val || '')}
                    className="w-44"
                    options={[
                        { value: 'Published', label: '🟢 Đã xuất bản' },
                        { value: 'Draft',     label: '🟡 Bản nháp' },
                        { value: 'Hidden',    label: '⚫ Đang ẩn' },
                    ]}
                />

                <div className="text-xs text-slate-500 font-semibold">
                    Tổng: <strong className="text-sky-700">{total}</strong> bài viết
                </div>
            </div>

            {/* ── Table ── */}
            <AdminTable
                columns={columns}
                dataSource={items}
                rowKey="newsId"
                loading={loading}
                currentPage={currentPage}
                pageSize={PAGE_SIZE}
                totalItems={total}
                onPageChange={(pg) => setCurrentPage(pg)}
            />

            {/* ── Modal Create / Edit ── */}
            <Modal
                open={isModalVisible}
                onCancel={closeModal}
                footer={null}
                centered
                width={720}
                destroyOnClose
                className="custom-admin-modal"
                closeIcon={null}
            >
                <AdminModalBanner
                    title={editingItem ? 'Sửa Bài Viết' : 'Thêm Bài Viết Mới'}
                    subtitle="Đăng bài viết để khách hàng luôn cập nhật thông tin mới nhất"
                    icon={<FileTextOutlined className="text-2xl" />}
                    badgeText={editingItem ? 'CẬP NHẬT' : 'THÊM MỚI'}
                    onClose={closeModal}
                />

                <Formik
                    enableReinitialize
                    initialValues={{
                        title:              editingItem?.title   || '',
                        summary:            editingItem?.summary || '',
                        content:            editingItem?.content || '',
                        status:             editingItem?.status  || 'Draft',
                        scheduledPublishAt: editingItem?.scheduledPublishAt
                            ? new Date(editingItem.scheduledPublishAt).toISOString().slice(0, 16)
                            : '',
                        imageFile: null,
                    }}
                    validationSchema={newsSchema}
                    onSubmit={handleSubmit}
                >
                    {({ errors, touched, setFieldValue }) => {
                        const handleFileChange = (info) => {
                            const file = info.file.originFileObj || info.file
                            if (!file) return
                            if (!file.type.startsWith('image/')) {
                                AppToast.error('Chỉ được phép upload file ảnh!')
                                return
                            }
                            setFieldValue('imageFile', file)
                            const reader = new FileReader()
                            reader.onload = (e) => setPreviewUrl(e.target.result)
                            reader.readAsDataURL(file)
                        }

                        return (
                            <Form className="px-6 py-6 space-y-5 bg-white max-h-[75vh] overflow-y-auto no-scrollbar">
                                {/* ── Image upload ── */}
                                <div className="flex flex-col items-center justify-center mb-2">
                                    <div className="relative group cursor-pointer">
                                        <div className="h-40 w-72 overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition-all group-hover:border-sky-500 group-hover:bg-sky-50">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full flex-col items-center justify-center text-slate-400">
                                                    <PictureOutlined className="text-4xl mb-2 opacity-50" />
                                                    <span className="text-[11px] font-bold">Tải ảnh bìa lên</span>
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
                                    {/* Title */}
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

                                    {/* Status */}
                                    <div className="sm:col-span-1">
                                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                            Trạng thái
                                        </label>
                                        <Field as="select" name="status" className="custom-admin-input h-[46px]">
                                            <option value="Draft">📝 Bản nháp</option>
                                            <option value="Published">✅ Xuất bản</option>
                                            <option value="Hidden">🔒 Ẩn</option>
                                        </Field>
                                    </div>

                                    {/* ScheduledPublishAt */}
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

                                    {/* Summary */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                            Tóm tắt
                                        </label>
                                        <Field
                                            as="textarea"
                                            name="summary"
                                            rows={2}
                                            placeholder="Mô tả ngắn gọn nội dung bài viết..."
                                            className="custom-admin-input custom-scrollbar resize-none"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                            Nội dung chi tiết <span className="text-red-500">*</span>
                                        </label>
                                        <Field
                                            as="textarea"
                                            name="content"
                                            rows={8}
                                            placeholder="Nhập nội dung HTML đầy đủ..."
                                            className={`custom-admin-input custom-scrollbar resize-y min-h-[120px] font-mono text-xs ${touched.content && errors.content ? 'custom-admin-input-error' : ''}`}
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
                        )
                    }}
                </Formik>
            </Modal>
        </div>
    )
}
