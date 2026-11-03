import { useState, useEffect, useRef } from 'react'
import { 
  MapPin, Search, Navigation, ExternalLink, Compass, 
  RotateCcw, Loader2, ArrowRight, X, Route
} from 'lucide-react'

// Common Indian cities / IT hubs fallback coords
const KNOWN_COORDS = {
  'bangalore': { lat: 12.9716, lng: 77.5946, label: 'Bangalore, Karnataka' },
  'bengaluru': { lat: 12.9716, lng: 77.5946, label: 'Bengaluru, Karnataka' },
  'mumbai': { lat: 19.0760, lng: 72.8777, label: 'Mumbai, Maharashtra' },
  'delhi': { lat: 28.6139, lng: 77.2090, label: 'New Delhi, Delhi' },
  'new delhi': { lat: 28.6139, lng: 77.2090, label: 'New Delhi, Delhi' },
  'noida': { lat: 28.5355, lng: 77.3910, label: 'Noida, Uttar Pradesh' },
  'gurgaon': { lat: 28.4595, lng: 77.0266, label: 'Gurgaon, Haryana' },
  'gurugram': { lat: 28.4595, lng: 77.0266, label: 'Gurugram, Haryana' },
  'hyderabad': { lat: 17.3850, lng: 78.4867, label: 'Hyderabad, Telangana' },
  'pune': { lat: 18.5204, lng: 73.8567, label: 'Pune, Maharashtra' },
  'chennai': { lat: 13.0827, lng: 80.2707, label: 'Chennai, Tamil Nadu' },
  'kolkata': { lat: 22.5726, lng: 88.3639, label: 'Kolkata, West Bengal' },
  'ahmedabad': { lat: 23.0225, lng: 72.5714, label: 'Ahmedabad, Gujarat' },
  'chandigarh': { lat: 30.7333, lng: 76.7794, label: 'Chandigarh, India' },
  'jaipur': { lat: 26.9124, lng: 75.7873, label: 'Jaipur, Rajasthan' },
  'lucknow': { lat: 26.8467, lng: 80.9462, label: 'Lucknow, Uttar Pradesh' },
  'indore': { lat: 22.7196, lng: 75.8577, label: 'Indore, Madhya Pradesh' },
  'kochi': { lat: 9.9312, lng: 76.2673, label: 'Kochi, Kerala' },
  'remote': { lat: 20.5937, lng: 78.9629, label: 'Remote / Work from Anywhere' },
}

// Distance calculation using Haversine formula
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

export default function JobLocationMap({ location = '', companyName = '' }) {
  const [jobCoords, setJobCoords] = useState({ lat: 12.9716, lng: 77.5946 })
  const [userQuery, setUserQuery] = useState('')
  const [userCoords, setUserCoords] = useState(null)
  const [userAddress, setUserAddress] = useState('')
  const [distance, setDistance] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [suggestions, setSuggestions] = useState([])

  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const jobMarkerRef = useRef(null)
  const userMarkerRef = useRef(null)
  const polylineRef = useRef(null)
  const searchTimeoutRef = useRef(null)

  const isRemote = !location || location.toLowerCase().includes('remote')

  // Resolve job location to coordinates on mount or location change
  useEffect(() => {
    let resolved = null
    const lower = (location || '').toLowerCase()

    for (const [key, val] of Object.entries(KNOWN_COORDS)) {
      if (lower.includes(key)) {
        resolved = { lat: val.lat, lng: val.lng }
        break
      }
    }

    if (resolved) {
      setJobCoords(resolved)
    } else if (location.trim()) {
      // Fetch via Nominatim
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`, {
        headers: { 'Accept-Language': 'en' }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setJobCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) })
          }
        })
        .catch(() => {})
    }
  }, [location])

  // Initialize Leaflet Map
  useEffect(() => {
    const timer = setTimeout(() => {
      initMap()
    }, 200)

    return () => clearTimeout(timer)
  }, [jobCoords.lat, jobCoords.lng])

  const initMap = () => {
    if (!mapContainerRef.current) return
    if (typeof window.L === 'undefined') {
      setTimeout(initMap, 250)
      return
    }

    const L = window.L

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
      jobMarkerRef.current = null
      userMarkerRef.current = null
      polylineRef.current = null
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [jobCoords.lat, jobCoords.lng],
        zoom: isRemote ? 5 : 13,
        zoomControl: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      L.control.zoom({ position: 'topright' }).addTo(map)

      // Job Location Pin (Blue)
      const jobPin = L.divIcon({
        className: 'custom-job-pin',
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; inset: 0; background-color: rgba(39, 93, 245, 0.35); border-radius: 9999px; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 36px; height: 36px; background: linear-gradient(135deg, #275df5, #1240c4); border: 2.5px solid #ffffff; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); color: white;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
      })

      const marker = L.marker([jobCoords.lat, jobCoords.lng], { icon: jobPin }).addTo(map)
      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px 2px;">
          <b style="color: #0f172a; font-size: 13px;">${companyName || 'Job Location'}</b>
          <div style="color: #64748b; font-size: 11px; margin-top: 2px;">${location || 'Remote'}</div>
        </div>
      `).openPopup()

      mapInstanceRef.current = map
      jobMarkerRef.current = marker

      setTimeout(() => {
        map.invalidateSize()
      }, 250)
    } catch (err) {
      console.error('JobLocationMap init error:', err)
    }
  }

  // Handle Candidate Searching Their Address / Landmark to check distance
  const handleSearchChange = (e) => {
    const val = e.target.value
    setUserQuery(val)
    setSearchError('')

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    if (!val.trim() || val.length < 2) {
      setSuggestions([])
      return
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&addressdetails=1`, {
        headers: { 'Accept-Language': 'en' }
      })
        .then(res => res.json())
        .then(data => setSuggestions(data || []))
        .catch(() => setSuggestions([]))
    }, 350)
  }

  const applyUserLocation = (lat, lng, label) => {
    const L = window.L
    if (!L || !mapInstanceRef.current) return

    setUserCoords({ lat, lng })
    setUserAddress(label)
    setSuggestions([])
    setSearchError('')

    const dist = getDistanceKm(lat, lng, jobCoords.lat, jobCoords.lng)
    setDistance(dist)

    // Remove existing user marker & route line
    if (userMarkerRef.current) userMarkerRef.current.remove()
    if (polylineRef.current) polylineRef.current.remove()

    // Add User Pin (Amber/Emerald)
    const userPin = L.divIcon({
      className: 'custom-user-pin',
      html: `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          <div style="position: relative; width: 34px; height: 34px; background: linear-gradient(135deg, #10b981, #059669); border: 2.5px solid #ffffff; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); color: white;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="12 8 8 12 12 16 16 12 12 8"/></svg>
          </div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -18],
    })

    const userM = L.marker([lat, lng], { icon: userPin }).addTo(mapInstanceRef.current)
    userM.bindPopup(`<b>Your Searched Location</b><br/><span style="font-size:11px; color:#64748b;">${label}</span>`).openPopup()
    userMarkerRef.current = userM

    // Add dotted geodesic / polyline between both locations
    const polyline = L.polyline([[lat, lng], [jobCoords.lat, jobCoords.lng]], {
      color: '#275df5',
      dashArray: '6, 8',
      weight: 3.5,
      opacity: 0.85,
    }).addTo(mapInstanceRef.current)
    polylineRef.current = polyline

    // Fit map bounds to show both markers
    const group = new L.featureGroup([jobMarkerRef.current, userM])
    mapInstanceRef.current.fitBounds(group.getBounds().pad(0.2))
  }

  const handleSearchSubmit = async () => {
    if (!userQuery.trim()) return
    setIsSearching(true)
    setSearchError('')
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(userQuery)}&limit=1`, {
        headers: { 'Accept-Language': 'en' }
      })
      const data = await res.json()
      if (data && data.length > 0) {
        const item = data[0]
        applyUserLocation(parseFloat(item.lat), parseFloat(item.lon), item.display_name?.split(',').slice(0, 3).join(', ') || item.display_name)
      } else {
        setSearchError('Place not found. Try searching a major area or landmark.')
      }
    } catch {
      setSearchError('Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setSearchError('Geolocation is not supported by your browser')
      return
    }
    setIsGettingLocation(true)
    setSearchError('')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setIsGettingLocation(false)
        applyUserLocation(lat, lng, 'Your Current Location')
        setUserQuery('My Location')
      },
      (err) => {
        setIsGettingLocation(false)
        console.warn(err)
        setSearchError('Could not retrieve current GPS position.')
      },
      { timeout: 8000 }
    )
  }

  const resetMap = () => {
    setUserQuery('')
    setUserCoords(null)
    setDistance(null)
    setSuggestions([])
    setSearchError('')
    if (userMarkerRef.current) userMarkerRef.current.remove()
    if (polylineRef.current) polylineRef.current.remove()
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([jobCoords.lat, jobCoords.lng], 13, { duration: 1 })
      if (jobMarkerRef.current) jobMarkerRef.current.openPopup()
    }
  }

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location || 'Bangalore')}`

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-sm space-y-4">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Compass className="h-4 w-4 text-[#275df5]" /> Job Location & Map
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {location ? `Workplace located at ${location}` : 'Remote / Anywhere'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-[#275df5] hover:text-[#1a4bd8] flex items-center gap-1 bg-blue-50 hover:bg-blue-100/70 px-3 py-1.5 rounded-full transition-colors"
          >
            Directions on Google Maps <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Search Distance Bar */}
      <div className="space-y-2">
        <div className="flex gap-2 relative">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search your area, city, or landmark to check distance..."
              value={userQuery}
              onChange={handleSearchChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSearchSubmit()
                }
              }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#275df5] focus:bg-white transition-all placeholder:text-slate-400"
            />
            {userQuery && (
              <button
                type="button"
                onClick={() => {
                  setUserQuery('')
                  setSuggestions([])
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSearchSubmit}
            disabled={isSearching}
            className="bg-[#275df5] hover:bg-[#1a4bd8] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-xs shrink-0"
          >
            {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
            <span>Search</span>
          </button>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isGettingLocation}
            title="Use my current location to measure commute distance"
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#275df5] text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
          >
            {isGettingLocation ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#275df5]" />
            ) : (
              <Navigation className="h-3.5 w-3.5 text-[#275df5]" />
            )}
            <span className="hidden sm:inline">My Location</span>
          </button>

          {userCoords && (
            <button
              type="button"
              onClick={resetMap}
              title="Reset map view"
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Suggestion dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute z-30 bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto divide-y divide-slate-100 max-w-md w-full">
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  applyUserLocation(parseFloat(item.lat), parseFloat(item.lon), item.display_name?.split(',').slice(0, 3).join(', ') || item.display_name)
                  setUserQuery(item.display_name?.split(',')[0] || '')
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 flex items-start gap-2"
              >
                <MapPin className="h-3.5 w-3.5 text-[#275df5] shrink-0 mt-0.5" />
                <span className="truncate">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}

        {searchError && (
          <p className="text-xs text-rose-500 bg-rose-50 px-2.5 py-1 rounded-lg">
            {searchError}
          </p>
        )}

        {/* Calculated Distance Banner */}
        {distance !== null && (
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200/80 rounded-xl p-3 flex items-center justify-between text-xs text-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">
                <Route className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm">~{distance} km</span> away from your searched location
                <p className="text-[11px] text-slate-500 truncate max-w-xs">{userAddress}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={resetMap}
              className="text-xs font-semibold text-[#275df5] hover:underline shrink-0"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Map Display Container */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200/80 h-72 md:h-80 bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Corner Coordinates Badge */}
        <div className="absolute bottom-2.5 left-2.5 z-20 pointer-events-none bg-white/90 backdrop-blur-xs text-slate-600 text-[10px] font-mono font-semibold px-2.5 py-1 rounded-md shadow-xs border border-slate-200">
          📍 {jobCoords.lat.toFixed(4)}° N, {jobCoords.lng.toFixed(4)}° E
        </div>
      </div>

    </div>
  )
}

