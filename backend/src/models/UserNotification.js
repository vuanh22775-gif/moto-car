const mongoose = require('mongoose');

const UserNotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['vehicle_booked', 'booking_cancelled', 'vehicle_approved', 'vehicle_rejected'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('UserNotification', UserNotificationSchema);