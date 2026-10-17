import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Switch } from 'antd'
import AdminTooltip from '../../../components/admin/common/AdminTooltip'
import {
    createAdminVoucher,
    getAdminVouchers,
    toggleAdminVoucher,
    updateAdminVoucher,
    deleteAdminVoucher,
} from '../../../redux/actions/admin/adminVoucherAction'
import { fetchAdminUsers } from '../../../redux/actions/admin/adminUserAction'
import { AdminTable } from '../adminShared'
import AdminPageBanner from '../../../components/admin/common/AdminPageBanner'
import VoucherFormModal from '../../../components/admin/VoucherAdmin/VoucherFormModal'
import {
    TagOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons'
import { formatVnd } from '../../../utils/helpers/format'
import {
    APPLY_TYPE_LABEL,
    DiscountType,
    VoucherTargetType,
} from '../../../utils/constants/VoucherConstants'
import { AppToast, AppConfirm } from '../../../components/common/AppNotification'

function formatVoucherDate(str) {
    if (!str) return '—'
    const d = new Date(str)
    return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

function checkVoucherValidity(startDate, endDate) {
    const now = new Date()
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null

    if (start && now < start) {
        return { isNotStarted: true, isExpired: false }
    }
    if (end && now > end) {
        return { isNotStarted: false, isExpired: true }
    }
    return { isNotStarted: false, isExpired: false }
}

/**
 * VoucherAdminPage Component
 * Trang quản lý Khuyến mãi (Vouchers/Coupons) cho Admin.
 * Hiển thị danh sách, cấu hình phân quyền voucher (PUBLIC hoặc USER), bật/tắt tự do.
 */
export default function VoucherAdminPage() {
    const dispatch = useDispatch()
    const { items, loading, submitting, error } = useSelector((s) => s.admin.voucher)
    const { items: usersList, loading: usersLoading } = useSelector((s) => s.admin.user)

    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState(null)

    useEffect(() => {
        dispatch(getAdminVouchers())
        // Fetch users for multi-select in VoucherFormModal
        dispatch(fetchAdminUsers({ pageSize: 1000 }))
    }, [dispatch])

    const handleSaveVoucher = async (body) => {
        const id = editing?.voucherId ?? editing?.id
        const result = editing
            ? await dispatch(updateAdminVoucher({ id, body }))
            : await dispatch(createAdminVoucher(body))

        if (
            createAdminVoucher.fulfilled.match(result) ||
            updateAdminVoucher.fulfilled.match(result)
        ) {
            AppToast.success(editing ? 'Đã cập nhật mã thành công' : 'Đã tạo mã mới thành công')
            setOpen(false)
            dispatch(getAdminVouchers())
        } else {
            /* API Error Modal will handle this */
        }
    }

    const handleDeleteVoucher = (r) => {
        const id = r.voucherId ?? r.id
        AppConfirm({
            title: `Xác nhận xóa mã ${r.code}`,
            content: 'Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa mã giảm giá này?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            centered: true,
            onOk: async () => {
                const res = await dispatch(deleteAdminVoucher(id))
                if (deleteAdminVoucher.fulfilled.match(res)) {
                    AppToast.success(`Đã xóa mã ${r.code} thành công`)
                }
            },
        })
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
                        {
                            key: 'code',
                            title: 'Mã & Mô tả',
                            render: (r) => (
                                <div className="space-y-1">
                                    <span className="font-mono text-sm font-black text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200/80 inline-block tracking-wider">
                                        {r.code}
                                    </span>
                                    <p className="text-xs text-slate-600 line-clamp-1 max-w-[200px]" title={r.description}>
                                        {r.description || '—'}
                                    </p>
                                </div>
                            ),
                        },
                        {
                            key: 'target',
                            title: 'Đối tượng & Loại',
                            render: (r) => (
                                <div className="flex flex-col gap-1 items-start">
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                            r.targetType === VoucherTargetType.USER
                                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                : 'bg-slate-100 text-slate-700 border-slate-200'
                                        }`}
                                    >
                                        {r.targetType === VoucherTargetType.USER ? '🎁 Tặng riêng User' : '🌐 Toàn hệ thống'}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                                        {APPLY_TYPE_LABEL[r.applyType] || r.applyType}
                                    </span>
                                </div>
                            ),
                        },
                        {
                            key: 'value',
                            title: 'Giá trị ưu đãi',
                            render: (r) => {
                                const isPercent = r.discountType === DiscountType.PERCENTAGE
                                return (
                                    <div className="space-y-0.5">
                                        <div className="font-black text-slate-800 text-sm">
                                            {isPercent ? `${r.discountValue}%` : formatVnd(r.discountValue)}
                                        </div>
                                        <div className="text-[11px] text-slate-500">
                                            Đơn tối thiểu: <span className="font-semibold text-slate-700">{r.minOrderValue > 0 ? formatVnd(r.minOrderValue) : '0đ'}</span>
                                        </div>
                                        {isPercent && r.maxDiscountAmount > 0 && (
                                            <div className="text-[11px] text-slate-400">
                                                Tối đa: <span className="font-medium text-slate-600">{formatVnd(r.maxDiscountAmount)}</span>
                                            </div>
                                        )}
                                    </div>
                                )
                            },
                        },
                        {
                            key: 'usage',
                            title: 'Số lượt dùng',
                            render: (r) => {
                                if (r.targetType === VoucherTargetType.USER) {
                                    const assignedCount = r.assignedUsersCount ?? r.userIds?.length ?? 0
                                    const used = r.usedCount ?? 0
                                    return (
                                        <div className="space-y-1">
                                            <span className="inline-flex items-center gap-1 font-bold text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                                                <span>{r.usageLimitPerUser || 1} lượt / người</span>
                                            </span>
                                            <div className="text-[11px] text-slate-500">
                                                Được tặng: <strong className="text-slate-700">{assignedCount}</strong> khách
                                            </div>
                                            <div className="text-[11px] text-slate-400">
                                                Đã dùng: <strong className="text-emerald-600">{used}</strong> lượt
                                            </div>
                                        </div>
                                    )
                                }

                                const used = r.usedCount ?? 0
                                const limit = r.usageLimit ?? 0
                                const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0

                                return (
                                    <div className="space-y-1.5 min-w-[120px]">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-slate-800">{used} / {limit}</span>
                                            <span className="text-[11px] font-semibold text-slate-400">{percent}%</span>
                                        </div>
                                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                            <div
                                                className="h-full bg-sky-500 rounded-full transition-all"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-slate-400 block">Toàn hệ thống</span>
                                    </div>
                                )
                            },
                        },
                        {
                            key: 'duration',
                            title: 'Thời gian hiệu lực',
                            render: (r) => {
                                const { isExpired, isNotStarted } = checkVoucherValidity(r.startDate, r.endDate)
                                return (
                                    <div className="space-y-1">
                                        <div className={`text-xs font-semibold ${isExpired ? 'text-slate-400' : 'text-slate-700'}`}>
                                            {formatVoucherDate(r.startDate)} — {formatVoucherDate(r.endDate)}
                                        </div>
                                        {isExpired && (
                                            <span className="inline-block text-[10px] font-bold text-red-600 bg-red-50 border border-red-200/80 px-2 py-0.5 rounded-full">
                                                Đã hết hạn
                                            </span>
                                        )}
                                        {isNotStarted && (
                                            <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
                                                Chưa bắt đầu
                                            </span>
                                        )}
                                    </div>
                                )
                            },
                        },
                        {
                            key: 'active',
                            title: 'Trạng thái',
                            align: 'center',
                            render: (r) => {
                                const id = r.voucherId ?? r.id
                                const isAct = r.isActive !== false
                                const { isExpired, isNotStarted } = checkVoucherValidity(r.startDate, r.endDate)

                                let statusLabel = 'Hoạt động'
                                let statusColor = 'text-emerald-600'
                                let switchChecked = isAct

                                if (!isAct) {
                                    statusLabel = 'Tạm dừng'
                                    statusColor = 'text-slate-400'
                                    switchChecked = false
                                } else if (isExpired) {
                                    statusLabel = 'Hết hạn'
                                    statusColor = 'text-red-500'
                                    switchChecked = false
                                } else if (isNotStarted) {
                                    statusLabel = 'Chưa bắt đầu'
                                    statusColor = 'text-amber-600'
                                    switchChecked = true
                                }

                                return (
                                    <div className="flex flex-col items-center gap-1">
                                        <Switch
                                            checked={switchChecked}
                                            disabled={isExpired}
                                            onChange={async () => {
                                                const result = await dispatch(toggleAdminVoucher(id))
                                                if (toggleAdminVoucher.fulfilled.match(result)) {
                                                    AppToast.success(`Đã ${!isAct ? 'kích hoạt' : 'tạm ngưng'} mã ${r.code}`)
                                                    dispatch(getAdminVouchers())
                                                }
                                            }}
                                            className={`custom-admin-switch ${
                                                isExpired
                                                    ? 'bg-slate-200 cursor-not-allowed opacity-60'
                                                    : switchChecked
                                                    ? 'bg-emerald-500'
                                                    : 'bg-slate-300'
                                            }`}
                                        />
                                        <span className={`text-[11px] font-bold ${statusColor}`}>
                                            {statusLabel}
                                        </span>
                                    </div>
                                )
                            },
                        },
                        {
                            key: 'actions',
                            title: 'Hành động',
                            render: (r) => (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <AdminTooltip title="Chỉnh sửa voucher & cấu hình tặng user">
                                        <button
                                            type="button"
                                            className="admin-action-btn admin-action-btn-edit"
                                            onClick={() => {
                                                setEditing(r)
                                                setOpen(true)
                                            }}
                                        >
                                            <EditOutlined />
                                            <span>Sửa</span>
                                        </button>
                                    </AdminTooltip>

                                    <AdminTooltip title="Xóa voucher này">
                                        <button
                                            type="button"
                                            className="admin-action-btn text-red-600 hover:bg-red-50 hover:border-red-200"
                                            onClick={() => handleDeleteVoucher(r)}
                                        >
                                            <DeleteOutlined />
                                            <span>Xóa</span>
                                        </button>
                                    </AdminTooltip>
                                </div>
                            ),
                        },
                    ]}
                />
            )}

            {/* Modal Tạo/Sửa Voucher (Tích hợp phân quyền tài khoản khi loại là USER) */}
            <VoucherFormModal
                open={open}
                editing={editing}
                onClose={() => setOpen(false)}
                onSubmit={handleSaveVoucher}
                submitting={submitting}
                usersList={usersList}
                usersLoading={usersLoading}
            />
        </div>
    )
}
