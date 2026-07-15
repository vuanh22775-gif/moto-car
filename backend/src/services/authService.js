const User = require('../models/User');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

// Tạo JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Đăng ký người dùng
const register = async (userData) => {
  const { username, email, password, fullName, phone } = userData;

  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    throw new AppError('Email hoặc tên đăng nhập đã tồn tại', 400);
  }

  const user = await User.create({
    username,
    email,
    password,
    fullName,
    phone
  });

  const token = generateToken(user._id);
  return { user, token };
};

// Đăng nhập
const login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new AppError('Email hoặc mật khẩu không đúng', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Email hoặc mật khẩu không đúng', 401);
  }

  // ✅ FIX: Dùng findByIdAndUpdate thay vì user.save() để cập nhật lastLogin.
  //
  // Vấn đề với user.save():
  //   - Mongoose load document từ DB với .select('+password') ở trên,
  //     tức là field password đang có mặt trong object.
  //   - Khi gọi save(), pre('save') hook chạy và kiểm tra isModified('password').
  //   - Trong một số trường hợp (ví dụ Mongoose track dirty fields không chính xác
  //     sau khi select '+password'), hook có thể coi password là "modified" và
  //     hash lại một lần nữa → password trong DB bị hash 2 lần → user không thể
  //     đăng nhập được ở các lần sau.
  //
  // findByIdAndUpdate bypass hoàn toàn pre-save hook, chỉ update đúng field cần thiết.
  await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

  const token = generateToken(user._id);
  return { user, token };
};

// Lấy thông tin user hiện tại
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('Người dùng không tồn tại', 404);
  }
  return user;
};

// Đổi mật khẩu
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError('Người dùng không tồn tại', 404);
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Mật khẩu hiện tại không đúng', 400);
  }

  // Ở đây dùng save() là ĐÚNG vì ta muốn hash password mới
  user.password = newPassword;
  await user.save();

  return { message: 'Đổi mật khẩu thành công' };
};

module.exports = {
  register,
  login,
  getCurrentUser,
  changePassword,
  generateToken
};