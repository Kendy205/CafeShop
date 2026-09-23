import React from 'react'
import { Table, Card } from 'antd'
import AppPagination from '../../common/AppPagination'

export default function AdminTable({
    columns,
    dataSource,
    rowKey = 'id',
    loading = false,
    pagination = false,
    className = 'custom-admin-table',
    emptyText = 'Không có dữ liệu',
    currentPage,
    pageSize,
    totalItems,
    onPageChange,
    ...props
}) {
    return (
        <Card className="rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden bg-white" bodyStyle={{ padding: 0 }}>
            {loading ? (
                <div className="p-5 space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-12 w-full animate-pulse rounded-3xl bg-slate-100/80" />
                    ))}
                </div>
            ) : (
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    rowKey={rowKey}
                    pagination={pagination}
                    className={className}
                    locale={{ emptyText: <div className="py-10 text-slate-400">{emptyText}</div> }}
                    {...props}
                />
            )}
            
            {onPageChange && (
                <AppPagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={totalItems}
                    onChange={onPageChange}
                />
            )}
        </Card>
    )
}
