import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { 
  Calendar, MapPin,
  CreditCard, Shield, Check,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@services/api';

const Booking: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    startTime: '08:00',
    endTime: '08:00',
    pickupLocation: '',
    returnLocation: '',
    notes: '',
    paymentMethod: 'cash'
  });

  const vehicle = location.state?.vehicle;
  const initialBookingData = location.state?.bookingData;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!vehicle) {
      navigate('/vehicles');
      return;
    }

    if (initialBookingData) {
      setBookingData(prev => ({
        ...prev,
        startDate: initialBookingData.startDate || '',
        endDate: initialBookingData.endDate || '',
        startTime: initialBookingData.startTime || '08:00',
        endTime: initialBookingData.endTime || '08:00'
      }));
    }
  }, [vehicle, isAuthenticated]);

  // Trước đây phép tính số ngày thuê (end - start) được viết lặp lại 3 lần
  // (trong calculateTotal, trong handleSubmit, và trong phần Tóm tắt) - dễ bị
  // lệch nhau nếu chỉ sửa 1 chỗ. Gom về 1 nơi duy nhất bằng useMemo, chỉ tính
  // lại khi ngày/giờ hoặc xe thay đổi.
  const { totalDays, isDateRangeValid } = useMemo(() => {
    if (!bookingData.startDate || !bookingData.endDate) {
      return { totalDays: 0, isDateRangeValid: false };
    }
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const valid = end.getTime() >= start.getTime();
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    return { totalDays: days, isDateRangeValid: valid };
  }, [bookingData.startDate, bookingData.endDate]);

  const totalAmount = useMemo(
    () => totalDays * (vehicle?.pricePerDay || 0),
    [totalDays, vehicle?.pricePerDay]
  );

  const deposit = vehicle?.deposit || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;

    if (!isDateRangeValid) {
      toast.error('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    try {
      setLoading(true);
      await api.post('/bookings', {
        vehicleId: vehicle.id,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        totalDays,
        totalPrice: totalAmount,
        deposit: deposit,
        paymentMethod: bookingData.paymentMethod,
        pickupLocation: bookingData.pickupLocation,
        returnLocation: bookingData.returnLocation,
        notes: bookingData.notes
      });

      toast.success('Đặt xe thành công!');
      navigate('/booking-history');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đặt xe thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition"
        >
          <ArrowLeft size={20} />
          Quay lại
        </button>

        <h1 className="text-3xl font-bold mb-2">Đặt xe</h1>
        <p className="text-gray-600 mb-8">Hoàn tất thông tin để đặt xe</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
              {/* Vehicle Info */}
              {vehicle && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={vehicle.images?.[0] || '/images/default-car.jpg'} 
                        alt={vehicle.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{vehicle.brand} {vehicle.name}</h3>
                      <p className="text-sm text-gray-600">
                        {vehicle.specifications.seats} chỗ • {vehicle.specifications.transmission} • {vehicle.specifications.fuelType}
                      </p>
                      <p className="text-blue-600 font-semibold">
                        {vehicle.pricePerDay.toLocaleString()}đ/ngày
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Date & Time */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-blue-600" />
                  Thời gian thuê
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={bookingData.startDate}
                      onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Giờ bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={bookingData.startTime}
                      onChange={(e) => setBookingData({...bookingData, startTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Ngày kết thúc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={bookingData.endDate}
                      onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Giờ kết thúc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={bookingData.endTime}
                      onChange={(e) => setBookingData({...bookingData, endTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-blue-600" />
                  Địa điểm
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Địa điểm nhận xe <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={bookingData.pickupLocation}
                      onChange={(e) => setBookingData({...bookingData, pickupLocation: e.target.value})}
                      placeholder="Nhập địa chỉ nhận xe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Địa điểm trả xe <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={bookingData.returnLocation}
                      onChange={(e) => setBookingData({...bookingData, returnLocation: e.target.value})}
                      placeholder="Nhập địa chỉ trả xe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CreditCard size={20} className="text-blue-600" />
                  Phương thức thanh toán
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {['cash', 'credit_card', 'bank_transfer', 'momo'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setBookingData({...bookingData, paymentMethod: method})}
                      className={`p-3 border rounded-lg text-sm font-medium transition ${
                        bookingData.paymentMethod === method
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {method === 'cash' && 'Tiền mặt'}
                      {method === 'credit_card' && 'Thẻ tín dụng'}
                      {method === 'bank_transfer' && 'Chuyển khoản'}
                      {method === 'momo' && 'MoMo'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Ghi chú
                </label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                  rows={3}
                  placeholder="Nhập ghi chú (nếu có)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận đặt xe'}
              </button>
            </form>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="font-semibold text-lg mb-4">Tóm tắt</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá thuê</span>
                  <span className="font-medium">
                    {vehicle?.pricePerDay.toLocaleString()}đ/ngày
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số ngày</span>
                  <span className="font-medium">
                    {totalDays} ngày
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Tổng tiền</span>
                    <span className="text-blue-600">
                      {totalAmount.toLocaleString()}đ
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tiền đặt cọc</span>
                  <span className="font-medium text-yellow-600">
                    {deposit.toLocaleString()}đ
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2 text-sm text-blue-800">
                  <Shield size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Đặt cọc sẽ được hoàn trả sau khi kết thúc hợp đồng</span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-green-500" />
                  <span>Hỗ trợ 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-green-500" />
                  <span>Bảo hiểm đầy đủ</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-green-500" />
                  <span>Hoàn tiền nếu hủy trước 48h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;