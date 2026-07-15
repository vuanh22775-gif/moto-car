import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface FavoriteButtonProps {
  vehicleId: string;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ vehicleId, className = '' }) => {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    checkFavorite();
  }, [vehicleId, isAuthenticated]);

  const checkFavorite = async () => {
    try {
      const res = await api.get(`/favorites/check/${vehicleId}`);
      setIsFavorite(res.data.isFavorite);
    } catch {
      // Bỏ qua lỗi check
    }
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu xe yêu thích');
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${vehicleId}`);
        setIsFavorite(false);
        toast.success('Đã xóa khỏi yêu thích');
      } else {
        await api.post(`/favorites/${vehicleId}`);
        setIsFavorite(true);
        toast.success('Đã thêm vào yêu thích ❤️');
      }
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={isFavorite ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
      className={`flex items-center justify-center w-10 h-10 rounded-full border transition
        ${isFavorite
          ? 'bg-red-50 border-red-200 hover:bg-red-100'
          : 'bg-white border-gray-200 hover:bg-gray-50'
        } ${className}`}
    >
      {loading
        ? <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
        : <Heart size={18} className={isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
      }
    </button>
  );
};

export default FavoriteButton;