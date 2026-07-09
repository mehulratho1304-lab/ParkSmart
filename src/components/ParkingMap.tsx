import React, { useState, useMemo } from 'react';
import { useParking } from '../context/ParkingContext';
import { ParkingLocation } from '../types/parking';
import { 
  MapPin, 
  Search, 
  Car, 
  Flame, 
  Shield, 
  Tv, 
  Sparkles, 
  Compass, 
  Check, 
  SlidersHorizontal,
  Navigation,
  DollarSign
} from 'lucide-react';

interface ParkingMapProps {
  onSelectLocation: (location: ParkingLocation) => void;
}

export default function ParkingMap({ onSelectLocation }: ParkingMapProps) {
  const { locations, slots } = useParking();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocId, setSelectedLocId] = useState<string>('loc-1');
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [requireEV, setRequireEV] = useState(false);
  const [requireCovered, setRequireCovered] = useState(false);
  const [requireWheelchair, setRequireWheelchair] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(150);

  // Filtered locations
  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            loc.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesEV = !requireEV || loc.amenities.includes('EV Charger');
      const matchesCovered = !requireCovered || loc.amenities.includes('Covered');
      const matchesWheelchair = !requireWheelchair || loc.amenities.includes('Wheelchair Access');
      const matchesPrice = loc.ratePerHour <= maxPrice;

      return matchesSearch && matchesEV && matchesCovered && matchesWheelchair && matchesPrice;
    });
  }, [locations, searchQuery, requireEV, requireCovered, requireWheelchair, maxPrice]);

  const selectedLocation = useMemo(() => {
    return locations.find(l => l.id === selectedLocId) || locations[0];
  }, [locations, selectedLocId]);

  // Compute live slot statistics for display
  const getSlotStats = (locId: string) => {
    const locSlots = slots.filter(s => s.locationId === locId);
    const available = locSlots.filter(s => s.status === 'available').length;
    const evAvailable = locSlots.filter(s => s.type === 'ev' && s.status === 'available').length;
    const total = locSlots.length;
    return { available, evAvailable, total };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-10rem)] min-h-[500px]">
      {/* Left Column: Search and Location List */}
      <div className="lg:col-span-5 flex flex-col bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors duration-300">
        
        {/* Search header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              id="map-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search airport, mall, central plaza..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-zinc-400 hover:text-zinc-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filters Toggle */}
          <div className="flex items-center justify-between">
            <button
              id="toggle-filters-btn"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {showFilters ? 'Hide Filters' : 'Filter Spots'}
              {(requireEV || requireCovered || requireWheelchair || maxPrice < 150) && (
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              )}
            </button>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              Found {filteredLocations.length} locations
            </span>
          </div>

          {/* Expanded filters panel */}
          {showFilters && (
            <div className="pt-2 pb-1 border-t border-dashed border-zinc-100 dark:border-zinc-800 space-y-3 animate-fade-in">
              {/* Max Price range slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-zinc-500">
                  <span>Price / Hour</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Up to ₹{maxPrice}/hr</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="150" 
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Amenity Toggles */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => setRequireEV(!requireEV)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    requireEV 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800'
                  }`}
                >
                  {requireEV && <Check className="w-3 h-3" />}
                  EV Charging
                </button>
                <button
                  onClick={() => setRequireCovered(!requireCovered)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    requireCovered 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800'
                  }`}
                >
                  {requireCovered && <Check className="w-3 h-3" />}
                  Covered Parking
                </button>
                <button
                  onClick={() => setRequireWheelchair(!requireWheelchair)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    requireWheelchair 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800'
                  }`}
                >
                  {requireWheelchair && <Check className="w-3 h-3" />}
                  Wheelchair Access
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Location List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-50 dark:divide-zinc-800/55 scrollbar-thin">
          {filteredLocations.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="text-3xl">🚗</div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No Parking Spaces Found</p>
              <p className="text-xs text-zinc-400">Try loosening your search query or price filters.</p>
            </div>
          ) : (
            filteredLocations.map((loc) => {
              const isSelected = loc.id === selectedLocId;
              const { available, evAvailable, total } = getSlotStats(loc.id);
              const occupancyPercentage = ((total - available) / total) * 100;
              
              return (
                <div
                  key={loc.id}
                  id={`loc-card-${loc.id}`}
                  onClick={() => setSelectedLocId(loc.id)}
                  className={`p-4 text-left cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/15 border-l-4 border-indigo-600' 
                      : 'hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <MapPin className={`w-4 h-4 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}`} />
                        {loc.name}
                      </h4>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium truncate max-w-[240px]">
                        {loc.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        ₹{loc.ratePerHour}/hr
                      </span>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {loc.amenities.slice(0, 3).map((amenity, idx) => (
                      <span 
                        key={idx} 
                        className="text-[9px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                    {loc.amenities.length > 3 && (
                      <span className="text-[9px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
                        +{loc.amenities.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Availability Gauge */}
                  <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        available > 10 
                          ? 'bg-emerald-500' 
                          : available > 3 
                            ? 'bg-amber-500' 
                            : 'bg-red-500'
                      }`}></span>
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {available} of {total} slots left
                      </span>
                    </div>
                    {evAvailable > 0 && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                        ⚡ {evAvailable} EV open
                      </span>
                    )}
                  </div>

                  {/* Mini-progress bar */}
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        occupancyPercentage > 85 
                          ? 'bg-red-500' 
                          : occupancyPercentage > 60 
                            ? 'bg-amber-500' 
                            : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occupancyPercentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Location Summary Drawer (Footer of list) */}
        {selectedLocation && (
          <div className="p-4 bg-zinc-50 dark:bg-zinc-950/70 border-t border-zinc-100 dark:border-zinc-800 mt-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase block">
                  SELECTED BASE
                </span>
                <span className="text-sm font-bold text-zinc-900 dark:text-white truncate block max-w-[220px]">
                  {selectedLocation.name}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
                <span>₹{selectedLocation.ratePerHour}/hr</span>
              </div>
            </div>

            <button
              id="reserve-spot-trigger"
              onClick={() => onSelectLocation(selectedLocation)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/15"
            >
              <Car className="w-4 h-4" />
              Select Parking Spot
            </button>
          </div>
        )}
      </div>

      {/* Right Column: Interactive Vector Map Panel */}
      <div className="lg:col-span-7 relative flex flex-col bg-zinc-950 text-white rounded-3xl border border-zinc-900 shadow-xl overflow-hidden min-h-[350px]">
        {/* HUD Top bar */}
        <div className="absolute top-4 left-4 z-10 bg-zinc-900/90 backdrop-blur border border-zinc-800 rounded-xl px-4 py-2 flex items-center gap-3">
          <Compass className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '8s' }} />
          <div>
            <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-wider">MAP VIEWPORT</span>
            <span className="text-xs font-semibold text-zinc-200">Sector 4 Bangalore South</span>
          </div>
        </div>

        {/* HUD Info Box */}
        {selectedLocation && (
          <div className="absolute bottom-4 right-4 z-10 bg-zinc-900/90 backdrop-blur border border-zinc-800 rounded-xl p-4 max-w-xs space-y-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></div>
              <span className="text-xs font-bold tracking-tight text-white">{selectedLocation.name}</span>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
              Coordinates: {selectedLocation.latitude}° N, {selectedLocation.longitude}° E
            </p>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-2 py-1 rounded">
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>{getSlotStats(selectedLocation.id).available} slots available right now</span>
            </div>
          </div>
        )}

        {/* Visual Map Canvas drawing pins */}
        <div className="flex-1 relative flex items-center justify-center bg-zinc-950 overflow-hidden select-none">
          {/* Abstract Grid background */}
          <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          {/* Schematic Roads / Tech outlines */}
          <svg className="absolute inset-0 w-full h-full text-zinc-800/30" xmlns="http://www.w3.org/2000/svg">
            <line x1="10%" y1="0" x2="10%" y2="100%" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="45%" y1="0" x2="45%" y2="100%" stroke="currentColor" strokeWidth="3" />
            <line x1="80%" y1="0" x2="80%" y2="100%" stroke="currentColor" strokeWidth="1" />
            <line x1="0" y1="35%" x2="100%" y2="35%" stroke="currentColor" strokeWidth="3" />
            <line x1="0" y1="75%" x2="100%" y2="75%" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
            <circle cx="50%" cy="50%" r="180" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="8 8" className="opacity-40 animate-pulse" style={{ animationDuration: '10s' }} />
            <circle cx="50%" cy="50%" r="90" fill="none" stroke="currentColor" strokeWidth="1" className="opacity-20" />
          </svg>

          {/* Render Location Pins */}
          {locations.map((loc, idx) => {
            const isSelected = loc.id === selectedLocId;
            const stats = getSlotStats(loc.id);
            
            // Map coordinates schematically to visually appealing spot
            const positions = [
              { top: '35%', left: '45%' }, // Airport (Hub Center)
              { top: '22%', left: '72%' }, // Plaza
              { top: '65%', left: '28%' }, // Tech Hub
              { top: '55%', left: '78%' }, // Mall
            ];
            
            const pos = positions[idx] || { top: '50%', left: '50%' };

            return (
              <div 
                key={loc.id}
                onClick={() => setSelectedLocId(loc.id)}
                style={{ top: pos.top, left: pos.left }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 group z-20`}
              >
                {/* Ping wave */}
                {isSelected && (
                  <span className="absolute -inset-4 rounded-full bg-indigo-500/20 animate-ping z-0"></span>
                )}
                
                {/* Card hover indicator */}
                <div className={`relative flex items-center gap-2 p-2 rounded-xl border transition-all z-10 ${
                  isSelected 
                    ? 'bg-indigo-600 border-indigo-400 text-white scale-110 shadow-lg shadow-indigo-600/30' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:scale-105'
                }`}>
                  <MapPin className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-indigo-400'}`} />
                  <div className="text-left leading-none">
                    <span className="text-[10px] font-bold block max-w-[80px] truncate">{loc.name.split(' ')[0]}</span>
                    <span className="text-[9px] opacity-80">{stats.available} open</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Compass Rose */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.02] border border-white rounded-full w-96 h-96"></div>
        </div>

        {/* Google Maps Embed Simulation tab */}
        <div className="p-3 bg-zinc-900/80 border-t border-zinc-800 flex justify-between items-center text-xs">
          <span className="text-zinc-500 font-semibold tracking-tight">INTEGRATED MAP PLATFORM</span>
          <div className="flex gap-2">
            <button className="text-indigo-400 font-bold bg-indigo-950/40 border border-indigo-900/60 px-3 py-1 rounded-lg">
              Smart Schematic Map
            </button>
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLocation?.name + ' ' + selectedLocation?.address)}`}
              target="_blank" 
              rel="noreferrer"
              className="text-zinc-400 hover:text-white px-3 py-1 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition"
            >
              Open in Google Maps ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
