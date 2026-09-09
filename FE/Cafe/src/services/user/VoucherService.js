import { BaseServices } from '../BaseService'

export class VoucherService extends BaseServices {
    /**
     * GET /api/Voucher/available
     * Lấy tất cả mã Public còn hạn + mã Personal được tặng riêng cho user
     */
    getAvailable = () =>
        this.get('/api/Voucher/available', { __skipGlobalLoading: true })

    /**
     * POST /api/Voucher/check
     * Kiểm tra tính hợp lệ & xem trước số tiền giảm (không trừ lượt dùng)
     * @param {string}  voucherCode
     * @param {boolean} isBuyNow   — true khi Mua Ngay, false khi từ Giỏ hàng
     * @param {number}  distanceKm — khoảng cách (lấy từ Mapbox), dùng tính phí ship
     * @param {Array}   items      — bắt buộc khi isBuyNow=true
     */
    checkVoucher = ({ voucherCode, isBuyNow, distanceKm, items }) =>
        this.post(
            '/api/Voucher/check',
            {
                voucherCode,
                isBuyNow: Boolean(isBuyNow),
                distanceKm: Number(distanceKm ?? 0),
                items: isBuyNow ? (items ?? []) : null,
            },
            { __skipGlobalLoading: true }
        )

    /**
     * GET /api/UserVoucher/my-vouchers
     * Xem ví voucher cá nhân (bao gồm số lần còn lại, trạng thái usable)
     */
    getMyVouchers = () =>
        this.get('/api/UserVoucher/my-vouchers')

    /**
     * POST /api/UserVoucher/claim/{code}
     * Lưu mã Public vào ví cá nhân
     */
    claimVoucher = (code) =>
        this.post(`/api/UserVoucher/claim/${encodeURIComponent(code)}`)
}

export const voucherService = new VoucherService()
