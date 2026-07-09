export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  vehicleNumber?: string;
  balance: number; // For demo digital wallet
  createdAt: string;
}

export interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  ratePerHour: number;
  totalSlots: number;
  availableSlots: number;
  amenities: string[];
}

export type SlotType = 'standard' | 'ev' | 'disabled';
export type SlotStatus = 'available' | 'occupied' | 'reserved';

export interface ParkingSlot {
  id: string;
  locationId: string;
  name: string; // e.g., "A-12", "EV-3"
  type: SlotType;
  status: SlotStatus;
  currentBookingId?: string;
}

export type BookingStatus = 'pending_payment' | 'active' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  locationId: string;
  slotId: string;
  vehicleNumber: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: BookingStatus;
  paymentId?: string;
  qrCodeData: string; // QR code contents for scanning
  checkInTime?: string;
  checkOutTime?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

export interface ParkingLog {
  id: string;
  timestamp: string;
  action: 'check_in' | 'check_out' | 'booking_created' | 'payment_received';
  userId: string;
  userName: string;
  locationName: string;
  slotName: string;
}
