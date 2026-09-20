/**
 * Định dạng các phong cách chung (Tailwind classes) dùng cho toàn bộ ứng dụng.
 * Tái sử dụng để đảm bảo Clean Code và nhất quán giao diện (Apple Style).
 */

export const THEME = {
    // ─── Tông màu chủ đạo (Light Blue / Sky) ──────────────────────────────────
    colors: {
        primary: 'sky-500',         // Màu chính (Button, Text active)
        primaryHover: 'sky-600',
        primaryBg: 'bg-sky-500',
        primaryBgHover: 'hover:bg-sky-600',
        primaryText: 'text-sky-500',
        
        secondary: 'blue-500',      // Tông màu phụ hỗ trợ
        background: 'bg-slate-50',  // Background mặc định trang
        cardBg: 'bg-white/70',      // Background kính cho Card
        text: 'text-slate-800',     // Màu chữ chính
        textMuted: 'text-slate-500',// Màu chữ phụ
    },

    // ─── Bo góc (Apple style chuộng bo tròn) ──────────────────────────────────
    radius: {
        card: 'rounded-3xl',        // Các block lớn, thẻ sản phẩm
        button: 'rounded-full',     // Nút bấm chính
        input: 'rounded-2xl',       // Ô nhập liệu
        tag: 'rounded-full',        // Nhãn (Badge)
    },

    // ─── Hiệu ứng Glassmorphism & Shadow ──────────────────────────────────────
    effects: {
        glass: 'bg-white/70 backdrop-blur-xl border border-white/40 shadow-apple',
        glassNavbar: 'bg-white/80 backdrop-blur-md border-b border-white/40 shadow-sm',
        shadow: 'shadow-apple', // Tùy chỉnh trong index.css
    },

    // ─── Layout & Spacing ─────────────────────────────────────────────────────
    layout: {
        container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        sectionY: 'py-8 md:py-12',
    }
}

/**
 * Helper class generator cho Button
 */
export const getButtonClass = (variant = 'primary') => {
    const base = `transition-all duration-300 font-semibold flex items-center justify-center cursor-pointer outline-none ${THEME.radius.button}`
    
    switch (variant) {
        case 'primary':
            return `${base} ${THEME.colors.primaryBg} text-white ${THEME.colors.primaryBgHover} shadow-md shadow-sky-500/20 px-6 py-2.5`
        case 'secondary':
            return `${base} bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 px-6 py-2.5 shadow-sm`
        case 'danger':
            return `${base} bg-red-500 text-white hover:bg-red-600 px-6 py-2.5 shadow-sm shadow-red-500/20`
        case 'ghost':
            return `${base} bg-transparent text-sky-600 hover:bg-sky-50 px-4 py-2`
        default:
            return `${base} ${THEME.colors.primaryBg} text-white px-6 py-2.5`
    }
}
