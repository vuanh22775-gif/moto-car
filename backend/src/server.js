const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/database');

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' } // cho phép load ảnh từ client
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
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

// Serve static files từ client/dist
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Handle React routing — không bắt /api và /uploads
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại port ${PORT}`);
});