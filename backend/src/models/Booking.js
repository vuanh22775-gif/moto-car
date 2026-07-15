const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Xe là bắt buộc']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Người dùng là bắt buộc']
  },
  startDate: {
    type: Date,
    required: [true, 'Ngày bắt đầu là bắt buộc']
  },
  endDate: {
    type: Date,
    required: [true, 'Ngày kết thúc là bắt buộc']
  },
  startTime: {
    type: String,
    required: [true, 'Giờ bắt đầu là bắt buộc'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Giờ không hợp lệ']
  },
  endTime: {
    type: String,
    required: [true, 'Giờ kết thúc là bắt buộc'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Giờ không hợp lệ']
  },
  totalDays: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: [true, 'Tổng tiền là bắt buộc'],
    min: [0, 'Tổng tiền không được âm']
  },
  deposit: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'bank_transfer', 'momo', 'zalopay', 'vnpay'],
    required: [true, 'Phương thức thanh toán là bắt buộc']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'deposit_paid', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    default: ''
  },
  pickupLocation: {
    type: String,
    required: [true, 'Địa điểm nhận xe là bắt buộc'],
    trim: true
  },
  returnLocation: {
    type: String,
    required: [true, 'Địa điểm trả xe là bắt buộc'],
    trim: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Ghi chú tối đa 500 ký tự'],
    default: ''
  },
  driverInfo: {
    name: { type: String, trim: true },
    phone: { type: String, match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'] },
    licenseNumber: { type: String, trim: true }
  },
  cancellationReason: {
    type: String,
    default: ''
  },
  cancelledAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// ✅ FIX: Thêm `return` trước next(error) để dừng hàm ngay lập tức.
// Bản cũ KHÔNG có return → sau khi gọi next(error), hàm vẫn chạy tiếp
// và gọi thêm next() lần nữa ở cuối → Express nhận 2 lần next() cho 1 request,
// gây ra lỗi "Cannot set headers after they are sent" hoặc bỏ qua error middleware.
BookingSchema.pre('save', function(next) {
  if (this.endDate < this.startDate) {
    return next(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
  }
  next();
});

// Index
BookingSchema.index({ user: 1, vehicle: 1 });
BookingSchema.index({ status: 1, startDate: 1 });

module.exports = mongoose.model('Booking', BookingSchema);