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
            <p className="rounded-xl border border-dashed border-stone-200 p-6 text-center text-sm text-stone-400">
                Bạn chưa lưu địa chỉ nào.{' '}
                <LoadingLink to="/addresses" className="font-semibold text-amber-800 underline hover:text-amber-900">
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
                                ? 'border-amber-700 bg-amber-50/80 shadow-xs'
                                : 'border-stone-100 bg-white hover:border-amber-200 hover:bg-stone-50/60'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <input
                                type="radio"
                                name="saved_address"
                                value={a.addressId}
                                checked={isSelected}
                                onChange={() => onSelectAddress(String(a.addressId))}
                                className="mt-1 h-4 w-4 shrink-0 accent-amber-800 cursor-pointer"
                            />
                            <div>
                                <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-stone-800">
                                    <span>{a.recipientName}</span>
                                    <span className="text-stone-300">·</span>
                                    <span className="font-mono text-stone-600">{a.phone}</span>
                                    {a.isDefault && (
                                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                                            Mặc định
                                        </span>
                                    )}
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-stone-500">{a.fullAddress}</p>
                            </div>
                        </div>

                        {/* Tag khoảng cách Mapbox cho địa chỉ đang chọn */}
                        {isSelected && (
                            <div className="shrink-0 text-right">
                                {distanceCalculating ? (
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100/70 px-2.5 py-1 text-[11px] font-medium text-amber-800 animate-pulse">
                                        ⏳ Tính khoảng cách...
                                    </span>
                                ) : savedDistanceKm > 0 ? (
                                    <span className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700 shadow-2xs">
                                        📍 {savedDistanceKm} km
                                    </span>
                                ) : null}
                            </div>
                        )}
                    </label>
                )
            })}

            {/* Thông báo lỗi màu đỏ khi địa chỉ vượt quá phạm vi giao hàng (400 Bad Request) */}
            {shippingError && (
                <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
                    <span className="text-base shrink-0">⚠️</span>
                    <div className="flex-1">
                        <p className="font-semibold text-red-800">{shippingError}</p>
                        <p className="mt-0.5 text-xs text-red-600">
                            Vui lòng chọn một địa chỉ khác hoặc chọn vị trí trên bản đồ trong phạm vi phục vụ của quán.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
