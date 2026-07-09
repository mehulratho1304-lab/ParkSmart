import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  ParkingLocation, 
  ParkingSlot, 
  Booking, 
  ParkingLog, 
  BookingStatus, 
  SlotStatus,
  UserRole
} from '../types/parking';
import { 
  INITIAL_LOCATIONS, 
  generateInitialSlots, 
  INITIAL_USERS, 
  INITIAL_BOOKINGS, 
  INITIAL_LOGS 
} from '../utils/mockData';

interface ParkingContextType {
  currentUser: User | null;
  locations: ParkingLocation[];
  slots: ParkingSlot[];
  bookings: Booking[];
  logs: ParkingLog[];
  darkMode: boolean;
  activeTab: string;
  login: (email: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, vehicleNumber: string) => void;
  bookSlot: (
    locationId: string, 
    slotId: string, 
    vehicleNumber: string, 
    startTime: string, 
    endTime: string,
    amount: number
  ) => Booking;
  confirmBookingPayment: (bookingId: string, paymentId: string) => void;
  cancelBooking: (bookingId: string) => void;
  checkInUser: (bookingId: string) => { success: boolean; message: string };
  checkOutUser: (bookingId: string) => { success: boolean; message: string; refund?: number; extraCharge?: number };
  addLocation: (location: Omit<ParkingLocation, 'id' | 'availableSlots'>) => void;
  updateSlotStatus: (slotId: string, status: SlotStatus) => void;
  topUpWallet: (amount: number) => void;
  toggleDarkMode: () => void;
  setActiveTab: (tab: string) => void;
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export const ParkingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence Loading
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('park_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [locations, setLocations] = useState<ParkingLocation[]>(() => {
    const saved = localStorage.getItem('park_locations');
    return saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
  });

  const [slots, setSlots] = useState<ParkingSlot[]>(() => {
    const saved = localStorage.getItem('park_slots');
    return saved ? JSON.parse(saved) : generateInitialSlots(INITIAL_LOCATIONS);
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('park_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [logs, setLogs] = useState<ParkingLog[]>(() => {
    const saved = localStorage.getItem('park_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('park_dark_mode');
    return saved === 'true';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('park_locations', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('park_slots', JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    localStorage.setItem('park_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('park_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('park_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('park_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('park_user');
    }
  }, [currentUser]);

  // Actions
  const login = (email: string): boolean => {
    const trimmed = email.trim().toLowerCase();
    const foundUser = INITIAL_USERS.find(u => u.email.toLowerCase() === trimmed);
    
    if (foundUser) {
      setCurrentUser(foundUser);
      return true;
    }
    
    // Create regular user if not found in pre-populated admins/demo
    const newUser: User = {
      id: `usr-${Date.now()}`,
      email: trimmed,
      name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' '),
      role: 'user',
      balance: 1000, // starting balance
      createdAt: new Date().toISOString()
    };
    
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const register = (name: string, email: string, vehicleNumber: string) => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      email: email.trim().toLowerCase(),
      name,
      role: 'user',
      vehicleNumber: vehicleNumber.toUpperCase(),
      balance: 500, // Register bonus
      createdAt: new Date().toISOString()
    };
    setCurrentUser(newUser);
  };

  const bookSlot = (
    locationId: string, 
    slotId: string, 
    vehicleNumber: string, 
    startTime: string, 
    endTime: string,
    amount: number
  ): Booking => {
    if (!currentUser) throw new Error("Authentication required");

    const newBooking: Booking = {
      id: `bk-${Date.now().toString().slice(-6)}`,
      userId: currentUser.id,
      locationId,
      slotId,
      vehicleNumber: vehicleNumber.toUpperCase(),
      startTime,
      endTime,
      totalAmount: amount,
      status: 'pending_payment',
      qrCodeData: `PARK-BK-${Date.now().toString().slice(-6)}-${currentUser.id}-${slotId}`,
    };

    setBookings(prev => [newBooking, ...prev]);
    return newBooking;
  };

  const confirmBookingPayment = (bookingId: string, paymentId: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        // Update slot to reserved
        setSlots(slotsPrev => slotsPrev.map(s => {
          if (s.id === b.slotId) {
            return { ...s, status: 'reserved' as SlotStatus, currentBookingId: bookingId };
          }
          return s;
        }));

        // Deduct from wallet if user paid through wallet (for balance demonstration) or log standard payment
        if (currentUser) {
          setCurrentUser(u => u ? { ...u, balance: Math.max(0, u.balance - b.totalAmount) } : null);
        }

        // Add a log entry
        const loc = locations.find(l => l.id === b.locationId);
        const slot = slots.find(s => s.id === b.slotId);
        const newLog: ParkingLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'payment_received',
          userId: currentUser?.id || 'guest',
          userName: currentUser?.name || 'Sarah Connor',
          locationName: loc?.name || 'Unknown Location',
          slotName: slot?.name || 'A-1',
        };
        setLogs(logsPrev => [newLog, ...logsPrev]);

        return { ...b, status: 'active' as BookingStatus, paymentId };
      }
      return b;
    }));

    // Re-calculate available slots
    updateLocationAvailableSlots();
  };

  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return { ...b, status: 'cancelled' as BookingStatus };
      }
      return b;
    }));

    // Release slot
    setSlots(slotsPrev => slotsPrev.map(s => {
      if (s.id === booking.slotId) {
        return { ...s, status: 'available' as SlotStatus, currentBookingId: undefined };
      }
      return s;
    }));

    updateLocationAvailableSlots();
  };

  const checkInUser = (bookingId: string): { success: boolean; message: string } => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: "Booking not found." };
    if (booking.status !== 'active') return { success: false, message: "Only paid, active bookings can be checked in." };
    if (booking.checkInTime) return { success: false, message: "Already checked in." };

    const checkInIso = new Date().toISOString();

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return { ...b, checkInTime: checkInIso };
      }
      return b;
    }));

    // Update slot to occupied
    setSlots(slotsPrev => slotsPrev.map(s => {
      if (s.id === booking.slotId) {
        return { ...s, status: 'occupied' as SlotStatus };
      }
      return s;
    }));

    // Log the check-in
    const loc = locations.find(l => l.id === booking.locationId);
    const slot = slots.find(s => s.id === booking.slotId);
    const newLog: ParkingLog = {
      id: `log-${Date.now()}`,
      timestamp: checkInIso,
      action: 'check_in',
      userId: booking.userId,
      userName: currentUser?.name || 'Sarah Connor',
      locationName: loc?.name || 'Unknown Location',
      slotName: slot?.name || 'A-1',
    };
    setLogs(logsPrev => [newLog, ...logsPrev]);

    return { success: true, message: `Check-in successful! Welcome to ${loc?.name}, Spot ${slot?.name}.` };
  };

  const checkOutUser = (bookingId: string): { success: boolean; message: string; refund?: number; extraCharge?: number } => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: "Booking not found." };
    if (!booking.checkInTime) return { success: false, message: "Cannot check out without check-in." };
    if (booking.status === 'completed') return { success: false, message: "Already checked out." };

    const checkOutIso = new Date().toISOString();
    
    // Release slot
    setSlots(slotsPrev => slotsPrev.map(s => {
      if (s.id === booking.slotId) {
        return { ...s, status: 'available' as SlotStatus, currentBookingId: undefined };
      }
      return s;
    }));

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return { ...b, status: 'completed' as BookingStatus, checkOutTime: checkOutIso };
      }
      return b;
    }));

    // Log check out
    const loc = locations.find(l => l.id === booking.locationId);
    const slot = slots.find(s => s.id === booking.slotId);
    const newLog: ParkingLog = {
      id: `log-${Date.now()}`,
      timestamp: checkOutIso,
      action: 'check_out',
      userId: booking.userId,
      userName: currentUser?.name || 'Sarah Connor',
      locationName: loc?.name || 'Unknown Location',
      slotName: slot?.name || 'A-1',
    };
    setLogs(logsPrev => [newLog, ...logsPrev]);
    
    // Recalculate available slots count on location
    setTimeout(() => {
      updateLocationAvailableSlots();
    }, 50);

    return { success: true, message: `Check-out successful! Thank you for using ${loc?.name}.` };
  };

  const addLocation = (locationData: Omit<ParkingLocation, 'id' | 'availableSlots'>) => {
    const newId = `loc-${Date.now()}`;
    const newLocation: ParkingLocation = {
      ...locationData,
      id: newId,
      availableSlots: locationData.totalSlots,
    };

    // Generate slots for new location
    const standardCount = Math.floor(newLocation.totalSlots * 0.7);
    const evCount = Math.floor(newLocation.totalSlots * 0.2);
    const disabledCount = newLocation.totalSlots - standardCount - evCount;

    const newSlots: ParkingSlot[] = [];
    let slotNum = 1;
    for (let i = 0; i < standardCount; i++) {
      newSlots.push({ id: `slot-${newId}-${slotNum}`, locationId: newId, name: `A-${slotNum}`, type: 'standard', status: 'available' });
      slotNum++;
    }
    for (let i = 0; i < evCount; i++) {
      newSlots.push({ id: `slot-${newId}-${slotNum}`, locationId: newId, name: `EV-${slotNum - standardCount}`, type: 'ev', status: 'available' });
      slotNum++;
    }
    for (let i = 0; i < disabledCount; i++) {
      newSlots.push({ id: `slot-${newId}-${slotNum}`, locationId: newId, name: `D-${slotNum - standardCount - evCount}`, type: 'disabled', status: 'available' });
      slotNum++;
    }

    setLocations(prev => [...prev, newLocation]);
    setSlots(prev => [...prev, ...newSlots]);
  };

  const updateSlotStatus = (slotId: string, status: SlotStatus) => {
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, status } : s));
  };

  const topUpWallet = (amount: number) => {
    if (currentUser) {
      setCurrentUser(prev => prev ? { ...prev, balance: prev.balance + amount } : null);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Internal Helper to recalculate slots count per location
  const updateLocationAvailableSlots = () => {
    setLocations(locPrev => locPrev.map(l => {
      const activeSlotsAtLoc = slots.filter(s => s.locationId === l.id && s.status === 'available');
      return {
        ...l,
        availableSlots: activeSlotsAtLoc.length
      };
    }));
  };

  useEffect(() => {
    updateLocationAvailableSlots();
  }, [slots]);

  return (
    <ParkingContext.Provider value={{
      currentUser,
      locations,
      slots,
      bookings,
      logs,
      darkMode,
      activeTab,
      login,
      logout,
      register,
      bookSlot,
      confirmBookingPayment,
      cancelBooking,
      checkInUser,
      checkOutUser,
      addLocation,
      updateSlotStatus,
      topUpWallet,
      toggleDarkMode,
      setActiveTab
    }}>
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = () => {
  const context = useContext(ParkingContext);
  if (context === undefined) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
};
