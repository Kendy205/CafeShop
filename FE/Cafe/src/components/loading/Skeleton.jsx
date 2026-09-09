export default function Skeleton({ className = '' }) {
    return <div className={`animate-pulse rounded-lg bg-stone-200 ${className}`} />
}

export function ProductCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-2xl border border-stone-100 bg-white p-3 shadow-sm">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="mt-3 h-4 w-3/4" />
            <Skeleton className="mt-2 h-4 w-1/2" />
        </div>
    )
}
