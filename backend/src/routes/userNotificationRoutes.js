const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const UserNotification = require('../models/UserNotification');

// @desc    Lấy thông báo của user hiện tại
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const notifications = await UserNotification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('vehicleId', 'name licensePlate images')
      .populate('bookingId', 'startDate endDate totalPrice');

    const unreadCount = await UserNotification.countDocuments({
      userId: req.user.id,
      isRead: false,
    });

    res.status(200).json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    next(error);
  }
});

// @desc    Đánh dấu 1 thông báo đã đọc
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res, next) => {
  try {
    await UserNotification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

// @desc    Đánh dấu tất cả đã đọc
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', protect, async (req, res, next) => {
  try {
    await UserNotification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;