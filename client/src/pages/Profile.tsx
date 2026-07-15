import React, { useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { 
  User, Mail, Phone, Shield,
  Edit2, Camera, ChevronRight, Car, Clock,
  LogOut, Key, FileText, Gift, Map, Database, Save, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@services/api';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || 'Nam'
  });

  const menuItems = [
    { icon: Car, label: 'Xe của tôi', link: '/my-vehicles' },
    { icon: Car, label: 'Xe yêu thích', link: '/favorites' },
    { icon: Clock, label: 'Chuyến của tôi', link: '/booking-history' },
    { icon: Gift, label: 'Quà tặng', link: '/gifts' },
    { icon: Map, label: 'Địa chỉ của tôi', link: '/addresses' },
    { icon: Database, label: 'Chính sách bảo vệ dữ liệu', link: '/privacy' },
    { icon: Key, label: 'Đổi mật khẩu', link: '/change-password' },
    { icon: FileText, label: 'Yêu cầu xóa tài khoản', link: '/delete-account' },
  ];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/users/profile', formData);
      toast.success('Cập nhật thông tin thành công');
      setIsEditing(false);
      // Refresh user data
      window.location.reload();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User size={40} className="text-blue-600" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition">
                <Camera size={14} />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{user?.fullName}</h2>
                  <p className="text-gray-500 text-sm">@{user?.username}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Mail size={14} />
                      {user?.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone size={14} />
                      {user?.phone || 'Chưa cập nhật'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <Edit2 size={16} />
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-lg mb-4">Chỉnh sửa thông tin</h3>
            <form onSubmit={handleUpdateProfile}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Họ tên
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Giới tính
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <X size={18} />
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Profile Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">Thông tin tài khoản</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-b pb-3">
              <p className="text-sm text-gray-500">Ngày sinh</p>
              <p className="font-medium">{user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : '---/---/---'}</p>
            </div>
            <div className="border-b pb-3">
              <p className="text-sm text-gray-500">Giới tính</p>
              <p className="font-medium">{user?.gender || 'Nam'}</p>
            </div>
            <div className="border-b pb-3">
              <p className="text-sm text-gray-500">Số điện thoại</p>
              <p className="font-medium">{user?.phone || 'Chưa cập nhật'}</p>
            </div>
            <div className="border-b pb-3">
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div className="border-b pb-3 md:col-span-2">
              <p className="text-sm text-gray-500">Địa chỉ</p>
              <p className="font-medium">{user?.address || 'Chưa cập nhật'}</p>
            </div>
          </div>
        </div>

        {/* Driving License */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Shield className="text-blue-600" size={24} />
              <div>
                <h3 className="font-semibold">Giấy phép lái xe</h3>
                <p className={`text-sm ${user?.drivingLicense?.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                  {user?.drivingLicense?.verified ? '✅ Đã xác thực' : '⏳ Chưa xác thực'}
                </p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Cập nhật
            </button>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition border-b last:border-0"
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className="text-gray-500" />
                <span>{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="mt-6 w-full bg-red-50 text-red-600 py-3 rounded-xl font-medium hover:bg-red-100 transition flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Profile;