const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['new_vehicle', 'updated_vehicle', 'new_booking', 'cancelled_booking'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);