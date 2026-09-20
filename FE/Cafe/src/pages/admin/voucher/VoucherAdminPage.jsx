import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { message, Modal, Select } from 'antd'
import {
    createAdminVoucher,
    getAdminVouchers,
    toggleAdminVoucher,
    updateAdminVoucher,
    assignAdminVoucher,
} from '../../../redux/actions/admin/adminVoucherAction'
import { fetchAdminUsers } from '../../../redux/actions/admin/adminUserAction'
import { AdminModal, AdminTable, FormField, PageHeader } from '../adminShared'
import { formatVnd } from '../../../utils/helpers/format'
import { TARGET_TYPE_LABEL, APPLY_TYPE_LABEL, DiscountType, VoucherTargetType, VoucherApplyType } from '../../../utils/constants/VoucherConstants'
import { getButtonClass } from '../../../utils/constants/Theme'

const schema = Yup.object({
    code: Yup.string().required('Nhập mã'),
    description: Yup.string().required('Nhập mô tả'),
    targetType: Yup.string().required(),
    applyType: Yup.string().required(),
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
    const { items: usersList, loading: usersLoading } = useSelector((s) => s.adminUser)

    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [assignModalOpen, setAssignModalOpen] = useState(false)
    const [selectedVoucher, setSelectedVoucher] = useState(null)
    const [selectedUsers, setSelectedUsers] = useState([])
    const [usageLimitPerUser, setUsageLimitPerUser] = useState(1)

    useEffect(() => {
        dispatch(getAdminVouchers())
        // Fetch users for assign modal
        dispatch(fetchAdminUsers({ pageSize: 1000 }))
    }, [dispatch])

    const empty = {
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

    const openAssignModal = (voucher) => {
        setSelectedVoucher(voucher)
        setSelectedUsers([])
        setUsageLimitPerUser(1)
        setAssignModalOpen(true)
    }

    const handleAssignUser = async () => {
        if (!selectedUsers.length) {
            message.warning('Vui lòng chọn ít nhất một người dùng')
            return
        }
        const body = {
            voucherId: selectedVoucher.voucherId || selectedVoucher.id,
            userIds: selectedUsers,
            usageLimitPerUser: Number(usageLimitPerUser)
        }
        const res = await dispatch(assignAdminVoucher(body))
        if (assignAdminVoucher.fulfilled.match(res)) {
            message.success('Đã tặng Voucher thành công')
            setAssignModalOpen(false)
        } else {
            message.error(res.payload || 'Tặng Voucher thất bại')
        }
    }

    return (
        <div>
            <PageHeader
                title="Mã giảm giá"
                extra={
                    <button
                        type="button"
                        className={getButtonClass('primary')}
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
                <div className="space-y-4 pt-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-12 w-full animate-pulse rounded-3xl bg-slate-100/80" />
                    ))}
                </div>
            ) : (
                <AdminTable
                    rowKey={(r) => r.voucherId || r.id}
                    rows={items}
                    columns={[
                        { key: 'code', title: 'Mã', render: (r) => <span className="font-bold text-sky-600">{r.code}</span> },
                        { key: 'description', title: 'Mô tả', render: (r) => r.description },
                        {
                            key: 'target', title: 'Đối tượng', render: (r) => (
                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                                    {TARGET_TYPE_LABEL[r.targetType] || r.targetType}
                                </span>
                            )
                        },
                        {
                            key: 'apply', title: 'Loại', render: (r) => (
                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-600 border border-sky-100">
                                    {APPLY_TYPE_LABEL[r.applyType] || r.applyType}
                                </span>
                            )
                        },
                        {
                            key: 'value',
                            title: 'Giá trị',
                            render: (r) =>
                                r.discountType === DiscountType.PERCENTAGE ? `${r.discountValue}%` : formatVnd(r.discountValue),
                        },
                        {
                            key: 'min',
                            title: 'Đơn tối thiểu',
                            render: (r) => formatVnd(r.minOrderValue),
                        },
                        {
                            key: 'active',
                            title: 'Trạng thái',
                            render: (r) => (
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.isActive === false ? 'bg-slate-100 text-slate-500' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                    {r.isActive === false ? 'Tắt' : 'Bật'}
                                </span>
                            ),
                        },
                        {
                            key: 'actions',
                            title: '',
                            render: (r) => (
                                <div className="flex gap-3 flex-wrap">
                                    <button
                                        type="button"
                                        className="text-sky-500 font-semibold hover:text-sky-700 transition-colors"
                                        onClick={() => {
                                            setEditing(r)
                                            setOpen(true)
                                        }}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        type="button"
                                        className="text-slate-500 font-medium hover:text-slate-800 transition-colors"
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
                                    {r.targetType === VoucherTargetType.USER && (
                                        <button
                                            type="button"
                                            className="text-purple-500 font-semibold hover:text-purple-700 transition-colors"
                                            onClick={() => openAssignModal(r)}
                                        >
                                            Tặng User
                                        </button>
                                    )}
                                </div>
                            ),
                        },
                    ]}
                />
            )}

            {/* Modal Tạo/Sửa Voucher */}
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
                        <Form className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                            <FormField label="Mã Voucher" error={touched.code && errors.code}>
                                <Field name="code" className="w-full rounded-2xl border px-3 py-2" />
                            </FormField>
                            <FormField label="Mô tả" error={touched.description && errors.description}>
                                <Field name="description" className="w-full rounded-2xl border px-3 py-2" />
                            </FormField>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Đối tượng (Target Type)">
                                    <Field as="select" name="targetType" className="w-full rounded-2xl border px-3 py-2">
                                        <option value={VoucherTargetType.PUBLIC}>Ưu đãi chung (PUBLIC)</option>
                                        <option value={VoucherTargetType.USER}>Dành riêng cho bạn (USER)</option>
                                    </Field>
                                </FormField>
                                <FormField label="Loại áp dụng (Apply Type)">
                                    <Field as="select" name="applyType" className="w-full rounded-2xl border px-3 py-2">
                                        <option value={VoucherApplyType.ORDER}>Giảm tiền món</option>
                                        <option value={VoucherApplyType.SHIPPING}>Giảm phí ship</option>
                                    </Field>
                                </FormField>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Loại giảm">
                                    <Field as="select" name="discountType" className="w-full rounded-2xl border px-3 py-2">
                                        <option value={DiscountType.FIXED}>Số tiền cố định</option>
                                        <option value={DiscountType.PERCENTAGE}>Phần trăm</option>
                                    </Field>
                                </FormField>
                                <FormField label="Giá trị giảm" error={touched.discountValue && errors.discountValue}>
                                    <Field name="discountValue" type="number" className="w-full rounded-2xl border px-3 py-2" />
                                </FormField>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Đơn tối thiểu">
                                    <Field name="minOrderValue" type="number" className="w-full rounded-2xl border px-3 py-2" />
                                </FormField>
                                <FormField label="Giảm tối đa">
                                    <Field name="maxDiscountAmount" type="number" className="w-full rounded-2xl border px-3 py-2" />
                                </FormField>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Bắt đầu">
                                    <Field name="startDate" type="datetime-local" className="w-full rounded-2xl border px-3 py-2" />
                                </FormField>
                                <FormField label="Kết thúc">
                                    <Field name="endDate" type="datetime-local" className="w-full rounded-2xl border px-3 py-2" />
                                </FormField>
                            </div>

                            <FormField label="Giới hạn lượt dùng">
                                <Field name="usageLimit" type="number" className="w-full rounded-2xl border px-3 py-2" />
                            </FormField>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="mt-4 w-full rounded-3xl bg-sky-800 py-3 font-bold text-white shadow hover:bg-sky-700 transition"
                            >
                                {submitting ? 'Đang lưu...' : 'Lưu Voucher'}
                            </button>
                        </Form>
                    )}
                </Formik>
            </AdminModal>

            {/* Modal Tặng Voucher (Assign User) */}
            <Modal
                title={`Tặng Voucher: ${selectedVoucher?.code}`}
                open={assignModalOpen}
                onCancel={() => setAssignModalOpen(false)}
                onOk={handleAssignUser}
                okText="Gửi Tặng"
                cancelText="Hủy"
                confirmLoading={submitting}
                okButtonProps={{ className: 'bg-sky-600 hover:bg-sky-700' }}
            >
                <div className="space-y-4 pt-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Chọn Khách Hàng</label>
                        <Select
                            mode="multiple"
                            allowClear
                            style={{ width: '100%' }}
                            placeholder="Chọn người dùng..."
                            value={selectedUsers}
                            onChange={setSelectedUsers}
                            options={usersList.map(u => ({
                                label: `${u.fullName || 'Khách'} (@${u.username})`,
                                value: u.userId || u.id
                            }))}
                            loading={usersLoading}
                            optionFilterProp="label"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Lượt dùng tối đa mỗi người</label>
                        <input
                            type="number"
                            min="1"
                            value={usageLimitPerUser}
                            onChange={e => setUsageLimitPerUser(e.target.value)}
                            className="w-full rounded-2xl border px-3 py-2 outline-none focus:border-sky-500"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    )
}
