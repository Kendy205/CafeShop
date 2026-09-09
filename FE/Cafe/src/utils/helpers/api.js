/**
 * Helpers chuẩn hoá giao tiếp giữa Frontend và Backend .NET ApiResponse<T> & PagedResult<T>
 *
 * Khung Backend:
 * - ApiResponse<T>: { Success: bool, StatusCode: int, Message: string, Data: T, Errors: object? }
 * - PagedResult<T>: { Items: IEnumerable<T>, Total: int, Page: int, PageSize: int }
 */

/**
 * Trích xuất Data từ Axios Response hoặc ApiResponse<T>
 * Ném Error kèm message nếu Success === false hoặc StatusCode >= 400
 */
export function unwrapApi(res) {
    const body = res?.data !== undefined ? res.data : res

    if (body && typeof body === 'object') {
        // Kiểm tra cờ thất bại của ApiResponse
        if (body.success === false || body.Success === false) {
            const msg = body.message || body.Message || 'Yêu cầu không thành công'
            const err = new Error(msg)
            err.response = { data: body }
            throw err
        }
        if (
            (body.statusCode && body.statusCode >= 400) ||
            (body.StatusCode && body.StatusCode >= 400)
        ) {
            const msg = body.message || body.Message || 'Yêu cầu không thành công'
            const err = new Error(msg)
            err.response = { data: body }
            throw err
        }

        // Lấy Data bên trong ApiResponse
        const data = body.data !== undefined ? body.data : (body.Data !== undefined ? body.Data : body)

        // Nếu data là object (không phải array, không phải null) và chưa có message,
        // đính kèm Message của ApiResponse vào data để các action có thể lấy thông báo
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            const msg = body.message || body.Message
            if (msg && !('message' in data) && !('Message' in data)) {
                data.message = msg
            }
        }

        return data
    }

    return body
}

/**
 * Chuyển đổi an toàn bất kỳ payload nào về Array (hỗ trợ cả PagedResult.Items / items / Data)
 */
export function asList(payload) {
    if (!payload) return []
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload.items)) return payload.items
    if (Array.isArray(payload.Items)) return payload.Items
    if (Array.isArray(payload.data)) return payload.data
    if (Array.isArray(payload.Data)) return payload.Data
    return []
}

/**
 * Chuẩn hoá PagedResult<T> của Backend ({ Items, Total, Page, PageSize })
 * Đảm bảo luôn có { items, total, page, pageSize, totalPages }
 */
export function normalizePagedResult(payload, defaultPageSize = 8) {
    const data = (payload && typeof payload === 'object') ? payload : {}
    const items = asList(data)

    const total = Number(
        data.total ??
        data.Total ??
        data.totalRecord ??
        data.TotalRecord ??
        items.length
    )

    const pageSize = Number(
        data.pageSize ??
        data.PageSize ??
        defaultPageSize
    ) || defaultPageSize

    const page = Number(
        data.page ??
        data.Page ??
        data.pageNumber ??
        data.PageNumber ??
        1
    ) || 1

    const totalPages = Math.max(1, Math.ceil(total / pageSize))

    return {
        items,
        total,
        page,
        pageSize,
        totalPages,
    }
}

/**
 * Trích xuất câu thông báo lỗi chi tiết từ Axios Error hoặc ApiResponse.Failed
 */
export function pickErrorMessage(error, fallback = 'Có lỗi xảy ra, vui lòng thử lại') {
    if (typeof error === 'string' && error) return error

    const data = error?.response?.data

    // 1. Phản hồi thô là chuỗi
    if (typeof data === 'string' && data.trim()) return data.trim()

    // 2. ApiResponse.Failed(string message, int statusCode, object? errors)
    if (typeof data?.message === 'string' && data.message) return data.message
    if (typeof data?.Message === 'string' && data.Message) return data.Message
    if (typeof data?.detail === 'string' && data.detail) return data.detail
    if (typeof data?.title === 'string' && data.title) return data.title

    // 3. Trích xuất từ Errors / errors
    const errObj = data?.errors ?? data?.Errors
    if (errObj) {
        if (typeof errObj === 'string' && errObj.trim()) return errObj.trim()
        if (Array.isArray(errObj) && errObj.length > 0) return String(errObj[0])
        if (typeof errObj === 'object') {
            const firstKey = Object.keys(errObj)[0]
            if (firstKey) {
                const val = errObj[firstKey]
                if (Array.isArray(val) && val[0]) return String(val[0])
                if (typeof val === 'string') return val
            }
        }
    }

    if (typeof error?.message === 'string' && error.message) return error.message
    return fallback
}

export function pickAccessToken(payload) {
    return (
        payload?.token ??
        payload?.Token ??
        payload?.accessToken ??
        payload?.AccessToken ??
        null
    )
}

export function pickRefreshToken(payload) {
    return (
        payload?.refreshToken ??
        payload?.RefreshToken ??
        payload?.refresh ??
        payload?.Refresh ??
        null
    )
}
