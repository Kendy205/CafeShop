import { useEffect, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Checkbox, message, Modal, Select, Upload, Switch } from 'antd'
import { PictureOutlined, UploadOutlined, CoffeeOutlined } from '@ant-design/icons'
import {
    createAdminProduct,
    updateAdminProduct,
} from '../../redux/actions/admin/adminProductAction'
import { buildProductFormData } from '../../utils/helpers/ProductHelper'
import AdminModalBanner from './common/AdminModalBanner'
import AppButton from '../common/AppButton'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { AppToast, AppConfirm } from '../common/AppNotification'


const productSchema = Yup.object().shape({
    name: Yup.string().required('Vui lòng nhập tên sản phẩm'),
    categoryId: Yup.number().required('Vui lòng chọn danh mục'),
    basePrice: Yup.number().min(0, 'Giá không được âm').required('Vui lòng nhập giá cơ bản'),
    description: Yup.string().nullable(),
    imageFile: Yup.mixed().nullable(),
    stockQuantity: Yup.number().min(0, 'Số lượng không được âm').nullable(),
    isAvailable: Yup.boolean()
})

export default function ProductFormModal({
    open,
    editingItem,
    onClose,
    onSuccess,
    categories = [],
    masterSizes = [],
    masterToppings = [],
}) {
    const dispatch = useDispatch()
    const submitting = useSelector((s) => s.admin.product.submitting)
    const [previewUrl, setPreviewUrl] = useState('')

    const initialValues = useMemo(() => {
        const matchedCategory = categories.find((c) => c.name === editingItem?.categoryName)
        const sizesState = {}
        
        masterSizes.forEach((ms) => {
            sizesState[ms.sizeId] = { isSelected: false, price: 0, stockQuantity: 0 }
        })

        if (editingItem && editingItem.productSizes) {
            editingItem.productSizes.forEach((ps) => {
                sizesState[ps.sizeId] = {
                    isSelected: true,
                    price: ps.price,
                    stockQuantity: ps.stockQuantity,
                }
            })
        }

        const initialToppingIds = Array.isArray(editingItem?.productToppings)
            ? editingItem.productToppings.map(t => t.toppingId)
            : []

        return {
            name: editingItem?.name || '',
            basePrice: editingItem?.basePrice ?? '',
            description: editingItem?.description || '',
            categoryId: editingItem ? (Number(editingItem.categoryId) || Number(matchedCategory?.categoryId) || null) : null,
            imageFile: null,
            sizes: sizesState,
            toppingIds: initialToppingIds,
            isAvailable: editingItem?.isAvailable ?? true,
            stockQuantity: editingItem?.stockQuantity ?? ''
        }
    }, [editingItem, categories, masterSizes])

    const handleFileChange = useCallback((info, setFieldValue) => {
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
    }, [])

    useEffect(() => {
        if (open) {
            setPreviewUrl(editingItem?.imageUrl || '')
        }
    }, [open, editingItem])

    const handleSubmit = async (values) => {
        const formData = buildProductFormData(values, values.sizes, values.toppingIds)
        if (!formData) return

        if (editingItem) {
            const res = await dispatch(updateAdminProduct({ id: editingItem.productId, formData }))
            if (updateAdminProduct.fulfilled.match(res)) {
                AppToast.success('Cập nhật sản phẩm thành công!')
                onClose()
                onSuccess?.()
            } else {
                /* API Error Modal will handle this */
            }
        } else {
            if (!values.imageFile) {
                AppToast.warning('Vui lòng chọn ảnh cho sản phẩm!')
                return
            }
            const res = await dispatch(createAdminProduct(formData))
            if (createAdminProduct.fulfilled.match(res)) {
                AppToast.success('Thêm sản phẩm thành công!')
                onClose()
                onSuccess?.()
            } else {
                /* API Error Modal will handle this */
            }
        }
    }

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width={700}
            destroyOnClose
            className="custom-admin-modal"
            closeIcon={null}
        >
            <AdminModalBanner 
                title={editingItem ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
                subtitle="Cập nhật thông tin chi tiết, giá cả và kích cỡ đồ uống"
                icon={<CoffeeOutlined className="text-2xl" />}
                badgeText={editingItem ? 'CẬP NHẬT' : 'THÊM MỚI'}
                onClose={onClose}
            />

            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={productSchema}
                onSubmit={handleSubmit}
            >
                {({ values, errors, touched, setFieldValue }) => {
                    return (
                        <Form className="px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto bg-white custom-scrollbar">
                            <div className="flex flex-col items-center justify-center mb-2">
                                <div className="relative group cursor-pointer mb-2">
                                    <div className="h-32 w-32 overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition-all group-hover:border-cyan-500 group-hover:bg-cyan-50">
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
                                        <Upload showUploadList={false} beforeUpload={() => false} onChange={(info) => handleFileChange(info, setFieldValue)}>
                                            <Button
                                                shape="circle"
                                                icon={<UploadOutlined />}
                                                className="bg-white shadow-md border-slate-200 text-slate-600 hover:text-cyan-600 hover:border-cyan-600"
                                            />
                                        </Upload>
                                    </div>
                                </div>
                                {!previewUrl && !editingItem && (
                                    <p className="text-xs text-red-500 font-medium">Bắt buộc tải ảnh lên</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                        Tên Sản Phẩm <span className="text-red-500">*</span>
                                    </label>
                                    <Field
                                        name="name"
                                        placeholder="VD: Trà sữa trân châu đường đen..."
                                        className={`custom-admin-input ${touched.name && errors.name ? 'custom-admin-input-error' : ''}`}
                                    />
                                    {touched.name && errors.name && <p className="mt-1 text-xs font-medium text-red-500">{errors.name}</p>}
                                </div>

                                <div className="sm:col-span-1">
                                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                        Danh Mục <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        value={values.categoryId || undefined}
                                        onChange={(val) => setFieldValue('categoryId', Number(val))}
                                        className="w-full h-[46px]"
                                        placeholder="Chọn danh mục"
                                        options={categories.map((c) => ({ value: Number(c.categoryId), label: c.name }))}
                                        status={touched.categoryId && errors.categoryId ? 'error' : ''}
                                    />
                                    {touched.categoryId && errors.categoryId && <p className="mt-1 text-xs font-medium text-red-500">{errors.categoryId}</p>}
                                </div>

                                <div className="sm:col-span-1">
                                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                        Giá Cơ Bản (VNĐ) <span className="text-red-500">*</span>
                                    </label>
                                    <Field
                                        type="number"
                                        name="basePrice"
                                        placeholder="VD: 35000"
                                        className={`custom-admin-input font-mono ${touched.basePrice && errors.basePrice ? 'custom-admin-input-error' : ''}`}
                                    />
                                    {touched.basePrice && errors.basePrice && <p className="mt-1 text-xs font-medium text-red-500">{errors.basePrice}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">Mô Tả</label>
                                    <Field
                                        as="textarea"
                                        name="description"
                                        placeholder="Mô tả chi tiết sản phẩm..."
                                        rows={3}
                                        className="custom-admin-input custom-scrollbar resize-none"
                                    />
                                </div>

                                <div className="sm:col-span-1">
                                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                        Tổng Tồn Kho (Để trống sẽ tự động tính từ các Size)
                                    </label>
                                    <Field
                                        type="number"
                                        name="stockQuantity"
                                        placeholder="VD: 100"
                                        className={`custom-admin-input font-mono ${touched.stockQuantity && errors.stockQuantity ? 'custom-admin-input-error' : ''}`}
                                    />
                                    {touched.stockQuantity && errors.stockQuantity && <p className="mt-1 text-xs font-medium text-red-500">{errors.stockQuantity}</p>}
                                </div>

                                <div className="sm:col-span-1">
                                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                        Trạng thái hiển thị (Bán)
                                    </label>
                                    <div className="flex items-center gap-3 h-[46px] px-3 rounded-2xl border border-slate-200 bg-white">
                                        <Switch
                                            checked={values.isAvailable}
                                            onChange={(checked) => setFieldValue('isAvailable', checked)}
                                            className={`custom-admin-switch ${values.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                        />
                                        {values.isAvailable ? (
                                            <span className="text-xs font-semibold text-emerald-600">Đang bán</span>
                                        ) : (
                                            <span className="text-xs font-semibold text-slate-400">Đã ẩn</span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                        Topping Khả Dụng (Tùy Chọn)
                                    </label>
                                    <Select
                                        mode="multiple"
                                        allowClear
                                        placeholder="Chọn các topping có thể thêm vào sản phẩm này..."
                                        value={values.toppingIds}
                                        onChange={(vals) => setFieldValue('toppingIds', vals)}
                                        className="w-full"
                                        options={(masterToppings || []).map((t) => ({ value: Number(t.toppingId), label: t.name }))}
                                    />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50/30 p-5 shadow-sm">
                                <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-3">
                                    Cấu Hình Kích Cỡ & Giá <span className="text-red-500">*</span>
                                </h3>

                                {masterSizes.length === 0 ? (
                                    <div className="text-center py-4 text-slate-400">
                                        Chưa có kích cỡ nào trong hệ thống. Vui lòng thêm Kích Cỡ trước.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {masterSizes.map((ms) => {
                                            const state = values.sizes[ms.sizeId] || { isSelected: false, price: 0, stockQuantity: 0 }
                                            return (
                                                <div
                                                    key={ms.sizeId}
                                                    className={`rounded-2xl border ${state.isSelected
                                                        ? 'border-cyan-500 bg-cyan-50/50'
                                                        : 'border-slate-200 bg-white'
                                                        } p-4 transition-all duration-300`}
                                                >
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <Checkbox
                                                            checked={state.isSelected}
                                                            onChange={(e) => {
                                                                setFieldValue(`sizes.${ms.sizeId}.isSelected`, e.target.checked)
                                                            }}
                                                        />
                                                        <span
                                                            className={`font-black text-sm uppercase ${state.isSelected ? 'text-cyan-800' : 'text-slate-500'}`}
                                                        >
                                                            Size {ms.name}
                                                        </span>

                                                    </div>

                                                    {state.isSelected && (
                                                        <div className="grid grid-cols-2 gap-4 pl-7">
                                                            <div>
                                                                <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">
                                                                    Giá bán <span className="text-red-500">*</span>
                                                                </label>
                                                                <div className="relative">
                                                                    <Field
                                                                        type="number"
                                                                        name={`sizes.${ms.sizeId}.price`}
                                                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all font-mono"
                                                                    />
                                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">đ</span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">
                                                                    Số lượng kho <span className="text-red-500">*</span>
                                                                </label>
                                                                <Field
                                                                    type="number"
                                                                    name={`sizes.${ms.sizeId}.stockQuantity`}
                                                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all font-mono"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600">
                                    Vui lòng kiểm tra lại các trường thông tin: {Object.values(errors).join(', ')}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <AppButton type="button" variant="ghost" onClick={onClose}>
                                    Hủy bỏ
                                </AppButton>
                                <AppButton type="submit" variant="primary" disabled={submitting}>
                                    {submitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
                                </AppButton>
                            </div>
                        </Form>
                    )
                }}
            </Formik>
        </Modal>
    )
}
