import { useState, useEffect, useRef } from 'react'
import { 
  MapPin, Search, Navigation, X, Check, Loader2, 
  Compass, ExternalLink, RefreshCw, ZoomIn, ZoomOut 
} from 'lucide-react'

// Preset coordinates for instant zero-latency lookup
const QUICK_CITIES = [
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946, label: 'Bangalore, India' },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, label: 'Mumbai, India' },
  { name: 'Delhi', lat: 28.6139, lng: 77.2090, label: 'Delhi, India' },
  { name: 'Noida', lat: 28.5355, lng: 77.3910, label: 'Noida, India' },
  { name: 'Gurugram', lat: 28.4595, lng: 77.0266, label: 'Gurugram, India' },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, label: 'Hyderabad, India' },
  { name: 'Pune', lat: 18.5204, lng: 73.8567, label: 'Pune, India' },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, label: 'Chennai, India' },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, label: 'Kolkata, India' },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, label: 'Ahmedabad, India' },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873, label: 'Jaipur, India' },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462, label: 'Lucknow, India' },
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794, label: 'Chandigarh, India' },
  { name: 'Indore', lat: 22.7196, lng: 75.8577, label: 'Indore, India' },
  { name: 'Kochi', lat: 9.9312, lng: 76.2673, label: 'Kochi, Kerala, India' },
  { name: 'Remote', lat: 20.5937, lng: 78.9629, label: 'Remote, India' },
]

export default function LocationPickerModal({
  isOpen,
  onClose,
  initialLocation = '',
  onSelectLocation
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(initialLocation || '')
  const [coords, setCoords] = useState({ lat: 12.9716, lng: 77.5946 }) // Default Bangalore
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [geocodingError, setGeocodingError] = useState('')

  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const searchTimeoutRef = useRef(null)

  // Initialize selected address and coords when modal opens
  useEffect(() => {
    if (isOpen) {
      const loc = initialLocation || ''
      setSelectedAddress(loc)
      setSearchQuery(loc)
      setSuggestions([])
      setGeocodingError('')

      // Match with predefined city or geocode
      const match = QUICK_CITIES.find(c => loc.toLowerCase().includes(c.name.toLowerCase()))
      if (match) {
        setCoords({ lat: match.lat, lng: match.lng })
      } else if (loc.trim() && loc.toLowerCase() !== 'remote') {
        geocodeAddress(loc, false)
      }
    }
  }, [isOpen, initialLocation])

  // Initialize or re-render Leaflet Map
  useEffect(() => {
    if (!isOpen) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
      return
    }

    const timer = setTimeout(() => {
      initMap()
    }, 150)

    return () => clearTimeout(timer)
  }, [isOpen, coords.lat, coords.lng])

  const initMap = () => {
    if (!mapContainerRef.current) return

    // Ensure Leaflet is loaded
    if (typeof window.L === 'undefined') {
      console.warn('Leaflet not yet ready on window. Retrying...')
      setTimeout(initMap, 200)
      return
    }

    const L = window.L

    // Clean up previous map if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 13,
        zoomControl: false,
      })

      // Add OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      // Add custom zoom control in top right
      L.control.zoom({ position: 'topright' }).addTo(map)

      // Custom pulsing blue marker icon
      const customPin = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="position: relative; width: 34px; height: 34px; display: flex; items-center; justify-content: center;">
            <div style="position: absolute; inset: 0; background-color: rgba(39, 93, 245, 0.35); border-radius: 9999px; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 34px; height: 34px; background: linear-gradient(135deg, #275df5, #1240c4); border: 2.5px solid #ffffff; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.35); color: white;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18],
      })

      const marker = L.marker([coords.lat, coords.lng], {
        icon: customPin,
        draggable: true,
      }).addTo(map)

      if (selectedAddress) {
        marker.bindPopup(`<b>${selectedAddress}</b>`).openPopup()
      }

      // Drag event on marker
      marker.on('dragend', (e) => {
        const newPos = e.target.getLatLng()
        setCoords({ lat: newPos.lat, lng: newPos.lng })
        reverseGeocode(newPos.lat, newPos.lng)
      })

      // Click event on map to reposition marker
      map.on('click', (e) => {
        const { lat, lng } = e.latlng
        marker.setLatLng([lat, lng])
        setCoords({ lat, lng })
        reverseGeocode(lat, lng)
      })

      mapInstanceRef.current = map
      markerRef.current = marker
      setMapLoaded(true)

      // Fix map size rendering after container animations
      setTimeout(() => {
        map.invalidateSize()
      }, 250)
    } catch (err) {
      console.error('Map init error:', err)
    }
  }

  // Update map position smoothly
  const updateMapPosition = (lat, lng, label) => {
    setCoords({ lat, lng })
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1 })
      markerRef.current.setLatLng([lat, lng])
      if (label) {
        markerRef.current.bindPopup(`<b>${label}</b>`).openPopup()
      }
    }
  }

  // Live search debounce
  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchQuery(val)
    setGeocodingError('')

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

    if (!val.trim() || val.length < 2) {
      setSuggestions([])
      return
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchAddressSuggestions(val)
    }, 350)
  }

  // Search Address Suggestions via OpenStreetMap Nominatim
  const searchAddressSuggestions = async (query) => {
    setIsSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      )
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      setSuggestions(data || [])
    } catch (err) {
      console.error('Geocoding search error:', err)
      // Fallback local search on QUICK_CITIES
      const filtered = QUICK_CITIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
      setSuggestions(filtered.map(c => ({
        display_name: c.label,
        lat: c.lat.toString(),
        lon: c.lng.toString(),
      })))
    } finally {
      setIsSearching(false)
    }
  }

  // Geocode address when user hits search button or Enter
  const geocodeAddress = async (query, showAlert = true) => {
    if (!query.trim()) return
    setIsSearching(true)
    setGeocodingError('')
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      if (data && data.length > 0) {
        const item = data[0]
        const lat = parseFloat(item.lat)
        const lng = parseFloat(item.lon)
        const cleanName = formatDisplayName(item)
        setSelectedAddress(cleanName)
        setSearchQuery(cleanName)
        setSuggestions([])
        updateMapPosition(lat, lng, cleanName)
      } else if (showAlert) {
        setGeocodingError('Location not found. Please try another place or click directly on the map.')
      }
    } catch {
      if (showAlert) setGeocodingError('Search failed. Please check internet connection or pick on map.')
    } finally {
      setIsSearching(false)
    }
  }

  // Reverse Geocoding: (lat, lon) -> Human Address
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=17&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      if (data && data.display_name) {
        const clean = formatDisplayName(data)
        setSelectedAddress(clean)
        setSearchQuery(clean)
        if (markerRef.current) {
          markerRef.current.bindPopup(`<b>${clean}</b>`).openPopup()
        }
      }
    } catch (err) {
      console.error('Reverse geocode error:', err)
    }
  }

  // Clean and format display name nicely for job location field
  const formatDisplayName = (item) => {
    if (!item.address) return item.display_name?.split(',').slice(0, 3).join(', ') || item.display_name
    const { suburb, neighbourhood, city, town, village, county, state, country } = item.address
    const parts = [
      neighbourhood || suburb,
      city || town || village || county,
      state,
      country
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : item.display_name
  }

  // Select a suggestion
  const handleSelectSuggestion = (item) => {
    const lat = parseFloat(item.lat)
    const lng = parseFloat(item.lon)
    const cleanName = formatDisplayName(item)
    setSelectedAddress(cleanName)
    setSearchQuery(cleanName)
    setSuggestions([])
    updateMapPosition(lat, lng, cleanName)
  }

  // Quick City Click
  const handleQuickCity = (city) => {
    setSelectedAddress(city.label)
    setSearchQuery(city.label)
    setSuggestions([])
    updateMapPosition(city.lat, city.lng, city.label)
  }

  // Geolocation / GPS
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }
    setIsGettingLocation(true)
    setGeocodingError('')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setIsGettingLocation(false)
        updateMapPosition(lat, lng, 'Your Current Location')
        reverseGeocode(lat, lng)
      },
      (err) => {
        setIsGettingLocation(false)
        console.warn('Geolocation error:', err)
        setGeocodingError('Could not access current location. Please search or pick on map.')
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  // Apply location and close
  const handleConfirm = () => {
    const finalVal = selectedAddress || searchQuery || 'Remote'
    if (onSelectLocation) {
      onSelectLocation(finalVal, { lat: coords.lat, lng: coords.lng })
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#275df5] flex items-center justify-center border border-blue-100">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Select Location on Map</h3>
              <p className="text-xs text-slate-500">Search address or click on the map to pin exact place</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Action Bar */}
        <div className="p-4 space-y-3 bg-white border-b border-slate-100">
          
          <div className="flex gap-2 relative">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl pl-10 pr-9 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#275df5] focus:bg-white transition-all placeholder:text-slate-400"
                placeholder="Search city, area, landmark, or street..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    geocodeAddress(searchQuery)
                  }
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSuggestions([])
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => geocodeAddress(searchQuery)}
              disabled={isSearching}
              className="bg-[#275df5] hover:bg-[#1a4bd8] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-60"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </button>

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isGettingLocation}
              title="Detect my current location"
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-[#275df5] font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-60 shrink-0"
            >
              {isGettingLocation ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#275df5]" />
              ) : (
                <Navigation className="h-4 w-4 text-[#275df5]" />
              )}
              <span className="hidden sm:inline">My Location</span>
            </button>
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute left-4 right-4 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-y-auto mt-1 divide-y divide-slate-100">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-blue-50/80 hover:text-[#275df5] flex items-start gap-2.5 transition-colors"
                >
                  <MapPin className="h-4 w-4 text-[#275df5] shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-relaxed">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Quick Preset City Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 text-xs no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Popular:
            </span>
            {QUICK_CITIES.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => handleQuickCity(c)}
                className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  selectedAddress.toLowerCase().includes(c.name.toLowerCase())
                    ? 'bg-[#275df5] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {geocodingError && (
            <p className="text-xs font-medium text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg">
              {geocodingError}
            </p>
          )}

        </div>

        {/* Interactive Map Area */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[360px] bg-slate-100">
          
          <div ref={mapContainerRef} className="w-full h-full min-h-[300px] sm:min-h-[360px] z-10" />

          {/* Map Floating Tip Badge */}
          <div className="absolute top-3 left-3 z-20 pointer-events-none bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-blue-400" /> Click or drag marker anywhere to adjust location
          </div>

          {/* Lat Lng coordinates pill */}
          <div className="absolute bottom-3 left-3 z-20 pointer-events-none bg-white/90 backdrop-blur-xs text-slate-600 text-[10px] font-mono font-semibold px-2.5 py-1 rounded-lg shadow-sm border border-slate-200/80">
            {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E
          </div>

        </div>

        {/* Footer with Selected Location Preview and Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="w-full sm:w-auto flex-1 flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <Check className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selected Location</p>
              <p className="text-xs font-bold text-slate-800 truncate" title={selectedAddress || 'Click on map or search'}>
                {selectedAddress || 'Click on map or search above'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="bg-[#275df5] hover:bg-[#1a4bd8] text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md w-full sm:w-auto"
            >
              <Check className="h-4 w-4" /> Confirm Location
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}

