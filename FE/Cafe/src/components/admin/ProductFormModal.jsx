import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Checkbox, message, Modal, Select, Upload } from 'antd'
import { PictureOutlined, UploadOutlined } from '@ant-design/icons'
import {
    createAdminProduct,
    updateAdminProduct,
} from '../../redux/actions/admin/adminProductAction'

export default function ProductFormModal({
    open,
    editingItem,
    onClose,
    onSuccess,
    categories = [],
    masterSizes = [],
}) {
    const dispatch = useDispatch()
    const submitting = useSelector((s) => s.adminProduct.submitting)

    const [form, setForm] = useState({
        name: '',
        description: '',
        categoryId: null,
        imageFile: null,
    })
    const [previewUrl, setPreviewUrl] = useState('')
    const [selectedSizes, setSelectedSizes] = useState({})

    useEffect(() => {
        if (!open) return

        const matchedCategory = categories.find((c) => c.name === editingItem?.categoryName)
        setForm({
            name: editingItem ? editingItem.name : '',
            description: editingItem ? editingItem.description || '' : '',
            categoryId: editingItem
                ? Number(editingItem.categoryId) || Number(matchedCategory?.categoryId) || null
                : null,
            imageFile: null,
        })
        setPreviewUrl(editingItem?.imageUrl || '')

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
        setSelectedSizes(sizesState)
    }, [open, editingItem, categories, masterSizes])

    const handleFileChange = (info) => {
        const file = info.file.originFileObj || info.file
        if (!file) return

        if (!file.type.startsWith('image/')) {
            message.error('Chỉ được phép upload file ảnh!')
            return
        }

        setForm((prev) => ({ ...prev, imageFile: file }))
        const reader = new FileReader()
        reader.onload = (e) => setPreviewUrl(e.target.result)
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name || !form.categoryId) {
            message.warning('Vui lòng nhập tên và chọn danh mục!')
            return
        }

        const sizeListToSubmit = []
        for (const sizeId in selectedSizes) {
            if (selectedSizes[sizeId].isSelected) {
                if (selectedSizes[sizeId].price < 0 || selectedSizes[sizeId].stockQuantity < 0) {
                    message.warning('Giá và số lượng không được âm!')
                    return
                }
                sizeListToSubmit.push({
                    sizeId: parseInt(sizeId, 10),
                    price: selectedSizes[sizeId].price,
                    stockQuantity: selectedSizes[sizeId].stockQuantity,
                })
            }
        }

        if (sizeListToSubmit.length === 0) {
            message.warning('Vui lòng chọn ít nhất 1 kích cỡ cho sản phẩm!')
            return
        }

        const formData = new FormData()
        formData.append('name', form.name.trim())
        formData.append('description', form.description || '')
        formData.append('categoryId', form.categoryId)
        if (form.imageFile) {
            formData.append('imageFile', form.imageFile)
        }
        formData.append('productSizesJson', JSON.stringify(sizeListToSubmit))

        if (editingItem) {
            const res = await dispatch(updateAdminProduct({ id: editingItem.productId, formData }))
            if (updateAdminProduct.fulfilled.match(res)) {
                message.success('Cập nhật sản phẩm thành công!')
                onClose()
                onSuccess?.()
            } else {
                message.error(res.payload || 'Cập nhật thất bại')
            }
        } else {
            if (!form.imageFile) {
                message.warning('Vui lòng chọn ảnh cho sản phẩm!')
                return
            }
            const res = await dispatch(createAdminProduct(formData))
            if (createAdminProduct.fulfilled.match(res)) {
                message.success('Thêm sản phẩm thành công!')
                onClose()
                onSuccess?.()
            } else {
                message.error(res.payload || 'Thêm thất bại')
            }
        }
    }

    return (
        <Modal
            title={
                <div className="text-xl font-black text-slate-800 border-b border-slate-100 pb-4 mb-2">
                    {editingItem ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
                </div>
            }
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width={700}
            className="custom-admin-modal"
            closeIcon={
                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500">
                    ✕
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6 pt-2 h-[60vh] overflow-y-auto custom-scrollbar pr-2">
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
                            <Upload showUploadList={false} beforeUpload={() => false} onChange={handleFileChange}>
                                <Button
                                    shape="circle"
                                    icon={<UploadOutlined />}
                                    className="bg-white shadow-md border-slate-200 text-slate-600 hover:text-cyan-600 hover:border-cyan-600"
                                />
                            </Upload>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-sm font-bold text-slate-700">
                            Tên Sản Phẩm <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="VD: Trà sữa trân châu đường đen..."
                            className="w-full rounded-3xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 outline-none focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 transition-all"
                            required
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-sm font-bold text-slate-700">
                            Danh Mục <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={form.categoryId || undefined}
                            onChange={(val) => setForm({ ...form, categoryId: Number(val) })}
                            className="w-full h-12"
                            placeholder="Chọn danh mục"
                            options={categories.map((c) => ({ value: Number(c.categoryId), label: c.name }))}
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-sm font-bold text-slate-700">Mô Tả</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Mô tả chi tiết sản phẩm..."
                            rows={3}
                            className="w-full rounded-3xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 outline-none focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 transition-all custom-scrollbar"
                        />
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-base font-black text-slate-800 border-b border-slate-100 pb-2">
                        Cấu Hình Kích Cỡ & Giá <span className="text-red-500">*</span>
                    </h3>

                    {masterSizes.length === 0 ? (
                        <div className="text-center py-4 text-slate-400">
                            Chưa có kích cỡ nào trong hệ thống. Vui lòng thêm Kích Cỡ trước.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {masterSizes.map((ms) => {
                                const state = selectedSizes[ms.sizeId] || {
                                    isSelected: false,
                                    price: 0,
                                    stockQuantity: 0,
                                }
                                return (
                                    <div
                                        key={ms.sizeId}
                                        className={`rounded-3xl border ${state.isSelected
                                                ? 'border-cyan-500 bg-cyan-50/30'
                                                : 'border-slate-200 bg-slate-50/30'
                                            } p-4 transition-all duration-300`}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <Checkbox
                                                checked={state.isSelected}
                                                onChange={(e) => {
                                                    setSelectedSizes((prev) => ({
                                                        ...prev,
                                                        [ms.sizeId]: {
                                                            ...prev[ms.sizeId],
                                                            isSelected: e.target.checked,
                                                        },
                                                    }))
                                                }}
                                            />
                                            <span
                                                className={`font-bold text-base ${state.isSelected ? 'text-cyan-800' : 'text-slate-500'
                                                    }`}
                                            >
                                                Size {ms.name}{' '}
                                                <span className="text-xs text-slate-400 font-normal">
                                                    ({ms.pricePercent * 100}% giá)
                                                </span>
                                            </span>
                                        </div>

                                        {state.isSelected && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 pl-7">
                                                <div>
                                                    <label className="mb-1 block text-xs font-bold text-slate-500">
                                                        Giá Bán (VNĐ)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={state.price === 0 ? '' : state.price}
                                                        placeholder="0"
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value, 10)
                                                            setSelectedSizes((prev) => ({
                                                                ...prev,
                                                                [ms.sizeId]: {
                                                                    ...prev[ms.sizeId],
                                                                    price: isNaN(val) ? 0 : val,
                                                                },
                                                            }))
                                                        }}
                                                        className="w-full rounded-2xl border border-cyan-200 bg-white px-3 py-2 text-sm font-mono text-slate-800 outline-none focus:border-cyan-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-xs font-bold text-slate-500">
                                                        Số lượng Tồn Kho
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={state.stockQuantity === 0 ? '' : state.stockQuantity}
                                                        placeholder="0"
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value, 10)
                                                            setSelectedSizes((prev) => ({
                                                                ...prev,
                                                                [ms.sizeId]: {
                                                                    ...prev[ms.sizeId],
                                                                    stockQuantity: isNaN(val) ? 0 : val,
                                                                },
                                                            }))
                                                        }}
                                                        className="w-full rounded-2xl border border-cyan-200 bg-white px-3 py-2 text-sm font-mono text-slate-800 outline-none focus:border-cyan-500"
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

                <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-slate-100 flex justify-end gap-3 mt-4 -mx-2 px-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-3xl px-6 py-2.5 font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-3xl bg-gradient-to-r from-cyan-600 to-cyan-800 px-8 py-2.5 font-bold text-white shadow-lg shadow-cyan-900/30 hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 transition-all duration-300"
                    >
                        {submitting ? 'Đang lưu...' : 'Lưu Sản Phẩm'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

