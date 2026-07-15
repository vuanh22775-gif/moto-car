const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên xe là bắt buộc'],
    trim: true,
    maxlength: [100, 'Tên xe tối đa 100 ký tự']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  type: {
    type: String,
    enum: ['car', 'motorbike'],
    required: [true, 'Loại xe là bắt buộc']
  },
  brand: {
    type: String,
    required: [true, 'Thương hiệu là bắt buộc'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Model là bắt buộc'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Năm sản xuất là bắt buộc'],
    min: [1900, 'Năm sản xuất không hợp lệ'],
    max: [new Date().getFullYear() + 1, 'Năm sản xuất không hợp lệ']
  },
  licensePlate: {
    type: String,
    required: [true, 'Biển số là bắt buộc'],
    unique: true,
    trim: true
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Giá thuê theo ngày là bắt buộc'],
    min: [0, 'Giá thuê không được âm']
  },
  pricePerHour: {
    type: Number,
    min: [0, 'Giá thuê không được âm'],
    default: 0
  },
  deposit: {
    type: Number,
    required: [true, 'Tiền đặt cọc là bắt buộc'],
    min: [0, 'Tiền đặt cọc không được âm'],
    default: 0
  },
  description: {
    type: String,
    required: [true, 'Mô tả là bắt buộc'],
    minlength: [20, 'Mô tả tối thiểu 20 ký tự'],
    maxlength: [2000, 'Mô tả tối đa 2000 ký tự']
  },
  images: [{
    type: String,
    required: [true, 'Ít nhất 1 ảnh là bắt buộc']
  }],
  features: [{
    type: String,
    enum: ['Số tự động', 'Số sàn', 'CVT', '7 chỗ', '4 chỗ', '5 chỗ', 
           'Điện', 'Xăng', 'Dầu', 'Hybrid', 'GPS', 'Camera lùi', 
           'Màn hình cảm ứng', 'Cảm biến đỗ xe', 'Túi khí', 'ABS']
  }],
  specifications: {
    seats: { type: Number, min: 1, max: 50, default: 4 },
    transmission: { 
      type: String, 
      enum: ['Số tự động', 'Số sàn', 'CVT'],
      default: 'Số tự động'
    },
    fuelType: { 
      type: String, 
      enum: ['Điện', 'Xăng', 'Dầu', 'Hybrid'],
      default: 'Xăng'
    },
    engine: { type: String, default: '' },
    color: { type: String, default: '' },
    mileage: { type: Number, min: 0, default: 0 },
    weight: { type: Number, min: 0, default: 0 },
    consumption: { type: String, default: '' }
  },
  location: {
    address: { type: String, required: [true, 'Địa chỉ là bắt buộc'], trim: true },
    city: { type: String, required: [true, 'Thành phố là bắt buộc'], trim: true },
    district: { type: String, required: [true, 'Quận/Huyện là bắt buộc'], trim: true },
    ward: { type: String, trim: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  availability: {
    isAvailable: { type: Boolean, default: true },
    availableFrom: { type: Date },
    availableTo: { type: Date }
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'inactive'],
    default: 'pending'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field
VehicleSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'vehicle'
});

// Tạo slug từ tên
VehicleSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Index cho tìm kiếm
VehicleSchema.index({ name: 'text', brand: 'text', model: 'text', description: 'text' });
VehicleSchema.index({ 'location.city': 1, 'location.district': 1 });
// Sửa lỗi: "rating" là object { average, count }, sắp xếp/index theo cả object không
// có ý nghĩa và không hỗ trợ được truy vấn sort theo rating.average như vehicleService
// đang dùng (sort: { 'rating.average': -1 }). Index đúng field con.
VehicleSchema.index({ pricePerDay: 1, 'rating.average': -1 });

module.exports = mongoose.model('Vehicle', VehicleSchema);