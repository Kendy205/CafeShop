import { useState, useEffect, useRef, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

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

// ── Config từ env ───────────────────────────────────────────────────────────
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

mapboxgl.accessToken = MAPBOX_TOKEN

// ── Main component ──────────────────────────────────────────────────────────
/**
 * MapboxAddressPicker
 *
 * Props:
 *  onAddressSelected({ address, lat, lng, distanceKm, shippingFee }) — callback khi chọn xong
 *  storeLat / storeLng — tọa độ cửa hàng từ API
 */
export default function MapboxAddressPicker({
    onAddressSelected,
    storeLat,
    storeLng,
}) {
    const mapContainer = useRef(null)
    const mapRef = useRef(null)
    const customerMarkerRef = useRef(null)
    const storeMarkerRef = useRef(null)
    const debounceRef = useRef(null)
    const mapInitialized = useRef(false)

    const [searchText, setSearchText] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [showDrop, setShowDrop] = useState(false)
    const [locating, setLocating] = useState(false)
    const [mapReady, setMapReady] = useState(false)
    const [routeLoading, setRouteLoading] = useState(false)
    const [error, setError] = useState('')

    const [selectedInfo, setSelectedInfo] = useState(null) // { address, lat, lng, distanceKm }

    // Dọn dẹp map khi unmount
    useEffect(() => {
        return () => {
            if (mapRef.current) {
                mapRef.current.remove()
                mapRef.current = null
                mapInitialized.current = false
            }
        }
    }, [])

    // ── Init map khi đã có storeLat và storeLng ───────────────────────────
    useEffect(() => {
        if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('YOUR_MAPBOX')) {
            setError('⚠️ Chưa cấu hình VITE_MAPBOX_TOKEN trong file .env')
            return
        }

        // Chỉ init map khi có tọa độ hợp lệ từ API
        if (!storeLat || !storeLng) return
        if (mapInitialized.current) return
        
        mapInitialized.current = true

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
        })

        // Click on map to set delivery point
        map.on('click', (e) => {
            const { lng, lat } = e.lngLat
            
            if (!customerMarkerRef.current) {
                const custEl = document.createElement('div')
                custEl.innerHTML = '📍'
                custEl.style.cssText = 'font-size:32px;cursor:grab;filter:drop-shadow(0 2px 6px rgba(0,0,0,.4));transition:transform .15s'

                customerMarkerRef.current = new mapboxgl.Marker({ element: custEl, anchor: 'bottom', draggable: true })
                    .setLngLat([lng, lat])
                    .addTo(map)

                customerMarkerRef.current.on('dragend', () => {
                    const { lng: dLng, lat: dLat } = customerMarkerRef.current.getLngLat()
                    reverseGeocode(dLng, dLat)
                })
            } else {
                customerMarkerRef.current.setLngLat([lng, lat])
            }
            
            reverseGeocode(lng, lat)
        })

        mapRef.current = map
    }, [storeLat, storeLng]) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Cập nhật bản đồ khi tọa độ quán thay đổi (ví dụ API trả về sau) ──
    useEffect(() => {
        const map = mapRef.current
        if (!map || !mapReady) return

        // Cập nhật vị trí marker của quán
        if (storeMarkerRef.current && storeLng && storeLat) {
            storeMarkerRef.current.setLngLat([storeLng, storeLat])
        }

        // Nếu khách chưa chọn địa chỉ nào, dời bản đồ về vị trí quán mới
        if (!selectedInfo && storeLng && storeLat) {
            map.flyTo({ center: [storeLng, storeLat], zoom: 13, speed: 1.2 })
        }
    }, [storeLat, storeLng, mapReady]) // eslint-disable-line react-hooks/exhaustive-deps

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

        const tempInfo = { address, lat, lng, distanceKm: +estimateKm.toFixed(2), isEstimate: true }
        setSelectedInfo(tempInfo)
        setSearchText(address)
        onAddressSelected?.(tempInfo)

        // Gọi Directions API → nhận khoảng cách đường thực tế
        const realKm = await drawRoute(lng, lat)

        if (realKm != null) {
            const realInfo = { address, lat, lng, distanceKm: realKm, isEstimate: false }
            setSelectedInfo(realInfo)
            onAddressSelected?.(realInfo)
        }
    }, [storeLat, storeLng, onAddressSelected, drawRoute])

    // ── Fly map to position ───────────────────────────────────────────────
    const flyTo = useCallback((lng, lat, zoom = 16) => {
        const map = mapRef.current
        if (!map) return
        
        map.flyTo({ center: [lng, lat], zoom, speed: 1.4 })
        
        if (!customerMarkerRef.current) {
            const custEl = document.createElement('div')
            custEl.innerHTML = '📍'
            custEl.style.cssText = 'font-size:32px;cursor:grab;filter:drop-shadow(0 2px 6px rgba(0,0,0,.4));transition:transform .15s'

            customerMarkerRef.current = new mapboxgl.Marker({ element: custEl, anchor: 'bottom', draggable: true })
                .setLngLat([lng, lat])
                .addTo(map)

            customerMarkerRef.current.on('dragend', () => {
                const { lng: dLng, lat: dLat } = customerMarkerRef.current.getLngLat()
                reverseGeocode(dLng, dLat)
            })
        } else {
            customerMarkerRef.current.setLngLat([lng, lat])
        }
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
        
        if (customerMarkerRef.current) {
            customerMarkerRef.current.remove()
            customerMarkerRef.current = null
        }
        
        if (mapRef.current && storeLng && storeLat) {
            mapRef.current.flyTo({ center: [storeLng, storeLat], zoom: 13 })
        }
        onAddressSelected?.(null)
    }

    return (
        <div className="w-full font-sans relative">
            <label className="font-semibold text-[13px] text-gray-700 block mb-2 tracking-wide">
                📍 Địa chỉ giao hàng
            </label>

            {/* ── Action buttons ── */}
            <div className="flex gap-2 mb-2.5 flex-wrap">
                <button
                    type="button"
                    className={`flex items-center gap-1.5 px-[14px] py-2 rounded-lg border-[1.5px] text-[13px] font-medium transition-all duration-200 ${
                        locating
                            ? 'border-amber-800 bg-amber-100 text-amber-800'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={handleGetLocation}
                    disabled={locating}
                >
                    {locating ? '⏳' : '🎯'} {locating ? 'Đang định vị...' : 'Vị trí của tôi'}
                </button>
                {selectedInfo && (
                    <button 
                        type="button" 
                        className="flex items-center gap-1.5 px-[14px] py-2 rounded-lg border-[1.5px] border-gray-200 bg-white text-gray-700 text-[13px] font-medium transition-all duration-200 hover:bg-gray-50"
                        onClick={handleReset}
                    >
                        ✕ Xóa chọn
                    </button>
                )}
            </div>

            {/* ── Search input ── */}
            <div className="relative z-20 mb-3">
                <input
                    type="text"
                    value={searchText}
                    onChange={handleSearchInput}
                    onFocus={() => suggestions.length > 0 && setShowDrop(true)}
                    onBlur={() => setTimeout(() => setShowDrop(false), 180)}
                    placeholder="Gõ địa chỉ hoặc nhấn 'Vị trí của tôi'..."
                    className="w-full py-[11px] pr-[44px] pl-[14px] rounded-[10px] border-[1.5px] border-gray-200 text-sm outline-none transition-colors duration-200 bg-white focus:border-amber-700"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-base">🔍</span>

                {/* Dropdown suggestions */}
                {showDrop && suggestions.length > 0 && (
                    <ul className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-gray-200 rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] max-h-[220px] overflow-y-auto list-none py-1 m-0">
                        {suggestions.map((f) => (
                            <li
                                key={f.id}
                                className="px-[14px] py-[10px] cursor-pointer text-[13px] text-gray-700 border-b border-gray-100 flex items-start gap-2 transition-colors duration-150 hover:bg-amber-50"
                                onMouseDown={() => handleSelectSuggestion(f)}
                            >
                                <span className="mt-[1px] shrink-0">📌</span>
                                <span>{f.place_name}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* ── Map ── */}
            <div className="rounded-xl overflow-hidden h-[340px] border-[1.5px] border-gray-200 relative">
                <div ref={mapContainer} className="w-full h-full" />

                {(!storeLat || !storeLng) && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-[15] rounded-xl text-[13px] text-gray-500 gap-2">
                        <span className="text-[20px]">⏳</span> Đang tải vị trí cửa hàng...
                    </div>
                )}

                {mapReady && !selectedInfo && storeLat && storeLng && (
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full pointer-events-none whitespace-nowrap z-10">
                        Click bản đồ hoặc kéo 📍 để chọn điểm giao
                    </div>
                )}

                {locating && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-[15] rounded-xl text-[13px] text-gray-500 gap-2">
                        <span className="text-[20px]">⏳</span> Đang lấy vị trí GPS...
                    </div>
                )}

                {routeLoading && !locating && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-[15] rounded-xl text-[13px] text-gray-500 gap-2">
                        <span className="text-[18px]">🗺️</span> Đang tải tuyến đường...
                    </div>
                )}
            </div>

            {/* ── Error message ── */}
            {error && <p className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

            {/* ── Info bar: Địa chỉ & Khoảng cách (không hiện phí ship) ── */}
            {selectedInfo && (
                <div className="mt-2.5 rounded-[10px] border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 px-4 py-3 flex justify-between items-start gap-3 flex-wrap">
                    <div className="text-[13px] text-amber-900 leading-relaxed flex-1">
                        <div className="font-bold mb-1 text-amber-900 flex items-center gap-1.5">
                            <span>📍 Địa chỉ đã chọn</span>
                            {!selectedInfo.isEstimate ? (
                                <span className="text-[11px] bg-amber-100 text-amber-800 rounded-md px-[7px] py-[1px] font-semibold border border-amber-200">
                                    🛣️ Tuyến đường thực tế
                                </span>
                            ) : (
                                <span className="text-[11px] bg-gray-100 text-gray-600 rounded-md px-[7px] py-[1px] font-medium">
                                    Ước tính
                                </span>
                            )}
                        </div>
                        <div className="text-gray-700 text-[13px] leading-relaxed">{selectedInfo.address}</div>
                    </div>

                    <div className="flex flex-col gap-1 items-end justify-center shrink-0">
                        <div className="inline-flex items-center gap-[5px] bg-amber-900 text-white px-3 py-1.5 rounded-[10px] font-bold text-[13px] shadow-[0_1px_3px_rgba(120,53,15,0.2)]">
                            <span>📏</span>
                            {routeLoading ? (
                                <span className="italic font-medium text-[12px]">Đang đo...</span>
                            ) : (
                                <span>{selectedInfo.distanceKm} km</span>
                            )}
                        </div>
                        <div className="text-[11px] text-amber-800 font-medium">
                            Khoảng cách tới quán
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
