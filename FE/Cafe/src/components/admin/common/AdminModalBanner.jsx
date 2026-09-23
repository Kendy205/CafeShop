import React from 'react'
import { CloseOutlined } from '@ant-design/icons'

export default function AdminModalBanner({ title, subtitle, icon, badgeText, onClose }) {
    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 px-6 py-5 text-white">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />
            <div className="absolute left-1/3 -bottom-10 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/30">
                        {icon}
                    </div>
                    <div>
                        {badgeText && (
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/20 px-2.5 py-0.5 text-[11px] font-bold text-sky-300">
                                <span>{badgeText}</span>
                            </div>
                        )}
                        <h3 className="mt-1 text-lg font-black tracking-tight text-white">
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="text-xs text-sky-200/80">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition-all hover:bg-white/20 hover:text-white cursor-pointer"
                        title="Đóng"
                    >
                        <CloseOutlined className="text-xs" />
                    </button>
                )}
            </div>
        </div>
    )
}
