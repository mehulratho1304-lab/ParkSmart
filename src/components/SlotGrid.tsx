import React, { useState, useMemo } from 'react';
import { useParking } from '../context/ParkingContext';
import { ParkingLocation, ParkingSlot, SlotType } from '../types/parking';
import { 
  ArrowLeft, 
  BatteryCharging, 
  CheckCircle, 
  Flame, 
  Navigation, 
  Sparkles, 
  Users, 
  Accessibility,
  Clock,
  Car,
  ShieldCheck,
  Zap,
  Tag
} from 'lucide-react';

interface SlotGridProps {
  location: ParkingLocation;
  onBack: () => void;
  onInitiatePayment: (slot: ParkingSlot, vehicleNumber: string, startTime: string, endTime: string, amount: number) => void;
}

export default function SlotGrid({ location, onBack, onInitiatePayment }: SlotGridProps) {
  const { slots, currentUser } = useParking();
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  
  // Form fields
  const [vehicleNumber, setVehicleNumber] = useState(currentUser?.vehicleNumber || '');
  
  // Time ranges: Default to booking for next 2 hours
  const [duration, setDuration] = useState<number>(2); // 2 hours
  const [startOffset, setStartOffset] = useState<number>(0); // Starts immediately

  // Filter spots in grid
  const [filterType, setFilterType] = useState<'all' | SlotType>('all');

  // Load slots for this location
  const locationSlots = useMemo(() => {
    return slots.filter(s => s.locationId === location.id);
  }, [slots, location.id]);

  const filteredSlots = useMemo(() => {
    if (filterType === 'all') return locationSlots;
    return locationSlots.filter(s => s.type === filterType);
  }, [locationSlots, filterType]);

  const selectedSlot = useMemo(() => {
    return locationSlots.find(s => s.id === selectedSlotId);
  }, [locationSlots, selectedSlotId]);

  // Calculations
  const calculatedStartTime = useMemo(() => {
    const time = new Date();
    time.setMinutes(time.getMinutes() + startOffset * 30);
    return time;
  }, [startOffset]);

  const calculatedEndTime = useMemo(() => {
    const time = new Date(calculatedStartTime.getTime());
    time.setHours(time.getHours() + duration);
    return time;
  }, [calculatedStartTime, duration]);

  const totalAmount = useMemo(() => {
    let multiplier = 1;
    if (selectedSlot?.type === 'ev') multiplier = 1.25; // Premium EV rate multiplier
    return Math.round(duration * location.ratePerHour * multiplier);
  }, [duration, location.ratePerHour, selectedSlot]);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId || !selectedSlot) {
      alert("Please select a parking spot first.");
      return;
    }
    if (!vehicleNumber.trim()) {
      alert("Please specify your vehicle number.");
      return;
    }
    
    onInitiatePayment(
      selectedSlot,
      vehicleNumber,
      calculatedStartTime.toISOString(),
      calculatedEndTime.toISOString(),
      totalAmount
    );
  };

  // Group slots by type or lanes for real lot aesthetic
  const lanes = useMemo(() => {
    const laneMap: { [key: string]: ParkingSlot[] } = {
      'Lane A (Premium)': [],
      'Lane B (Standard)': [],
      'Lane C (EV & Special)': []
    };

    filteredSlots.forEach((slot, index) => {
      if (slot.type === 'ev' || slot.type === 'disabled') {
        laneMap['Lane C (EV & Special)'].push(slot);
      } else if (index < locationSlots.length * 0.35) {
        laneMap['Lane A (Premium)'].push(slot);
      } else {
        laneMap['Lane B (Standard)'].push(slot);
      }
    });

    return laneMap;
  }, [filteredSlots, locationSlots.length]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            id="back-to-map-btn"
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl transition"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              Slot Allocations
            </h2>
            <p className="text-xs text-zinc-500 font-medium">
              {location.name} • {location.address}
            </p>
          </div>
        </div>

        {/* Pricing / Amenity Badges */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            Base Rate: ₹{location.ratePerHour}/hr
          </div>
          {location.amenities.includes('EV Charger') && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-xs font-semibold border border-emerald-100 dark:border-emerald-900/30">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              EV Supercharge Available
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Graphic Lot grid */}
        <div className="lg:col-span-7 space-y-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          
          {/* Legend and Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterType === 'all' 
                    ? 'bg-zinc-900 dark:bg-zinc-200 text-white dark:text-zinc-900' 
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
                }`}
              >
                All Spots
              </button>
              <button
                onClick={() => setFilterType('ev')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                  filterType === 'ev' 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-zinc-50 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 hover:bg-zinc-100'
                }`}
              >
                <Zap className="w-3 h-3" />
                EV Slots
              </button>
              <button
                onClick={() => setFilterType('disabled')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                  filterType === 'disabled' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-zinc-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 hover:bg-zinc-100'
                }`}
              >
                <Accessibility className="w-3 h-3" />
                Disabled
              </button>
            </div>

            {/* Visual Legend items */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-zinc-500">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"></span>
                <span>Open</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-zinc-300 dark:bg-zinc-600"></span>
                <span>Occupied</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-400/80"></span>
                <span>Reserved</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-indigo-600"></span>
                <span>Selected</span>
              </div>
            </div>
          </div>

          {/* Graphical Map representation of Parking Lanes */}
          <div className="space-y-6">
            {Object.keys(lanes).map((laneName) => {
              const laneSlots = lanes[laneName];
              if (laneSlots.length === 0) return null;

              return (
                <div key={laneName} className="space-y-2">
                  <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1">{laneName}</h5>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3.5 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 relative">
                    {/* Road line marking divider inside lane */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 border-t-2 border-dashed border-zinc-300 dark:border-zinc-800 pointer-events-none -translate-y-1/2 opacity-30"></div>

                    {laneSlots.map((slot) => {
                      const isSelected = slot.id === selectedSlotId;
                      const isOccupied = slot.status === 'occupied';
                      const isReserved = slot.status === 'reserved';
                      const isSelectable = !isOccupied && !isReserved;

                      return (
                        <button
                          key={slot.id}
                          id={`slot-btn-${slot.id}`}
                          disabled={!isSelectable}
                          onClick={() => setSelectedSlotId(isSelected ? null : slot.id)}
                          className={`group aspect-square flex flex-col justify-between p-2 rounded-xl text-left border-2 transition-all relative ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-400 text-white shadow-md scale-105 z-10'
                              : isOccupied
                                ? 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 opacity-60 cursor-not-allowed'
                                : isReserved
                                  ? 'bg-amber-100 dark:bg-amber-950/20 border-amber-300/60 dark:border-amber-950 text-amber-800 dark:text-amber-400 cursor-not-allowed'
                                  : 'bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                          }`}
                        >
                          <div className="flex justify-between items-start w-full">
                            <span className="text-[10px] font-bold tracking-tight">
                              {slot.name}
                            </span>
                            {slot.type === 'ev' && (
                              <Zap className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-200' : 'text-emerald-500 animate-pulse'}`} />
                            )}
                            {slot.type === 'disabled' && (
                              <Accessibility className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-200' : 'text-blue-500'}`} />
                            )}
                          </div>

                          {/* Graphical car icon showing occupied/reserved state */}
                          <div className="flex justify-center items-center py-2">
                            {isOccupied ? (
                              <Car className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                            ) : isReserved ? (
                              <Car className="w-5 h-5 text-amber-500/80" />
                            ) : isSelected ? (
                              <Car className="w-5 h-5 text-indigo-100 animate-bounce" />
                            ) : (
                              <span className="text-[9px] font-bold text-emerald-500">OPEN</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex items-center gap-2.5 text-xs text-zinc-400 font-medium">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>
            <span>EV slots have a +25% charger occupancy tariff. Premium Lane A parking features automated CCTV cameras.</span>
          </div>
        </div>

        {/* Right: Booking Form / Summary Column */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Reservation and form box */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm transition-colors">
            <h3 className="font-bold text-base text-zinc-950 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Configure Stay
            </h3>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              
              {/* Vehicle registration number */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">
                  Vehicle Number Plate
                </label>
                <div className="relative">
                  <Car className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    placeholder="KA-01-AB-1234"
                    maxLength={15}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 transition-all font-semibold uppercase tracking-wider"
                  />
                </div>
              </div>

              {/* Start offset selection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">
                  Parking Commencement
                </label>
                <select
                  value={startOffset}
                  onChange={(e) => setStartOffset(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all font-semibold"
                >
                  <option value={0}>Immediately (Real-Time)</option>
                  <option value={1}>In 30 Minutes</option>
                  <option value={2}>In 1 Hour</option>
                  <option value={4}>In 2 Hours</option>
                </select>
              </div>

              {/* Duration Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-600 dark:text-zinc-400">Reservation Hours</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{duration} Hours</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={24}
                  step={1}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-bold">
                  <span>1 Hr</span>
                  <span>12 Hr</span>
                  <span>24 Hr</span>
                </div>
              </div>

              {/* Schedule summary */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800/60 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    Reservation Start
                  </span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {calculatedStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    Reservation End
                  </span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {calculatedEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Selected Slot Information Box */}
              {selectedSlot ? (
                <div className="p-4 rounded-2xl border-2 border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/10 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase block">
                        SELECTED ALLOCATION
                      </span>
                      <span className="text-lg font-extrabold text-zinc-950 dark:text-white">
                        Spot {selectedSlot.name}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-600 text-white uppercase">
                      {selectedSlot.type}
                    </span>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="pt-2.5 border-t border-indigo-100 dark:border-indigo-950/60 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                    <div className="flex justify-between">
                      <span>Base tariff</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-200">₹{location.ratePerHour} / hr</span>
                    </div>
                    {selectedSlot.type === 'ev' && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                        <span>⚡ EV Charger surcharge</span>
                        <span className="font-semibold">+ 25%</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1 border-t border-dashed border-indigo-100 dark:border-indigo-950/60 font-bold text-zinc-900 dark:text-white text-sm">
                      <span>Total Invoice</span>
                      <span className="text-indigo-600 dark:text-indigo-400">₹{totalAmount}</span>
                    </div>
                  </div>

                  {/* Payment submit trigger */}
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20 mt-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Pay and Reserve Spot
                  </button>
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-center text-xs text-zinc-400 dark:text-zinc-500 font-semibold space-y-1">
                  <div>🎯</div>
                  <p>Choose a vacant parking slot from the visual layout map on the left to lock booking details.</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
