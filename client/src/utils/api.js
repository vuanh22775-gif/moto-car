import axios from 'axios';

// Kiểm tra xem web đang chạy ở máy tính (development) hay trên mạng (production)
const isProduction = import.meta.env.PROD;

const api = axios.create({
  // Nếu ở local thì dùng proxy '/api', nếu ở production thì gọi trực tiếp link Backend Vercel
  baseURL: isProduction 
    ? 'https://moto-ol2dj4uzw-vuanh22775-gifs-projects.vercel.app/' // Thay link Backend Vercel của bạn vào đây
    : '', // Để trống để Vite tự dùng proxy '/api' ở local
  withCredentials: true,
});

export default api;