import React from 'react';
import VehicleCard from './VehicleCard';
import type { Vehicle } from '@types';
import { Car } from 'lucide-react';

interface VehicleListProps {
  vehicles: Vehicle[];
  loading?: boolean;
}

const VehicleList: React.FC<VehicleListProps> = ({ vehicles, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <Car size={64} className="text-gray-300" />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy xe</h3>
        <p className="text-gray-500">Vui lòng thử lại với bộ lọc khác</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
};

export default VehicleList;