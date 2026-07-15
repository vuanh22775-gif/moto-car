import React, { useState } from 'react';
import { MessageCircle, Send, Phone, Mail, MapPin, Clock, Facebook, Instagram, Youtube } from 'lucide-react';
import ChatBot from '@components/chat/ChatBot';
import toast from 'react-hot-toast';

const Contact: React.FC = () => {
  const [showChat, setShowChat] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Gửi email hoặc lưu vào database
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi sớm.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Gửi tin nhắn thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Liên hệ với MOTO</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Hãy liên hệ với chúng tôi qua các kênh dưới đây.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Thông tin liên hệ</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="font-medium">Hotline</p>
                    <p className="text-gray-600">1900 1234</p>
                    <p className="text-sm text-gray-500">8:00 - 22:00 hàng ngày</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">support@moto.com</p>
                    <p className="text-sm text-gray-500">Phản hồi trong 24h</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="font-medium">Địa chỉ</p>
                    <p className="text-gray-600">123 Đường ABC, Quận 1, TP.HCM</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="font-medium">Giờ làm việc</p>
                    <p className="text-gray-600">Thứ 2 - Thứ 7: 8:00 - 22:00</p>
                    <p className="text-gray-600">Chủ nhật: 9:00 - 18:00</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm font-medium text-gray-700 mb-3">Kết nối với chúng tôi</p>
                <div className="flex gap-4">
                  <a href="#" className="text-gray-400 hover:text-blue-600 transition">
                    <Facebook size={24} />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-blue-600 transition">
                    <Instagram size={24} />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-blue-600 transition">
                    <Youtube size={24} />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Response */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-2">💬 Cần hỗ trợ nhanh?</h3>
              <p className="text-blue-800 text-sm mb-4">
                Nhấn vào nút bên dưới để trò chuyện với trợ lý ảo Mia của chúng tôi.
              </p>
              <button
                onClick={() => setShowChat(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                <MessageCircle size={20} />
                Chat với Mia
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Gửi tin nhắn</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập họ tên của bạn"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập email của bạn"
                  required
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tiêu đề"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập nội dung tin nhắn"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                <Send size={20} />
                {submitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Chat Bot Modal */}
      {showChat && <ChatBot onClose={() => setShowChat(false)} />}
    </div>
  );
};

export default Contact;