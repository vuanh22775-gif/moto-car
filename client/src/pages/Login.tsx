import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600">MOTO</h1>
          <p className="text-gray-600 mt-2">Cùng bạn đến mọi hành trình</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">Đăng nhập</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email / Số điện thoại
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập email của bạn"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mật khẩu"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end mb-6">
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Bạn chưa là thành viên?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Đăng ký ngay
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Hoặc đăng nhập với</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3.97C17.782 2.074 15.074 1 12 1 7.392 1 3.417 3.563 1.693 7.059l3.573 2.706z"/>
                  <path fill="#34A853" d="M23.018 12.174c0-.807-.074-1.585-.21-2.337H12v4.419h6.206a5.675 5.675 0 0 1-2.467 3.723l3.739 2.902c2.173-1.998 3.54-4.955 3.54-8.707z"/>
                  <path fill="#4A90E2" d="M5.266 14.235A7.058 7.058 0 0 1 4.909 12c0-.782.134-1.535.357-2.235L1.693 7.059A11.967 11.967 0 0 0 0 12c0 1.927.456 3.746 1.258 5.367l3.008-3.132z"/>
                  <path fill="#FBBC05" d="M12 23c3.074 0 5.782-1.006 7.709-2.724l-3.739-2.902c-1.034.694-2.358 1.098-3.97 1.098-2.986 0-5.514-1.66-6.756-4.046l-3.008 3.132C3.417 20.437 7.392 23 12 23z"/>
                </svg>
                Google
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link to="/register-owner" className="text-sm text-blue-600 hover:text-blue-700">
              Trở thành chủ xe
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;