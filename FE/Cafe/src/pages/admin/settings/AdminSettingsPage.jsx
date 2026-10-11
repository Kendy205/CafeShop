import { Tabs } from 'antd'
import { SettingOutlined, SafetyCertificateOutlined, AppstoreOutlined } from '@ant-design/icons'
import AdminPageBanner from '../../../components/admin/common/AdminPageBanner'
import GeneralSettingsTab from './GeneralSettingsTab'
import AdminRoleTab from './AdminRoleTab'

/**
 * AdminSettingsPage Component
 * Trang Cài đặt chung của hệ thống CafeShop.
 * Tổ chức thành các Tabs: Cấu hình cửa hàng (GeneralSettingsTab) và Phân quyền (AdminRoleTab).
 */
export default function AdminSettingsPage() {
    const items = [
        {
            key: '1',
            label: (
                <span className="font-bold flex items-center gap-2">
                    <AppstoreOutlined />
                    Cấu hình chung
                </span>
            ),
            children: <GeneralSettingsTab />,
        },
        {
            key: '2',
            label: (
                <span className="font-bold flex items-center gap-2">
                    <SafetyCertificateOutlined />
                    Phân quyền (Roles)
                </span>
            ),
            children: <AdminRoleTab />,
        },
    ]

    return (
        <div className="space-y-6">
            <AdminPageBanner
                badge="Hệ Thống & Cấu Hình"
                title="Cài Đặt Cửa Hàng"
                description="Tùy chỉnh thông tin thương hiệu, trạng thái mở/đóng cửa hàng, cấu hình vận chuyển và phân quyền hệ thống."
                icon={<SettingOutlined className="text-slate-300 text-xl" />}
            />

            <div className="bg-white/50 backdrop-blur-md rounded-3xl p-4 shadow-sm">
                <Tabs 
                    defaultActiveKey="1" 
                    items={items} 
                    className="custom-admin-tabs"
                    animated
                />
            </div>
        </div>
    )
}
