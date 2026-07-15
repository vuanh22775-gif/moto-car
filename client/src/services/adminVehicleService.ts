import api from './api';
import type { Vehicle } from '@types';

export interface VehicleFormData {
  name: string;
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
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
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
  };
}

export interface AdminVehicleParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  source?: string;
}

// Lấy toàn bộ xe (kể cả chưa approved) — dành cho admin
export const adminGetVehicles = async (params: AdminVehicleParams = {}) => {
  const res = await api.get('/admin/vehicles', { params });
  return res.data; // { success, data, pagination }
};

export const adminGetVehicleById = async (id: string): Promise<Vehicle> => {
  const res = await api.get(`/vehicles/${id}`);
  return res.data.data;
};

export const adminCreateVehicle = async (data: VehicleFormData): Promise<Vehicle> => {
  const res = await api.post('/vehicles', data);
  return res.data.data;
};

export const adminUpdateVehicle = async (id: string, data: Partial<VehicleFormData>): Promise<Vehicle> => {
  const res = await api.put(`/vehicles/${id}`, data);
  return res.data.data;
};

export const adminDeleteVehicle = async (id: string): Promise<void> => {
  await api.delete(`/vehicles/${id}`);
};