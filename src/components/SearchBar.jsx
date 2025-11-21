import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Loader2 } from 'lucide-react';
import { locationApi } from '../api/locationApi';

const SearchBar = ({ onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search with debounce
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await locationApi.searchLocations(searchQuery);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const handleResultClick = (result) => {
    onLocationSelect([result.lat, result.lng]);
    setSearchQuery(result.displayName.split(',')[0]);
    setShowResults(false);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showResults || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleResultClick(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-cg-accent/60 pointer-events-none" 
          size={20} 
        />
        
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchQuery.trim().length >= 3 && searchResults.length > 0 && setShowResults(true)}
          placeholder="Search for any location in the world..."
          className="w-full pl-12 pr-12 py-3 sm:py-3.5 text-base bg-cg-panel/80 backdrop-blur-sm text-white placeholder:text-cg-muted rounded-xl border border-cg-accent/30 shadow-lg focus:outline-none focus:ring-2 focus:ring-cg-accent/30 focus:border-cg-accent transition-all hover:bg-cg-panel hover:border-cg-accent/50 hover:shadow-xl"
        />

        {isSearching && (
          <Loader2 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-cg-accent animate-spin" 
            size={20} 
          />
        )}

        {!isSearching && searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-cg-muted hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-cg-panel/98 backdrop-blur-md rounded-xl shadow-2xl border border-cg-accent/30 max-h-[320px] overflow-y-auto z-[9999] custom-scrollbar">
          {searchResults.map((result, index) => (
            <div
              key={index}
              onClick={() => handleResultClick(result)}
              className={`px-4 py-3 cursor-pointer transition-all flex items-start gap-3 border-b border-cg-accent/10 last:border-b-0
                ${index === selectedIndex 
                  ? 'bg-cg-accent/20 border-l-4 border-l-cg-accent' 
                  : 'hover:bg-cg-accent/10 border-l-4 border-l-transparent'
                }`}
            >
              <MapPin 
                className={`flex-shrink-0 mt-0.5 transition-colors ${
                  index === selectedIndex ? 'text-cg-accent' : 'text-cg-accent/60'
                }`} 
                size={18} 
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate transition-colors ${
                  index === selectedIndex ? 'text-white' : 'text-white/90'
                }`}>
                  {result.displayName.split(',')[0]}
                </p>
                <p className="text-xs text-cg-muted truncate mt-0.5">
                  {result.displayName}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && searchQuery.trim().length >= 3 && searchResults.length === 0 && !isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-cg-panel/98 backdrop-blur-md rounded-xl shadow-2xl border border-cg-accent/30 p-4 z-[9999]">
          <p className="text-sm text-cg-muted text-center">
            No locations found for "{searchQuery}"
          </p>
        </div>
      )}

      {/* Hint */}
      {searchQuery.trim().length > 0 && searchQuery.trim().length < 3 && (
        <p className="absolute top-full left-0 mt-1 text-xs text-cg-muted px-1">
          Type at least 3 characters to search
        </p>
      )}
    </div>
  );
};

export default SearchBar;