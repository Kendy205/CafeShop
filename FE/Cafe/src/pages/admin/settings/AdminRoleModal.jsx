import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, Form, Input, Checkbox, message, Row, Col } from 'antd'
import { CloseOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { createRole, updateRole } from '../../../redux/actions/admin/adminRoleAction'

export default function AdminRoleModal({ visible, onClose, editingRole }) {
    const [form] = Form.useForm()
    const dispatch = useDispatch()
    const { permissions, submitting } = useSelector((s) => s.admin.role)

    useEffect(() => {
        if (visible) {
            if (editingRole) {
                form.setFieldsValue({
                    name: editingRole.name,
                    description: editingRole.description,
                    permissionIds: editingRole.permissions?.map(p => p.permissionId || p.id) || []
                })
            } else {
                form.resetFields()
            }
        }
    }, [visible, editingRole, form])

    const handleOk = async () => {
        try {
            const values = await form.validateFields()
            
            if (editingRole) {
                const isSystem = editingRole.name === 'Admin' || editingRole.name === 'Administrator'
                if (isSystem && values.name !== editingRole.name) {
                    message.error('Không được phép đổi tên vai trò hệ thống!')
                    return
                }

                const roleId = editingRole.roleId || editingRole.id
                const res = await dispatch(updateRole({ id: roleId, data: values }))
                if (updateRole.fulfilled.match(res)) {
                    message.success('Cập nhật vai trò thành công!')
                    onClose()
                }
            } else {
                const res = await dispatch(createRole(values))
                if (createRole.fulfilled.match(res)) {
                    message.success('Thêm vai trò mới thành công!')
                    onClose()
                }
            }
        } catch (error) {
            // Validation failed
        }
    }

    // Nhóm permissions để hiển thị đẹp hơn nếu cần. Ở đây chỉ hiển thị list.
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
                            <SafetyCertificateOutlined className="text-2xl" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/20 px-2.5 py-0.5 text-[11px] font-bold text-sky-300">
                                <span>{editingRole ? 'Chỉnh Sửa Vai Trò' : 'Tạo Mới Vai Trò'}</span>
                            </div>
                            <h3 className="mt-1 text-lg font-black tracking-tight text-white">
                                {editingRole ? `Cập Nhật: ${editingRole.name}` : 'Thêm Vai Trò Mới'}
                            </h3>
                            <p className="text-xs text-sky-200/80">
                                Thiết lập phân quyền để quản lý quyền truy cập hệ thống.
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
                <Form.Item
                    name="name"
                    label={<span className="text-xs font-bold text-slate-500 uppercase">Tên Vai Trò</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập tên vai trò' }]}
                >
                    <Input 
                        placeholder="VD: Staff, Manager..." 
                        disabled={editingRole && (editingRole.name === 'Admin' || editingRole.name === 'Administrator')}
                        className="rounded-xl px-4 py-2"
                    />
                </Form.Item>

                <Form.Item
                    name="description"
                    label={<span className="text-xs font-bold text-slate-500 uppercase">Mô tả</span>}
                >
                    <Input.TextArea 
                        rows={2} 
                        placeholder="Mô tả chức năng của vai trò này..." 
                        className="rounded-xl px-4 py-2"
                    />
                </Form.Item>

                <Form.Item
                    name="permissionIds"
                    label={<span className="text-xs font-bold text-slate-500 uppercase">Phân quyền chức năng</span>}
                >
                    <Checkbox.Group className="w-full">
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 h-64 overflow-y-auto custom-scrollbar">
                            {permissions.length > 0 ? (() => {
                                const grouped = permissions.reduce((acc, p) => {
                                    const mod = p.module || 'Khác'
                                    if (!acc[mod]) acc[mod] = []
                                    acc[mod].push(p)
                                    return acc
                                }, {})
                                return Object.entries(grouped).map(([mod, perms]) => (
                                    <div key={mod} className="mb-4 last:mb-0">
                                        <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">
                                            Module: <span className="text-slate-700">{mod}</span>
                                        </div>
                                        <Row gutter={[16, 12]}>
                                            {perms.map(p => (
                                                <Col span={24} md={12} key={p.permissionId || p.id}>
                                                    <Checkbox value={p.permissionId || p.id} className="text-sm font-medium text-slate-700 flex items-start">
                                                        <div className="flex flex-col ml-1">
                                                            <span className="font-bold text-sky-700 leading-tight">{p.code}</span>
                                                            <span className="text-[11px] text-slate-500 leading-tight mt-0.5">{p.description}</span>
                                                        </div>
                                                    </Checkbox>
                                                </Col>
                                            ))}
                                        </Row>
                                    </div>
                                ))
                            })() : (
                                <div className="text-center py-4">
                                    <span className="text-xs text-slate-400 italic">Đang tải danh sách quyền...</span>
                                </div>
                            )}
                        </div>
                    </Checkbox.Group>
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
                        {editingRole ? 'Cập Nhật' : 'Thêm Mới'}
                    </button>
                </div>
            </Form>
        </Modal>
    )
}
