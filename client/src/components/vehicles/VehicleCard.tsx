import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Users, Settings, Fuel, Eye } from 'lucide-react';
import type { Vehicle } from '@types';

interface VehicleCardProps {
  vehicle: Vehicle;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const { 
    id, 
    name, 
    brand, 
    images, 
    pricePerDay, 
    rating, 
    location, 
    specifications,
    discount,
    viewCount 
  } = vehicle;

  const discountedPrice = discount ? pricePerDay * (1 - discount / 100) : pricePerDay;

  return (
    <Link to={`/vehicles/${id}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-gray-200">
          <img 
            src={images[0] || '/images/default-car.jpg'} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {discount > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-semibold animate-pulse">
              -{discount}%
            </span>
          )}
          <div className="absolute bottom-2 left-2 bg-black/60 text-white px-3 py-1 rounded-lg text-sm">
            {vehicle.type === 'car' ? '🚗 Ô tô' : '🛵 Xe máy'}
          </div>
          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
            <Eye size={14} />
            {viewCount}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-lg group-hover:text-blue-600 transition line-clamp-1">
                {brand} {name}
              </h3>
              <p className="text-sm text-gray-500">{vehicle.model}</p>
            </div>
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
              <Star className="text-yellow-500" size={16} fill="currentColor" />
              <span className="font-semibold">{rating.average.toFixed(1)}</span>
              <span className="text-gray-400 text-sm">({rating.count})</span>
            </div>
          </div>

          {/* Specifications */}
          <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">
            <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
              <Settings size={14} />
              {specifications.transmission}
            </span>
            <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
              <Users size={14} />
              {specifications.seats} chỗ
            </span>
            <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
              <Fuel size={14} />
              {specifications.fuelType}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-start gap-1 text-sm text-gray-500 mb-3">
            <MapPin size={14} className="flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">
              {location.ward}, {location.district}, {location.city}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between border-t pt-3">
            <div>
              {discount > 0 ? (
                <div>
                  <span className="text-xl font-bold text-blue-600">
                    {discountedPrice.toLocaleString()}đ
                  </span>
                  <span className="text-sm text-gray-400 line-through ml-2">
                    {pricePerDay.toLocaleString()}đ
                  </span>
                </div>
              ) : (
                <span className="text-xl font-bold text-blue-600">
                  {pricePerDay.toLocaleString()}đ
                </span>
              )}
              <span className="text-sm text-gray-500">/ngày</span>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
              Đặt ngay
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VehicleCard;