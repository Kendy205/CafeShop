import { useState, useEffect, useRef, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

mapboxgl.accessToken = MAPBOX_TOKEN

/**
 * MapboxLocationPicker
 * Dùng cho người dùng chọn địa chỉ của mình, hoặc admin chọn vị trí cửa hàng.
 * Không vẽ tuyến đường, chỉ ghim 1 vị trí và trả về { address, lat, lng }
 *
 * Props:
 *  onLocationSelected({ address, lat, lng }) — callback khi vị trí được chọn
 *  initialLat / initialLng — tọa độ mặc định ban đầu (tùy chọn)
 *  initialAddress — địa chỉ mặc định ban đầu (tùy chọn)
 *  label — nhãn hiển thị phía trên (mặc định: '📍 Chọn vị trí trên bản đồ')
 */
export default function MapboxLocationPicker({
    onLocationSelected,
    initialLat,
    initialLng,
    initialAddress = '',
    label = '📍 Chọn vị trí trên bản đồ',
}) {
    const mapContainer = useRef(null)
    const mapRef = useRef(null)
    const markerRef = useRef(null)
    const debounceRef = useRef(null)
    const markerAddedRef = useRef(Boolean(initialLat && initialLng))

    const [searchText, setSearchText] = useState(initialAddress)
    const [suggestions, setSuggestions] = useState([])
    const [showDrop, setShowDrop] = useState(false)
    const [locating, setLocating] = useState(false)
    const [mapReady, setMapReady] = useState(false)
    const [error, setError] = useState(
        !MAPBOX_TOKEN || MAPBOX_TOKEN.includes('YOUR_MAPBOX')
            ? '⚠️ Chưa cấu hình VITE_MAPBOX_TOKEN trong file .env'
            : ''
    )

    const [selectedInfo, setSelectedInfo] = useState(
        initialLat && initialLng
            ? { address: initialAddress, lat: initialLat, lng: initialLng }
            : null
    )

    // Lưu lựa chọn
    const commitSelection = useCallback((address, lat, lng) => {
        const info = { address, lat, lng }
        setSelectedInfo(info)
        setSearchText(address)
    }, [])

    // Reverse geocode
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
    }, [commitSelection])

    // Bay tới vị trí
    const flyTo = useCallback((lng, lat, zoom = 16) => {
        const map = mapRef.current
        if (!map || !markerRef.current) return
        
        map.flyTo({ center: [lng, lat], zoom, speed: 1.4 })
        markerRef.current.setLngLat([lng, lat])
        if (!markerAddedRef.current || !markerRef.current.getElement()?.parentElement) {
            markerRef.current.addTo(map)
            markerAddedRef.current = true
        }
    }, [])

    // Khởi tạo map
    useEffect(() => {
        if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('YOUR_MAPBOX')) {
            return
        }

        const initLat = initialLat || 21.0285
        const initLng = initialLng || 105.8542
        const initZoom = initialLat && initialLng ? 15 : 12

        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [initLng, initLat],
            zoom: initZoom,
            language: 'vi',
        })

        map.addControl(new mapboxgl.NavigationControl(), 'top-right')
        map.addControl(new mapboxgl.ScaleControl(), 'bottom-left')

        map.on('load', () => {
            setMapReady(true)
            setTimeout(() => map.resize(), 100)
            setTimeout(() => map.resize(), 400)

            // Marker
            const el = document.createElement('div')
            el.innerHTML = '📍'
            el.style.cssText = 'font-size:32px;cursor:grab;filter:drop-shadow(0 2px 6px rgba(0,0,0,.4));transition:transform .15s'

            markerRef.current = new mapboxgl.Marker({ element: el, anchor: 'bottom', draggable: true })
            
            if (initialLat && initialLng) {
                markerRef.current.setLngLat([initialLng, initialLat]).addTo(map)
                markerAddedRef.current = true
            }

            markerRef.current.on('dragstart', () => {
                setSearchText('Đang lấy vị trí...')
            })

            markerRef.current.on('dragend', () => {
                const { lng, lat } = markerRef.current.getLngLat()
                reverseGeocode(lng, lat)
            })
        })

        map.on('click', (e) => {
            const { lng, lat } = e.lngLat
            if (!markerRef.current) return
            markerRef.current.setLngLat([lng, lat])
            if (!markerAddedRef.current || !markerRef.current.getElement()?.parentElement) {
                markerRef.current.addTo(map)
                markerAddedRef.current = true
            }
            reverseGeocode(lng, lat)
        })

        mapRef.current = map

        return () => {
            map.remove()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Lấy GPS
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

    // Tìm kiếm
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

    return (
        <div className="w-full font-sans relative">
            {label && (
                <label className="font-semibold text-[13px] text-gray-700 block mb-2 tracking-wide">
                    {label}
                </label>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 mb-2.5 flex-wrap">
                <button
                    type="button"
                    className={`flex items-center gap-1.5 px-[14px] py-2 rounded-lg border-[1.5px] text-[13px] font-medium transition-all duration-200 ${
                        locating
                            ? 'border-sky-800 bg-sky-100 text-sky-800'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={handleGetLocation}
                    disabled={locating}
                >
                    {locating ? '⏳' : '🎯'} {locating ? 'Đang định vị...' : 'Vị trí của tôi'}
                </button>
            </div>

            {/* Search input */}
            <div className="relative z-20 mb-3">
                <input
                    type="text"
                    value={searchText}
                    onChange={handleSearchInput}
                    onFocus={() => suggestions.length > 0 && setShowDrop(true)}
                    onBlur={() => setTimeout(() => setShowDrop(false), 180)}
                    placeholder="Gõ địa chỉ để tìm kiếm..."
                    className="w-full py-[11px] pr-[44px] pl-[14px] rounded-[10px] border-[1.5px] border-gray-200 text-sm outline-none transition-colors duration-200 bg-white focus:border-sky-700"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-base">🔍</span>

                {showDrop && suggestions.length > 0 && (
                    <ul className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-gray-200 rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] max-h-[220px] overflow-y-auto list-none py-1 m-0">
                        {suggestions.map((f) => (
                            <li
                                key={f.id}
                                className="px-[14px] py-[10px] cursor-pointer text-[13px] text-gray-700 border-b border-gray-100 flex items-start gap-2 transition-colors duration-150 hover:bg-sky-50"
                                onMouseDown={() => handleSelectSuggestion(f)}
                            >
                                <span className="mt-[1px] shrink-0">📌</span>
                                <span>{f.place_name}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Map */}
            <div className="rounded-xl overflow-hidden h-[340px] w-full border-[1.5px] border-gray-200 relative">
                <div ref={mapContainer} className="w-full h-full" />

                {mapReady && !selectedInfo && (
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full pointer-events-none whitespace-nowrap z-10">
                        Click bản đồ hoặc kéo 📍 để ghim vị trí
                    </div>
                )}

                {locating && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-[15] rounded-xl text-[13px] text-gray-500 gap-2">
                        <span className="text-[20px]">⏳</span> Đang lấy vị trí GPS...
                    </div>
                )}
            </div>

            {/* Error message */}
            {error && <p className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

            <div className="mt-3">
                <button
                    type="button"
                    onClick={() => onLocationSelected?.(selectedInfo)}
                    className="w-full rounded-2xl bg-sky-600 py-3 text-sm font-bold text-white shadow-md shadow-sky-600/20 transition-all hover:bg-sky-700 active:scale-[0.98]"
                >
                    Xác nhận địa chỉ này
                </button>
            </div>
        </div>
    )
}
