import React, { useState, useRef, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Polygon, useMap, GeoJSON } from 'react-leaflet'
import { ChevronDown, Calendar, ChevronLeft, ChevronRight, Sparkles, Plus, Minus } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const mockDates = [
  { date: 'Dec 15, 2024', cloudCover: 12.5 },
  { date: 'Dec 10, 2024', cloudCover: 8.3 },
  { date: 'Dec 5, 2024', cloudCover: 15.2 },
  { date: 'Nov 30, 2024', cloudCover: 5.6 },
  { date: 'Nov 25, 2024', cloudCover: 18.9 },
  { date: 'Nov 20, 2024', cloudCover: 3.2 },
  { date: 'Nov 15, 2024', cloudCover: 22.1 },
  { date: 'Nov 10, 2024', cloudCover: 7.8 },
]

const indexTypes = [
  { value: 'NDVI', label: 'NDVI - Normalized Difference Vegetation Index' },
  { value: 'NDRE', label: 'NDRE - Normalized Difference Red Edge' },
  { value: 'MSAVI', label: 'MSAVI - Modified Soil-Adjusted Vegetation Index' },
  { value: 'NDMI', label: 'NDMI - Normalized Difference Moisture Index' },
  { value: 'EVI', label: 'EVI - Enhanced Vegetation Index' },
  { value: 'SAVI', label: 'SAVI - Soil Adjusted Vegetation Index' },
  { value: 'GNDVI', label: 'GNDVI - Green NDVI' },
]

const locationData = {
  India: {
    coordinates: [20.5937, 78.9629],
    states: {
      Maharashtra: {
        coordinates: [19.7515, 75.7139],
        districts: {
          Mumbai: [19.0760, 72.8777],
          Pune: [18.5204, 73.8567],
          Nashik: [19.9975, 73.7898],
          Nagpur: [21.1458, 79.0882],
        }
      },
      Karnataka: {
        coordinates: [15.3173, 75.7139],
        districts: {
          Bangalore: [12.9716, 77.5946],
          Mysore: [12.2958, 76.6394],
          Hubli: [15.3647, 75.1240],
          Mangalore: [12.9141, 74.8560],
        }
      },
    }
  },
  USA: {
    coordinates: [37.0902, -95.7129],
    states: {
      California: {
        coordinates: [36.7783, -119.4179],
        districts: {
          'Los Angeles': [34.0522, -118.2437],
          'San Francisco': [37.7749, -122.4194],
          'San Diego': [32.7157, -117.1611],
          Sacramento: [38.5816, -121.4944],
        }
      },
    }
  },
}

const generateSamplePolygon = (center) => {
  const [lat, lng] = center
  const offset = 0.002
  return [
    { lat: lat + offset, lng: lng - offset },
    { lat: lat + offset, lng: lng + offset },
    { lat: lat - offset, lng: lng + offset },
    { lat: lat - offset, lng: lng - offset },
    { lat: lat + offset, lng: lng - offset },
  ]
}

const MoveMapToLocation = ({ center, bounds }) => {
  const map = useMap()
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 })
    } else if (center) {
      map.setView(center, 15)
    }
  }, [center, bounds, map])
  return null
}

const LocationSelectors = ({ onLocationChange }) => {
  const [country, setCountry] = useState('')
  const [state, setState] = useState('')
  const [district, setDistrict] = useState('')
  const [showMobileDropdown, setShowMobileDropdown] = useState(false)

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value
    setCountry(selectedCountry)
    setState('')
    setDistrict('')
    if (selectedCountry && locationData[selectedCountry]) {
      onLocationChange(locationData[selectedCountry].coordinates)
    }
  }

  const handleStateChange = (e) => {
    const selectedState = e.target.value
    setState(selectedState)
    setDistrict('')
    if (country && selectedState && locationData[country]?.states[selectedState]) {
      onLocationChange(locationData[country].states[selectedState].coordinates)
    }
  }

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value
    setDistrict(selectedDistrict)
    if (country && state && selectedDistrict && locationData[country]?.states[state]?.districts[selectedDistrict]) {
      onLocationChange(locationData[country].states[state].districts[selectedDistrict])
    }
  }

  const availableStates = country ? Object.keys(locationData[country]?.states || {}) : []
  const availableDistricts = (country && state) ? Object.keys(locationData[country]?.states[state]?.districts || {}) : []

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setShowMobileDropdown(!showMobileDropdown)}
        className="md:hidden bg-white text-gray-700 rounded px-3 py-2 text-xs font-medium"
      >
        Select Location
      </button>

      {/* Desktop/Tablet Selectors */}
      <div className={`
        ${showMobileDropdown ? 'flex' : 'hidden'} md:flex 
        absolute md:relative top-12 md:top-0 left-0 
        flex-col md:flex-row gap-2 
        bg-white md:bg-transparent p-3 md:p-0 
        rounded-lg md:rounded-none shadow-lg md:shadow-none
        z-50 w-full md:w-auto max-w-xs md:max-w-none
      `}>
        <select
          value={country}
          onChange={handleCountryChange}
          className="bg-white text-gray-700 rounded px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm outline-none hover:bg-white/20 transition-colors cursor-pointer"
        >
          <option value="">Country</option>
          {Object.keys(locationData).map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={state}
          onChange={handleStateChange}
          disabled={!country}
          className="bg-white text-gray-700 rounded px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm outline-none hover:bg-white/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Province/State</option>
          {availableStates.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        
        <select
          value={district}
          onChange={handleDistrictChange}
          disabled={!state}
          className="bg-white text-gray-700 rounded px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm outline-none hover:bg-white/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">District</option>
          {availableDistricts.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
    </>
  )
}

const IndexTypeDropdown = ({ selectedIndex, setSelectedIndex }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-cg-panel/90 backdrop-blur-sm text-white rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-2 min-w-[80px] sm:min-w-[100px] hover:bg-cg-panel transition-colors border border-white/10"
      >
        <span className="text-xs sm:text-sm font-medium">{selectedIndex}</span>
        <ChevronDown size={14} className="sm:w-4 sm:h-4" />
      </button>

      {isOpen && (
        <div className="absolute bottom-10 sm:bottom-12 right-0 bg-cg-panel rounded-lg shadow-cg-soft border border-green-900/30 max-h-[250px] sm:max-h-[300px] overflow-y-auto z-50 min-w-[280px] sm:min-w-[350px]">
          {indexTypes.map((index) => (
            <div
              key={index.value}
              onClick={() => {
                setSelectedIndex(index.value)
                setIsOpen(false)
              }}
              className={`px-3 sm:px-4 py-2 sm:py-3 cursor-pointer hover:bg-cg-panel-2 text-white transition-colors
                ${selectedIndex === index.value ? 'bg-cg-panel-2' : ''}`}
            >
              <div className="font-medium text-xs sm:text-sm">{index.value}</div>
              <div className="text-[10px] sm:text-xs text-cg-muted mt-0.5 sm:mt-1">{index.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const DateSelector = () => {
  const [selectedDate, setSelectedDate] = useState(mockDates[0].date)
  const [visibleDates, setVisibleDates] = useState(mockDates.slice(0, 3))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showCalendar, setShowCalendar] = useState(false)

  const datesPerView = window.innerWidth < 640 ? 3 : window.innerWidth < 1024 ? 4 : 6

  useEffect(() => {
    setVisibleDates(mockDates.slice(currentIndex, currentIndex + datesPerView))
  }, [currentIndex, datesPerView])

  const handlePrev = () => {
    if (currentIndex > 0) {
      const newIndex = Math.max(0, currentIndex - datesPerView)
      setCurrentIndex(newIndex)
    }
  }

  const handleNext = () => {
    if (currentIndex + datesPerView < mockDates.length) {
      const newIndex = currentIndex + datesPerView
      setCurrentIndex(newIndex)
    }
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-cg-panel/95 backdrop-blur-sm rounded-b-xl sm:rounded-b-2xl z-[1000]">
      <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 px-2 sm:px-4 py-2 sm:py-3">
        <div className="relative">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Calendar size={16} className="sm:w-5 sm:h-5 text-cg-accent" />
          </button>

          {showCalendar && (
            <div className="absolute bottom-10 sm:bottom-12 left-0 bg-cg-panel rounded-lg p-2 shadow-cg-soft border border-white/10">
              <input
                type="date"
                className="bg-cg-panel-2 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded outline-none text-xs sm:text-sm"
                onChange={(e) => setShowCalendar(false)}
              />
            </div>
          )}
        </div>
        
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`p-1.5 sm:p-2 rounded-lg transition-colors
            ${currentIndex === 0 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-white/10'}`}
        >
          <ChevronLeft size={16} className="sm:w-5 sm:h-5 text-white" />
        </button>
        
        <div className="flex gap-1 sm:gap-2 flex-1 overflow-x-auto scrollbar-hide">
          {visibleDates.map((dateItem) => (
            <div
              key={dateItem.date}
              onClick={() => setSelectedDate(dateItem.date)}
              className={`flex flex-col items-center px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg cursor-pointer transition-all min-w-[80px] sm:min-w-[100px]
                ${selectedDate === dateItem.date 
                  ? 'bg-cg-panel-2 shadow-sm border border-cg-accent/30' 
                  : 'hover:bg-white/5'}`}
            >
              <div className="text-[10px] sm:text-xs font-semibold text-white whitespace-nowrap">
                {dateItem.date}
              </div>
              <div className="text-[10px] sm:text-xs text-cg-muted whitespace-nowrap">
                {dateItem.cloudCover}% Cloud
              </div>
            </div>
          ))}
        </div>
        
        <button
          onClick={handleNext}
          disabled={currentIndex + datesPerView >= mockDates.length}
          className={`p-1.5 sm:p-2 rounded-lg transition-colors
            ${currentIndex + datesPerView >= mockDates.length 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-white/10'}`}
        >
          <ChevronRight size={16} className="sm:w-5 sm:h-5 text-white" />
        </button>
      </div>
    </div>
  )
}

export default function MapSection({ uploadedData }) {
  const [userLocation, setUserLocation] = useState(null)
  const [generatedPolygon, setGeneratedPolygon] = useState([])
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState('NDVI')
  const [shouldFitBounds, setShouldFitBounds] = useState(false)
  const mapRef = useRef(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const location = [latitude, longitude]
          setUserLocation(location)
          setMapCenter(location)
        },
        (error) => console.error("Error getting location:", error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      )
    }
  }, [])

  useEffect(() => {
    if (uploadedData && uploadedData.coordinates && uploadedData.coordinates.length > 0) {
      setGeneratedPolygon(uploadedData.coordinates)
      setShouldFitBounds(true)
      
      const lats = uploadedData.coordinates.map(c => c.lat)
      const lngs = uploadedData.coordinates.map(c => c.lng)
      const center = [
        (Math.min(...lats) + Math.max(...lats)) / 2,
        (Math.min(...lngs) + Math.max(...lngs)) / 2
      ]
      setMapCenter(center)
    }
  }, [uploadedData])

  const handleLocationChange = (coordinates) => {
    setMapCenter(coordinates)
    setSelectedLocation(coordinates)
    setShouldFitBounds(false)
  }

  const handleGenerateField = () => {
    const centerToUse = selectedLocation || userLocation || mapCenter
    setIsGenerating(true)
    
    setTimeout(() => {
      const polygon = generateSamplePolygon(centerToUse)
      setGeneratedPolygon(polygon)
      setShouldFitBounds(true)
      setIsGenerating(false)
    }, 1000)
  }

  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn()
  }

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut()
  }

  const polygonBounds = useMemo(() => {
    if (generatedPolygon.length === 0) return null
    const lats = generatedPolygon.map(c => c.lat)
    const lngs = generatedPolygon.map(c => c.lng)
    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    ]
  }, [generatedPolygon])

  return (
    <div className="bg-cg-panel rounded-xl sm:rounded-2xl shadow-cg-soft h-[400px] sm:h-[450px] md:h-[500px] relative overflow-hidden">
      <MapContainer 
        center={mapCenter} 
        zoom={15}
        className="w-full h-full rounded-xl sm:rounded-2xl" 
        ref={mapRef} 
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          maxZoom={20}
        />
        
        {uploadedData && uploadedData.geojson && (
          <GeoJSON
            key={uploadedData.fileName}
            data={uploadedData.geojson}
            style={{
              fillColor: '#79c24a',
              fillOpacity: 0.3,
              color: '#79c24a',
              weight: 3,
            }}
          />
        )}
        
        {generatedPolygon.length > 0 && !uploadedData?.geojson && (
          <Polygon
            positions={generatedPolygon.map(({ lat, lng }) => [lat, lng])}
            pathOptions={{
              fillColor: '#79c24a',
              fillOpacity: 0.2,
              color: '#79c24a',
              weight: 3,
            }}
          />
        )}
        
        <MoveMapToLocation 
          center={!shouldFitBounds ? mapCenter : null}
          bounds={shouldFitBounds ? polygonBounds : null}
        />
      </MapContainer>

      {/* Zoom Controls */}
      <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="bg-[#0C2214] text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
        >
          <Plus size={16} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-[#0C2214] text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
        >
          <Minus size={16} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
        </button>
      </div>
      
      {/* Top Controls */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex flex-col sm:flex-row justify-between items-start sm:items-start gap-2 z-[1000]">
        <div className="flex items-start gap-2 sm:gap-3">
          <LocationSelectors onLocationChange={handleLocationChange} />
        </div>
        
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={handleGenerateField}
            disabled={isGenerating}
            className={`bg-[#0C2214] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium 
              flex items-center gap-1 sm:gap-2 transition-all hover:bg-cg-accent-2 shadow-md
              text-xs sm:text-sm ${isGenerating ? 'opacity-75 cursor-wait' : ''}`}
          >
            {isGenerating ? (
              <>
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-green-900 border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Generating...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Auto-Generate Sample Field</span>
                <span className="sm:hidden">Generate</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Index Type Selector */}
      <div className="absolute bottom-16 sm:bottom-20 right-2 sm:right-4 z-[1001]">
        <IndexTypeDropdown 
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
        />
      </div>
      
      <DateSelector />
    </div>
  )
}