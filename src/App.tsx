/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ParkingProvider, useParking } from './context/ParkingContext';
import Navbar from './components/Navbar';
import AuthScreen from './components/AuthScreen';
import ParkingMap from './components/ParkingMap';
import SlotGrid from './components/SlotGrid';
import RazorpayModal from './components/RazorpayModal';
import HistoryLog from './components/HistoryLog';
import QRScanner from './components/QRScanner';
import AdminPanel from './components/AdminPanel';
import { ParkingLocation, ParkingSlot } from './types/parking';

function AppContent() {
  const { currentUser, activeTab, bookSlot, confirmBookingPayment, setActiveTab } = useParking();
  
  // Local states for Booking flow
  const [selectedLocation, setSelectedLocation] = useState<ParkingLocation | null>(null);
  const [checkoutBooking, setCheckoutBooking] = useState<{
    slot: ParkingSlot;
    vehicleNumber: string;
    startTime: string;
    endTime: string;
    amount: number;
    id: string;
  } | null>(null);

  // User auth lock
  if (!currentUser) {
    return <AuthScreen />;
  }

  // Active view router
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        if (!selectedLocation) {
          return (
            <ParkingMap 
              onSelectLocation={(loc) => setSelectedLocation(loc)} 
            />
          );
        }
        return (
          <SlotGrid
            location={selectedLocation}
            onBack={() => setSelectedLocation(null)}
            onInitiatePayment={(slot, vehicleNumber, startTime, endTime, amount) => {
              // 1. Create a pending booking inside state
              const newBooking = bookSlot(selectedLocation.id, slot.id, vehicleNumber, startTime, endTime, amount);
              // 2. Open Razorpay modal
              setCheckoutBooking({
                slot,
                vehicleNumber,
                startTime,
                endTime,
                amount,
                id: newBooking.id
              });
            }}
          />
        );

      case 'history':
        return <HistoryLog />;

      case 'scanner':
        return <QRScanner />;

      case 'admin':
        if (currentUser.role !== 'admin') {
          setActiveTab('dashboard');
          return null;
        }
        return <AdminPanel />;

      default:
        return (
          <ParkingMap 
            onSelectLocation={(loc) => setSelectedLocation(loc)} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      
      {/* Dynamic Nav bar */}
      <Navbar />

      {/* Main Container Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          {renderActiveView()}
        </div>
      </main>

      {/* Razorpay Gateway Overlay */}
      {checkoutBooking && (
        <RazorpayModal
          amount={checkoutBooking.amount}
          locationName={selectedLocation?.name || 'Smart Lot'}
          spotName={checkoutBooking.slot.name}
          onClose={() => {
            setCheckoutBooking(null);
          }}
          onSuccess={(paymentId) => {
            // Confirm booking state in context
            confirmBookingPayment(checkoutBooking.id, paymentId);
            setCheckoutBooking(null);
            setSelectedLocation(null); // return to map
            setActiveTab('history');   // show pass ticket immediately
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ParkingProvider>
      <AppContent />
    </ParkingProvider>
  );
}
