// @ts-nocheck
'use client'

import { MapPin, ChevronDown, Navigation } from 'lucide-react'
import { useEffect, useState } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

// Bhavan's Campus, Andheri West, Mumbai coordinates
const BHAVANS_CAMPUS = {
  lat: 19.1136,
  lng: 72.8697,
  name: 'Bhavan\'s Campus',
  address: 'Andheri West, Mumbai'
}

interface CampusLocation {
  id: number
  name: string
  type: 'canteen' | 'lab' | 'library' | 'admin' | 'classroom' | 'sports'
  lat: number
  lng: number
  description: string
  timing?: string
}

// Campus areas around Bhavan's Campus
const campusLocations: CampusLocation[] = [
  { id: 1, name: 'Main Canteen', type: 'canteen', lat: 19.1136, lng: 72.8697, description: 'Food and beverage services', timing: '08:00 - 18:00' },
  { id: 2, name: 'Science Lab', type: 'lab', lat: 19.1140, lng: 72.8700, description: 'Advanced research laboratory', timing: '09:00 - 17:00' },
  { id: 3, name: 'Central Library', type: 'library', lat: 19.1132, lng: 72.8695, description: 'Digital and physical resources', timing: '08:00 - 20:00' },
  { id: 4, name: 'Admin Block', type: 'admin', lat: 19.1130, lng: 72.8692, description: 'Administrative offices', timing: '09:00 - 17:30' },
  { id: 5, name: 'Computer Lab', type: 'lab', lat: 19.1138, lng: 72.8705, description: 'Computing facilities', timing: '08:30 - 17:30' },
  { id: 6, name: 'Sports Complex', type: 'sports', lat: 19.1128, lng: 72.8690, description: 'Sports and recreation', timing: '06:00 - 19:00' },
]

// Custom icons for different location types
const getLocationIcon = (type: string) => {
  const iconSize = [40, 50]
  const iconAnchor = [20, 50]

  const svgByType = {
    canteen: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2"><path d="M6 9h12M6 9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9z"/><circle cx="12" cy="14" r="2" fill="#ff6b6b"/></svg>`,
    lab: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#4c6ef5" stroke-width="2"><path d="M9 3h6M9 3l-2 18h10l-2-18M9 3v3h6V3"/><circle cx="12" cy="14" r="1.5" fill="#4c6ef5"/></svg>`,
    library: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#15aabf" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H3M20 8.5V19.5a2.5 2.5 0 0 1-2.5 2.5H12M20 8.5H4M20 8.5V5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v3.5"/></svg>`,
    admin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#9775fa" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    classroom: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fcc419" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18M15 3v18"/></svg>`,
    sports: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#51cf66" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="5" r="1"/><circle cx="5" cy="19" r="1"/><path d="M12 13v8M11 12H3M21 11v2"/></svg>`
  }

  const html = `
    <div style="position: relative; display: flex; align-items: flex-end; justify-content: center;">
      <div style="
        width: 40px;
        height: 50px;
        background: white;
        border: 2px solid #666;
        border-radius: 50% 50% 0 0;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        ${svgByType[type as keyof typeof svgByType] || svgByType.classroom}
      </div>
    </div>
  `

  return L.divIcon({
    html,
    iconSize,
    iconAnchor,
    popupAnchor: [0, -50],
  })
}

export default function MapView() {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [directions, setDirections] = useState<string>('')

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        () => {
          // Fallback to campus center if geolocation fails
          setUserLocation(BHAVANS_CAMPUS)
        }
      )
    }
  }, [])

  const handleShowDirections = (location: CampusLocation) => {
    if (userLocation) {
      // Calculate simple distance-based directions
      const fromLat = userLocation.lat
      const fromLng = userLocation.lng
      const toLat = location.lat
      const toLng = location.lng

      // Google Maps URL for directions
      const mapsUrl = `https://www.google.com/maps/dir/${fromLat},${fromLng}/${toLat},${toLng}`
      window.open(mapsUrl, '_blank')
    }
  }

  const typeColors: Record<string, string> = {
    canteen: 'bg-red-200 text-red-900 border-red-400',
    lab: 'bg-blue-200 text-blue-900 border-blue-400',
    library: 'bg-cyan-200 text-cyan-900 border-cyan-400',
    admin: 'bg-purple-200 text-purple-900 border-purple-400',
    classroom: 'bg-yellow-200 text-yellow-900 border-yellow-400',
    sports: 'bg-green-200 text-green-900 border-green-400',
  }

  return (
    <div className="h-full flex bg-amber-50 relative">
      {/* Left Panel - Campus Locations */}
      <div className="w-96 flex-shrink-0 bg-white border-r-4 border-black p-6 overflow-y-auto flex flex-col">
        <div className="mb-6">
          <div className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Campus Navigation</div>
          <h3 className="text-xl font-black text-black mb-1">{BHAVANS_CAMPUS.name}</h3>
          <p className="text-sm text-gray-600">{BHAVANS_CAMPUS.address}</p>
        </div>

        {/* Campus Locations List */}
        <div className="space-y-3">
          {campusLocations.map((location) => (
            <div
              key={location.id}
              className={`p-4 rounded-none cursor-pointer transition-all border-2 ${
                selectedLocation === location.id
                  ? 'bg-yellow-300 border-black'
                  : 'bg-white border-black hover:shadow-md'
              }`}
              onClick={() => setSelectedLocation(selectedLocation === location.id ? null : location.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-bold uppercase border-2 border-black ${
                    selectedLocation === location.id
                      ? 'bg-black text-white'
                      : typeColors[location.type] || 'bg-gray-200 text-black'
                  }`}>
                    {location.type}
                  </span>
                </div>
                <MapPin size={16} className="text-black" />
              </div>

              <h4 className="font-bold text-sm text-black mb-1">{location.name}</h4>
              <p className="text-xs text-gray-600 mb-2">{location.description}</p>
              {location.timing && <p className="text-xs text-gray-500 font-mono">{location.timing}</p>}

              {selectedLocation === location.id && (
                <div className="border-t-2 border-black pt-3 mt-3">
                  <button
                    onClick={() => handleShowDirections(location)}
                    className="btn-neo primary w-full text-xs"
                  >
                    <Navigation size={14} className="inline mr-2" />
                    Get Directions
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Map */}
      <div className="flex-1 flex flex-col bg-white relative border-l-4 border-black">
        <MapContainer
          center={[BHAVANS_CAMPUS.lat, BHAVANS_CAMPUS.lng]}
          zoom={18}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {/* Campus Center Marker */}
          <Marker
            position={[BHAVANS_CAMPUS.lat, BHAVANS_CAMPUS.lng]}
            icon={L.icon({
              iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDQwIDUwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjZiNmIiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTIwIDFDMTAgMTAgMyAxNyAzIDI2YzAgMTAgMTAgMjAgMTcgMjNjNy0zIDE3LTEzIDE3LTIzYzAtOSA3LTE2IDE3LTI1eiIgZmlsbD0iI2ZmNmI2YiIvPjwvc3ZnPg==',
              iconSize: [40, 50],
              iconAnchor: [20, 50],
              popupAnchor: [0, -50],
            })}
          >
            <Popup>
              <div className="text-sm font-bold text-black">{BHAVANS_CAMPUS.name}</div>
              <div className="text-xs text-gray-600">{BHAVANS_CAMPUS.address}</div>
            </Popup>
          </Marker>

          {/* Campus Location Markers */}
          {campusLocations.map((location) => (
            <Marker
              key={location.id}
              position={[location.lat, location.lng]}
              icon={getLocationIcon(location.type)}
            >
              <Popup>
                <div className="font-bold text-sm text-black">{location.name}</div>
                <div className="text-xs text-gray-600 mt-1">{location.description}</div>
                {location.timing && <div className="text-xs text-gray-500 mt-1">{location.timing}</div>}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
