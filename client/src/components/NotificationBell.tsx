import React, { useState, useEffect, useRef } from 'react';
import { Bell, Car, X, Check } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  vehicleId?: { name: string; images: string[] };
}

const TYPE_ICON: Record<string, string> = {
  vehicle_booked:    '🎉',
  booking_cancelled: '❌',
  vehicle_approved:  '✅',
  vehicle_rejected:  '⚠️',
};

const NotificationBell: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [open, setOpen]                   = useState(false);
  const ref                               = useRef<HTMLDivElement>(null);

  // Đóng khi click ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch mỗi 30 giây
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
      setUnreadCount(res.data.unreadCount);
    } catch {}
  };

  const handleOpen = () => {
    setOpen(o => !o);
    // Đánh dấu tất cả đã đọc khi mở
    if (!open && unreadCount > 0) {
      api.put('/notifications/read-all').then(() => {
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }).catch(() => {});
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={ref}>
      {/* Nút chuông */}
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold text-gray-800">Thông báo</h3>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-gray-400">
                <Bell size={32} className="mb-2 opacity-30" />
                <p className="text-sm">Chưa có thông báo nào</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  className={`flex gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${
                    !n.isRead ? 'bg-blue-50/50' : ''
                  }`}
                >
                  {/* Icon / ảnh xe */}
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center text-lg">
                    {n.vehicleId?.images?.[0]
                      ? <img src={n.vehicleId.images[0]} alt="" className="w-full h-full object-cover" />
                      : TYPE_ICON[n.type] || '🔔'
                    }
                  </div>

                  {/* Nội dung */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium leading-snug ${!n.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t text-center">
              <button
                onClick={() => {
                  api.put('/notifications/read-all');
                  setUnreadCount(0);
                  setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                }}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 mx-auto"
              >
                <Check size={12} /> Đánh dấu tất cả đã đọc
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;