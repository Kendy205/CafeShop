import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, Form, Input, Select, Switch } from 'antd'
import { CloseOutlined, UserOutlined, UploadOutlined } from '@ant-design/icons'
import { createAdminUser, updateAdminUserInfo } from '../../../redux/actions/admin/adminUserAction'
import { AppToast } from '../../../components/common/AppNotification'

/**
 * AdminUserModal Component
 * Modal dùng để Tạo mới hoặc Sửa thông tin tài khoản Người dùng trong hệ thống.
 * Hỗ trợ multipart/form-data cho cập nhật: avatar Cloudinary, roles, password, isActive.
 */
export default function AdminUserModal({ visible, onClose, editingUser, roles = [], onSuccess }) {
    const [form] = Form.useForm()
    const dispatch = useDispatch()
    const { submitting } = useSelector((s) => s.admin.user)

    const [avatarFile, setAvatarFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const fileInputRef = useRef(null)

    // Cleanup preview URL on unmount or change
    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    useEffect(() => {
        if (visible) {
            if (editingUser) {
                let userRoleIds = editingUser.roleIds || []
                if ((!userRoleIds || userRoleIds.length === 0) && editingUser.roles) {
                    userRoleIds = roles
                        .filter((r) => editingUser.roles.includes(r.name))
                        .map((r) => r.roleId || r.id)
                }

                form.setFieldsValue({
                    fullName: editingUser.fullName || '',
                    phoneNumber: editingUser.phoneNumber || '',
                    email: editingUser.email || '',
                    roleIds: userRoleIds,
                    isActive: editingUser.isActive ?? true,
                    newPassword: '',
                })
            } else {
                form.resetFields()
            }
        }
    }, [visible, editingUser, form, roles])

    const handleResetLocalState = () => {
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl)
        }
        setAvatarFile(null)
        setPreviewUrl(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleClose = () => {
        handleResetLocalState()
        onClose()
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            AppToast.error('Vui lòng chọn file hình ảnh (jpg, png, webp...)!')
            return
        }

        // 5MB limit
        if (file.size > 5 * 1024 * 1024) {
            AppToast.error('Kích thước ảnh tối đa là 5MB!')
            return
        }

        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl)
        }

        setAvatarFile(file)
        setPreviewUrl(URL.createObjectURL(file))
    }

    const handleRemoveSelectedAvatar = () => {
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl)
        }
        setAvatarFile(null)
        setPreviewUrl(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleOk = async () => {
        try {
            const values = await form.validateFields()

            if (editingUser) {
                const userId = editingUser.userId || editingUser.id
                const formData = new FormData()

                if (values.fullName) formData.append('FullName', values.fullName.trim())
                if (values.phoneNumber) formData.append('PhoneNumber', values.phoneNumber.trim())
                if (values.email) formData.append('Email', values.email.trim())
                if (avatarFile) formData.append('AvatarFile', avatarFile)
                if (values.newPassword) formData.append('NewPassword', values.newPassword)
                if (typeof values.isActive === 'boolean') formData.append('IsActive', values.isActive)

                if (Array.isArray(values.roleIds) && values.roleIds.length > 0) {
                    values.roleIds.forEach((id, index) => {
                        formData.append(`RoleIds[${index}]`, id)
                    })
                }

                const res = await dispatch(updateAdminUserInfo({ id: userId, data: formData }))
                if (updateAdminUserInfo.fulfilled.match(res)) {
                    AppToast.success('Cập nhật thông tin tài khoản thành công!')
                    handleClose()
                    onSuccess?.()
                }
            } else {
                // Tạo mới cần JSON payload theo API 2
                const payload = {
                    username: values.username.trim(),
                    password: values.password,
                    fullName: values.fullName.trim(),
                    phoneNumber: values.phoneNumber ? values.phoneNumber.trim() : null,
                    email: values.email ? values.email.trim() : null,
                    roleIds: values.roleIds || [],
                }
                const res = await dispatch(createAdminUser(payload))
                if (createAdminUser.fulfilled.match(res)) {
                    AppToast.success('Tạo mới tài khoản thành công!')
                    handleClose()
                    onSuccess?.()
                }
            }
        } catch {
            // Validation failed
        }
    }

    return (
        <Modal
            open={visible}
            onCancel={handleClose}
            afterClose={handleResetLocalState}
            footer={null}
            closeIcon={false}
            width={620}
            centered
            destroyOnClose
            styles={{
                content: {
                    padding: 0,
                    borderRadius: '24px',
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
                            <UserOutlined className="text-2xl" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/20 px-2.5 py-0.5 text-[11px] font-bold text-sky-300">
                                <span>{editingUser ? 'Chỉnh Sửa Tài Khoản' : 'Thêm Tài Khoản Mới'}</span>
                            </div>
                            <h3 className="mt-1 text-lg font-black tracking-tight text-white">
                                {editingUser ? `Cập Nhật: ${editingUser.fullName || editingUser.username}` : 'Thêm Người Dùng Mới'}
                            </h3>
                            <p className="text-xs text-sky-200/80">
                                Quản lý thông tin cá nhân, phân quyền và trạng thái tài khoản.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition-all hover:bg-white/20 hover:text-white cursor-pointer"
                        title="Đóng"
                    >
                        <CloseOutlined className="text-xs" />
                    </button>
                </div>
            </div>

            <Form form={form} layout="vertical" className="px-6 py-5 bg-white space-y-4">
                {/* Avatar upload (Chỉ hiển thị khi chỉnh sửa) */}
                {editingUser && (
                    <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                        <div className="relative h-16 w-16 shrink-0 rounded-full overflow-hidden border-2 border-sky-500/30 shadow-xs bg-sky-100 flex items-center justify-center">
                            {previewUrl || editingUser.avatarUrl ? (
                                <img
                                    src={previewUrl || editingUser.avatarUrl}
                                    alt="Avatar"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="font-bold text-sky-700 text-xl">
                                    {(editingUser.fullName || editingUser.username || 'U').charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-700">Ảnh đại diện mới</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                                Hỗ trợ JPG, PNG, WEBP (tải lên Cloudinary)
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-xs">
                                    <UploadOutlined className="text-sky-600" />
                                    <span>{previewUrl ? 'Đổi ảnh khác' : 'Tải ảnh mới'}</span>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                </label>
                                {previewUrl && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveSelectedAvatar}
                                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                    >
                                        Hủy chọn
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tài khoản & mật khẩu ban đầu khi tạo mới */}
                {!editingUser && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Form.Item
                            name="username"
                            label={<span className="text-xs font-bold text-slate-500 uppercase">Tên Đăng Nhập</span>}
                            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                        >
                            <Input placeholder="VD: barista01" className="rounded-xl px-4 py-2" />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            label={<span className="text-xs font-bold text-slate-500 uppercase">Mật khẩu</span>}
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu' },
                                { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }
                            ]}
                        >
                            <Input.Password placeholder="Tối thiểu 6 ký tự" className="rounded-xl px-4 py-2" />
                        </Form.Item>
                    </div>
                )}

                <Form.Item
                    name="fullName"
                    label={<span className="text-xs font-bold text-slate-500 uppercase">Họ và tên</span>}
                    rules={[
                        { required: true, message: 'Vui lòng nhập họ tên' },
                        { max: 255, message: 'Họ tên tối đa 255 ký tự' }
                    ]}
                >
                    <Input placeholder="VD: Nguyễn Văn A" className="rounded-xl px-4 py-2" />
                </Form.Item>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Form.Item
                        name="phoneNumber"
                        label={<span className="text-xs font-bold text-slate-500 uppercase">Số điện thoại</span>}
                        rules={[
                            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ (10-11 chữ số)' }
                        ]}
                    >
                        <Input placeholder="VD: 0912345678" className="rounded-xl px-4 py-2" />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label={<span className="text-xs font-bold text-slate-500 uppercase">Email</span>}
                        rules={[
                            { type: 'email', message: 'Địa chỉ email không hợp lệ' }
                        ]}
                    >
                        <Input placeholder="VD: email@example.com" type="email" className="rounded-xl px-4 py-2" />
                    </Form.Item>
                </div>

                {/* Chọn vai trò (Dùng cho cả Tạo mới và Sửa) */}
                <Form.Item
                    name="roleIds"
                    label={<span className="text-xs font-bold text-slate-500 uppercase">Vai trò</span>}
                    rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 vai trò' }]}
                >
                    <Select
                        mode="multiple"
                        placeholder="Chọn vai trò"
                        className="rounded-xl w-full"
                        options={roles.map((r) => ({ label: r.name, value: r.roleId || r.id }))}
                    />
                </Form.Item>

                {/* Cập nhật mật khẩu mới & Trạng thái hoạt động (Chỉ trong Edit mode) */}
                {editingUser && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <Form.Item
                            name="newPassword"
                            label={<span className="text-xs font-bold text-slate-500 uppercase">Mật khẩu mới (Tùy chọn)</span>}
                            rules={[
                                {
                                    validator: (_, value) => {
                                        if (!value || value.length >= 6) return Promise.resolve()
                                        return Promise.reject(new Error('Mật khẩu tối thiểu 6 ký tự'))
                                    }
                                }
                            ]}
                        >
                            <Input.Password placeholder="Để trống nếu không đổi" className="rounded-xl px-4 py-2" />
                        </Form.Item>

                        <Form.Item
                            name="isActive"
                            label={<span className="text-xs font-bold text-slate-500 uppercase">Trạng thái tài khoản</span>}
                            valuePropName="checked"
                        >
                            <Switch
                                checkedChildren="Hoạt động"
                                unCheckedChildren="Tạm khóa"
                                className="mt-1"
                            />
                        </Form.Item>
                    </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={submitting}
                        className="rounded-2xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleOk}
                        disabled={submitting}
                        className={`flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-black text-white shadow-lg transition-all cursor-pointer ${
                            submitting
                                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-sky-500/30 active:scale-95'
                        }`}
                    >
                        {editingUser ? 'Lưu thay đổi' : 'Thêm mới'}
                    </button>
                </div>
            </Form>
        </Modal>
    )
}
