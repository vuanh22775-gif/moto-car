import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold text-blue-400 mb-4">MOTO</h3>
            <p className="text-gray-400 text-sm mb-4">
              Cùng bạn trên mọi hành trình. Nền tảng chia sẻ ô tô hàng đầu Việt Nam.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/vehicles" className="text-gray-400 hover:text-white transition">Tìm xe</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition">Giới thiệu</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition">Liên hệ</Link></li>
              <li><Link to="/booking-history" className="text-gray-400 hover:text-white transition">Lịch sử đặt xe</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Dịch vụ</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-400">Thuê xe tự lái</li>
              <li className="text-gray-400">Thuê xe có tài xế</li>
              <li className="text-gray-400">Thuê xe dài hạn</li>
              <li className="text-gray-400">Hỗ trợ 24/7</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3 text-gray-400">
                <MapPin size={18} className="flex-shrink-0 mt-0.5" />
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Phone size={18} />
                <span>1900 1234</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Mail size={18} />
                <span>support@moto.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} MOTO. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;