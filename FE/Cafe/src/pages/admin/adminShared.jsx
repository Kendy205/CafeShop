import { THEME } from '../../utils/constants/Theme'

export function PageHeader({ title, extra }) {
    return (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">{title}</h1>
            <div className="flex items-center gap-3">
                {extra}
            </div>
        </div>
    )
}

export function FormField({ label, children, error }) {
    return (
        <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 ml-1">{label}</label>
            {children}
            {error ? <p className="mt-1.5 text-xs font-medium text-red-500 ml-1">{error}</p> : null}
        </div>
    )
}

export function AdminTable({ columns, rows, rowKey = 'id' }) {
    return (
        <div className="overflow-x-auto rounded-3xl bg-white shadow-sm border border-slate-100">
            <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                    <tr>
                        {columns.map((c) => (
                            <th key={c.key} className="px-6 py-4 font-semibold whitespace-nowrap">
                                {c.title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td className="px-6 py-12 text-center text-slate-400 font-medium" colSpan={columns.length}>
                                Không có dữ liệu để hiển thị
                            </td>
                        </tr>
                    ) : (
                        rows.map((row, idx) => (
                            <tr key={row[rowKey] ?? idx} className="border-b border-slate-50 last:border-0 hover:bg-sky-50/30 transition-colors">
                                {columns.map((c) => (
                                    <td key={c.key} className="px-6 py-4 text-slate-700">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white/95 backdrop-blur-xl p-6 md:p-8 shadow-apple border border-white/40 animate-in zoom-in-95 duration-200 no-scrollbar">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                    >
                        ✕
                    </button>
                </div>
                <div className="text-slate-700">
                    {children}
                </div>
                {footer ? <div className="mt-8 flex justify-end gap-3">{footer}</div> : null}
            </div>
        </div>
    )
}

