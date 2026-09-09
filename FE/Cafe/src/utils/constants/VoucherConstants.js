/**
 * Voucher enum constants — khớp chính xác với backend static class
 *
 * Backend:
 *   VoucherTypeTarget  { USER = "USER",        PUBLIC = "PUBLIC"      }
 *   VoucherApplyType   { ORDER = "ORDER",       SHIPPING = "SHIPPING"  }
 *   DiscountApplyType  { FIXED = "FIXED",       PERCENTAGE = "PERCENTAGE" }
 */

/** VoucherTypeTarget */
export const VoucherTargetType = Object.freeze({
    USER:   'USER',
    PUBLIC: 'PUBLIC',
})

/** VoucherApplyType */
export const VoucherApplyType = Object.freeze({
    ORDER:    'ORDER',
    SHIPPING: 'SHIPPING',
})

/** DiscountApplyType */
export const DiscountType = Object.freeze({
    FIXED:      'FIXED',
    PERCENTAGE: 'PERCENTAGE',
})

// ── Display helpers ─────────────────────────────────────────────────────────

/** Label hiển thị theo applyType */
export const APPLY_TYPE_LABEL = {
    [VoucherApplyType.ORDER]:    '🛒 Giảm tiền món',
    [VoucherApplyType.SHIPPING]: '🚚 Giảm phí ship',
}

/** Label hiển thị theo targetType */
export const TARGET_TYPE_LABEL = {
    [VoucherTargetType.PUBLIC]: 'Công khai',
    [VoucherTargetType.USER]:   'Tặng riêng',
}

/**
 * Format số tiền giảm theo discountType
 * @param {string} type  — "FIXED" | "PERCENTAGE"
 * @param {number} value
 * @param {function} formatVnd
 */
export function formatDiscount(type, value, formatVnd) {
    return type === DiscountType.PERCENTAGE
        ? `-${value}%`
        : `-${formatVnd(value)}`
}
