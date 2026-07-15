import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { 
  Menu, X, User, LogOut, Settings, Car, Home, 
  Phone, Info, Calendar, UserCircle 
} from 'lucide-react';
import NotificationBell from '@components/common/NotificationBell';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsDropdownOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Trang chủ', icon: Home },
    { to: '/vehicles', label: 'Xe', icon: Car },
    { to: '/about', label: 'Giới thiệu', icon: Info },
    { to: '/contact', label: 'Liên hệ', icon: Phone },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">MOTO</span>
            <span className="text-sm text-gray-500 hidden sm:inline">Cùng bạn trên mọi hành trình</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-600 hover:text-blue-600 transition-colors flex items-center space-x-1"
              >
                <link.icon size={18} />
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                {/* ✅ Chuông thông báo — chỉ hiện khi đã đăng nhập */}
                <NotificationBell />

                {/* Avatar + Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-lg transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User size={18} className="text-blue-600" />
                      )}
                    </div>
                    <span className="text-sm font-medium hidden lg:block">{user?.fullName}</span>
                  </button>

                  {/* Dropdown */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-medium text-sm">{user?.fullName}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            Admin
                          </span>
                        )}
                      </div>

                      <Link to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 transition"
                        onClick={() => setIsDropdownOpen(false)}>
                        <UserCircle size={18} />
                        <span>Hồ sơ</span>
                      </Link>

                      <Link to="/my-vehicles"
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 transition"
                        onClick={() => setIsDropdownOpen(false)}>
                        <Car size={18} />
                        <span>Xe của tôi</span>
                      </Link>

                      {isAdmin && (
                        <Link to="/admin"
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 transition"
                          onClick={() => setIsDropdownOpen(false)}>
                          <Settings size={18} />
                          <span>Quản trị</span>
                        </Link>
                      )}

                      <Link to="/booking-history"
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 transition"
                        onClick={() => setIsDropdownOpen(false)}>
                        <Calendar size={18} />
                        <span>Lịch sử đặt xe</span>
                      </Link>

                      <button onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-red-50 text-red-600 transition border-t border-gray-100 mt-1">
                        <LogOut size={18} />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link to="/login"
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition">
                  Đăng nhập
                </Link>
                <Link to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to}
                  className="flex items-center space-x-2 px-2 py-2 hover:bg-gray-50 rounded-lg transition"
                  onClick={() => setIsMenuOpen(false)}>
                  <link.icon size={20} />
                  <span>{link.label}</span>
                </Link>
              ))}

              {!isAuthenticated && (
                <div className="flex flex-col space-y-2 pt-2 border-t border-gray-100">
                  <Link to="/login"
                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg text-center hover:bg-blue-50 transition"
                    onClick={() => setIsMenuOpen(false)}>
                    Đăng nhập
                  </Link>
                  <Link to="/register"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-center hover:bg-blue-700 transition"
                    onClick={() => setIsMenuOpen(false)}>
                    Đăng ký
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;