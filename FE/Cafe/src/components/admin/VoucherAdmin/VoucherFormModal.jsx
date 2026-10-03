import React from 'react'
import { Modal } from 'antd'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import {
    TagOutlined,
    CloseOutlined,
    CalendarOutlined,
    DollarOutlined,
    PercentageOutlined,
    ThunderboltOutlined,
    InfoCircleOutlined,
    CheckCircleFilled,
} from '@ant-design/icons'
import {
    DiscountType,
    VoucherTargetType,
    VoucherApplyType,
} from '../../../utils/constants/VoucherConstants'

const schema = Yup.object({
    code: Yup.string().required('Vui lòng nhập mã voucher'),
    description: Yup.string().required('Vui lòng nhập mô tả'),
    targetType: Yup.string().required(),
    applyType: Yup.string().required(),
    discountType: Yup.string().required(),
    discountValue: Yup.number().min(0, 'Giá trị không hợp lệ').required('Nhập giá trị giảm'),
    minOrderValue: Yup.number().min(0, 'Giá trị không hợp lệ').required('Nhập đơn tối thiểu'),
    maxDiscountAmount: Yup.number().min(0, 'Giá trị không hợp lệ').required('Nhập giảm tối đa'),
    startDate: Yup.string().required('Chọn ngày bắt đầu'),
    endDate: Yup.string().required('Chọn ngày kết thúc'),
    usageLimit: Yup.number().min(1, 'Tối thiểu 1 lượt').required('Nhập giới hạn'),
})

function toInputDate(value) {
    if (!value) return ''
    return String(value).slice(0, 16)
}

function toPayload(values) {
    return {
        ...values,
        code: values.code.trim().toUpperCase(),
        discountValue: Number(values.discountValue),
        minOrderValue: Number(values.minOrderValue),
        maxDiscountAmount: Number(values.maxDiscountAmount),
        usageLimit: Number(values.usageLimit),
        startDate: values.startDate.length === 16 ? `${values.startDate}:00` : values.startDate,
        endDate: values.endDate.length === 16 ? `${values.endDate}:00` : values.endDate,
    }
}

export default function VoucherFormModal({
    open,
    editing,
    onClose,
    onSubmit,
    submitting = false,
}) {
    const emptyValues = {
        code: '',
        description: '',
        targetType: VoucherTargetType.PUBLIC,
        applyType: VoucherApplyType.ORDER,
        discountType: DiscountType.FIXED,
        discountValue: 15000,
        minOrderValue: 50000,
        maxDiscountAmount: 15000,
        startDate: '',
        endDate: '',
        usageLimit: 100,
    }

    const initialValues = editing
        ? {
              code: editing.code || '',
              description: editing.description || '',
              targetType: editing.targetType || VoucherTargetType.PUBLIC,
              applyType: editing.applyType || VoucherApplyType.ORDER,
              discountType: editing.discountType || DiscountType.FIXED,
              discountValue: editing.discountValue ?? 0,
              minOrderValue: editing.minOrderValue ?? 0,
              maxDiscountAmount: editing.maxDiscountAmount ?? 0,
              startDate: toInputDate(editing.startDate),
              endDate: toInputDate(editing.endDate),
              usageLimit: editing.usageLimit ?? 1,
          }
        : emptyValues

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            closeIcon={false}
            centered
            width={680}
            destroyOnClose
            styles={{
                content: {
                    padding: 0,
                    borderRadius: '28px',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(14, 165, 233, 0.25)',
                    border: '1px solid rgba(14, 165, 233, 0.2)',
                },
            }}
        >
            {/* Header Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 px-6 py-5 text-white">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />
                <div className="absolute left-1/3 -bottom-10 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />

                <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/30">
                            <TagOutlined className="text-2xl" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/20 px-2.5 py-0.5 text-[11px] font-bold text-sky-300">
                                <span>{editing ? 'Chỉnh Sửa Mã' : 'Tạo Mới Voucher'}</span>
                            </div>
                            <h3 className="mt-1 text-lg font-black tracking-tight text-white">
                                {editing ? `Cập Nhật Mã: ${editing.code}` : 'Tạo Mã Giảm Giá Mới'}
                            </h3>
                            <p className="text-xs text-sky-200/80">
                                {editing
                                    ? 'Cập nhật lại giá trị khuyến mãi, thời hạn hoặc giới hạn lượt dùng.'
                                    : 'Thiết lập mã khuyến mãi mới để thu hút khách hàng.'}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition-all hover:bg-white/20 hover:text-white cursor-pointer"
                        title="Đóng"
                    >
                        <CloseOutlined className="text-xs" />
                    </button>
                </div>
            </div>

            {/* Formik Form with Sleek Styling */}
            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={schema}
                onSubmit={async (values) => {
                    await onSubmit(toPayload(values))
                }}
            >
                {({ errors, touched, values, setFieldValue }) => (
                    <Form className="max-h-[72vh] overflow-y-auto px-6 py-5 space-y-5 bg-white custom-scrollbar">
                        {/* 1. Mã Voucher & Mô tả */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                        Mã Voucher <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Field
                                            name="code"
                                            placeholder="VD: GIAM20K"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-mono text-sm font-black text-sky-700 tracking-wider uppercase outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200"
                                        />
                                    </div>
                                    {touched.code && errors.code && (
                                        <p className="mt-1 text-xs font-medium text-red-500">{errors.code}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                        Mô Tả Chương Trình <span className="text-red-500">*</span>
                                    </label>
                                    <Field
                                        name="description"
                                        placeholder="VD: Quà tri ân khách hàng giảm 20k cho đơn từ 100k..."
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200"
                                    />
                                    {touched.description && errors.description && (
                                        <p className="mt-1 text-xs font-medium text-red-500">{errors.description}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2. Đối tượng & Loại Áp Dụng */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                    Đối Tượng Áp Dụng
                                </label>
                                <Field
                                    as="select"
                                    name="targetType"
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200 cursor-pointer"
                                >
                                    <option value={VoucherTargetType.PUBLIC}>
                                        🌐 Ưu đãi chung (Ai cũng dùng được)
                                    </option>
                                    <option value={VoucherTargetType.USER}>
                                        🎁 Dành riêng cho bạn (Tặng tài khoản)
                                    </option>
                                </Field>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                    Loại Áp Dụng
                                </label>
                                <Field
                                    as="select"
                                    name="applyType"
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200 cursor-pointer"
                                >
                                    <option value={VoucherApplyType.ORDER}>
                                        🛒 Giảm tiền món trong đơn hàng
                                    </option>
                                    <option value={VoucherApplyType.SHIPPING}>
                                        🚚 Giảm phí vận chuyển (Freeship)
                                    </option>
                                </Field>
                            </div>
                        </div>

                        {/* 3. Khung Giá Trị & Mức Chiết Khấu */}
                        <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/40 via-indigo-50/20 to-slate-50/50 p-4 space-y-3.5">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-sky-800 border-b border-sky-100/80 pb-2">
                                <DollarOutlined className="text-sky-600" />
                                <span>Cấu Hình Giá Trị Khuyến Mãi</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Loại Giảm Giá
                                    </label>
                                    <Field
                                        as="select"
                                        name="discountType"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 cursor-pointer"
                                    >
                                        <option value={DiscountType.FIXED}>💵 Số tiền cố định (VNĐ)</option>
                                        <option value={DiscountType.PERCENTAGE}>🏷️ Theo phần trăm (%)</option>
                                    </Field>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Giá Trị Giảm {values.discountType === DiscountType.PERCENTAGE ? '(%)' : '(VNĐ)'}
                                    </label>
                                    <div className="relative">
                                        <Field
                                            name="discountValue"
                                            type="number"
                                            min="0"
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm font-bold text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                        />
                                        <span className="absolute right-3 top-2 text-xs font-bold text-slate-400 pointer-events-none">
                                            {values.discountType === DiscountType.PERCENTAGE ? '%' : 'đ'}
                                        </span>
                                    </div>
                                    {touched.discountValue && errors.discountValue && (
                                        <p className="mt-1 text-xs font-medium text-red-500">{errors.discountValue}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Đơn Hàng Tối Thiểu (VNĐ)
                                    </label>
                                    <div className="relative">
                                        <Field
                                            name="minOrderValue"
                                            type="number"
                                            min="0"
                                            step="1000"
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm font-bold text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                        />
                                        <span className="absolute right-3 top-2 text-xs font-bold text-slate-400 pointer-events-none">
                                            đ
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Mức Giảm Tối Đa (VNĐ)
                                    </label>
                                    <div className="relative">
                                        <Field
                                            name="maxDiscountAmount"
                                            type="number"
                                            min="0"
                                            step="1000"
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm font-bold text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                        />
                                        <span className="absolute right-3 top-2 text-xs font-bold text-slate-400 pointer-events-none">
                                            đ
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Thời Gian Áp Dụng */}
                        <div className="space-y-3.5">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700">
                                <CalendarOutlined className="text-amber-500" />
                                <span>Thời Gian Hiệu Lực</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Bắt Đầu <span className="text-red-500">*</span>
                                    </label>
                                    <Field
                                        name="startDate"
                                        type="datetime-local"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-bold text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200"
                                    />
                                    {touched.startDate && errors.startDate && (
                                        <p className="mt-1 text-xs font-medium text-red-500">{errors.startDate}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Kết Thúc <span className="text-red-500">*</span>
                                    </label>
                                    <Field
                                        name="endDate"
                                        type="datetime-local"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-bold text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200"
                                    />
                                    {touched.endDate && errors.endDate && (
                                        <p className="mt-1 text-xs font-medium text-red-500">{errors.endDate}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 5. Giới Hạn Lượt Dùng Toàn Hệ Thống */}
                        <div className="space-y-2">
                            <label className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-700">
                                <div className="flex items-center gap-1.5">
                                    <ThunderboltOutlined className="text-purple-600" />
                                    <span>Tổng Số Lượt Dùng Toàn Hệ Thống</span>
                                </div>
                                <span className="text-[11px] font-semibold text-slate-400">
                                    (Toàn bộ khách hàng có thể dùng)
                                </span>
                            </label>

                            <div className="flex items-center gap-3">
                                <Field
                                    name="usageLimit"
                                    type="number"
                                    min="1"
                                    className="w-32 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-center font-mono text-sm font-black text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200"
                                />

                                {/* Quick Presets for total usage */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {[50, 100, 200, 500, 1000].map((preset) => {
                                        const isActive = Number(values.usageLimit) === preset
                                        return (
                                            <button
                                                key={preset}
                                                type="button"
                                                onClick={() => setFieldValue('usageLimit', preset)}
                                                className={`rounded-xl px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                                                    isActive
                                                        ? 'bg-sky-600 text-white shadow-xs'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                            >
                                                {preset}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                                className="rounded-2xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                            >
                                Hủy Bỏ
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-black text-white shadow-lg transition-all cursor-pointer ${
                                    submitting
                                        ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                        : 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-sky-500/30 active:scale-95'
                                }`}
                            >
                                <TagOutlined />
                                <span>{submitting ? 'Đang lưu...' : editing ? 'Cập Nhật Voucher' : 'Tạo Voucher Mới'}</span>
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    )
}
