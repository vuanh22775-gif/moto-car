const { body } = require('express-validator');

// Common validators
const validators = {
  // Email validator
  email: body('email')
    .isEmail().withMessage('Email không hợp lệ')
    .notEmpty().withMessage('Email là bắt buộc'),

  // Password validator
  password: body('password')
    .isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự')
    .notEmpty().withMessage('Mật khẩu là bắt buộc'),

  // Phone validator
  phone: body('phone')
    .notEmpty().withMessage('Số điện thoại là bắt buộc')
    .matches(/^[0-9]{10,11}$/).withMessage('Số điện thoại không hợp lệ'),

  // Username validator
  username: body('username')
    .notEmpty().withMessage('Tên đăng nhập là bắt buộc')
    .isLength({ min: 3, max: 30 }).withMessage('Tên đăng nhập từ 3-30 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới'),

  // Full name validator
  fullName: body('fullName')
    .notEmpty().withMessage('Họ tên là bắt buộc')
    .isLength({ min: 2, max: 50 }).withMessage('Họ tên từ 2-50 ký tự'),

  // Date validator
  date: body('date')
    .isISO8601().withMessage('Ngày không hợp lệ'),

  // Price validator
  price: body('price')
    .isInt({ min: 0 }).withMessage('Giá phải là số dương'),

  // Rating validator
  rating: body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Đánh giá từ 1-5 sao'),

  // URL validator
  url: body('url')
    .isURL().withMessage('URL không hợp lệ')
};

module.exports = validators;