import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { message, Switch } from 'antd'
import {
    createAdminVoucher,
    getAdminVouchers,
    toggleAdminVoucher,
    updateAdminVoucher,
    assignAdminVoucher,
} from '../../../redux/actions/admin/adminVoucherAction'
import { fetchAdminUsers } from '../../../redux/actions/admin/adminUserAction'
import { AdminTable } from '../adminShared'
import AdminPageBanner from '../../../components/admin/common/AdminPageBanner'
import AssignVoucherModal from '../../../components/admin/VoucherAdmin/AssignVoucherModal'
import VoucherFormModal from '../../../components/admin/VoucherAdmin/VoucherFormModal'
import { TagOutlined, PlusOutlined, GiftOutlined, EditOutlined } from '@ant-design/icons'
import { formatVnd } from '../../../utils/helpers/format'
import { TARGET_TYPE_LABEL, APPLY_TYPE_LABEL, DiscountType, VoucherTargetType } from '../../../utils/constants/VoucherConstants'

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

    const handleSaveVoucher = async (body) => {
        const result = editing
            ? await dispatch(
                  updateAdminVoucher({ id: editing.voucherId ?? editing.id, body })
              )
            : await dispatch(createAdminVoucher(body))

        if (
            createAdminVoucher.fulfilled.match(result) ||
            updateAdminVoucher.fulfilled.match(result)
        ) {
            message.success(editing ? 'Đã cập nhật mã thành công' : 'Đã tạo mã mới thành công')
            setOpen(false)
            dispatch(getAdminVouchers())
        } else {
            message.error(result.payload || 'Không lưu được mã')
        }
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
        <div className="space-y-6">
            <AdminPageBanner
                badge="Khuyến Mãi & Tri Ân Khách Hàng"
                title="Mã Giảm Giá (Voucher)"
                description="Tạo và quản lý các chương trình ưu đãi giảm giá, chiết khấu theo %, tặng mã trực tiếp cho khách hàng."
                icon={<TagOutlined className="text-amber-400 text-xl" />}
                extra={
                    <button
                        type="button"
                        className="flex items-center gap-2 rounded-2xl bg-sky-500 hover:bg-sky-400 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-sky-500/30 transition-all cursor-pointer active:scale-95"
                        onClick={() => {
                            setEditing(null)
                            setOpen(true)
                        }}
                    >
                        <PlusOutlined />
                        <span>Tạo mã mới</span>
                    </button>
                }
                stats={
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-xs">
                        <span className="text-slate-300 font-medium">Tổng số voucher:</span>
                        <strong className="text-white text-sm font-black">{items.length}</strong>
                    </div>
                }
            />
            {error && <p className="mb-3 text-sm text-red-600">⚠️ {error}</p>}
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
                            align: 'center',
                            render: (r) => {
                                const id = r.voucherId ?? r.id
                                const isAct = r.isActive !== false
                                return (
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={isAct}
                                            onChange={async () => {
                                                const result = await dispatch(toggleAdminVoucher(id))
                                                if (toggleAdminVoucher.fulfilled.match(result)) {
                                                    message.success(`Đã ${!isAct ? 'kích hoạt' : 'tạm ngưng'} mã ${r.code}`)
                                                    dispatch(getAdminVouchers())
                                                } else {
                                                    message.error(result.payload || 'Không đổi được trạng thái')
                                                }
                                            }}
                                            className={isAct ? 'bg-emerald-500' : 'bg-slate-300'}
                                        />
                                        <span className={`text-xs font-bold ${isAct ? 'text-emerald-600' : 'text-slate-400'}`}>
                                            {isAct ? 'Hoạt động' : 'Tạm dừng'}
                                        </span>
                                    </div>
                                )
                            },
                        },
                        {
                            key: 'actions',
                            title: 'Hành động',
                            render: (r) => (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-sky-700 hover:border-sky-300 transition-all cursor-pointer shadow-2xs"
                                        onClick={() => {
                                            setEditing(r)
                                            setOpen(true)
                                        }}
                                        title="Chỉnh sửa voucher"
                                    >
                                        <EditOutlined />
                                        <span>Sửa</span>
                                    </button>

                                    {r.targetType === VoucherTargetType.USER && (
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-1.5 rounded-2xl border border-purple-200 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 text-xs font-bold text-purple-700 hover:border-purple-300 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                                            onClick={() => openAssignModal(r)}
                                            title="Tặng mã ưu đãi này riêng cho khách hàng"
                                        >
                                            <GiftOutlined className="text-purple-600" />
                                            <span>Tặng User</span>
                                        </button>
                                    )}
                                </div>
                            ),
                        },
                    ]}
                />
            )}

            {/* Modal Tạo/Sửa Voucher */}
            <VoucherFormModal
                open={open}
                editing={editing}
                onClose={() => setOpen(false)}
                onSubmit={handleSaveVoucher}
                submitting={submitting}
            />

            {/* Modal Tặng Voucher (Assign User) */}
            <AssignVoucherModal
                open={assignModalOpen}
                onCancel={() => setAssignModalOpen(false)}
                selectedVoucher={selectedVoucher}
                usersList={usersList}
                usersLoading={usersLoading}
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
                usageLimitPerUser={usageLimitPerUser}
                setUsageLimitPerUser={setUsageLimitPerUser}
                handleAssignUser={handleAssignUser}
                submitting={submitting}
            />
        </div>
    )
}
