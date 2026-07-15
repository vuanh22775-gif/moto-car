import React, { useState, useEffect } from 'react';
import { useVehicles } from '@hooks/useVehicles';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getBrands, getCities } from '@services/vehicleService';

const VehicleFilter: React.FC = () => {
  // Lỗi cũ: nút "Áp dụng" gọi setFilters(localFilters) - đây chỉ là setState thuần
  // của VehicleContext, KHÔNG gọi API lấy lại danh sách xe. Vì vậy khi người dùng
  // bấm "Áp dụng", state filters được cập nhật nhưng danh sách xe hiển thị không
  // hề thay đổi. Sửa lại bằng cách dùng fetchVehicles(localFilters) - hàm này vừa
  // gọi API vừa tự cập nhật state filters.
  const { filters, fetchVehicles, clearFilters } = useVehicles();
  const [brands, setBrands] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [brandsData, citiesData] = await Promise.all([
          getBrands(),
          getCities()
        ]);
        setBrands(brandsData);
        setCities(citiesData);
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    };
    loadOptions();
  }, []);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value } as any;
    if (!value) {
      delete newFilters[key];
    }
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    fetchVehicles(localFilters);
  };

  const resetFilters = () => {
    setLocalFilters({});
    clearFilters();
  };

  const filterOptions = {
    type: [
      { value: 'car', label: 'Ô tô' },
      { value: 'motorbike', label: 'Xe máy' }
    ],
    seats: [2, 4, 5, 7, 9, 16],
    transmission: ['Số tự động', 'Số sàn', 'CVT'],
    fuelType: ['Điện', 'Xăng', 'Dầu', 'Hybrid'],
    sortBy: [
      { value: 'newest', label: 'Mới nhất' },
      { value: 'price_asc', label: 'Giá thấp đến cao' },
      { value: 'price_desc', label: 'Giá cao đến thấp' },
      { value: 'rating', label: 'Đánh giá cao nhất' }
    ]
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-blue-600" />
          <h3 className="font-semibold">Bộ lọc</h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {Object.keys(filters).filter(k => (filters as any)[k]).length}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Sort by */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Sắp xếp theo
            </label>
            <select
              value={localFilters.sortBy || ''}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Mặc định</option>
              {filterOptions.sortBy.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Loại xe
            </label>
            <div className="flex gap-2">
              {filterOptions.type.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange('type', 
                    localFilters.type === option.value ? '' : option.value
                  )}
                  className={`px-4 py-1.5 rounded-lg text-sm transition ${
                    localFilters.type === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Thành phố
            </label>
            <select
              value={localFilters.city || ''}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Tất cả</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Thương hiệu
            </label>
            <select
              value={localFilters.brand || ''}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Tất cả</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* Seats */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Số chỗ ngồi
            </label>
            <div className="flex flex-wrap gap-1.5">
              {filterOptions.seats.map((seat) => (
                <button
                  key={seat}
                  onClick={() => handleFilterChange('seats', 
                    localFilters.seats === seat ? '' : seat
                  )}
                  className={`px-3 py-1 rounded-lg text-sm transition ${
                    localFilters.seats === seat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {seat} chỗ
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Giá từ
              </label>
              <input
                type="number"
                placeholder="0"
                value={localFilters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Giá đến
              </label>
              <input
                type="number"
                placeholder="10,000,000"
                value={localFilters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={applyFilters}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              Áp dụng
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm flex items-center gap-1"
            >
              <X size={16} />
              Xóa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleFilter;