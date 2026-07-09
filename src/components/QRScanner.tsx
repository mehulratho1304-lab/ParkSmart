import React, { useState, useMemo } from 'react';
import { useParking } from '../context/ParkingContext';
import { QrCode, Scan, ShieldCheck, Play, ArrowUpRight, ArrowDownLeft, Disc, CheckCircle } from 'lucide-react';

export default function QRScanner() {
  const { bookings, locations, slots, checkInUser, checkOutUser, currentUser } = useParking();
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [scannedResult, setScannedResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Gate simulation states
  const [scanning, setScanning] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateAction, setGateAction] = useState<'check_in' | 'check_out' | null>(null);

  // Active bookings that are paid and ready for action
  const activeBookings = useMemo(() => {
    return bookings.filter(b => {
      const isMyBooking = b.userId === currentUser?.id;
      // Show if paid & active, or checked-in (to allow checkout)
      return isMyBooking && (b.status === 'active' || b.status === 'completed');
    });
  }, [bookings, currentUser]);

  const currentSelectedBooking = useMemo(() => {
    return bookings.find(b => b.id === selectedBookingId);
  }, [bookings, selectedBookingId]);

  const handleScanSimulation = (action: 'check_in' | 'check_out') => {
    if (!selectedBookingId) {
      alert("Please select a digital ticket to scan first.");
      return;
    }

    setScanning(true);
    setScannedResult(null);
    setGateOpen(false);
    setGateAction(action);

    // Simulate laser scanning latency
    setTimeout(() => {
      setScanning(false);
      
      let result;
      if (action === 'check_in') {
        result = checkInUser(selectedBookingId);
      } else {
        result = checkOutUser(selectedBookingId);
      }

      setScannedResult(result);

      if (result.success) {
        setGateOpen(true);
        // Automatically close gate after 6 seconds
        setTimeout(() => {
          setGateOpen(false);
        }, 6000);
      }
    }, 2200);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Left panel: Scanner Interface */}
      <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6 transition-colors duration-300">
        <div>
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-500" />
            Gate Scanner Terminal
          </h2>
          <p className="text-xs text-zinc-500 font-medium">
            Simulate scanning your phone's digital ticket at the physical entrance or exit bays.
          </p>
        </div>

        {/* Ticket Selector Dropdown */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">
            Select ticket to scan
          </label>
          <select
            id="ticket-scanner-select"
            value={selectedBookingId}
            onChange={(e) => {
              setSelectedBookingId(e.target.value);
              setScannedResult(null);
              setGateOpen(false);
            }}
            className="w-full px-3 py-2.5 rounded-xl text-sm border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-semibold focus:outline-none"
          >
            <option value="">-- Choose your permit pass --</option>
            {activeBookings.map(b => {
              const loc = locations.find(l => l.id === b.locationId);
              const slot = slots.find(s => s.id === b.slotId);
              const subText = b.checkInTime 
                ? (b.checkOutTime ? 'Archived (Checked Out)' : 'Checked-in (Inside Lot)') 
                : 'Awaiting Check-in';
              return (
                <option key={b.id} value={b.id}>
                  {loc?.name} - Spot {slot?.name} ({subText})
                </option>
              );
            })}
          </select>
        </div>

        {/* The Scanning Area viewport */}
        <div className="relative aspect-video max-h-[320px] bg-zinc-950 rounded-2xl border-4 border-zinc-800 overflow-hidden flex flex-col items-center justify-center select-none text-white shadow-inner">
          {/* Abstract background grid */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>

          {scanning ? (
            <>
              {/* Spinning sweep line */}
              <div className="absolute left-0 right-0 h-1 bg-indigo-500 shadow-lg shadow-indigo-400/50 animate-bounce"></div>
              
              <div className="text-center space-y-3 z-10">
                <Scan className="w-12 h-12 text-indigo-400 animate-pulse mx-auto" />
                <p className="text-xs font-mono tracking-widest text-indigo-300 animate-pulse uppercase">
                  INITIALIZING LASER SCAN...
                </p>
              </div>
            </>
          ) : scannedResult ? (
            <div className="text-center space-y-4 p-6 z-10 animate-scale-in">
              <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center ${
                scannedResult.success 
                  ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400' 
                  : 'bg-red-500/20 border-2 border-red-500 text-red-400'
              }`}>
                {scannedResult.success ? <CheckCircle className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-wide">
                  {scannedResult.success ? 'PERMIT VERIFIED' : 'ACCESS DENIED'}
                </h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-[340px] mx-auto leading-relaxed">
                  {scannedResult.message}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3 z-10">
              <QrCode className="w-14 h-14 text-zinc-600 dark:text-zinc-500 mx-auto" />
              <div>
                <p className="text-xs font-semibold text-zinc-400">Position ticket inside reader bay</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">Automated barrier controls are active</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Triggers */}
        {currentSelectedBooking && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleScanSimulation('check_in')}
              disabled={scanning || !!currentSelectedBooking.checkInTime}
              className={`flex items-center justify-center gap-2 py-3 font-bold text-xs rounded-xl border transition ${
                currentSelectedBooking.checkInTime 
                  ? 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent shadow-md shadow-indigo-600/10'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Scan at Entrance Gate
            </button>
            <button
              onClick={() => handleScanSimulation('check_out')}
              disabled={scanning || !currentSelectedBooking.checkInTime || !!currentSelectedBooking.checkOutTime}
              className={`flex items-center justify-center gap-2 py-3 font-bold text-xs rounded-xl border transition ${
                !currentSelectedBooking.checkInTime || currentSelectedBooking.checkOutTime
                  ? 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700 cursor-not-allowed'
                  : 'bg-zinc-950 hover:bg-zinc-900 text-white border-zinc-800 shadow-md'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              Scan at Exit Gate
            </button>
          </div>
        )}
      </div>

      {/* Right panel: Physical Barrier gate visualizer */}
      <div className="lg:col-span-5 bg-zinc-950 text-white rounded-3xl border border-zinc-900 p-6 shadow-xl space-y-6">
        <div>
          <h3 className="font-bold text-base">Gate Barrier System</h3>
          <p className="text-xs text-zinc-500">Live IoT micro-controller feedback</p>
        </div>

        {/* The Gate Visualizer */}
        <div className="aspect-square bg-zinc-900 rounded-2xl border border-zinc-800/80 p-5 flex flex-col justify-between overflow-hidden relative">
          
          {/* Barrier gate HUD Status */}
          <div className="flex justify-between items-center bg-zinc-950 px-3.5 py-1.5 rounded-xl border border-zinc-800 z-10">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Gate Arm State</span>
            <span className={`text-xs font-mono font-bold uppercase ${gateOpen ? 'text-emerald-400 animate-pulse' : 'text-red-500'}`}>
              ● {gateOpen ? 'LOCKED OPEN' : 'SECURELY DOWN'}
            </span>
          </div>

          {/* Physical Swiveling Gate Arm Graphic */}
          <div className="flex-1 flex flex-col justify-center items-center relative py-12">
            
            {/* Sector / Gate Post */}
            <div className="w-8 h-24 bg-zinc-800 rounded border border-zinc-700 relative flex justify-center z-10 shadow-lg shadow-black/40">
              <div className="w-4 h-4 rounded-full bg-indigo-500 absolute top-4 shadow-md border border-indigo-400 animate-pulse"></div>
            </div>

            {/* Swiveling Barrier Pole (CSS Transform) */}
            <div 
              style={{
                transform: gateOpen ? 'rotate(-75deg)' : 'rotate(0deg)',
                transformOrigin: 'left center',
                transition: 'all 1.5s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              className="absolute left-1/2 -translate-x-12 top-2/3 h-4 bg-red-600 rounded-full border border-white z-20 flex"
            >
              {/* Red & White strip patterns */}
              <div className="w-8 h-full bg-white"></div>
              <div className="w-8 h-full bg-red-600"></div>
              <div className="w-8 h-full bg-white"></div>
              <div className="w-8 h-full bg-red-600"></div>
              <div className="w-8 h-full bg-white"></div>
              <div className="w-8 h-full bg-red-600"></div>
            </div>

            {/* Floor indicator line */}
            <div className="w-full h-1 bg-zinc-800 absolute bottom-4"></div>
          </div>

          {/* Terminal Instructions display */}
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-center text-[11px] font-mono leading-relaxed z-10">
            {gateOpen ? (
              <span className="text-emerald-400 font-bold animate-pulse">
                &gt;&gt; ACCESS PERMITTED. PROCEED UNDER BARRIER.
              </span>
            ) : (
              <span className="text-zinc-500 font-semibold">
                &gt;&gt; WAITING FOR CRYPTOGRAPHIC TICKET TRIGGER...
              </span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
