import { ParkingLocation, ParkingSlot, Booking, ParkingLog, User } from '../types/parking';

export const INITIAL_LOCATIONS: ParkingLocation[] = [
  {
    id: 'loc-1',
    name: 'Metropolitan Terminal Airport',
    address: 'Terminal 2, Airport Boulevard, Zone A',
    latitude: 12.9716,
    longitude: 77.5946,
    ratePerHour: 120,
    totalSlots: 24,
    availableSlots: 15,
    amenities: ['CCTV', 'EV Charger', 'Covered', 'Wheelchair Access', '24/7 Service'],
  },
  {
    id: 'loc-2',
    name: 'Downtown Commercial Plaza',
    address: '45 MG Road, Near Central Metro Station',
    latitude: 12.9756,
    longitude: 77.5996,
    ratePerHour: 80,
    totalSlots: 18,
    availableSlots: 10,
    amenities: ['CCTV', 'Covered', 'Wheelchair Access'],
  },
  {
    id: 'loc-3',
    name: 'Silicon Valley Tech Hub',
    address: 'Building 4, Electronic City Phase 1',
    latitude: 12.8504,
    longitude: 77.6625,
    ratePerHour: 60,
    totalSlots: 20,
    availableSlots: 14,
    amenities: ['CCTV', 'EV Charger', 'Covered', 'Self Service'],
  },
  {
    id: 'loc-4',
    name: 'Prestige Shopping Mall',
    address: 'Prestige Boulevard, Outer Ring Road',
    latitude: 12.9250,
    longitude: 77.6850,
    ratePerHour: 100,
    totalSlots: 30,
    availableSlots: 21,
    amenities: ['CCTV', 'EV Charger', 'Car Wash', 'Wheelchair Access'],
  },
];

// Generate Slots for each Location
export const generateInitialSlots = (locations: ParkingLocation[]): ParkingSlot[] => {
  const slots: ParkingSlot[] = [];
  
  locations.forEach(loc => {
    // Standard slots (70%)
    const standardCount = Math.floor(loc.totalSlots * 0.7);
    // EV slots (20%)
    const evCount = Math.floor(loc.totalSlots * 0.2);
    // Disabled slots (10%)
    const disabledCount = loc.totalSlots - standardCount - evCount;

    let slotNum = 1;

    for (let i = 0; i < standardCount; i++) {
      // Some pre-occupied to simulate live environment
      const isOccupied = slotNum % 5 === 0;
      const isReserved = slotNum % 7 === 0 && !isOccupied;
      
      slots.push({
        id: `slot-${loc.id}-${slotNum}`,
        locationId: loc.id,
        name: `A-${slotNum}`,
        type: 'standard',
        status: isOccupied ? 'occupied' : isReserved ? 'reserved' : 'available',
      });
      slotNum++;
    }

    for (let i = 0; i < evCount; i++) {
      const isOccupied = slotNum % 4 === 0;
      slots.push({
        id: `slot-${loc.id}-${slotNum}`,
        locationId: loc.id,
        name: `EV-${slotNum - standardCount}`,
        type: 'ev',
        status: isOccupied ? 'occupied' : 'available',
      });
      slotNum++;
    }

    for (let i = 0; i < disabledCount; i++) {
      slots.push({
        id: `slot-${loc.id}-${slotNum}`,
        locationId: loc.id,
        name: `D-${slotNum - standardCount - evCount}`,
        type: 'disabled',
        status: 'available',
      });
      slotNum++;
    }
  });

  return slots;
};

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    email: 'admin@parking.com',
    name: 'John Doe (Admin)',
    role: 'admin',
    vehicleNumber: 'KA-01-ME-1234',
    balance: 5000,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'usr-demo',
    email: 'user@parking.com',
    name: 'Sarah Connor',
    role: 'user',
    vehicleNumber: 'KA-03-PK-9876',
    balance: 750,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-101',
    userId: 'usr-demo',
    locationId: 'loc-1',
    slotId: 'slot-loc-1-5', // occupied standard spot
    vehicleNumber: 'KA-03-PK-9876',
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    endTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),   // 1 hour from now
    totalAmount: 360,
    status: 'active',
    paymentId: 'pay_live_101',
    qrCodeData: 'PARK-BK-101-usr-demo-slot-loc-1-5',
    checkInTime: new Date(Date.now() - 110 * 60 * 1000).toISOString(), // checked in
  },
  {
    id: 'bk-102',
    userId: 'usr-demo',
    locationId: 'loc-2',
    slotId: 'slot-loc-2-12',
    vehicleNumber: 'KA-03-PK-9876',
    startTime: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    totalAmount: 160,
    status: 'completed',
    paymentId: 'pay_hist_102',
    qrCodeData: 'PARK-BK-102-usr-demo-slot-loc-2-12',
    checkInTime: new Date(Date.now() - 25.8 * 60 * 60 * 1000).toISOString(),
    checkOutTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const INITIAL_LOGS: ParkingLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 2.1 * 60 * 60 * 1000).toISOString(),
    action: 'payment_received',
    userId: 'usr-demo',
    userName: 'Sarah Connor',
    locationName: 'Metropolitan Terminal Airport',
    slotName: 'A-5',
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    action: 'check_in',
    userId: 'usr-demo',
    userName: 'Sarah Connor',
    locationName: 'Metropolitan Terminal Airport',
    slotName: 'A-5',
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    action: 'booking_created',
    userId: 'usr-demo',
    userName: 'Sarah Connor',
    locationName: 'Downtown Commercial Plaza',
    slotName: 'A-12',
  },
  {
    id: 'log-4',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    action: 'check_out',
    userId: 'usr-demo',
    userName: 'Sarah Connor',
    locationName: 'Downtown Commercial Plaza',
    slotName: 'A-12',
  },
];
