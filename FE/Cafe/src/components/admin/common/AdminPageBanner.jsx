import { ThunderboltOutlined } from '@ant-design/icons'

export default function AdminPageBanner({
    badge = 'Hệ Thống Quản Trị CafeShop',
    title,
    description,
    icon = <ThunderboltOutlined className="text-amber-400 text-xl" />,
    stats,
    extra,
}) {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 md:p-8 text-white shadow-xl">
            {/* Background Geometric Matrix Decor */}
            <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }}
            />
            {/* Glowing Aura Spheres */}
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/20 px-3 py-1 text-xs font-bold text-sky-300 backdrop-blur-md mb-3">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        {badge}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                        {title}
                        {icon}
                    </h1>
                    {description && (
                        <p className="mt-1.5 text-xs md:text-sm text-slate-300 max-w-xl">
                            {description}
                        </p>
                    )}
                </div>

                {/* Extra Actions / Stats on the right */}
                {(extra || stats) && (
                    <div className="flex flex-wrap items-center gap-3">
                        {stats}
                        {extra}
                    </div>
                )}
            </div>
        </div>
    )
}
