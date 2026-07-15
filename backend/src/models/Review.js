const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
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
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking là bắt buộc']
  },
  rating: {
    type: Number,
    required: [true, 'Đánh giá là bắt buộc'],
    min: [1, 'Đánh giá tối thiểu 1 sao'],
    max: [5, 'Đánh giá tối đa 5 sao']
  },
  comment: {
    type: String,
    required: [true, 'Nhận xét là bắt buộc'],
    minlength: [10, 'Nhận xét tối thiểu 10 ký tự'],
    maxlength: [500, 'Nhận xét tối đa 500 ký tự']
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Đảm bảo mỗi user chỉ review 1 lần cho 1 booking
ReviewSchema.index({ user: 1, booking: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);