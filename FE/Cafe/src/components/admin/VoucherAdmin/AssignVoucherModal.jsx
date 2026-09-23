import React from 'react'
import { Modal, Select } from 'antd'
import {
    GiftOutlined,
    UserOutlined,
    CloseOutlined,
    InfoCircleOutlined,
    CrownOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons'
import { formatVnd } from '../../../utils/helpers/format'
import { DiscountType, APPLY_TYPE_LABEL } from '../../../utils/constants/VoucherConstants'

export default function AssignVoucherModal({
    open,
    onCancel,
    selectedVoucher,
    usersList = [],
    usersLoading = false,
    selectedUsers = [],
    setSelectedUsers,
    usageLimitPerUser,
    setUsageLimitPerUser,
    handleAssignUser,
    submitting = false,
}) {
    if (!selectedVoucher) return null

    const isPercentage = selectedVoucher.discountType === DiscountType.PERCENTAGE
    const discountText = isPercentage
        ? `Giảm ${selectedVoucher.discountValue}%`
        : `Giảm ${formatVnd(selectedVoucher.discountValue)}`

    const handleSelectAll = () => {
        const allIds = usersList.map((u) => u.userId || u.id).filter(Boolean)
        setSelectedUsers(allIds)
    }

    const handleClearAll = () => {
        setSelectedUsers([])
    }

    const presetLimits = [1, 2, 3, 5, 10]

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            centered
            width={620}
            destroyOnClose
            styles={{
                content: {
                    padding: 0,
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(88, 28, 135, 0.25)',
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                },
            }}
        >
            {/* Header Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 px-6 py-6 text-white">
                {/* Background decorative glow effects */}
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
                <div className="absolute left-1/2 -bottom-10 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />

                <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/30">
                            <GiftOutlined className="text-2xl" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/30 bg-purple-500/20 px-2.5 py-0.5 text-[11px] font-bold text-purple-300">
                                <CrownOutlined className="text-amber-400" />
                                <span>Tri Ân Khách Hàng</span>
                            </div>
                            <h3 className="mt-1 text-lg font-black tracking-tight text-white">
                                Tặng Voucher Riêng Cho Khách Hàng
                            </h3>
                            <p className="text-xs text-purple-200/80">
                                Chỉ định khách hàng nhận mã ưu đãi độc quyền trực tiếp vào ví
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition-all hover:bg-white/20 hover:text-white cursor-pointer"
                        title="Đóng"
                    >
                        <CloseOutlined className="text-xs" />
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-5 bg-white">
                {/* Voucher Ticket Preview Card */}
                <div className="relative overflow-hidden rounded-2xl border border-purple-200/80 bg-gradient-to-r from-purple-50/60 via-indigo-50/40 to-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-base font-black text-purple-800 tracking-wider bg-purple-100/90 border border-purple-300/60 px-2.5 py-0.5 rounded-lg shadow-2xs">
                                    {selectedVoucher.code}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-purple-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                                    {discountText}
                                </span>
                                <span className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                    {APPLY_TYPE_LABEL[selectedVoucher.applyType] || selectedVoucher.applyType}
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium pt-1">
                                {selectedVoucher.description || 'Không có mô tả chi tiết'}
                            </p>
                        </div>

                        <div className="text-right shrink-0">
                            <div className="text-[11px] text-slate-400 font-medium">Đơn tối thiểu</div>
                            <div className="text-xs font-bold text-slate-700">
                                {formatVnd(selectedVoucher.minOrderValue)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Select Users */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700">
                            <UserOutlined className="text-purple-600" />
                            <span>Chọn Khách Hàng Được Tặng</span>
                            {selectedUsers.length > 0 && (
                                <span className="ml-1 rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-700">
                                    Đã chọn {selectedUsers.length}
                                </span>
                            )}
                        </label>

                        {/* Quick action buttons */}
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className="rounded-lg bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-700 transition hover:bg-purple-100 cursor-pointer"
                            >
                                Chọn tất cả ({usersList.length})
                            </button>
                            {selectedUsers.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleClearAll}
                                    className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500 transition hover:bg-slate-200 cursor-pointer"
                                >
                                    Bỏ chọn
                                </button>
                            )}
                        </div>
                    </div>

                    <Select
                        mode="multiple"
                        allowClear
                        style={{ width: '100%' }}
                        placeholder="Tìm theo tên, username hoặc ID khách hàng..."
                        value={selectedUsers}
                        onChange={setSelectedUsers}
                        loading={usersLoading}
                        optionFilterProp="filterText"
                        maxTagCount="responsive"
                        className="custom-user-select"
                        options={usersList.map((u) => {
                            const name = u.fullName || 'Khách hàng'
                            const username = u.username ? `@${u.username}` : ''
                            const id = u.userId || u.id
                            return {
                                value: id,
                                label: (
                                    <div className="flex items-center gap-2 py-0.5">
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-[10px] font-black text-white">
                                            {name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-800 leading-tight">
                                                {name}
                                            </span>
                                            {username && (
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {username}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ),
                                filterText: `${name} ${username} ${u.email || ''} ${u.phone || ''} ${id}`,
                            }
                        })}
                    />
                </div>

                {/* Section: Usage Limit Per User */}
                <div className="space-y-2">
                    <label className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-700">
                        <div className="flex items-center gap-1.5">
                            <ThunderboltOutlined className="text-amber-500" />
                            <span>Số Lượt Sử Dụng Tối Đa Mỗi Khách</span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">
                            Mỗi người được dùng tối đa {usageLimitPerUser || 1} lần
                        </span>
                    </label>

                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            min="1"
                            max="999"
                            value={usageLimitPerUser}
                            onChange={(e) => setUsageLimitPerUser(Math.max(1, Number(e.target.value) || 1))}
                            className="w-28 rounded-xl border border-slate-200 px-3 py-2 text-center text-sm font-black text-slate-800 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                        />

                        {/* Quick Presets */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {presetLimits.map((preset) => {
                                const isActive = Number(usageLimitPerUser) === preset
                                return (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() => setUsageLimitPerUser(preset)}
                                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                            isActive
                                                ? 'bg-purple-600 text-white shadow-xs'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {preset} lần
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Notice Banner */}
                <div className="flex items-start gap-2.5 rounded-xl border border-purple-100 bg-purple-50/50 p-3 text-xs text-purple-900">
                    <InfoCircleOutlined className="text-purple-600 text-sm mt-0.5 shrink-0" />
                    <div>
                        <span className="font-bold">Lưu ý:</span> Khách hàng được tặng sẽ thấy mã này ngay trong mục{' '}
                        <strong className="text-purple-700">"Ưu đãi của tôi"</strong> khi đăng nhập và đặt hàng.
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={submitting}
                        className="rounded-2xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    >
                        Hủy Bỏ
                    </button>
                    <button
                        type="button"
                        onClick={handleAssignUser}
                        disabled={submitting || selectedUsers.length === 0}
                        className={`flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-black text-white shadow-lg transition-all cursor-pointer ${
                            selectedUsers.length === 0 || submitting
                                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/30 active:scale-95'
                        }`}
                    >
                        <GiftOutlined />
                        <span>
                            {submitting
                                ? 'Đang gửi tặng...'
                                : `Gửi Tặng Ngay (${selectedUsers.length})`}
                        </span>
                    </button>
                </div>
            </div>
        </Modal>
    )
}
