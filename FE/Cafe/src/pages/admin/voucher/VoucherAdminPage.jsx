import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { message } from 'antd'
import {
    createAdminVoucher,
    getAdminVouchers,
    toggleAdminVoucher,
    updateAdminVoucher,
} from '../../../redux/actions/admin/adminVoucherAction'
import { AdminModal, AdminTable, FormField, PageHeader } from '../adminShared'
import { formatVnd } from '../../../utils/helpers/format'

const schema = Yup.object({
    code: Yup.string().required('Nhập mã'),
    discountType: Yup.string().required(),
    discountValue: Yup.number().min(0).required('Nhập giá trị giảm'),
    minOrderValue: Yup.number().min(0).required(),
    maxDiscountAmount: Yup.number().min(0).required(),
    startDate: Yup.string().required(),
    endDate: Yup.string().required(),
    usageLimit: Yup.number().min(1).required(),
})

function toInputDate(value) {
    if (!value) return ''
    return String(value).slice(0, 16)
}

function toPayload(values) {
    return {
        ...values,
        discountValue: Number(values.discountValue),
        minOrderValue: Number(values.minOrderValue),
        maxDiscountAmount: Number(values.maxDiscountAmount),
        usageLimit: Number(values.usageLimit),
        startDate: values.startDate.length === 16 ? `${values.startDate}:00` : values.startDate,
        endDate: values.endDate.length === 16 ? `${values.endDate}:00` : values.endDate,
    }
}

export default function VoucherAdminPage() {
    const dispatch = useDispatch()
    const { items, loading, submitting, error } = useSelector((s) => s.adminVoucher)
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState(null)

    useEffect(() => {
        dispatch(getAdminVouchers())
    }, [dispatch])

    const empty = {
        code: '',
        discountType: 'Fixed',
        discountValue: 15000,
        minOrderValue: 50000,
        maxDiscountAmount: 15000,
        startDate: '',
        endDate: '',
        usageLimit: 100,
    }

    return (
        <div>
            <PageHeader
                title="Mã giảm giá"
                extra={
                    <button
                        type="button"
                        className="rounded-xl bg-amber-800 px-4 py-2 text-white"
                        onClick={() => {
                            setEditing(null)
                            setOpen(true)
                        }}
                    >
                        Tạo mã
                    </button>
                }
            />
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <AdminTable
                    rowKey="voucherId"
                    rows={items}
                    columns={[
                        { key: 'code', title: 'Mã', render: (r) => r.code },
                        { key: 'type', title: 'Loại', render: (r) => r.discountType },
                        {
                            key: 'value',
                            title: 'Giá trị',
                            render: (r) =>
                                r.discountType === 'Percent' ? `${r.discountValue}%` : formatVnd(r.discountValue),
                        },
                        {
                            key: 'min',
                            title: 'Đơn tối thiểu',
                            render: (r) => formatVnd(r.minOrderValue),
                        },
                        {
                            key: 'active',
                            title: 'Trạng thái',
                            render: (r) => (r.isActive === false ? 'Tắt' : 'Bật'),
                        },
                        {
                            key: 'actions',
                            title: '',
                            render: (r) => (
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        className="text-amber-800"
                                        onClick={() => {
                                            setEditing(r)
                                            setOpen(true)
                                        }}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            const id = r.voucherId ?? r.id
                                            const result = await dispatch(toggleAdminVoucher(id))
                                            if (toggleAdminVoucher.fulfilled.match(result)) {
                                                message.success('Đã đổi trạng thái mã')
                                                dispatch(getAdminVouchers())
                                            } else {
                                                message.error(result.payload || 'Không đổi được trạng thái')
                                            }
                                        }}
                                    >
                                        Bật/Tắt
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                />
            )}

            <AdminModal
                open={open}
                title={editing ? 'Cập nhật mã' : 'Tạo mã mới'}
                onClose={() => setOpen(false)}
            >
                <Formik
                    enableReinitialize
                    initialValues={
                        editing
                            ? {
                                  code: editing.code || '',
                                  discountType: editing.discountType || 'Fixed',
                                  discountValue: editing.discountValue ?? 0,
                                  minOrderValue: editing.minOrderValue ?? 0,
                                  maxDiscountAmount: editing.maxDiscountAmount ?? 0,
                                  startDate: toInputDate(editing.startDate),
                                  endDate: toInputDate(editing.endDate),
                                  usageLimit: editing.usageLimit ?? 1,
                              }
                            : empty
                    }
                    validationSchema={schema}
                    onSubmit={async (values) => {
                        const body = toPayload(values)
                        const result = editing
                            ? await dispatch(
                                  updateAdminVoucher({ id: editing.voucherId ?? editing.id, body })
                              )
                            : await dispatch(createAdminVoucher(body))
                        if (
                            createAdminVoucher.fulfilled.match(result) ||
                            updateAdminVoucher.fulfilled.match(result)
                        ) {
                            message.success(editing ? 'Đã cập nhật mã' : 'Đã tạo mã')
                            setOpen(false)
                            dispatch(getAdminVouchers())
                        } else {
                            message.error(result.payload || 'Không lưu được mã')
                        }
                    }}
                >
                    {({ errors, touched }) => (
                        <Form>
                            <FormField label="Mã" error={touched.code && errors.code}>
                                <Field name="code" className="w-full rounded-lg border px-3 py-2" />
                            </FormField>
                            <FormField label="Loại giảm">
                                <Field as="select" name="discountType" className="w-full rounded-lg border px-3 py-2">
                                    <option value="Fixed">Số tiền cố định</option>
                                    <option value="Percent">Phần trăm</option>
                                </Field>
                            </FormField>
                            <FormField label="Giá trị giảm" error={touched.discountValue && errors.discountValue}>
                                <Field name="discountValue" type="number" className="w-full rounded-lg border px-3 py-2" />
                            </FormField>
                            <FormField label="Đơn tối thiểu">
                                <Field name="minOrderValue" type="number" className="w-full rounded-lg border px-3 py-2" />
                            </FormField>
                            <FormField label="Giảm tối đa">
                                <Field
                                    name="maxDiscountAmount"
                                    type="number"
                                    className="w-full rounded-lg border px-3 py-2"
                                />
                            </FormField>
                            <FormField label="Bắt đầu">
                                <Field
                                    name="startDate"
                                    type="datetime-local"
                                    className="w-full rounded-lg border px-3 py-2"
                                />
                            </FormField>
                            <FormField label="Kết thúc">
                                <Field
                                    name="endDate"
                                    type="datetime-local"
                                    className="w-full rounded-lg border px-3 py-2"
                                />
                            </FormField>
                            <FormField label="Giới hạn lượt dùng">
                                <Field name="usageLimit" type="number" className="w-full rounded-lg border px-3 py-2" />
                            </FormField>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="mt-2 w-full rounded-xl bg-amber-800 py-2 text-white"
                            >
                                {submitting ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </Form>
                    )}
                </Formik>
            </AdminModal>
        </div>
    )
}
