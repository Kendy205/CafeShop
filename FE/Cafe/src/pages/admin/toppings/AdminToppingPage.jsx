import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { message, Modal, Switch, Space, Button, Upload } from 'antd'
import AdminTooltip from '../../../components/admin/common/AdminTooltip'
import { EditOutlined, PlusOutlined, UploadOutlined, CoffeeOutlined } from '@ant-design/icons'
import {
    fetchAdminToppings,
    createAdminTopping,
    updateAdminTopping,
    toggleToppingAvailability,
} from '../../../redux/actions/admin/adminToppingAction'
import { formatVnd } from '../../../utils/helpers/format'
import AdminPageBanner from '../../../components/admin/common/AdminPageBanner'
import AdminTable from '../../../components/admin/common/AdminTable'
import AdminModalBanner from '../../../components/admin/common/AdminModalBanner'
import AppButton from '../../../components/common/AppButton'
import AppSearchBox from '../../../components/common/AppSearchBox'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'

const toppingSchema = Yup.object().shape({
    name: Yup.string().required('Vui lòng nhập tên Topping'),
    price: Yup.number().min(0, 'Giá không hợp lệ').required('Vui lòng nhập giá'),
    imageFile: Yup.mixed()
})

export default function AdminToppingPage() {
    const dispatch = useDispatch()
    const { items, loading, submitting } = useSelector((s) => s.admin.topping)

    const [isModalVisible, setIsModalVisible] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [previewUrl, setPreviewUrl] = useState('')
    const [searchText, setSearchText] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    useEffect(() => {
        dispatch(fetchAdminToppings())
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
        const formData = new FormData()
        formData.append('name', values.name.trim())
        formData.append('price', values.price)
        if (values.imageFile) {
            formData.append('imageFile', values.imageFile)
        }

        if (editingItem) {
            const res = await dispatch(updateAdminTopping({ id: editingItem.toppingId, formData }))
            if (updateAdminTopping.fulfilled.match(res)) {
                message.success('Cập nhật thành công!')
                closeModal()
                resetForm()
            } else {
                /* API Error Modal will handle this */
            }
        } else {
            if (!values.imageFile) {
                message.warning('Vui lòng chọn ảnh cho Topping!')
                return
            }
            const res = await dispatch(createAdminTopping(formData))
            if (createAdminTopping.fulfilled.match(res)) {
                message.success('Thêm mới thành công!')
                closeModal()
                resetForm()
            } else {
                /* API Error Modal will handle this */
            }
        }
    }

    const handleToggle = async (id, checked) => {
        const res = await dispatch(toggleToppingAvailability(id))
        if (toggleToppingAvailability.fulfilled.match(res)) {
            message.success(`Đã ${checked ? 'bật' : 'tắt'} hiển thị topping!`)
        } else {
            /* API Error Modal will handle this */
        }
    }

    const filteredItems = items.filter(t => t.name.toLowerCase().includes(searchText.toLowerCase()))
    const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

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
                        className={`custom-admin-switch ${isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}
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
                <AdminTooltip title="Chỉnh sửa topping">
                    <button
                        onClick={() => openModal(record)}
                        className="admin-action-btn admin-action-btn-edit"
                    >
                        <EditOutlined />
                        <span>Sửa</span>
                    </button>
                </AdminTooltip>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 shadow-xs">
                <AppSearchBox
                    initialValue={searchText}
                    placeholder="Tìm kiếm topping theo tên..."
                    onSearch={(val) => { setSearchText(val); setCurrentPage(1); }}
                    className="flex-1 min-w-[220px] max-w-md"
                />

                <div className="flex items-center gap-4">
                    <div className="text-xs text-slate-500 font-semibold hidden sm:block">
                        Đang hiển thị: <strong className="text-emerald-700">{filteredItems.length}</strong> loại topping
                    </div>
                    <AppButton onClick={() => openModal()} className="!px-5 !bg-emerald-500 hover:!bg-emerald-600 shadow-emerald-500/30">
                        <PlusOutlined />
                        <span>Thêm Topping mới</span>
                    </AppButton>
                </div>
            </div>

            <AdminTable
                columns={columns}
                dataSource={paginatedItems}
                rowKey="toppingId"
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
                    title={editingItem ? 'Sửa Topping' : 'Thêm Topping Mới'}
                    subtitle="Thiết lập tên topping và mức giá phụ thu"
                    icon={<CoffeeOutlined className="text-2xl" />}
                    badgeText={editingItem ? 'CẬP NHẬT' : 'THÊM MỚI'}
                    onClose={closeModal}
                />

                <Formik
                    enableReinitialize
                    initialValues={{
                        name: editingItem?.name || '',
                        price: editingItem?.price ?? 0,
                        imageFile: null
                    }}
                    validationSchema={toppingSchema}
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
                            <Form className="px-6 py-6 space-y-5 bg-white">
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
                                    {!previewUrl && !editingItem && (
                                        <p className="text-xs text-red-500 font-medium">Bắt buộc phải tải ảnh lên</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                        Tên Topping <span className="text-red-500">*</span>
                                    </label>
                                    <Field
                                        name="name"
                                        placeholder="VD: Trân châu đen, Thạch phô mai..."
                                        className={`custom-admin-input focus:border-emerald-500 focus:ring-emerald-200 ${touched.name && errors.name ? 'custom-admin-input-error' : ''}`}
                                    />
                                    {touched.name && errors.name && (
                                        <p className="mt-1 text-xs font-medium text-red-500">{errors.name}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                        Giá bán (VNĐ) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Field
                                            type="number"
                                            name="price"
                                            placeholder="0"
                                            className={`custom-admin-input pr-10 focus:border-emerald-500 focus:ring-emerald-200 font-mono ${touched.price && errors.price ? 'custom-admin-input-error' : ''}`}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">đ</span>
                                    </div>
                                    {touched.price && errors.price && (
                                        <p className="mt-1 text-xs font-medium text-red-500">{errors.price}</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-6 mt-2">
                                    <AppButton type="button" variant="ghost" onClick={closeModal}>
                                        Hủy bỏ
                                    </AppButton>
                                    <AppButton type="submit" variant="primary" disabled={submitting} className="!bg-emerald-500 hover:!bg-emerald-600 shadow-emerald-500/30">
                                        {submitting ? 'Đang lưu...' : 'Lưu Topping'}
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
