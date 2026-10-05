import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, Form, Select, message } from 'antd'
import { CloseOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { assignAdminRoles, fetchAdminUsers } from '../../../redux/actions/admin/adminUserAction'
import { AppToast, AppConfirm } from '../../../components/common/AppNotification'


export default function AdminAssignRoleModal({ visible, onClose, assigningUser, roles }) {
    const [form] = Form.useForm()
    const dispatch = useDispatch()
    const { submitting } = useSelector((s) => s.admin.user)

    useEffect(() => {
        if (visible && assigningUser) {
            const userRoleNames = assigningUser.roles || []
            const userRoleIds = roles
                .filter(r => userRoleNames.includes(r.name))
                .map(r => r.roleId || r.id)
            
            form.setFieldsValue({
                roleIds: userRoleIds
            })
        }
    }, [visible, assigningUser, form, roles])

    const handleOk = async () => {
        try {
            const values = await form.validateFields()
            const userId = assigningUser.userId || assigningUser.id
            const res = await dispatch(assignAdminRoles({ id: userId, roleIds: values.roleIds }))
            
            if (assignAdminRoles.fulfilled.match(res)) {
                AppToast.success('Phân quyền thành công!')
                dispatch(fetchAdminUsers({})) // Reload to get updated roles
                onClose()
            }
            // Không gọi AppToast.error() ở đây nữa vì BaseService đã hiển thị thông báo lỗi chung
        } catch (error) {
            // form validation failed
        }
    }

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            closeIcon={false}
            width={500}
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
                            <SafetyCertificateOutlined className="text-2xl" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/20 px-2.5 py-0.5 text-[11px] font-bold text-sky-300">
                                <span>Ủy Quyền</span>
                            </div>
                            <h3 className="mt-1 text-lg font-black tracking-tight text-white">
                                Phân Quyền Vai Trò
                            </h3>
                            <p className="text-xs text-sky-200/80">
                                Cấp quyền hạn truy cập cho tài khoản.
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

            <div className="px-6 py-5 bg-white space-y-4">
                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    Đang phân quyền cho tài khoản: <strong className="text-sky-600">@{assigningUser?.username}</strong> ({assigningUser?.fullName})
                </div>
                <Form form={form} layout="vertical">
                <Form.Item
                    name="roleIds"
                    label={<span className="text-xs font-bold text-slate-500 uppercase">Vai trò được cấp</span>}
                    rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 vai trò' }]}
                >
                    <Select 
                        mode="multiple" 
                        placeholder="Chọn vai trò"
                        className="rounded-xl w-full"
                        options={roles.map(r => ({ label: r.name, value: r.roleId || r.id }))}
                    />
                </Form.Item>

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
                        Lưu quyền
                    </button>
                </div>
            </Form>
            </div>
        </Modal>
    )
}
