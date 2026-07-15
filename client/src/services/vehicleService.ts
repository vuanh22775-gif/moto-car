import api from './api';
import type { Vehicle, VehicleFilters } from '@types';

export const getVehicles = async (filters?: VehicleFilters, page = 1, limit = 12) => {
  const params = { ...filters, page, limit };
  const response = await api.get('/vehicles', { params });
  return response.data;
};

export const getVehicleById = async (id: string): Promise<Vehicle> => {
  const response = await api.get(`/vehicles/${id}`);
  return response.data.data;
};

export const getBrands = async (): Promise<string[]> => {
  const response = await api.get('/vehicles/brands');
  return response.data.data;
};

export const getCities = async (): Promise<string[]> => {
  const response = await api.get('/vehicles/cities');
  return response.data.data;
};

export const createVehicle = async (vehicleData: Partial<Vehicle>) => {
  const response = await api.post('/vehicles', vehicleData);
  return response.data.data;
};

export const updateVehicle = async (id: string, vehicleData: Partial<Vehicle>) => {
  const response = await api.put(`/vehicles/${id}`, vehicleData);
  return response.data.data;
};

export const deleteVehicle = async (id: string) => {
  const response = await api.delete(`/vehicles/${id}`);
  return response.data;
};