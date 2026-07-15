const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const bookingService = require('../services/bookingService');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const UserNotification = require('../models/UserNotification');

// @desc    Lấy thông báo admin (xe chờ duyệt...)
// @route   GET /api/admin/notifications
// @access  Private/Admin
router.get('/notifications', protect, authorize('admin'), async (req, res, next) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('userId', 'fullName email phone')
      .populate('vehicleId', 'name licensePlate images');

    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.status(200).json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    next(error);
  }
});

// @desc    Đánh dấu thông báo đã đọc
// @route   PUT /api/admin/notifications/:id/read
// @access  Private/Admin
router.put('/notifications/:id/read', protect, authorize('admin'), async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

// @desc    Đánh dấu tất cả đã đọc
// @route   PUT /api/admin/notifications/read-all
// @access  Private/Admin
router.put('/notifications/read-all', protect, authorize('admin'), async (req, res, next) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});


// @desc    Lấy tất cả xe (Admin) — kể cả pending/rejected/inactive
// @route   GET /api/admin/vehicles
// @access  Private/Admin
router.get('/vehicles', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, type, source } = req.query;

    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { licensePlate: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [allVehicles, total] = await Promise.all([
      Vehicle.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'fullName email role'),
      Vehicle.countDocuments(query),
    ]);

    // Filter source ở application level (sau populate)
    let vehicles = allVehicles;
    if (source === 'admin') {
      vehicles = allVehicles.filter(v => !v.createdBy || v.createdBy?.role === 'admin');
    } else if (source === 'user') {
      vehicles = allVehicles.filter(v => v.createdBy?.role === 'user');
    }

    res.status(200).json({
      success: true,
      data: vehicles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Cập nhật trạng thái booking (Admin)
// @route   PUT /api/admin/bookings/:id/status
// @access  Private/Admin
router.put('/bookings/:id/status', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const validStatuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy booking' });
    }
    booking.status = status;
    if (status === 'cancelled' || status === 'rejected') {
      booking.cancellationReason = reason || '';
      booking.cancelledAt = new Date();
    }
    if (status === 'completed') booking.completedAt = new Date();
    await booking.save();
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
});

// @desc    Lấy tất cả bookings (Admin)
// @route   GET /api/admin/bookings
// @access  Private/Admin
router.get('/bookings', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, userId, vehicleId } = req.query;
    const result = await bookingService.getAllBookings(
      { status, userId, vehicleId },
      parseInt(page),
      parseInt(limit)
    );
    res.status(200).json({
      success: true,
      data: result.bookings,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Lấy tất cả users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Cập nhật user (Admin)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
router.put('/users/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { role, isActive, fullName, phone, address } = req.body;

    // Chỉ update field có giá trị (tránh ghi undefined vào DB - bug #9)
    const updateFields = {};
    if (role !== undefined) updateFields.role = role;
    if (isActive !== undefined) updateFields.isActive = isActive;
    if (fullName) updateFields.fullName = fullName;
    if (phone) updateFields.phone = phone;
    if (address !== undefined) updateFields.address = address;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// @desc    Lấy thống kê tổng quan dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res, next) => {
  try {
    const [totalUsers, totalVehicles, totalBookings, recentBookings] = await Promise.all([
      User.countDocuments(),
      Vehicle.countDocuments({ status: 'approved' }),
      Booking.countDocuments(),
      bookingService.getAllBookings({}, 1, 5),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalVehicles,
        totalBookings,
        recentBookings: recentBookings.bookings,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Lấy dữ liệu báo cáo & thống kê chi tiết
// @route   GET /api/admin/reports
// @access  Private/Admin
router.get('/reports', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { period = 'month' } = req.query; // 'week' | 'month' | 'year'

    // Xác định khoảng thời gian
    const now = new Date();
    let startDate;
    let groupFormat;
    if (period === 'week') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      groupFormat = '%Y-%m-%d'; // nhóm theo ngày
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      groupFormat = '%Y-%m'; // nhóm theo tháng
    } else {
      // month (default) — 30 ngày gần nhất
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
      groupFormat = '%Y-%m-%d';
    }

    const [
      // 1. Tổng quan
      totalUsers,
      newUsersThisPeriod,
      totalVehicles,
      totalBookings,

      // 2. Thống kê booking theo trạng thái
      bookingsByStatus,

      // 3. Doanh thu & booking theo thời gian
      revenueByTime,

      // 4. Top xe được đặt nhiều nhất
      topVehicles,

      // 5. Booking theo loại xe
      bookingsByVehicleType,

      // 6. Booking theo phương thức thanh toán
      bookingsByPayment,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      Vehicle.countDocuments({ status: 'approved' }),
      Booking.countDocuments(),

      // Đếm booking theo từng trạng thái
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Doanh thu + số đơn theo thời gian
      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: { $in: ['confirmed', 'active', 'completed'] }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
            revenue: { $sum: '$totalPrice' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Top 5 xe được đặt nhiều nhất
      Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'active', 'completed'] } } },
        { $group: { _id: '$vehicle', count: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'vehicles',
            localField: '_id',
            foreignField: '_id',
            as: 'vehicle'
          }
        },
        { $unwind: '$vehicle' },
        {
          $project: {
            name: '$vehicle.name',
            licensePlate: '$vehicle.licensePlate',
            type: '$vehicle.type',
            image: { $arrayElemAt: ['$vehicle.images', 0] },
            count: 1,
            revenue: 1
          }
        }
      ]),

      // Booking theo loại xe (ô tô / xe máy)
      Booking.aggregate([
        {
          $lookup: {
            from: 'vehicles',
            localField: 'vehicle',
            foreignField: '_id',
            as: 'vehicleData'
          }
        },
        { $unwind: '$vehicleData' },
        { $group: { _id: '$vehicleData.type', count: { $sum: 1 } } }
      ]),

      // Booking theo phương thức thanh toán
      Booking.aggregate([
        { $group: { _id: '$paymentMethod', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
    ]);

    // Tính tổng doanh thu & đơn hoàn thành
    const totalRevenue = revenueByTime.reduce((sum, r) => sum + r.revenue, 0);
    const completedBookings = bookingsByStatus.find(b => b._id === 'completed')?.count || 0;

    res.status(200).json({
      success: true,
      data: {
        overview: { totalUsers, newUsersThisPeriod, totalVehicles, totalBookings, totalRevenue, completedBookings },
        bookingsByStatus,
        revenueByTime,
        topVehicles,
        bookingsByVehicleType,
        bookingsByPayment,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;