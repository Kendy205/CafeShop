import { useSelector } from 'react-redux'

export default function Loading() {
    const visible = useSelector(
        (s) => s.ui.loadingCount > 0 || s.ui.routeLoadingCount > 0
    )

    if (!visible) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-lg">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-700" />
                <p className="text-sm font-medium text-stone-600">Đang tải...</p>
            </div>
        </div>
    )
}
