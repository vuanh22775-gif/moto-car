const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const AppError = require('../utils/AppError');

// Tạo booking mới
const createBooking = async (bookingData) => {
  const { vehicleId, userId, startDate, endDate, ...otherData } = bookingData;

  // Kiểm tra xe tồn tại
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new AppError('Xe không tồn tại', 404);
  }

  // Kiểm tra xe có sẵn
  if (!vehicle.availability.isAvailable) {
    throw new AppError('Xe hiện không có sẵn', 400);
  }

  // Kiểm tra trùng lịch
  // Hai khoảng ngày giao nhau khi: existing.startDate <= endDate VÀ existing.endDate >= startDate.
  // (Logic cũ dùng $or của 2 điều kiện "nằm trong" nên lọt trường hợp booking cũ
  // bao trọn khoảng ngày mới, ví dụ booking cũ 1/1-10/1 và booking mới 3/1-5/1 sẽ
  // không bị phát hiện là trùng lịch -> có thể đặt trùng xe)
  const existingBooking = await Booking.findOne({
    vehicle: vehicleId,
    status: { $in: ['pending', 'confirmed', 'active'] },
    startDate: { $lte: endDate },
    endDate: { $gte: startDate }
  });

  if (existingBooking) {
    throw new AppError('Xe đã được đặt trong khoảng thời gian này', 409);
  }

  const booking = await Booking.create({
    vehicle: vehicleId,
    user: userId,
    startDate,
    endDate,
    ...otherData
  });

  return booking;
};

// Lấy danh sách booking của user
const getUserBookings = async (userId, status = null) => {
  const query = { user: userId };
  if (status) {
    query.status = status;
  }

  const bookings = await Booking.find(query)
    .populate('vehicle')
    .sort({ createdAt: -1 });

  return bookings;
};

// Lấy chi tiết booking
const getBookingById = async (id, userId) => {
  const booking = await Booking.findById(id)
    .populate('vehicle')
    .populate('user', 'fullName email phone');

  if (!booking) {
    throw new AppError('Booking không tồn tại', 404);
  }

  if (booking.user._id.toString() !== userId.toString()) {
    throw new AppError('Bạn không có quyền xem booking này', 403);
  }

  return booking;
};

// Cập nhật trạng thái booking
const updateBookingStatus = async (id, status, userId, reason = '') => {
  const booking = await Booking.findById(id);
  if (!booking) {
    throw new AppError('Booking không tồn tại', 404);
  }

  if (booking.user.toString() !== userId.toString()) {
    throw new AppError('Bạn không có quyền cập nhật booking này', 403);
  }

  // Không cho phép hủy các booking đã ở trạng thái kết thúc (completed/cancelled/rejected)
  if (status === 'cancelled' && ['completed', 'cancelled', 'rejected'].includes(booking.status)) {
    throw new AppError('Không thể hủy booking đã hoàn tất hoặc đã hủy trước đó', 400);
  }

  booking.status = status;
  
  if (status === 'cancelled') {
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();
  }

  if (status === 'completed') {
    booking.completedAt = new Date();
  }

  await booking.save();
  return booking;
};

// Hủy booking
const cancelBooking = async (id, userId, reason) => {
  return updateBookingStatus(id, 'cancelled', userId, reason);
};

// Admin: Lấy tất cả bookings
const getAllBookings = async (filters = {}, page = 1, limit = 10) => {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.userId) {
    query.user = filters.userId;
  }

  if (filters.vehicleId) {
    query.vehicle = filters.vehicleId;
  }

  const skip = (page - 1) * limit;

  const bookings = await Booking.find(query)
    .populate('vehicle')
    .populate('user', 'fullName email phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Booking.countDocuments(query);

  return {
    bookings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getAllBookings
};