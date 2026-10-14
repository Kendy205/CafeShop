export function formatVnd(value) {
    const n = Number(value)
    if (!Number.isFinite(n)) return '0 ₫'
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(n)
}

export function calcLineTotal(item) {
    if (!item) return 0
    if (item.totalItemPrice != null && item.totalItemPrice !== '') {
        return Number(item.totalItemPrice)
    }
    if (item.totalPrice != null && item.totalPrice !== '') return Number(item.totalPrice)

    const qty = Number(item.quantity) || 1

    // Nếu item có unitPrice từ backend (đã gồm toàn bộ topping của ly)
    if (item.unitPrice != null && item.unitPrice !== '') {
        return Number(item.unitPrice) * qty
    }

    // Nếu chỉ có basePrice hoặc sizePrice (chưa gồm topping)
    const toppingSumPerLy = (item.toppings || []).reduce((sum, t) => {
        const price = Number(t.price ?? t.unitPrice ?? 0)
        return sum + price
    }, 0)

    const base = Number(item.sizePrice ?? item.basePrice ?? 0)
    return (base + toppingSumPerLy) * qty
}

export function toppingLabel(t) {
    const name = t.name || t.toppingName || 'Topping'
    const qty = t.quantity
    const unit = t.unit ? ` ${t.unit}` : ''
    return qty != null ? `${name} · ${qty}${unit}` : name
}

export function itemDisplayName(item) {
    return item.productName || item.name || 'Món'
}

/**
 * Tính phí vận chuyển theo khoảng cách (km).
 * - 0 km       → 0 ₫
 * - ≤ 3 km     → 15.000 ₫
 * - > 3 km     → 15.000 ₫ + ceil(km - 3) × 5.000 ₫ mỗi km
 */
export function calculateShippingFee(distanceKm) {
    if (distanceKm <= 0) return 0
    if (distanceKm <= 3) return 15000
    const extraKm = Math.ceil(distanceKm - 3)
    return 15000 + extraKm * 5000
}
