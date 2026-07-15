const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Tên đăng nhập là bắt buộc'],
    unique: true,
    trim: true,
    minlength: [3, 'Tên đăng nhập tối thiểu 3 ký tự'],
    maxlength: [30, 'Tên đăng nhập tối đa 30 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [6, 'Mật khẩu tối thiểu 6 ký tự'],
    select: false
  },
  fullName: {
    type: String,
    required: [true, 'Họ tên là bắt buộc'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Số điện thoại là bắt buộc'],
    match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
  },
  address: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Nam', 'Nữ', 'Khác'],
    default: 'Nam'
  },
  drivingLicense: {
    number: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    image: { type: String, default: '' }
  },
  lastLogin: {
    type: Date
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    default: []
  }]
},
{
  timestamps: true
});

// Hash password trước khi lưu
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// So sánh password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Chuyển đổi sang JSON
UserSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);