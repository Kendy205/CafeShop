import React, { useState } from 'react'
import { Tabs } from 'antd'
import { AppstoreOutlined, CoffeeOutlined, ColumnWidthOutlined } from '@ant-design/icons'
import AdminCategoryPage from '../categories/AdminCategoryPage'
import AdminToppingPage from '../toppings/AdminToppingPage'
import AdminSizePage from '../sizes/AdminSizePage'

/**
 * AdminMenuConfigPage Component
 * Trang gộp chung cấu hình thuộc tính của Menu: Danh mục, Topping, Kích cỡ (Size).
 * Sử dụng Tabs để chuyển đổi qua lại giữa các màn hình cấu hình một cách tiện lợi.
 */
export default function AdminMenuConfigPage() {
    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Cấu Hình Thuộc Tính Sản Phẩm</h2>
                        <p className="mt-1 text-sm font-medium text-slate-500">
                            Quản lý Danh mục, Topping và Kích cỡ đồ uống tập trung tại một nơi.
                        </p>
                    </div>
                </div>

                <Tabs
                    defaultActiveKey="category"
                    className="admin-custom-tabs"
                    items={[
                        {
                            key: 'category',
                            label: (
                                <span className="flex items-center gap-2 font-bold px-2 py-1 text-sm">
                                    <AppstoreOutlined />
                                    Danh Mục
                                </span>
                            ),
                            children: (
                                <div className="mt-4">
                                    <AdminCategoryPage />
                                </div>
                            ),
                        },
                        {
                            key: 'topping',
                            label: (
                                <span className="flex items-center gap-2 font-bold px-2 py-1 text-sm">
                                    <CoffeeOutlined />
                                    Topping
                                </span>
                            ),
                            children: (
                                <div className="mt-4">
                                    <AdminToppingPage />
                                </div>
                            ),
                        },
                        {
                            key: 'size',
                            label: (
                                <span className="flex items-center gap-2 font-bold px-2 py-1 text-sm">
                                    <ColumnWidthOutlined />
                                    Kích Cỡ
                                </span>
                            ),
                            children: (
                                <div className="mt-4">
                                    <AdminSizePage />
                                </div>
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    )
}
