const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @desc    Cập nhật thông tin user
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { fullName, phone, address, dateOfBirth, gender } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, phone, address, dateOfBirth, gender },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Upload avatar
// @route   POST /api/users/avatar
// @access  Private
router.post('/avatar', protect, async (req, res, next) => {
  try {
    const { avatarUrl } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;