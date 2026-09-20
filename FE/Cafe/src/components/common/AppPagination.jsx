import { Pagination } from 'antd'

/**
 * AppPagination – Component phân trang thống nhất cho toàn bộ ứng dụng.
 *
 * Props khớp với cấu trúc normalizePagedResult() từ utils/helpers/api.js:
 *   { items, total, page, pageSize, totalPages }
 *
 * @param {number}   current   - Trang hiện tại (1-based). Alias: `page`
 * @param {number}   pageSize  - Số mục mỗi trang
 * @param {number}   total     - Tổng số mục (từ backend: PagedResult.Total)
 * @param {function} onChange  - Callback (page: number) => void
 * @param {boolean}  showTotal - Hiển thị dòng "Hiển thị X–Y trong Z mục" (mặc định: true)
 * @param {string}   className - Class tuỳ chỉnh cho wrapper div
 * @param {boolean}  border    - Thêm border-top ngăn cách (dùng trong bảng admin, mặc định: true)
 */
export default function AppPagination({
    current,
    page,
    pageNumber,     // alias cho current/page
    pageSize = 8,
    total,
    totalPages,     // fallback nếu gọi kiểu user-side chỉ truyền totalPages
    onChange,
    showTotal,
    className = '',
    border = false,
}) {
    const activePage = Number(current ?? page ?? pageNumber ?? 1)
    const effectivePageSize = Number(pageSize) || 8

    // Nếu có total thì dùng total, nếu không có mà có totalPages thì ước tính total
    const computedTotal = total !== undefined && total !== null
        ? Number(total)
        : (totalPages ? Number(totalPages) * effectivePageSize : 0)

    // Nếu không truyền showTotal thì mặc định: chỉ hiện khi có total rõ ràng từ backend
    const shouldShowTotal = showTotal !== undefined
        ? showTotal
        : (total !== undefined && total !== null && total > 0 && border)

    // Không render nếu chỉ có 1 trang hoặc không có dữ liệu
    if (!computedTotal || computedTotal <= effectivePageSize) return null

    return (
        <div
            className={`flex flex-col items-center gap-2 py-4 ${border ? 'border-t border-slate-100 bg-white px-6' : ''} ${className}`}
        >
            <Pagination
                current={activePage}
                pageSize={effectivePageSize}
                total={computedTotal}
                onChange={onChange}
                showSizeChanger={false}
                showTotal={
                    shouldShowTotal
                        ? (tot, range) => (
                              <span className="text-sm text-slate-500">
                                  Hiển thị{' '}
                                  <span className="font-bold text-slate-800">{range[0]}</span>
                                  {'–'}
                                  <span className="font-bold text-slate-800">{range[1]}</span>{' '}
                                  trong{' '}
                                  <span className="font-bold text-slate-800">{tot}</span> mục
                              </span>
                          )
                        : undefined
                }
                className="custom-admin-pagination"
            />
        </div>
    )
}
