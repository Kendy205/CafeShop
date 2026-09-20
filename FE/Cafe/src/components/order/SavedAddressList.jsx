import LoadingLink from '../loading/LoadingLink'

/**
 * SavedAddressList Component
 * Danh sách sổ địa chỉ đã lưu của khách hàng kèm tính khoảng cách Mapbox & báo lỗi ngoài phạm vi
 */
export default function SavedAddressList({
    addresses = [],
    selectedAddressId,
    onSelectAddress,
    savedDistanceKm,
    distanceCalculating,
    shippingError,
}) {
    if (!addresses || addresses.length === 0) {
        return (
            <p className="rounded-3xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                Bạn chưa lưu địa chỉ nào.{' '}
                <LoadingLink to="/addresses" className="font-semibold text-sky-800 underline hover:text-sky-900">
                    Thêm ngay
                </LoadingLink>
            </p>
        )
    }

    return (
        <div className="space-y-2.5">
            {addresses.map((a) => {
                const isSelected = String(a.addressId) === String(selectedAddressId)

                return (
                    <label
                        key={a.addressId}
                        className={`flex cursor-pointer items-start justify-between gap-3 rounded-2xl border-2 p-3.5 transition-all ${
                            isSelected
                                ? 'border-sky-700 bg-sky-50/80 shadow-xs'
                                : 'border-slate-100 bg-white hover:border-sky-200 hover:bg-slate-50/60'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <input
                                type="radio"
                                name="saved_address"
                                value={a.addressId}
                                checked={isSelected}
                                onChange={() => onSelectAddress(String(a.addressId))}
                                className="mt-1 h-4 w-4 shrink-0 accent-sky-800 cursor-pointer"
                            />
                            <div>
                                <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-slate-800">
                                    <span>{a.recipientName}</span>
                                    <span className="text-slate-300">·</span>
                                    <span className="font-mono text-slate-600">{a.phone}</span>
                                    {a.isDefault && (
                                        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-800">
                                            Mặc định
                                        </span>
                                    )}
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-slate-500">{a.fullAddress}</p>
                            </div>
                        </div>

                        {/* Tag khoảng cách Mapbox cho địa chỉ đang chọn */}
                        {isSelected && (
                            <div className="shrink-0 text-right">
                                {distanceCalculating ? (
                                    <span className="inline-flex items-center gap-1 rounded-2xl bg-sky-100/70 px-2.5 py-1 text-[11px] font-medium text-sky-800 animate-pulse">
                                        ⏳ Tính khoảng cách...
                                    </span>
                                ) : savedDistanceKm > 0 ? (
                                    <span className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs">
                                        📍 {savedDistanceKm} km
                                    </span>
                                ) : null}
                            </div>
                        )}
                    </label>
                )
            })}

            {/* Thông báo lỗi khi không tính được khoảng cách địa chỉ */}
            {shippingError && (
                <div className="mt-3 flex items-start gap-2.5 rounded-3xl border border-sky-200 bg-sky-50 p-3.5 text-sm text-sky-800">
                    <span className="text-base shrink-0">⚠️</span>
                    <div className="flex-1">
                        <p className="font-semibold">{shippingError}</p>
                        <p className="mt-0.5 text-xs text-sky-700">
                            Bạn có thể chuyển sang tab &quot;Chọn trên bản đồ&quot; để chọn lại vị trí nhanh chóng.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
