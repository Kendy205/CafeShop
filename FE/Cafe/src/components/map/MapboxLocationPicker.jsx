import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Spin } from 'antd'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
mapboxgl.accessToken = MAPBOX_TOKEN || ''

export default function MapboxLocationPicker({
    onLocationSelected,
    initialLat = 21.0285,
    initialLng = 105.8542,
    initialAddress = '',
}) {
    const mapContainer = useRef(null)
    const mapRef = useRef(null)
    const markerRef = useRef(null)
    const debounceRef = useRef(null)

    const [searchText, setSearchText] = useState(initialAddress)
    const [suggestions, setSuggestions] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [mapReady, setMapReady] = useState(false)
    const [error, setError] = useState('')

    const [selectedInfo, setSelectedInfo] = useState({
        address: initialAddress,
        lat: initialLat,
        lng: initialLng,
    })

    useEffect(() => {
        if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('YOUR_MAPBOX')) {
            setError('⚠️ Chưa cấu hình VITE_MAPBOX_TOKEN trong file .env')
            return
        }

        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [initialLng, initialLat],
            zoom: 14,
            language: 'vi',
        })

        map.addControl(new mapboxgl.NavigationControl(), 'top-right')

        map.on('load', () => {
            setMapReady(true)

            const el = document.createElement('div')
            el.innerHTML = '📍'
            el.style.cssText = 'font-size:32px;cursor:grab;filter:drop-shadow(0 2px 6px rgba(0,0,0,.4));transition:transform .15s'

            markerRef.current = new mapboxgl.Marker({ element: el, anchor: 'bottom', draggable: true })
                .setLngLat([initialLng, initialLat])
                .addTo(map)

            markerRef.current.on('dragend', () => {
                const { lng, lat } = markerRef.current.getLngLat()
                reverseGeocode(lng, lat)
            })
        })

        mapRef.current = map

        return () => {
            map.remove()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const searchAddress = async (query) => {
        if (!query.trim()) {
            setSuggestions([])
            return
        }
        setIsSearching(true)
        try {
            const res = await fetch(
                `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(
                    query
                )}&country=vn&access_token=${MAPBOX_TOKEN}&language=vi`
            )
            const data = await res.json()
            if (data.features) {
                setSuggestions(
                    data.features.map((f) => ({
                        id: f.id,
                        name: f.properties.name,
                        address: f.properties.full_address || f.properties.place_formatted || f.properties.name,
                        lng: f.geometry.coordinates[0],
                        lat: f.geometry.coordinates[1],
                    }))
                )
            }
        } catch (err) {
            console.error('Search error:', err)
        } finally {
            setIsSearching(false)
        }
    }

    async function reverseGeocode(lng, lat) {
        setIsSearching(true)
        try {
            const res = await fetch(
                `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${MAPBOX_TOKEN}&language=vi`
            )
            const data = await res.json()
            let address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`

            if (data.features && data.features.length > 0) {
                const props = data.features[0].properties
                address = props.full_address || props.name || address
            }
            setSearchText(address)
            setSelectedInfo({ address, lat, lng })
        } catch (err) {
            console.error('Reverse geocode error:', err)
            setSelectedInfo({ address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, lat, lng })
        } finally {
            setIsSearching(false)
        }
    }

    const handleSearchChange = (e) => {
        const val = e.target.value
        setSearchText(val)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            searchAddress(val)
        }, 500)
    }

    const handleSelectSuggestion = (item) => {
        setSearchText(item.address)
        setSuggestions([])
        setSelectedInfo({ address: item.address, lat: item.lat, lng: item.lng })

        if (mapRef.current && markerRef.current) {
            markerRef.current.setLngLat([item.lng, item.lat])
            mapRef.current.flyTo({ center: [item.lng, item.lat], zoom: 16 })
        }
    }

    const handleConfirm = () => {
        if (onLocationSelected && selectedInfo) {
            onLocationSelected(selectedInfo)
        }
    }

    if (error) {
        return <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-200 font-bold">{error}</div>
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="relative z-10">
                <input
                    type="text"
                    value={searchText}
                    onChange={handleSearchChange}
                    placeholder="Nhập địa chỉ hoặc di chuyển ghim trên bản đồ..."
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm shadow-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20"
                />
                {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Spin size="small" />
                    </div>
                )}
                {suggestions.length > 0 && (
                    <ul className="absolute left-0 right-0 top-full mt-1 max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
                        {suggestions.map((s) => (
                            <li
                                key={s.id}
                                onClick={() => handleSelectSuggestion(s)}
                                className="cursor-pointer px-4 py-2 hover:bg-sky-50"
                            >
                                <p className="text-sm font-bold text-slate-800">{s.name}</p>
                                <p className="text-xs text-slate-500 line-clamp-1">{s.address}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="relative h-[300px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
                <div ref={mapContainer} className="absolute inset-0" />
                {!mapReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                        <Spin />
                    </div>
                )}
            </div>
            
            <button
                type="button"
                onClick={handleConfirm}
                className="w-full rounded-2xl bg-sky-600 py-3 text-sm font-bold text-white shadow-md shadow-sky-600/20 transition-all hover:bg-sky-700 active:scale-[0.98]"
            >
                Xác nhận địa chỉ này
            </button>
        </div>
    )
}
