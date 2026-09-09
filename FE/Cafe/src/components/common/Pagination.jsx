export default function Pagination({ pageNumber = 1, totalPages = 1, onChange }) {
    if (totalPages <= 1) return null

    const pages = []
    const start = Math.max(1, pageNumber - 2)
    const end = Math.min(totalPages, pageNumber + 2)
    for (let i = start; i <= end; i += 1) pages.push(i)

    return (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
                type="button"
                disabled={pageNumber <= 1}
                onClick={() => onChange(pageNumber - 1)}
                className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm disabled:opacity-40"
            >
                Trước
            </button>
            {pages.map((p) => (
                <button
                    key={p}
                    type="button"
                    onClick={() => onChange(p)}
                    className={`rounded-lg px-3 py-1.5 text-sm ${
                        p === pageNumber
                            ? 'bg-amber-800 text-white'
                            : 'border border-stone-200 hover:bg-amber-50'
                    }`}
                >
                    {p}
                </button>
            ))}
            <button
                type="button"
                disabled={pageNumber >= totalPages}
                onClick={() => onChange(pageNumber + 1)}
                className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm disabled:opacity-40"
            >
                Sau
            </button>
        </div>
    )
}
