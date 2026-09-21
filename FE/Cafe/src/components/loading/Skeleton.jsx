export default function Skeleton({ className = '' }) {
    return <div className={`animate-pulse rounded-2xl bg-slate-200/80 ${className}`} />
}

export function ProductCardSkeleton() {
    return (
        <div className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs animate-pulse">
            <div>
                {/* Khung ảnh giả lập */}
                <div className="h-48 w-full bg-slate-200/80" />

                {/* Thông tin món */}
                <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                        <div className="h-5 w-3/4 rounded-xl bg-slate-200/80" />
                        <div className="h-4 w-10 rounded-full bg-slate-200/60" />
                    </div>
                    <div className="h-3.5 w-5/6 rounded-lg bg-slate-200/60" />
                    <div className="flex items-center gap-1.5 pt-1">
                        <div className="h-3 w-8 rounded-md bg-slate-200/50" />
                        <div className="h-4 w-10 rounded-md bg-slate-200/70" />
                        <div className="h-4 w-10 rounded-md bg-slate-200/70" />
                    </div>
                </div>
            </div>

            {/* Chân card */}
            <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 flex items-center justify-between">
                <div className="space-y-1">
                    <div className="h-2.5 w-12 rounded bg-slate-200/60" />
                    <div className="h-5 w-20 rounded-lg bg-slate-200/80" />
                </div>
                <div className="h-7 w-20 rounded-3xl bg-slate-200/80" />
            </div>
        </div>
    )
}

