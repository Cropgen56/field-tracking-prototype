import React, { useState, useEffect } from 'react';
import { X, Globe, MapIcon, Building2, MapPin, Navigation } from 'lucide-react';
import { locationApi } from '../api/locationApi';

const LocationModal = ({ isOpen, onClose, onLocationSelect }) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  const [loading, setLoading] = useState({
    countries: false,
    states: false,
    cities: false,
    geocoding: false,
  });

  // Fetch countries when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCountries();
    }
  }, [isOpen]);

  const fetchCountries = async () => {
    setLoading(prev => ({ ...prev, countries: true }));
    try {
      const countriesData = await locationApi.getCountries();
      setCountries(countriesData);
    } catch (error) {
      console.error('Failed to load countries:', error);
    } finally {
      setLoading(prev => ({ ...prev, countries: false }));
    }
  };

  const fetchStates = async (country) => {
    setLoading(prev => ({ ...prev, states: true }));
    try {
      const statesData = await locationApi.getStates(country);
      setStates(statesData || []);
    } catch (error) {
      console.error('Failed to load states:', error);
      setStates([]);
    } finally {
      setLoading(prev => ({ ...prev, states: false }));
    }
  };

  const fetchCities = async (country, state) => {
    setLoading(prev => ({ ...prev, cities: true }));
    try {
      const citiesData = await locationApi.getCities(country, state);
      setCities(citiesData || []);
    } catch (error) {
      console.error('Failed to load cities:', error);
      setCities([]);
    } finally {
      setLoading(prev => ({ ...prev, cities: false }));
    }
  };

  const handleCountryChange = async (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    setSelectedState('');
    setSelectedCity('');
    setStates([]);
    setCities([]);

    if (country) {
      await fetchStates(country);
    }
  };

  const handleStateChange = async (e) => {
    const state = e.target.value;
    setSelectedState(state);
    setSelectedCity('');
    setCities([]);

    if (state && selectedCountry) {
      await fetchCities(selectedCountry, state);
    }
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
  };

  const handleApplyLocation = async () => {
    if (!selectedCountry) {
      alert('Please select at least a country');
      return;
    }

    setLoading(prev => ({ ...prev, geocoding: true }));

    let query = selectedCountry;
    if (selectedCity && selectedState) {
      query = `${selectedCity}, ${selectedState}, ${selectedCountry}`;
    } else if (selectedState) {
      query = `${selectedState}, ${selectedCountry}`;
    }

    try {
      if (selectedCity || selectedState) {
        // Geocode for state/city
        const location = await locationApi.geocodeLocation(query);
        if (location) {
          onLocationSelect([location.lat, location.lng]);
        }
      } else {
        // Use country coordinates directly
        const countryData = countries.find(c => c.name === selectedCountry);
        if (countryData) {
          onLocationSelect([countryData.lat, countryData.long]);
        }
      }
      onClose();
    } catch (error) {
      console.error('Failed to apply location:', error);
    } finally {
      setLoading(prev => ({ ...prev, geocoding: false }));
    }
  };

  const handleReset = () => {
    setSelectedCountry('');
    setSelectedState('');
    setSelectedCity('');
    setStates([]);
    setCities([]);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div 
          className="bg-gradient-to-br from-cg-panel via-cg-panel to-cg-panel-2 rounded-2xl shadow-2xl border border-green-500/30 w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-900/40 to-green-800/30 px-6 py-4 border-b border-green-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <MapPin className="text-green-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Set Location</h2>
                <p className="text-sm text-gray-400">Choose your location on the map</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="text-gray-400 hover:text-white" size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto custom-scrollbar">
            {/* Country Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-green-400">
                <Globe size={16} />
                Country
              </label>
              <select
                value={selectedCountry}
                onChange={handleCountryChange}
                disabled={loading.countries}
                className="w-full px-4 py-3 bg-cg-panel-2 text-white rounded-lg border border-green-500/20 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 outline-none transition-all hover:border-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loading.countries ? 'Loading countries...' : 'Select a country'}
                </option>
                {countries.map((country) => (
                  <option key={country.iso2} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* State Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-green-400">
                <MapIcon size={16} />
                State / Province
                <span className="text-xs text-gray-500 font-normal">(Optional)</span>
              </label>
              <select
                value={selectedState}
                onChange={handleStateChange}
                disabled={!selectedCountry || loading.states}
                className="w-full px-4 py-3 bg-cg-panel-2 text-white rounded-lg border border-green-500/20 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 outline-none transition-all hover:border-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loading.states ? 'Loading states...' : 'Select a state'}
                </option>
                {states.map((state) => (
                  <option key={state.state_code} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-green-400">
                <Building2 size={16} />
                City
                <span className="text-xs text-gray-500 font-normal">(Optional)</span>
              </label>
              <select
                value={selectedCity}
                onChange={handleCityChange}
                disabled={!selectedState || loading.cities}
                className="w-full px-4 py-3 bg-cg-panel-2 text-white rounded-lg border border-green-500/20 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 outline-none transition-all hover:border-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loading.cities ? 'Loading cities...' : 'Select a city'}
                </option>
                {cities.map((city, index) => (
                  <option key={`${city}-${index}`} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Location Display */}
            {selectedCountry && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Selected Location:</p>
                <p className="text-white font-semibold flex items-center gap-2">
                  <Navigation size={16} className="text-green-400" />
                  {[selectedCity, selectedState, selectedCountry].filter(Boolean).join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-green-900/20 to-green-800/10 px-6 py-4 border-t border-green-500/20 flex items-center justify-between gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
            >
              Reset
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition-all text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyLocation}
                disabled={!selectedCountry || loading.geocoding}
                className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                {loading.geocoding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <MapPin size={16} />
                    Apply Location
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LocationModal;