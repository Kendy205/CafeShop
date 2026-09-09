export function PageHeader({ title, extra }) {
    return (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold text-stone-800">{title}</h1>
            {extra}
        </div>
    )
}

export function FormField({ label, children, error }) {
    return (
        <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-stone-700">{label}</label>
            {children}
            {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
        </div>
    )
}

export function AdminTable({ columns, rows, rowKey = 'id' }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
            <table className="min-w-full text-left text-sm">
                <thead className="bg-stone-50 text-stone-600">
                    <tr>
                        {columns.map((c) => (
                            <th key={c.key} className="px-4 py-3 font-medium">
                                {c.title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td className="px-4 py-8 text-center text-stone-400" colSpan={columns.length}>
                                Chưa có dữ liệu
                            </td>
                        </tr>
                    ) : (
                        rows.map((row, idx) => (
                            <tr key={row[rowKey] ?? idx} className="border-t border-stone-100">
                                {columns.map((c) => (
                                    <td key={c.key} className="px-4 py-3">
                                        {c.render ? c.render(row) : row[c.dataIndex]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}

export function AdminModal({ open, title, onClose, children, footer }) {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button type="button" onClick={onClose} className="text-stone-500">
                        Đóng
                    </button>
                </div>
                {children}
                {footer ? <div className="mt-4 flex justify-end gap-2">{footer}</div> : null}
            </div>
        </div>
    )
}
