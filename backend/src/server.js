const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/database');
// app.listen(...) // <--- Bỏ dòng này đi
const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' } // cho phép load ảnh từ client
}));
app.use(cors({
  origin: 'https://moto-car-4pqw-git-main-vuanh22775-gifs-projects.vercel.app', // Địa chỉ trang web Frontend Vercel của bạn
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // Cho phép gửi cookie / token nếu cần
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Kết nối MongoDB
connectDB();

// ✅ Serve thư mục uploads làm static — client dùng URL này để hiển thị ảnh
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/notifications', require('./routes/userNotificationRoutes')); // thông báo cho user

// Thay thế bằng đoạn test đơn giản này:
app.get('/', (req, res) => {
  res.json({ message: "API Backend đang chạy ổn định!" });
});

// Thay thế đoạn chạy PORT cũ bằng đoạn này:
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server đang chạy tại port ${PORT}`);
  });
}

module.exports = app; // Xuất app ra để Vercel sử dụng