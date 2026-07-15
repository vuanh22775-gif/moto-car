import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { 
  LayoutDashboard, Car, Users, Calendar, 
  Settings, LogOut, Menu, X, BarChart3 
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { to: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
    { to: '/admin/vehicles', label: 'Quản lý xe', icon: Car },
    { to: '/admin/users', label: 'Quản lý người dùng', icon: Users },
    { to: '/admin/bookings', label: 'Quản lý đặt xe', icon: Calendar },
    { to: '/admin/reports', label: 'Báo cáo', icon: BarChart3 },
    { to: '/admin/settings', label: 'Cài đặt', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 fixed h-full z-50`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {isSidebarOpen ? (
            <span className="text-xl font-bold text-blue-400">MOTO Admin</span>
          ) : (
            <span className="text-xl font-bold text-blue-400">M</span>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-gray-700 rounded transition"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition group"
            >
              <item.icon size={20} className="flex-shrink-0" />
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            {isSidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium">{user?.fullName}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2 w-full rounded-lg hover:bg-red-600 transition text-red-400 hover:text-white mt-2"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`${isSidebarOpen ? 'ml-64' : 'ml-20'} flex-1 transition-all duration-300`}>
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;