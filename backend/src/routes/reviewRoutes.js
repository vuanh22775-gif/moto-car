const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const Review = require('../models/Review');
const Vehicle = require('../models/Vehicle');
const mongoose = require('mongoose');

// @desc    Tạo review mới
// @route   POST /api/reviews
// @access  Private
router.post(
  '/',
  protect,
  [
    body('vehicleId').notEmpty().withMessage('Xe là bắt buộc'),
    body('bookingId').notEmpty().withMessage('Booking là bắt buộc'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Đánh giá từ 1-5 sao'),
    body('comment').isLength({ min: 10 }).withMessage('Nhận xét tối thiểu 10 ký tự')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { vehicleId, bookingId, rating, comment } = req.body;

      // Kiểm tra review đã tồn tại
      const existingReview = await Review.findOne({
        user: req.user.id,
        booking: bookingId
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'Bạn đã đánh giá cho booking này'
        });
      }

      const review = await Review.create({
        vehicle: vehicleId,
        user: req.user.id,
        booking: bookingId,
        rating,
        comment
      });

      // ✅ FIX: Dùng MongoDB aggregation thay vì load toàn bộ reviews vào memory.
      //
      // Vấn đề cũ:
      //   - Review.find() load tất cả reviews của xe về Node.js server
      //   - Nếu xe có 10.000 reviews → tốn RAM và thời gian rất lớn
      //   - Sau đó dùng .reduce() tính trung bình trên JS → không cần thiết
      //   - Còn có race condition: nếu 2 user submit review cùng lúc, cả 2 đều
      //     đọc cùng 1 danh sách cũ, tính ra cùng 1 avg và ghi đè lên nhau
      //     → 1 trong 2 review bị "mất" khỏi phép tính
      //
      // Cách mới: $avg và $sum tính thẳng trên DB, nhanh hơn và không có race condition
      const result = await Review.aggregate([
        {
          $match: {
            vehicle: new mongoose.Types.ObjectId(vehicleId),
            status: 'approved'
          }
        },
        {
          $group: {
            _id: null,
            avg: { $avg: '$rating' },
            count: { $sum: 1 }
          }
        }
      ]);

      const { avg = 0, count = 0 } = result[0] || {};

      await Vehicle.findByIdAndUpdate(vehicleId, {
        'rating.average': Math.round(avg * 10) / 10, // làm tròn 1 chữ số thập phân
        'rating.count': count
      });

      res.status(201).json({
        success: true,
        data: review
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc    Lấy reviews của xe
// @route   GET /api/reviews/vehicle/:vehicleId
// @access  Public
router.get('/vehicle/:vehicleId', async (req, res, next) => {
  try {
    const reviews = await Review.find({
      vehicle: req.params.vehicleId,
      status: 'approved'
    })
      .populate('user', 'fullName avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;