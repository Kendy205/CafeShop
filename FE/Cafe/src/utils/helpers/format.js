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
    if (item.totalItemPrice != null && item.totalItemPrice !== '') {
        return Number(item.totalItemPrice)
    }
    if (item.totalPrice != null && item.totalPrice !== '') return Number(item.totalPrice)
    const unit = Number(item.unitPrice ?? item.sizePrice ?? item.basePrice ?? 0)
    const qty = Number(item.quantity) || 0
    const toppingSum = (item.toppings || []).reduce((sum, t) => {
        return sum + Number(t.unitPrice ?? t.price ?? 0)
    }, 0)
    return unit * qty + toppingSum
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
