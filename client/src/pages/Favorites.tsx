import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, MapPin, Car, Trash2, Calendar } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface FavoriteVehicle {
  _id: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  pricePerDay: number;
  images: string[];
  rating: { average: number; count: number };
  location: { city: string; district: string };
  status: string;
}

const Favorites: React.FC = () => {
  const [vehicles, setVehicles] = useState<FavoriteVehicle[]>([]);
  const [loading, setLoading]   = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await api.get('/favorites');
      setVehicles(res.data.data);
    } catch {
      toast.error('Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (vehicleId: string, vehicleName: string) => {
    setRemoving(vehicleId);
    try {
      await api.delete(`/favorites/${vehicleId}`);
      setVehicles(prev => prev.filter(v => v._id !== vehicleId));
      toast.success(`Đã xóa "${vehicleName}" khỏi yêu thích`);
    } catch {
      toast.error('Không thể xóa khỏi yêu thích');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <Heart size={20} className="text-red-500 fill-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Xe yêu thích</h1>
            <p className="text-sm text-gray-500">{vehicles.length} xe đã lưu</p>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <Heart size={36} className="text-red-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Chưa có xe yêu thích</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              Bấm vào icon ❤️ khi xem chi tiết xe để lưu vào danh sách yêu thích
            </p>
            <Link to="/vehicles"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium">
              Khám phá xe ngay
            </Link>
          </div>
        ) : (
          /* Danh sách xe */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {vehicles.map(v => (
              <div key={v._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group">

                {/* Ảnh */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  {v.images?.[0] ? (
                    <img src={v.images[0]} alt={v.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car size={48} className="text-gray-300" />
                    </div>
                  )}

                  {/* Nút xóa yêu thích */}
                  <button
                    onClick={() => handleRemove(v._id, v.name)}
                    disabled={removing === v._id}
                    className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full shadow flex items-center
                               justify-center hover:bg-red-50 transition"
                    title="Xóa khỏi yêu thích"
                  >
                    {removing === v._id
                      ? <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      : <Heart size={16} className="text-red-500 fill-red-500" />
                    }
                  </button>

                  {/* Badge loại xe */}
                  <span className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
                    {v.type === 'car' ? 'Ô tô' : 'Xe máy'}
                  </span>
                </div>

                {/* Thông tin */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">{v.name}</h3>

                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      {v.rating?.average?.toFixed(1) || '0.0'}
                      <span className="text-gray-300">({v.rating?.count || 0})</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {v.location?.district}, {v.location?.city}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-blue-600 font-bold text-lg">
                        {v.pricePerDay?.toLocaleString('vi-VN')}₫
                      </span>
                      <span className="text-gray-400 text-xs">/ngày</span>
                    </div>
                    <Link
                      to={`/vehicles/${v._id}`}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm
                                 rounded-xl hover:bg-blue-700 transition font-medium"
                    >
                      <Calendar size={14} /> Đặt xe
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;