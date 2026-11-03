import { useState } from 'react'
import { MapPin, Compass, Search } from 'lucide-react'
import LocationPickerModal from './LocationPickerModal'

export default function LocationInputWithMap({
  value = '',
  onChange,
  placeholder = 'e.g. Bangalore, India',
  label = 'Location',
  required = false,
  className = '',
  buttonLabel = 'Map'
}) {
  const [modalOpen, setModalOpen] = useState(false)

  const handleSelect = (selectedLoc) => {
    if (onChange) {
      onChange(selectedLoc)
    }
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          className="input-field pl-9 pr-24 text-sm"
          placeholder={placeholder}
          value={value}
          required={required}
          onChange={(e) => onChange && onChange(e.target.value)}
        />
        
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-50 hover:bg-blue-100 text-[#275df5] border border-blue-200 hover:border-blue-300 font-semibold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-2xs"
          title="Pick or search location on interactive map"
        >
          <Compass className="h-3.5 w-3.5" />
          <span>{buttonLabel}</span>
        </button>
      </div>

      {/* Interactive Map Picker Modal */}
      <LocationPickerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialLocation={value}
        onSelectLocation={handleSelect}
      />
    </div>
  )
}

