import { useState, useEffect, useRef, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { orderService } from '../../services/user/OrderService'
import { unwrapApi } from '../../utils/helpers/api'

// ── Haversine distance (km) — dùng làm fallback / ước tính tạm ────────────
function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Shipping fee calculator ─────────────────────────────────────────────────
function calcShippingFee(distanceKm) {
    if (distanceKm <= 0) return 0
    if (distanceKm <= 3) return 15000
    let fee = 15000
    if (distanceKm > 3) {
        fee += (distanceKm - 3) * 5000
    }
    return fee
}

// ── Config từ env ───────────────────────────────────────────────────────────
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
const STORE_LAT = parseFloat(import.meta.env.VITE_STORE_LAT ?? '21.0285')
const STORE_LNG = parseFloat(import.meta.env.VITE_STORE_LNG ?? '105.8542')

mapboxgl.accessToken = MAPBOX_TOKEN

// ── Styles ──────────────────────────────────────────────────────────────────
const S = {
    root: {
        width: '100%',
        fontFamily: "'Inter', system-ui, sans-serif",
        position: 'relative',
    },
    label: {
        fontWeight: '600',
        fontSize: '13px',
        color: '#374151',
        display: 'block',
        marginBottom: '8px',
        letterSpacing: '0.01em',
    },
    searchWrap: { position: 'relative', zIndex: 20, marginBottom: '12px' },
    searchInput: {
        width: '100%',
        padding: '11px 44px 11px 14px',
        borderRadius: '10px',
        border: '1.5px solid #e5e7eb',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color .2s',
        background: '#fff',
    },
    searchIcon: {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#9ca3af',
        pointerEvents: 'none',
        fontSize: '16px',
    },
    dropdown: {
        position: 'absolute',
        top: 'calc(100% + 4px)',
        left: 0,
        right: 0,
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        boxShadow: '0 8px 24px rgba(0,0,0,.12)',
        maxHeight: '220px',
        overflowY: 'auto',
        listStyle: 'none',
        padding: '4px 0',
        margin: 0,
    },
    dropdownItem: {
        padding: '10px 14px',
        cursor: 'pointer',
        fontSize: '13px',
        color: '#374151',
        borderBottom: '1px solid #f3f4f6',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        transition: 'background .15s',
    },
    actions: {
        display: 'flex',
        gap: '8px',
        marginBottom: '10px',
        flexWrap: 'wrap',
    },
    btn: (active) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        borderRadius: '8px',
        border: active ? '1.5px solid #92400e' : '1.5px solid #e5e7eb',
        background: active ? '#fef3c7' : '#fff',
        color: active ? '#92400e' : '#374151',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all .2s',
    }),
    mapWrap: {
        borderRadius: '12px',
        overflow: 'hidden',
        height: '340px',
        border: '1.5px solid #e5e7eb',
        position: 'relative',
    },
    mapHint: {
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,.62)',
        color: '#fff',
        fontSize: '12px',
        padding: '5px 12px',
        borderRadius: '20px',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        zIndex: 10,
    },
    infoBar: {
        marginTop: '10px',
        borderRadius: '10px',
        border: '1px solid #fde68a',
        background: 'linear-gradient(135deg,#fffbeb,#fef3c7)',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12px',
        flexWrap: 'wrap',
    },
    infoText: { fontSize: '13px', color: '#78350f', lineHeight: 1.5, flex: 1 },
    badge: (color) => ({
        background: color,
        color: '#fff',
        borderRadius: '8px',
        padding: '4px 10px',
        fontSize: '12px',
        fontWeight: '700',
        whiteSpace: 'nowrap',
        alignSelf: 'flex-start',
    }),
    loading: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(255,255,255,.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 15,
        borderRadius: '12px',
        fontSize: '13px',
        color: '#6b7280',
        gap: '8px',
    },
    errText: {
        marginTop: '8px',
        fontSize: '12px',
        color: '#dc2626',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        padding: '8px 12px',
    },
}

// ── Main component ──────────────────────────────────────────────────────────
/**
 * MapboxAddressPicker
 *
 * Props:
 *  onAddressSelected({ address, lat, lng, distanceKm, shippingFee }) — callback khi chọn xong
 *  storeLat / storeLng — override tọa độ cửa hàng (default lấy từ .env)
 */
export default function MapboxAddressPicker({
    onAddressSelected,
    storeLat = STORE_LAT,
    storeLng = STORE_LNG,
    shippingFee: externalShippingFee,
    feeCalculating: externalFeeCalculating,
    orderTotal = 0,
}) {
    const mapContainer = useRef(null)
    const mapRef = useRef(null)
    const customerMarkerRef = useRef(null)
    const storeMarkerRef = useRef(null)
    const debounceRef = useRef(null)
    const feeDebounceRef = useRef(null)

    const [searchText, setSearchText] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [showDrop, setShowDrop] = useState(false)
    const [locating, setLocating] = useState(false)
    const [mapReady, setMapReady] = useState(false)
    const [routeLoading, setRouteLoading] = useState(false)
    const [error, setError] = useState('')

    const [selectedInfo, setSelectedInfo] = useState(null) // { address, lat, lng, distanceKm, shippingFee }
    const [internalApiFee, setInternalApiFee] = useState(null)
    const [internalCalculating, setInternalCalculating] = useState(false)

    // Nếu parent không truyền shippingFee, tự gọi API POST /api/Order/calculate-fee (debounce 800ms)
    useEffect(() => {
        if (externalShippingFee !== undefined) return
        clearTimeout(feeDebounceRef.current)

        const dist = selectedInfo?.distanceKm
        if (!dist || dist <= 0) {
            setInternalApiFee(0)
            setInternalCalculating(false)
            return
        }

        setInternalCalculating(true)
        feeDebounceRef.current = setTimeout(async () => {
            try {
                const res = await orderService.calculateShippingFee({
                    distanceKm: dist,
                    orderTotal,
                })
                const fee = unwrapApi(res)
                setInternalApiFee(Number(fee ?? 0))
            } catch {
                setInternalApiFee(calcShippingFee(dist))
            } finally {
                setInternalCalculating(false)
            }
        }, 800)

        return () => clearTimeout(feeDebounceRef.current)
    }, [selectedInfo?.distanceKm, externalShippingFee, orderTotal])

    // ── Init map ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('YOUR_MAPBOX')) {
            setError('⚠️ Chưa cấu hình VITE_MAPBOX_TOKEN trong file .env')
            return
        }

        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [storeLng, storeLat],
            zoom: 13,
            language: 'vi',
        })

        // Controls
        map.addControl(new mapboxgl.NavigationControl(), 'top-right')
        map.addControl(new mapboxgl.ScaleControl(), 'bottom-left')

        map.on('load', () => {
            setMapReady(true)

            // Store marker — dùng biểu tượng cà phê cho Cafe
            const storeEl = document.createElement('div')
            storeEl.innerHTML = '☕'
            storeEl.style.cssText = 'font-size:28px;cursor:default;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))'
            storeEl.title = 'Quán cà phê'

            storeMarkerRef.current = new mapboxgl.Marker({ element: storeEl, anchor: 'bottom' })
                .setLngLat([storeLng, storeLat])
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<b>☕ Quán cà phê</b><br>Điểm xuất phát'))
                .addTo(map)

            // Customer marker (draggable)
            const custEl = document.createElement('div')
            custEl.innerHTML = '📍'
            custEl.style.cssText = 'font-size:32px;cursor:grab;filter:drop-shadow(0 2px 6px rgba(0,0,0,.4));transition:transform .15s'

            customerMarkerRef.current = new mapboxgl.Marker({ element: custEl, anchor: 'bottom', draggable: true })
                .setLngLat([storeLng, storeLat])
                .addTo(map)

            customerMarkerRef.current.on('dragend', () => {
                const { lng, lat } = customerMarkerRef.current.getLngLat()
                reverseGeocode(lng, lat)
            })
        })

        // Click on map to set delivery point
        map.on('click', (e) => {
            const { lng, lat } = e.lngLat
            customerMarkerRef.current?.setLngLat([lng, lat])
            reverseGeocode(lng, lat)
        })

        mapRef.current = map
        return () => map.remove()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Reverse geocode → lấy tên địa chỉ từ tọa độ ─────────────────────
    const reverseGeocode = useCallback(async (lng, lat) => {
        try {
            const res = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=vi&types=address,poi,neighborhood,locality`
            )
            const json = await res.json()
            const place = json.features?.[0]
            const address = place?.place_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
            commitSelection(address, lat, lng)
        } catch {
            commitSelection(`${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng)
        }
    }, [storeLat, storeLng]) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Xóa tuyến đường khỏi bản đồ ─────────────────────────────────────
    const clearRoute = useCallback(() => {
        const map = mapRef.current
        if (!map) return
        if (map.getLayer('route-line')) map.removeLayer('route-line')
        if (map.getLayer('route-outline')) map.removeLayer('route-outline')
        if (map.getSource('route')) map.removeSource('route')
    }, [])

    // ── Gọi Mapbox Directions API → vẽ tuyến đường thực tế + trả về khoảng cách ──
    const drawRoute = useCallback(async (toLng, toLat) => {
        const map = mapRef.current
        if (!map) return null

        setRouteLoading(true)
        clearRoute()

        try {
            const url =
                `https://api.mapbox.com/directions/v5/mapbox/driving/` +
                `${storeLng},${storeLat};${toLng},${toLat}` +
                `?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`

            const res = await fetch(url)
            const json = await res.json()
            const route = json.routes?.[0]
            if (!route) return null

            // ── Khoảng cách đường thực tế (meters → km) ──────────────────
            const realKm = +(route.distance / 1000).toFixed(2)

            const geojson = { type: 'Feature', geometry: route.geometry }

            clearRoute()
            map.addSource('route', { type: 'geojson', data: geojson })

            map.addLayer({
                id: 'route-outline',
                type: 'line',
                source: 'route',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': '#ffffff', 'line-width': 8, 'line-opacity': 0.8 },
            })

            map.addLayer({
                id: 'route-line',
                type: 'line',
                source: 'route',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: {
                    'line-color': '#92400e',
                    'line-width': 5,
                    'line-opacity': 0.92,
                },
            })

            const coords = route.geometry.coordinates
            const lngs = coords.map((c) => c[0])
            const lats = coords.map((c) => c[1])
            map.fitBounds(
                [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
                { padding: { top: 60, bottom: 60, left: 40, right: 40 }, speed: 1.2 }
            )

            return realKm  // ← trả về khoảng cách đường thực tế
        } catch {
            return null    // ← lỗi → fallback dùng Haversine
        } finally {
            setRouteLoading(false)
        }
    }, [storeLng, storeLat, clearRoute])

    // ── Commit selection & fire callback ─────────────────────────────────
    const commitSelection = useCallback(async (address, lat, lng) => {
        const estimateKm = haversineKm(storeLat, storeLng, lat, lng)
        const estimateFee = calcShippingFee(estimateKm)

        const tempInfo = { address, lat, lng, distanceKm: +estimateKm.toFixed(2), shippingFee: estimateFee, isEstimate: true }
        setSelectedInfo(tempInfo)
        setSearchText(address)
        onAddressSelected?.(tempInfo)

        // Gọi Directions API → nhận khoảng cách đường thực tế
        const realKm = await drawRoute(lng, lat)

        if (realKm != null) {
            const realFee = calcShippingFee(realKm)
            const realInfo = { address, lat, lng, distanceKm: realKm, shippingFee: realFee, isEstimate: false }
            setSelectedInfo(realInfo)
            onAddressSelected?.(realInfo)  // cập nhật lại CheckoutPage với giá trị chính xác
        }
    }, [storeLat, storeLng, onAddressSelected, drawRoute])

    // ── Fly map to position ───────────────────────────────────────────────
    const flyTo = useCallback((lng, lat, zoom = 16) => {
        mapRef.current?.flyTo({ center: [lng, lat], zoom, speed: 1.4 })
        customerMarkerRef.current?.setLngLat([lng, lat])
    }, [])

    // ── Geolocation: lấy vị trí hiện tại ─────────────────────────────────
    const handleGetLocation = () => {
        setError('')
        if (!navigator.geolocation) {
            setError('Trình duyệt không hỗ trợ định vị GPS.')
            return
        }
        setLocating(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords
                flyTo(lng, lat)
                reverseGeocode(lng, lat)
                setLocating(false)
            },
            (err) => {
                setLocating(false)
                const msgs = {
                    1: 'Bạn đã từ chối quyền truy cập vị trí. Hãy cho phép trong cài đặt trình duyệt.',
                    2: 'Không xác định được vị trí. Kiểm tra kết nối hoặc thử lại.',
                    3: 'Hết thời gian chờ định vị. Thử lại.',
                }
                setError(msgs[err.code] ?? 'Không lấy được vị trí.')
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }

    // ── Search: Mapbox Geocoding autocomplete ─────────────────────────────
    const handleSearchInput = (e) => {
        const value = e.target.value
        setSearchText(value)
        clearTimeout(debounceRef.current)

        if (value.length < 2) {
            setSuggestions([])
            setShowDrop(false)
            return
        }

        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json` +
                    `?access_token=${MAPBOX_TOKEN}&language=vi&country=VN&autocomplete=true&limit=6`
                )
                const json = await res.json()
                setSuggestions(json.features ?? [])
                setShowDrop(true)
            } catch {
                setSuggestions([])
            }
        }, 350)
    }

    const handleSelectSuggestion = (feature) => {
        const [lng, lat] = feature.center
        flyTo(lng, lat)
        commitSelection(feature.place_name, lat, lng)
        setSuggestions([])
        setShowDrop(false)
    }

    // ── Reset ─────────────────────────────────────────────────────────────
    const handleReset = () => {
        setSearchText('')
        setSuggestions([])
        setShowDrop(false)
        setSelectedInfo(null)
        setError('')
        clearRoute()
        flyTo(storeLng, storeLat, 13)
        onAddressSelected?.(null)
    }

    // ── Shipping fee badge color & calculations ───────────────────────────
    const isCalculatingFee = externalFeeCalculating !== undefined
        ? externalFeeCalculating
        : internalCalculating

    const effectiveFee = externalShippingFee !== undefined
        ? externalShippingFee
        : (internalApiFee !== null ? internalApiFee : (selectedInfo?.shippingFee ?? 0))

    const isFreeship = effectiveFee === 0 && !routeLoading && !isCalculatingFee && !!selectedInfo

    const feeColor = !selectedInfo ? '#9ca3af'
        : isFreeship ? '#059669'
            : effectiveFee <= 25000 ? '#059669'
                : effectiveFee <= 40000 ? '#d97706'
                    : '#dc2626'

    const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

    return (
        <div style={S.root}>
            <label style={S.label}>📍 Địa chỉ giao hàng</label>

            {/* ── Action buttons ── */}
            <div style={S.actions}>
                <button
                    type="button"
                    style={S.btn(locating)}
                    onClick={handleGetLocation}
                    disabled={locating}
                >
                    {locating ? '⏳' : '🎯'} {locating ? 'Đang định vị...' : 'Vị trí của tôi'}
                </button>
                {selectedInfo && (
                    <button type="button" style={S.btn(false)} onClick={handleReset}>
                        ✕ Xóa chọn
                    </button>
                )}
            </div>

            {/* ── Search input ── */}
            <div style={S.searchWrap}>
                <input
                    type="text"
                    value={searchText}
                    onChange={handleSearchInput}
                    onFocus={() => suggestions.length > 0 && setShowDrop(true)}
                    onBlur={() => setTimeout(() => setShowDrop(false), 180)}
                    placeholder="Gõ địa chỉ hoặc nhấn 'Vị trí của tôi'..."
                    style={S.searchInput}
                />
                <span style={S.searchIcon}>🔍</span>

                {/* Dropdown suggestions */}
                {showDrop && suggestions.length > 0 && (
                    <ul style={S.dropdown}>
                        {suggestions.map((f) => (
                            <li
                                key={f.id}
                                style={S.dropdownItem}
                                onMouseDown={() => handleSelectSuggestion(f)}
                                onMouseOver={(e) => (e.currentTarget.style.background = '#fffbeb')}
                                onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}
                            >
                                <span style={{ marginTop: '1px', flexShrink: 0 }}>📌</span>
                                <span>{f.place_name}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* ── Map ── */}
            <div style={S.mapWrap}>
                <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

                {mapReady && !selectedInfo && (
                    <div style={S.mapHint}>
                        Click bản đồ hoặc kéo 📍 để chọn điểm giao
                    </div>
                )}

                {locating && (
                    <div style={S.loading}>
                        <span style={{ fontSize: '20px' }}>⏳</span> Đang lấy vị trí GPS...
                    </div>
                )}

                {routeLoading && !locating && (
                    <div style={{ ...S.loading, background: 'rgba(255,255,255,.6)' }}>
                        <span style={{ fontSize: '18px' }}>🗺️</span> Đang tải tuyến đường...
                    </div>
                )}
            </div>

            {/* ── Error message ── */}
            {error && <p style={S.errText}>{error}</p>}

            {/* ── Info bar: khoảng cách + phí ship ── */}
            {selectedInfo && (
                <div style={S.infoBar}>
                    <div style={S.infoText}>
                        <div style={{ fontWeight: 600, marginBottom: '4px', color: '#78350f', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            ✅ Địa chỉ đã chọn
                            {!selectedInfo.isEstimate && (
                                <span style={{ fontSize: '10px', background: '#fde68a', color: '#92400e', borderRadius: '4px', padding: '1px 6px', fontWeight: 500 }}>
                                    🛣️ Đường thực tế
                                </span>
                            )}
                        </div>
                        <div>{selectedInfo.address}</div>
                        <div style={{ marginTop: '6px', fontSize: '12px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            📏 Khoảng cách:{' '}
                            {routeLoading ? (
                                <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Đang tính...</span>
                            ) : (
                                <b>{selectedInfo.distanceKm} km</b>
                            )}
                            {selectedInfo.isEstimate && !routeLoading && (
                                <span style={{ fontSize: '10px', color: '#9ca3af' }}>(ước tính)</span>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                        <div style={S.badge(routeLoading || isCalculatingFee ? '#9ca3af' : feeColor)}>
                            {routeLoading || isCalculatingFee ? (
                                '⏳ Đang tính...'
                            ) : isFreeship ? (
                                '🎉 Miễn phí (Freeship)'
                            ) : (
                                `🚚 ${fmt(effectiveFee)}`
                            )}
                        </div>
                        <div style={{ fontSize: '11px', color: isFreeship ? '#059669' : '#6b7280', fontWeight: isFreeship ? 600 : 400 }}>
                            {isFreeship ? 'Ưu đãi Freeship' : 'Phí vận chuyển'}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
