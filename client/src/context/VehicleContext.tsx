import React, { createContext, useState, useContext, ReactNode } from 'react';
import { getVehicles, getVehicleById } from '@services/vehicleService';
import type { Vehicle, VehicleFilters, VehicleContextType } from '@types';

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

interface VehicleProviderProps {
  children: ReactNode;
}

export const VehicleProvider: React.FC<VehicleProviderProps> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<VehicleFilters>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  const fetchVehicles = async (newFilters?: VehicleFilters, page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentFilters = newFilters || filters;
      const response = await getVehicles(currentFilters, page, pagination.limit);
      
      setVehicles(response.data);
      setPagination(response.pagination);
      
      if (newFilters) {
        setFilters(newFilters);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải danh sách xe');
    } finally {
      setLoading(false);
    }
  };

  const getVehicle = async (id: string) => {
    try {
      setLoading(true);
      const vehicle = await getVehicleById(id);
      return vehicle;
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải thông tin xe');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({});
    fetchVehicles({});
  };

  const value: VehicleContextType = {
    vehicles,
    loading,
    error,
    filters,
    pagination,
    fetchVehicles,
    getVehicleById: getVehicle,
    setFilters,
    clearFilters
  };

  return (
    <VehicleContext.Provider value={value}>
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicles = (): VehicleContextType => {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }
  return context;
};