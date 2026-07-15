import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Grid, List } from 'lucide-react';
import VehicleList from '@components/vehicles/VehicleList';
import VehicleFilter from '@components/vehicles/VehicleFilter';
import { useVehicles } from '@hooks/useVehicles';

const Vehicles: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { vehicles, loading, filters, setFilters, fetchVehicles, pagination } = useVehicles();
  const [showFilter, setShowFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const city = searchParams.get('location') || '';
    // const startDate = searchParams.get('startDate') || '';
    // const endDate = searchParams.get('endDate') || '';

    // Lỗi cũ: gọi setFilters(...) rồi gọi fetchVehicles() ngay sau đó trong cùng
    // 1 lần render. setState của React không cập nhật đồng bộ nên fetchVehicles()
    // bên trong context vẫn đọc "filters" cũ (chưa có city) -> lọc theo location
    // trên URL không có tác dụng ở lần tải đầu tiên.
    // Cách sửa: tính filters mới và truyền thẳng vào fetchVehicles thay vì dựa vào
    // state đã setFilters trước đó.
    if (city) {
      const newFilters = { ...filters, city };
      setFilters(newFilters);
      fetchVehicles(newFilters);
    } else {
      fetchVehicles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handlePageChange = (page: number) => {
    fetchVehicles(filters, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Danh sách xe</h1>
            <p className="text-gray-600 mt-1">
              {pagination.total} xe đang có sẵn
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex bg-white rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <List size={18} />
              </button>
            </div>
            {/* Filter button */}
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition lg:hidden"
            >
              <SlidersHorizontal size={20} />
              Bộ lọc
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <div className={`${showFilter ? 'block' : 'hidden'} lg:block w-full lg:w-72 flex-shrink-0`}>
            <VehicleFilter />
          </div>

          {/* Vehicle List */}
          <div className="flex-1">
            <VehicleList vehicles={vehicles} loading={loading} />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-4 py-2 rounded-lg ${
                      pagination.page === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vehicles;