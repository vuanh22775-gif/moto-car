// ============ USER TYPES ============
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'user' | 'admin';
  avatar?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'Nam' | 'Nữ' | 'Khác';
  isActive: boolean;
  drivingLicense?: {
    number: string;
    verified: boolean;
    image?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

// ============ VEHICLE TYPES ============
export interface Vehicle {
  id: string;
  name: string;
  slug: string;
  type: 'car' | 'motorbike';
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  pricePerDay: number;
  pricePerHour: number;
  deposit: number;
  description: string;
  images: string[];
  features: string[];
  specifications: {
    seats: number;
    transmission: string;
    fuelType: string;
    engine: string;
    color: string;
    mileage: number;
    weight: number;
    consumption: string;
  };
  location: {
    address: string;
    city: string;
    district: string;
    ward: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  availability: {
    isAvailable: boolean;
    availableFrom?: Date;
    availableTo?: Date;
  };
  rating: {
    average: number;
    count: number;
  };
  discount: number;
  viewCount: number;
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  createdBy: string | User;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleFilters {
  type?: string;
  brand?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  seats?: number;
  transmission?: string;
  fuelType?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
  search?: string;
  page?: number;
  limit?: number;
}

// ============ BOOKING TYPES ============
export interface Booking {
  id: string;
  vehicle: string | Vehicle;
  user: string | User;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  totalDays: number;
  totalPrice: number;
  deposit: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'rejected';
  paymentMethod: 'cash' | 'credit_card' | 'bank_transfer' | 'momo' | 'zalopay' | 'vnpay';
  paymentStatus: 'pending' | 'deposit_paid' | 'paid' | 'refunded';
  paymentId?: string;
  pickupLocation: string;
  returnLocation: string;
  notes?: string;
  driverInfo?: {
    name: string;
    phone: string;
    licenseNumber: string;
  };
  cancellationReason?: string;
  cancelledAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingData {
  vehicleId: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  totalDays: number;
  totalPrice: number;
  deposit: number;
  paymentMethod: string;
  pickupLocation: string;
  returnLocation: string;
  notes?: string;
  driverInfo?: {
    name: string;
    phone: string;
    licenseNumber: string;
  };
}

// ============ REVIEW TYPES ============
export interface Review {
  id: string;
  vehicle: string | Vehicle;
  user: string | User;
  booking: string | Booking;
  rating: number;
  comment: string;
  images?: string[];
  status: 'pending' | 'approved' | 'rejected';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============ CHAT TYPES ============
export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  message: string;
  timestamp: Date;
  user?: User;
}

// ============ API RESPONSE TYPES ============
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============ CONTEXT TYPES ============
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<any>;
  register: (userData: RegisterData) => Promise<any>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface VehicleContextType {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  filters: VehicleFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  fetchVehicles: (filters?: VehicleFilters, page?: number) => Promise<void>;
  getVehicleById: (id: string) => Promise<Vehicle | null>;
  setFilters: (filters: VehicleFilters) => void;
  clearFilters: () => void;
}