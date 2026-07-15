const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Validation rules
const registerValidation = [
  body('username')
    .notEmpty().withMessage('Tên đăng nhập là bắt buộc')
    .isLength({ min: 3, max: 30 }).withMessage('Tên đăng nhập từ 3-30 ký tự'),
  body('email')
    .isEmail().withMessage('Email không hợp lệ')
    .notEmpty().withMessage('Email là bắt buộc'),
  body('password')
    .isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự')
    .notEmpty().withMessage('Mật khẩu là bắt buộc'),
  body('fullName')
    .notEmpty().withMessage('Họ tên là bắt buộc'),
  body('phone')
    .notEmpty().withMessage('Số điện thoại là bắt buộc')
    .matches(/^[0-9]{10,11}$/).withMessage('Số điện thoại không hợp lệ')
];

const loginValidation = [
  body('email')
    .isEmail().withMessage('Email không hợp lệ')
    .notEmpty().withMessage('Email là bắt buộc'),
  body('password')
    .notEmpty().withMessage('Mật khẩu là bắt buộc')
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/me', protect, authController.getMe);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;