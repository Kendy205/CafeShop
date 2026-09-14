/**
 * MapService.js
 * Quản lý tương tác với Mapbox API: Directions (tính khoảng cách đường bộ),
 * Geocoding (tìm kiếm địa chỉ và chuyển đổi tọa độ), Haversine fallback.
 */

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

/**
 * Tính khoảng cách đường chim bay (Haversine formula) đơn vị km
 */
export function haversineKm(lat1, lng1, lat2, lng2) {
    if (!lat1 || !lng1 || !lat2 || !lng2) return 0
    const R = 6371 // Bán kính Trái Đất (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2
    const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return Number(d.toFixed(1))
}

export class MapService {
    token = MAPBOX_TOKEN

    hasValidToken() {
        return Boolean(this.token && !this.token.includes('YOUR_MAPBOX'))
    }

    /**
     * Lấy chỉ đường lái xe từ Mapbox Directions API
     * @param {number} fromLng
     * @param {number} fromLat
     * @param {number} toLng
     * @param {number} toLat
     * @returns {Promise<{ distanceKm: number, distanceMeters: number, durationMinutes: number, geometry: any, route: any } | null>}
     */
    async getDrivingDirections(fromLng, fromLat, toLng, toLat) {
        if (!fromLng || !fromLat || !toLng || !toLat) return null

        if (!this.hasValidToken()) {
            const dist = haversineKm(fromLat, fromLng, toLat, toLng)
            return {
                distanceKm: dist,
                distanceMeters: dist * 1000,
                durationMinutes: Math.round(dist * 2.5),
                geometry: null,
                route: null,
            }
        }

        try {
            const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${fromLng},${fromLat};${toLng},${toLat}?geometries=geojson&overview=full&access_token=${this.token}`
            const res = await fetch(url)
            const json = await res.json()
            const route = json.routes?.[0]

            if (route && typeof route.distance === 'number') {
                const distanceKm = Number((route.distance / 1000).toFixed(1))
                const durationMinutes = Math.round((route.duration ?? 0) / 60)
                return {
                    distanceKm,
                    distanceMeters: route.distance,
                    durationMinutes,
                    geometry: route.geometry,
                    route,
                }
            }
        } catch (err) {
            console.warn('[MapService] Directions API error:', err)
        }

        // Fallback Haversine nếu API gặp sự cố
        const dist = haversineKm(fromLat, fromLng, toLat, toLng)
        return {
            distanceKm: dist,
            distanceMeters: dist * 1000,
            durationMinutes: Math.round(dist * 2.5),
            geometry: null,
            route: null,
        }
    }

    /**
     * Chỉ lấy khoảng cách km đã làm tròn 1 chữ số thập phân (VD: 3.5)
     */
    async getDrivingDistance(fromLng, fromLat, toLng, toLat) {
        const result = await this.getDrivingDirections(fromLng, fromLat, toLng, toLat)
        return result?.distanceKm ?? 0
    }

    /**
     * Chuyển tọa độ thành tên địa chỉ (Reverse Geocoding)
     */
    async reverseGeocode(lng, lat) {
        if (!lng || !lat) return `${lat}, ${lng}`
        if (!this.hasValidToken()) return `${lat.toFixed(5)}, ${lng.toFixed(5)}`

        try {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.token}&language=vi&types=address,poi,neighborhood,locality`
            const res = await fetch(url)
            const json = await res.json()
            const place = json.features?.[0]
            return place?.place_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        } catch (err) {
            console.warn('[MapService] Reverse geocode error:', err)
            return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        }
    }

    /**
     * Tìm kiếm gợi ý địa chỉ theo từ khóa (Forward Geocoding)
     */
    async searchPlaces(query, proximityLng, proximityLat) {
        const clean = (query || '').trim()
        if (!clean || !this.hasValidToken()) return []

        try {
            let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(clean)}.json?access_token=${this.token}&country=VN&language=vi&types=address,poi,neighborhood,locality&limit=6`
            if (proximityLng && proximityLat) {
                url += `&proximity=${proximityLng},${proximityLat}`
            }
            const res = await fetch(url)
            const json = await res.json()
            return json.features || []
        } catch (err) {
            console.warn('[MapService] Search places error:', err)
            return []
        }
    }
}

export const mapService = new MapService()
