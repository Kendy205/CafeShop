import { useState, useEffect, useMemo, useRef } from 'react'
import { mapService } from '../../services/map/MapService'
import { orderService } from '../../services/user/OrderService'
import { unwrapApi } from '../../utils/helpers/api'

export function useCheckoutMap({ addressTab, selectedAddr, cafeLat, cafeLng, mapAddress, subtotal, TAB_SAVED, TAB_MAP }) {
    const [savedDistanceKm, setSavedDistanceKm] = useState(null)
    const [distanceCalculating, setDistanceCalculating] = useState(false)

    const [apiShippingFee, setApiShippingFee] = useState(null)
    const [feeCalculating, setFeeCalculating] = useState(false)
    const [shippingError, setShippingError] = useState('')
    const shipDebounceRef = useRef(null)

    const [isShippingError, setIsShippingError] = useState(false)

    // Bước 2 & Bước 3: Tính khoảng cách Mapbox khi user chọn radio hoặc tick tự động
    useEffect(() => {
        if (addressTab !== TAB_SAVED || !selectedAddr) {
            return
        }

        let cancelled = false
        setDistanceCalculating(true)
        setShippingError('')

        const calculateDistance = (toLng, toLat) => {
            mapService
                .getDrivingDistance(cafeLng, cafeLat, toLng, toLat)
                .then((dist) => {
                    if (!cancelled) {
                        setSavedDistanceKm(dist ?? 0)
                        setDistanceCalculating(false)
                    }
                })
                .catch(() => {
                    if (!cancelled) {
                        const directDist = mapService.calculateHaversineDistance?.(cafeLat, cafeLng, toLat, toLng)
                        setSavedDistanceKm(directDist ?? 0)
                        setDistanceCalculating(false)
                    }
                })
        }

        const lat = selectedAddr.latitude
        const lng = selectedAddr.longitude

        // Nếu địa chỉ cũ trong DB chưa có tọa độ GPS, tự động tìm tọa độ qua Mapbox Geocoding
        if (!lat || !lng || Number(lat) === 0 || Number(lng) === 0) {
            mapService
                .searchAddress(selectedAddr.fullAddress)
                .then((features) => {
                    if (cancelled) return
                    if (features && features.length > 0) {
                        const [autoLng, autoLat] = features[0].center
                        calculateDistance(autoLng, autoLat)
                    } else {
                        setSavedDistanceKm(0)
                        setDistanceCalculating(false)
                        setShippingError('Chưa xác định được tọa độ địa chỉ. Bạn có thể chọn lại trên bản đồ.')
                    }
                })
                .catch(() => {
                    if (!cancelled) {
                        setSavedDistanceKm(0)
                        setDistanceCalculating(false)
                    }
                })
            return
        }

        calculateDistance(lng, lat)

        return () => {
            cancelled = true
        }
    }, [addressTab, selectedAddr, cafeLat, cafeLng, TAB_SAVED])

    // Khoảng cách hiện tại dùng để tính phí ship (km)
    const currentDistanceKm = useMemo(() => {
        if (addressTab === TAB_MAP) {
            return Number(mapAddress?.distanceKm ?? 0)
        }
        return Number(savedDistanceKm ?? 0)
    }, [addressTab, mapAddress, savedDistanceKm, TAB_MAP])

    // Bước 4: Xin báo giá phí vận chuyển từ Backend (POST /api/Order/calculate-fee)
    useEffect(() => {
        clearTimeout(shipDebounceRef.current)

        if (!currentDistanceKm || currentDistanceKm <= 0) {
            setApiShippingFee(0)
            setFeeCalculating(false)
            setShippingError('')
            setIsShippingError(false)
            return
        }

        setFeeCalculating(true)
        shipDebounceRef.current = setTimeout(async () => {
            try {
                const res = await orderService.calculateShippingFee({
                    distanceKm: currentDistanceKm,
                    orderTotal: subtotal,
                })
                const fee = unwrapApi(res)

                setApiShippingFee(Number(fee ?? 0))
                setShippingError('')
                setIsShippingError(false)
            } catch (err) {
                // Đã có toast global báo lỗi từ Axios/Redux, không set shippingError để ẩn khung đỏ
                setApiShippingFee(null)
                setShippingError('')
                setIsShippingError(true)
            } finally {
                setFeeCalculating(false)
            }
        }, 500)

        return () => clearTimeout(shipDebounceRef.current)
    }, [currentDistanceKm, subtotal])

    return {
        savedDistanceKm,
        distanceCalculating,
        currentDistanceKm,
        shippingFee: apiShippingFee != null ? apiShippingFee : 0,
        feeCalculating,
        shippingError,
        setShippingError,
        isShippingError,
    }
}
