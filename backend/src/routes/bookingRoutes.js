const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

// Validation rules
const createBookingValidation = [
  body('vehicleId').notEmpty().withMessage('Xe là bắt buộc'),
  body('startDate').isISO8601().withMessage('Ngày bắt đầu không hợp lệ'),
  body('endDate').isISO8601().withMessage('Ngày kết thúc không hợp lệ'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Giờ bắt đầu không hợp lệ'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Giờ kết thúc không hợp lệ'),
  body('totalDays').isInt({ min: 1 }).withMessage('Số ngày thuê phải lớn hơn 0'),
  body('totalPrice').isInt({ min: 0 }).withMessage('Tổng tiền phải là số dương'),
  body('paymentMethod').isIn(['cash', 'credit_card', 'bank_transfer', 'momo', 'zalopay', 'vnpay'])
    .withMessage('Phương thức thanh toán không hợp lệ'),
  body('pickupLocation').notEmpty().withMessage('Địa điểm nhận xe là bắt buộc'),
  body('returnLocation').notEmpty().withMessage('Địa điểm trả xe là bắt buộc')
];

// Routes
router.post('/', protect, createBookingValidation, bookingController.createBooking);
router.get('/', protect, bookingController.getUserBookings);
router.get('/:id', protect, bookingController.getBookingById);
router.put('/:id/cancel', protect, bookingController.cancelBooking);

module.exports = router;