import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { 
  Calendar, Clock, MapPin, Car, 
  CheckCircle, XCircle, Clock as ClockIcon,
  AlertCircle, Eye
} from 'lucide-react';
import api from '@services/api';
import toast from 'react-hot-toast';

const BookingHistory: React.FC = () => {
  useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings');
      setBookings(response.data.data || []);
    } catch (error) {
      toast.error('Lỗi tải lịch sử đặt xe');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      active: { label: 'Đang thuê', color: 'bg-green-100 text-green-800', icon: Car },
      completed: { label: 'Hoàn thành', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
      cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: XCircle },
      rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const info = statusMap[status] || statusMap.pending;
    const Icon = info.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${info.color}`}>
        <Icon size={12} />
        {info.label}
      </span>
    );
  };

  const getPaymentStatus = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: 'Chưa thanh toán', color: 'text-yellow-600' },
      deposit_paid: { label: 'Đã đặt cọc', color: 'text-blue-600' },
      paid: { label: 'Đã thanh toán', color: 'text-green-600' },
      refunded: { label: 'Đã hoàn tiền', color: 'text-gray-600' }
    };

    const info = statusMap[status] || statusMap.pending;
    return <span className={`text-sm font-medium ${info.color}`}>{info.label}</span>;
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Lịch sử đặt xe</h1>
        <p className="text-gray-600 mb-6">Quản lý các đơn đặt xe của bạn</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Tất cả
          </button>
          {['pending', 'confirmed', 'active', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === status 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status === 'pending' && 'Chờ xác nhận'}
              {status === 'confirmed' && 'Đã xác nhận'}
              {status === 'active' && 'Đang thuê'}
              {status === 'completed' && 'Hoàn thành'}
              {status === 'cancelled' && 'Đã hủy'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="spinner h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Chưa có đơn đặt xe</h3>
            <p className="text-gray-500 mb-4">Bạn chưa có đơn đặt xe nào</p>
            <Link to="/vehicles" className="text-blue-600 hover:underline font-medium">
              Tìm xe ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const vehicle = booking.vehicle || {};
              return (
                <div key={booking.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                        <img 
                          src={vehicle.images?.[0] || '/images/default-car.jpg'} 
                          alt={vehicle.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold text-lg">
                            {vehicle.brand} {vehicle.name}
                          </h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        <p className="text-sm text-gray-500">
                          {vehicle.specifications?.seats} chỗ • {vehicle.specifications?.transmission} • {vehicle.specifications?.fuelType}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(booking.startDate).toLocaleDateString('vi-VN')}
                            {' → '}
                            {new Date(booking.endDate).toLocaleDateString('vi-VN')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {booking.startTime} - {booking.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {booking.pickupLocation}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">
                        {booking.totalPrice.toLocaleString()}đ
                      </p>
                      <p className="text-sm text-gray-500">{booking.totalDays} ngày</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Thanh toán: {getPaymentStatus(booking.paymentStatus)}
                      </p>
                      <Link
                        to={`/booking/${booking.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                      >
                        <Eye size={14} />
                        Chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;