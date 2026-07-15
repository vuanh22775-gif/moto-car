const bookingService = require('../services/bookingService');
const { validationResult } = require('express-validator');
const Vehicle = require('../models/Vehicle');
const UserNotification = require('../models/UserNotification');

// @desc    Tạo booking mới
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const bookingData = {
      ...req.body,
      userId: req.user.id
    };

    const booking = await bookingService.createBooking(bookingData);

    // ── Gửi thông báo đến chủ xe nếu xe do user đăng ──────────────────
    try {
      const vehicle = await Vehicle.findById(req.body.vehicleId).populate('createdBy', '_id role');

      if (vehicle && vehicle.createdBy && vehicle.createdBy.role === 'user') {
        const ownerId = vehicle.createdBy._id;

        // Chỉ thông báo nếu chủ xe không phải người đặt
        if (ownerId.toString() !== req.user.id) {
          const startDate = new Date(req.body.startDate).toLocaleDateString('vi-VN');
          const endDate   = new Date(req.body.endDate).toLocaleDateString('vi-VN');

          await UserNotification.create({
            userId: ownerId,
            type: 'vehicle_booked',
            title: 'Xe của bạn vừa được đặt! 🎉',
            message: `Xe "${vehicle.name}" (${vehicle.licensePlate}) vừa được đặt thuê từ ${startDate} đến ${endDate}.`,
            bookingId: booking._id,
            vehicleId: vehicle._id,
            isRead: false,
          });
        }
      }
    } catch (notifErr) {
      // Không block response nếu tạo thông báo lỗi
      console.error('Notification error:', notifErr);
    }

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy danh sách booking của user
// @route   GET /api/bookings
// @access  Private
exports.getUserBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const bookings = await bookingService.getUserBookings(req.user.id, status);
    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy chi tiết booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Hủy booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await bookingService.cancelBooking(req.params.id, req.user.id, reason);

    // Thông báo chủ xe khi đơn bị hủy
    try {
      const vehicle = await Vehicle.findById(booking.vehicle).populate('createdBy', '_id role');
      if (vehicle && vehicle.createdBy && vehicle.createdBy.role === 'user') {
        const ownerId = vehicle.createdBy._id;
        if (ownerId.toString() !== req.user.id) {
          await UserNotification.create({
            userId: ownerId,
            type: 'booking_cancelled',
            title: 'Đơn thuê xe bị hủy',
            message: `Đơn thuê xe "${vehicle.name}" (${vehicle.licensePlate}) vừa bị hủy bởi khách thuê.`,
            bookingId: booking._id,
            vehicleId: vehicle._id,
            isRead: false,
          });
        }
      }
    } catch (notifErr) {
      console.error('Notification error:', notifErr);
    }

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Hủy booking thành công'
    });
  } catch (error) {
    next(error);
  }
};