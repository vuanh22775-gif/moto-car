import React, { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import { 
  Users, Car, Calendar, DollarSign, 
  TrendingUp, TrendingDown, 
  MoreVertical, Search, Filter,
  Download, RefreshCw
} from 'lucide-react';
import api from '@services/api';
import toast from 'react-hot-toast';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [statsRes, bookingsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/bookings?limit=5')
      ]);
      setStats(statsRes.data.data);
      setRecentBookings(bookingsRes.data.data || []);
    } catch (error) {
      toast.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Tổng người dùng',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Tổng xe',
      value: stats?.totalVehicles || 0,
      icon: Car,
      color: 'bg-green-500',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Đơn đặt xe',
      value: stats?.totalBookings || 0,
      icon: Calendar,
      color: 'bg-purple-500',
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Doanh thu tháng',
      value: '125.6M',
      icon: DollarSign,
      color: 'bg-orange-500',
      change: '-2%',
      trend: 'down'
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tổng quan</h1>
          <p className="text-gray-500 text-sm">Chào mừng trở lại, {user?.fullName}</p>
        </div>
        <button
          onClick={loadDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <RefreshCw size={18} />
          Làm mới
        </button>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="spinner h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon size={20} className="text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3">
                    {stat.trend === 'up' ? (
                      <TrendingUp size={16} className="text-green-500" />
                    ) : (
                      <TrendingDown size={16} className="text-red-500" />
                    )}
                    <span className={`text-sm ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500">so với tháng trước</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex flex-wrap justify-between items-center p-6 border-b">
              <h2 className="font-semibold">Đơn đặt xe gần đây</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                  <Filter size={18} />
                </button>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                  <Download size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Xe</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày thuê</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentBookings.map((booking) => {
                    const vehicle = booking.vehicle || {};
                    const customer = booking.user || {};
                    return (
                      <tr key={booking.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                              {customer.fullName?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{customer.fullName || 'Khách hàng'}</p>
                              <p className="text-xs text-gray-500">{customer.email || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-gray-200">
                              <img 
                                src={vehicle.images?.[0] || '/images/default-car.jpg'} 
                                alt={vehicle.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{vehicle.brand} {vehicle.name}</p>
                              <p className="text-xs text-gray-500">{vehicle.licensePlate}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(booking.startDate).toLocaleDateString('vi-VN')}
                          <br />
                          <span className="text-xs text-gray-500">
                            {new Date(booking.endDate).toLocaleDateString('vi-VN')}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-blue-600">
                          {booking.totalPrice.toLocaleString()}đ
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'active' ? 'bg-green-100 text-green-800' :
                            booking.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.status === 'pending' && 'Chờ xác nhận'}
                            {booking.status === 'confirmed' && 'Đã xác nhận'}
                            {booking.status === 'active' && 'Đang thuê'}
                            {booking.status === 'completed' && 'Hoàn thành'}
                            {booking.status === 'cancelled' && 'Đã hủy'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {recentBookings.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar size={32} className="mx-auto mb-2 text-gray-300" />
                <p>Chưa có đơn đặt xe nào</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Admin;