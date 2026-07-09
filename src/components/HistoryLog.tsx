import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext';
import { Booking } from '../types/parking';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Printer, 
  QrCode, 
  Tag, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Download,
  Info
} from 'lucide-react';

// A Beautiful Procedural SVG-based QR Code Component for authentic ticket displays
export function MiniQRCode({ value }: { value: string }) {
  // We'll generate a grid with QR corner anchors and some organic-looking deterministic bits
  const size = 15;
  const grid: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));

  // Determine seed from string
  let seed = 0;
  for (let i = 0; i < value.length; i++) {
    seed += value.charCodeAt(i);
  }

  // Draw Corner Anchors (7x7 hollow squares)
  const drawAnchor = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        const border = (i === 0 || i === 6 || j === 0 || j === 6);
        const center = (i >= 2 && i <= 4 && j >= 2 && j <= 4);
        if (border || center) {
          grid[r + i][c + j] = true;
        }
      }
    }
  };

  // Anchors at: top-left (0,0), top-right (0, size-7), bottom-left (size-7, 0)
  drawAnchor(0, 0);
  drawAnchor(0, size - 7);
  drawAnchor(size - 7, 0);

  // Fill in remaining with hash-driven blocks
  let currentSeed = seed;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip anchors
      const isTLAnchor = (r < 7 && c < 7);
      const isTRAnchor = (r < 7 && c >= size - 7);
      const isBLAnchor = (r >= size - 7 && c < 7);
      
      if (!isTLAnchor && !isTRAnchor && !isBLAnchor) {
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        grid[r][c] = (currentSeed % 2) === 0;
      }
    }
  }

  return (
    <div className="bg-white p-3 rounded-2xl inline-block border border-zinc-100 shadow-inner">
      <svg width="120" height="120" viewBox={`0 0 ${size} ${size}`} className="text-zinc-950">
        {grid.map((row, r) => 
          row.map((active, c) => (
            active ? (
              <rect 
                key={`${r}-${c}`} 
                x={c} 
                y={r} 
                width="1" 
                height="1" 
                fill="currentColor" 
                shapeRendering="crispEdges"
              />
            ) : null
          ))
        )}
      </svg>
    </div>
  );
}

export default function HistoryLog() {
  const { 
    bookings, 
    locations, 
    slots, 
    cancelBooking, 
    checkInUser, 
    checkOutUser,
    currentUser 
  } = useParking();

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Filter bookings for current logged-in user
  const userBookings = bookings.filter(b => b.userId === currentUser?.id);

  const activeAndPending = userBookings.filter(b => b.status === 'active' || b.status === 'pending_payment');
  const pastBookings = userBookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  const selectedBooking = bookings.find(b => b.id === selectedBookingId);
  const selectedLoc = selectedBooking ? locations.find(l => l.id === selectedBooking.locationId) : null;
  const selectedSlot = selectedBooking ? slots.find(s => s.id === selectedBooking.slotId) : null;

  const handlePrint = (bookingId: string) => {
    alert(`Print receipt triggered for invoice references on: ${bookingId}`);
  };

  const triggerCheckIn = (bookingId: string) => {
    const res = checkInUser(bookingId);
    alert(res.message);
  };

  const triggerCheckOut = (bookingId: string) => {
    const res = checkOutUser(bookingId);
    alert(res.message);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Paid & Active
          </span>
        );
      case 'pending_payment':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/20 flex items-center gap-1 w-fit">
            <AlertCircle className="w-3.5 h-3.5" />
            Awaiting Payment
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center gap-1 w-fit">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center gap-1 w-fit">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Left side: Bookings directory */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Active Passes Section */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm transition-colors">
          <h3 className="font-extrabold text-base text-zinc-950 dark:text-white mb-4 flex items-center gap-2">
            <QrCode className="w-4.5 h-4.5 text-indigo-500" />
            Active Passes & Permits
          </h3>

          {activeAndPending.length === 0 ? (
            <div className="py-8 text-center text-zinc-400 dark:text-zinc-500 text-sm font-semibold space-y-1">
              <div>🎫</div>
              <p>No active parking permits found.</p>
              <p className="text-xs font-normal">Your digital check-in passes will populate here once booked.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAndPending.map((b) => {
                const loc = locations.find(l => l.id === b.locationId);
                const slot = slots.find(s => s.id === b.slotId);
                const isSelected = selectedBookingId === b.id;

                return (
                  <div
                    key={b.id}
                    id={`active-booking-${b.id}`}
                    onClick={() => setSelectedBookingId(b.id)}
                    className={`p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                      isSelected 
                        ? 'bg-indigo-50/40 dark:bg-indigo-950/10 border-indigo-500' 
                        : 'bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/20 border-transparent hover:border-zinc-200 dark:hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                            {loc?.name}
                          </h4>
                          <span className="text-xs font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-lg">
                            Spot {slot?.name}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5" />
                          {loc?.address}
                        </p>
                      </div>
                      
                      {getStatusBadge(b.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4 pt-3.5 border-t border-zinc-200/50 dark:border-zinc-800/80 text-xs">
                      <div>
                        <span className="text-zinc-400 font-semibold block">Vehicle plate</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 uppercase">{b.vehicleNumber}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 font-semibold block">Estimated hours</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">
                          {new Date(b.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(b.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>

                    {/* Check In / Out Simulator actions directly inside the card */}
                    {b.status === 'active' && (
                      <div className="flex gap-2.5 mt-4 pt-3 border-t border-dashed border-zinc-200/60 dark:border-zinc-800/60">
                        {!b.checkInTime ? (
                          <button
                            id={`checkin-btn-${b.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerCheckIn(b.id);
                            }}
                            className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition"
                          >
                            Simulate Gate Entrance (Check In)
                          </button>
                        ) : !b.checkOutTime ? (
                          <button
                            id={`checkout-btn-${b.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerCheckOut(b.id);
                            }}
                            className="flex-1 py-1.5 bg-zinc-900 dark:bg-zinc-200 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 font-bold text-xs rounded-xl transition"
                          >
                            Simulate Gate Exit (Check Out)
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-500 font-bold">Passed exit toll gates. Receipt available below.</span>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelBooking(b.id);
                          }}
                          disabled={!!b.checkInTime}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                            b.checkInTime
                              ? 'text-zinc-400 border-zinc-200 dark:border-zinc-800 bg-transparent cursor-not-allowed'
                              : 'text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20'
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* History / Receipts Log */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm transition-colors">
          <h3 className="font-extrabold text-base text-zinc-950 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-4.5 h-4.5 text-zinc-400" />
            Toll History & Invoices
          </h3>

          {pastBookings.length === 0 ? (
            <div className="py-6 text-center text-zinc-400 text-xs font-semibold">
              <p>No past transactions registered in database yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {pastBookings.map((b) => {
                const loc = locations.find(l => l.id === b.locationId);
                const isCompleted = b.status === 'completed';

                return (
                  <div key={b.id} className="py-3.5 flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{loc?.name}</span>
                        <span className="text-[10px] text-zinc-400">#{b.id}</span>
                      </div>
                      <p className="text-zinc-400 font-medium">
                        {new Date(b.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {b.vehicleNumber}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="font-bold text-zinc-900 dark:text-white block">₹{b.totalAmount}</span>
                        <span className={`text-[10px] font-bold ${isCompleted ? 'text-emerald-500' : 'text-red-500'}`}>
                          {b.status === 'completed' ? 'Success' : 'Refunded'}
                        </span>
                      </div>
                      <button
                        onClick={() => handlePrint(b.id)}
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-800"
                        title="Download Invoice"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Digital Boarding Ticket display */}
      <div className="lg:col-span-5 bg-zinc-950 text-white rounded-3xl border border-zinc-900 shadow-xl p-6 space-y-6">
        <div>
          <h3 className="font-bold text-base text-white">Digital Parking Permit</h3>
          <p className="text-xs text-zinc-500">Hold up at any automated camera-sensor check-in lane</p>
        </div>

        {selectedBooking ? (
          <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-hidden p-5 space-y-5 animate-scale-in">
            {/* Location banner */}
            <div className="border-b border-zinc-800 pb-4 space-y-1">
              <span className="text-[9px] font-extrabold text-indigo-400 tracking-wider uppercase block">AUTHORIZED PERMIT</span>
              <h4 className="font-black text-white text-sm">{selectedLoc?.name}</h4>
              <p className="text-[11px] text-zinc-400 truncate">{selectedLoc?.address}</p>
            </div>

            {/* Visual Gate / Scanner instruction QR */}
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <MiniQRCode value={selectedBooking.qrCodeData} />
              <div className="text-center">
                <span className="font-mono text-xs font-semibold text-zinc-300 block tracking-widest uppercase">
                  {selectedBooking.id}
                </span>
                <span className="text-[10px] text-zinc-500 block">Encrypted RFID Code</span>
              </div>
            </div>

            {/* Metadata Fields */}
            <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-4 text-xs">
              <div>
                <span className="text-zinc-500 font-semibold block">Vehicle Plate</span>
                <span className="font-bold uppercase text-zinc-200">{selectedBooking.vehicleNumber}</span>
              </div>
              <div>
                <span className="text-zinc-500 font-semibold block">Spot Allocation</span>
                <span className="font-bold text-indigo-400">Spot {selectedSlot?.name}</span>
              </div>
              <div>
                <span className="text-zinc-500 font-semibold block">In-Check</span>
                <span className="font-bold text-zinc-200">
                  {selectedBooking.checkInTime 
                    ? new Date(selectedBooking.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                    : 'Awaiting Entry'}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 font-semibold block">Out-Check</span>
                <span className="font-bold text-zinc-200">
                  {selectedBooking.checkOutTime 
                    ? new Date(selectedBooking.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                    : 'Awaiting Exit'}
                </span>
              </div>
            </div>

            {/* Print/Download Button */}
            <button
              onClick={() => handlePrint(selectedBooking.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Download Receipt PDF
            </button>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800/50 rounded-2xl py-16 text-center text-zinc-500 text-xs px-6 space-y-3">
            <Info className="w-8 h-8 text-indigo-500 mx-auto" />
            <p className="font-bold text-zinc-300">No ticket is currently inspected.</p>
            <p className="text-zinc-500 font-normal">Select an active card from your list on the left to review its live QR check-in permit and receipts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
