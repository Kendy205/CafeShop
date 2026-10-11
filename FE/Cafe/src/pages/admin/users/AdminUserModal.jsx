import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, Form, Input, Select, message } from 'antd'
import { CloseOutlined, UserOutlined } from '@ant-design/icons'
import { createAdminUser, updateAdminUserInfo } from '../../../redux/actions/admin/adminUserAction'
import { AppToast, AppConfirm } from '../../../components/common/AppNotification'


/**
 * AdminUserModal Component
 * Modal dùng để Tạo mới hoặc Sửa thông tin tài khoản Người dùng trong hệ thống.
 * Có xử lý việc tạo tài khoản kèm phân quyền hoặc chỉ cập nhật thông tin cá nhân.
 */
export default function AdminUserModal({ visible, onClose, editingUser, roles }) {
    const [form] = Form.useForm()
    const dispatch = useDispatch()
    const { submitting } = useSelector((s) => s.admin.user)

    useEffect(() => {
        if (visible) {
            if (editingUser) {
                form.setFieldsValue({
                    fullName: editingUser.fullName,
                    phoneNumber: editingUser.phoneNumber,
                    email: editingUser.email,
                })
            } else {
                form.resetFields()
            }
        }
    }, [visible, editingUser, form])

    const handleOk = async () => {
        try {
            const values = await form.validateFields()
            
            if (editingUser) {
                const userId = editingUser.userId || editingUser.id
                // Chỉ gửi fullName, phoneNumber, email
                const res = await dispatch(updateAdminUserInfo({ id: userId, data: {
                    fullName: values.fullName,
                    phoneNumber: values.phoneNumber,
                    email: values.email
                }}))
                if (updateAdminUserInfo.fulfilled.match(res)) {
                    AppToast.success('Cập nhật thông tin thành công!')
                    onClose()
                }
            } else {
                // Tạo mới cần username, password, roleIds
                const res = await dispatch(createAdminUser(values))
                if (createAdminUser.fulfilled.match(res)) {
                    AppToast.success('Thêm tài khoản mới thành công!')
                    onClose()
                } else {
                    AppToast.error(res.payload || 'Không thể tạo tài khoản!')
                }
            }
        } catch (error) {
            // Validation failed
        }
    }

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            closeIcon={false}
            width={600}
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
                                {editingUser ? `Cập Nhật: ${editingUser.fullName}` : 'Thêm Khách Hàng / Nhân Viên Mới'}
                            </h3>
                            <p className="text-xs text-sky-200/80">
                                Quản lý thông tin cá nhân và tài khoản đăng nhập.
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

            <Form form={form} layout="vertical" className="px-6 py-5 bg-white">
                {!editingUser && (
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="username"
                            label={<span className="text-xs font-bold text-slate-500 uppercase">Tên Đăng Nhập</span>}
                            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                        >
                            <Input placeholder="VD: admin123" className="rounded-xl px-4 py-2" />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            label={<span className="text-xs font-bold text-slate-500 uppercase">Mật khẩu</span>}
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                        >
                            <Input.Password placeholder="Mật khẩu" className="rounded-xl px-4 py-2" />
                        </Form.Item>
                    </div>
                )}

                <Form.Item
                    name="fullName"
                    label={<span className="text-xs font-bold text-slate-500 uppercase">Họ và tên</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                >
                    <Input placeholder="VD: Nguyễn Văn A" className="rounded-xl px-4 py-2" />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="phoneNumber"
                        label={<span className="text-xs font-bold text-slate-500 uppercase">Số điện thoại</span>}
                    >
                        <Input placeholder="VD: 0912345678" className="rounded-xl px-4 py-2" />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label={<span className="text-xs font-bold text-slate-500 uppercase">Email</span>}
                    >
                        <Input placeholder="VD: email@example.com" type="email" className="rounded-xl px-4 py-2" />
                    </Form.Item>
                </div>

                {!editingUser && (
                    <Form.Item
                        name="roleIds"
                        label={<span className="text-xs font-bold text-slate-500 uppercase">Vai trò ban đầu</span>}
                        rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 vai trò' }]}
                    >
                        <Select 
                            mode="multiple" 
                            placeholder="Chọn vai trò"
                            className="rounded-xl"
                            options={roles.map(r => ({ label: r.name, value: r.roleId || r.id }))}
                        />
                    </Form.Item>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
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
