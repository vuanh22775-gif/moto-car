const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');

// @desc    Lấy danh sách xe yêu thích
// @route   GET /api/favorites
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'favorites',
      select: 'name type brand model year licensePlate pricePerDay images rating status location',
      match: { status: 'approved' } // chỉ lấy xe đã duyệt
    });

    res.status(200).json({
      success: true,
      data: user.favorites || []
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Thêm xe vào yêu thích
// @route   POST /api/favorites/:vehicleId
// @access  Private
router.post('/:vehicleId', protect, async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy xe' });
    }

    const user = await User.findById(req.user.id);

    // Kiểm tra đã thích chưa
    if (user.favorites.includes(req.params.vehicleId)) {
      return res.status(400).json({ success: false, message: 'Xe đã có trong danh sách yêu thích' });
    }

    user.favorites.push(req.params.vehicleId);
    await user.save();

    res.status(200).json({ success: true, message: 'Đã thêm vào yêu thích' });
  } catch (error) {
    next(error);
  }
});

// @desc    Xóa xe khỏi yêu thích
// @route   DELETE /api/favorites/:vehicleId
// @access  Private
router.delete('/:vehicleId', protect, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { favorites: req.params.vehicleId }
    });

    res.status(200).json({ success: true, message: 'Đã xóa khỏi yêu thích' });
  } catch (error) {
    next(error);
  }
});

// @desc    Kiểm tra xe có trong yêu thích không
// @route   GET /api/favorites/check/:vehicleId
// @access  Private
router.get('/check/:vehicleId', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('favorites');
    const isFavorite = user.favorites.includes(req.params.vehicleId);

    res.status(200).json({ success: true, isFavorite });
  } catch (error) {
    next(error);
  }
});

module.exports = router;