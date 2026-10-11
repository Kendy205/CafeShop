import React from 'react'

/**
 * AppButton Component
 * Nút bấm (Button) dùng chung trên toàn hệ thống CafeShop.
 * Quản lý các biến thể màu sắc (primary, danger, outline...) và kích thước để giao diện nhất quán.
 */
export default function AppButton({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    className = '', 
    ...props 
}) {
    const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
    
    const variants = {
        primary: "bg-sky-500 hover:bg-sky-600 text-white shadow-apple hover:shadow-apple-hover",
        danger: "bg-rose-500 hover:bg-rose-600 text-white shadow-apple hover:shadow-lg hover:shadow-rose-500/30",
        outline: "border-2 border-slate-200 hover:border-sky-500 text-slate-700 hover:text-sky-600 bg-white shadow-sm hover:shadow-md",
        glass: "bg-white/80 backdrop-blur-md border border-white/40 text-slate-700 shadow-apple hover:bg-white",
        ghost: "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900"
    }

    const sizes = {
        sm: "px-3 py-1.5 text-xs rounded-xl",
        md: "px-5 py-2.5 text-sm rounded-2xl",
        lg: "px-8 py-3.5 text-base rounded-2xl",
        icon: "p-2 rounded-full"
    }

    return (
        <button 
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}
