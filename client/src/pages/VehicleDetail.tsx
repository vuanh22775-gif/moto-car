import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Star, MapPin, Users, Settings, Fuel, Calendar,
  Heart, Share2, Check, Shield,
  ChevronRight, Home, AlertCircle, User
} from 'lucide-react';
import { useVehicles } from '@hooks/useVehicles';
import { useAuth } from '@hooks/useAuth';
import api from '@services/api';
import toast from 'react-hot-toast';

const VehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getVehicleById, loading } = useVehicles();
  const { isAuthenticated } = useAuth();
  const [vehicle, setVehicle] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    startTime: '08:00',
    endTime: '08:00'
  });
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    if (id) loadVehicle(id);
  }, [id]);

  // Kiểm tra xe có trong yêu thích không khi đã đăng nhập
  useEffect(() => {
    if (isAuthenticated && id) checkFavorite();
  }, [id, isAuthenticated]);

  const loadVehicle = async (vehicleId: string) => {
    const data = await getVehicleById(vehicleId);
    if (data) {
      setVehicle(data);
    } else {
      toast.error('Không tìm thấy xe');
      navigate('/vehicles');
    }
  };

  const checkFavorite = async () => {
    try {
      const res = await api.get(`/favorites/check/${id}`);
      setIsFavorite(res.data.isFavorite);
    } catch {
      // Bỏ qua lỗi check
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu xe yêu thích');
      navigate('/login');
      return;
    }
    setFavLoading(true);
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${id}`);
        setIsFavorite(false);
        toast.success('Đã xóa khỏi yêu thích');
      } else {
        await api.post(`/favorites/${id}`);
        setIsFavorite(true);
        toast.success('Đã thêm vào yêu thích ❤️');
      }
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setFavLoading(false);
    }
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đặt xe');
      navigate('/login');
      return;
    }
    navigate('/booking', { state: { vehicle, bookingData } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={64} className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600">Không tìm thấy xe</h2>
          <Link to="/vehicles" className="text-blue-600 hover:underline mt-2 inline-block">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const discountedPrice = vehicle.discount 
    ? vehicle.pricePerDay * (1 - vehicle.discount / 100) 
    : vehicle.pricePerDay;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-blue-600">
            <Home size={16} />
          </Link>
          <ChevronRight size={16} />
          <Link to="/vehicles" className="hover:text-blue-600">Xe</Link>
          <ChevronRight size={16} />
          <span className="text-gray-900 font-medium truncate">{vehicle.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Main Image */}
              <div className="relative h-96 bg-gray-200">
                <img
                  src={vehicle.images[selectedImage] || '/images/default-car.jpg'}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                />
                {vehicle.discount > 0 && (
                  <span className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg text-lg font-bold">
                    -{vehicle.discount}%
                  </span>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  {/* ✅ Nút tim đã được kết nối API */}
                  <button 
                    onClick={handleToggleFavorite}
                    disabled={favLoading}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
                    title={isFavorite ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                  >
                    {favLoading
                      ? <span className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin block" />
                      : <Heart 
                          size={20} 
                          className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}
                        />
                    }
                  </button>
                  <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition">
                    <Share2 size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              {vehicle.images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {vehicle.images.map((img: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                        selectedImage === index ? 'border-blue-600' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt={`${vehicle.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-md p-6 mt-6">
              <h3 className="font-semibold text-lg mb-4">Mô tả</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {vehicle.description}
              </p>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl shadow-md p-6 mt-6">
              <h3 className="font-semibold text-lg mb-4">Tiện ích</h3>
              <div className="flex flex-wrap gap-2">
                {vehicle.features.map((feature: string, index: number) => (
                  <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl shadow-md p-6 mt-6">
              <h3 className="font-semibold text-lg mb-4">Đánh giá</h3>
              {vehicle.reviews && vehicle.reviews.length > 0 ? (
                <div className="space-y-4">
                  {vehicle.reviews.map((review: any) => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{review.user?.fullName || 'Khách hàng'}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">
                              {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Chưa có đánh giá nào</p>
              )}
            </div>
          </div>

          {/* Right Column - Booking */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-2">{vehicle.brand} {vehicle.name}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <Star className="fill-yellow-400 text-yellow-400" size={16} />
                  {vehicle.rating.average.toFixed(1)} ({vehicle.rating.count} đánh giá)
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={16} />
                  {vehicle.location.city}
                </span>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users size={16} className="text-gray-500" />
                  <span>{vehicle.specifications.seats} chỗ</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Settings size={16} className="text-gray-500" />
                  <span>{vehicle.specifications.transmission}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Fuel size={16} className="text-gray-500" />
                  <span>{vehicle.specifications.fuelType}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-gray-500" />
                  <span>{vehicle.year}</span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                {vehicle.discount > 0 ? (
                  <div className="flex items-end gap-3">
                    <span className="text-3xl font-bold text-blue-600">
                      {discountedPrice.toLocaleString()}đ
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      {vehicle.pricePerDay.toLocaleString()}đ
                    </span>
                    <span className="text-sm text-green-600 font-medium">/ngày</span>
                  </div>
                ) : (
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-blue-600">
                      {vehicle.pricePerDay.toLocaleString()}đ
                    </span>
                    <span className="text-sm text-gray-500">/ngày</span>
                  </div>
                )}
              </div>

              {/* Booking Form */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Ngày nhận xe
                  </label>
                  <input
                    type="date"
                    value={bookingData.startDate}
                    onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Ngày trả xe
                  </label>
                  <input
                    type="date"
                    value={bookingData.endDate}
                    onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Giờ nhận
                    </label>
                    <input
                      type="time"
                      value={bookingData.startTime}
                      onChange={(e) => setBookingData({...bookingData, startTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Giờ trả
                    </label>
                    <input
                      type="time"
                      value={bookingData.endTime}
                      onChange={(e) => setBookingData({...bookingData, endTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleBooking}
                className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Đặt xe ngay
              </button>

              <div className="mt-4 space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-green-500" />
                  <span>Đặt cọc chỉ {vehicle.deposit.toLocaleString()}đ</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-green-500" />
                  <span>Hỗ trợ 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-green-500" />
                  <span>Bảo hiểm đầy đủ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;