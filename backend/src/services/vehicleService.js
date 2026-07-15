const Vehicle = require('../models/Vehicle');
const AppError = require('../utils/AppError');

// Lấy danh sách xe với filter và pagination
const getVehicles = async (filters, page = 1, limit = 12) => {
  const query = { status: 'approved' };

  // Filter theo loại xe
  if (filters.type) {
    query.type = filters.type;
  }

  // Filter theo thương hiệu
  if (filters.brand) {
    query.brand = filters.brand;
  }

  // Filter theo thành phố
  if (filters.city) {
    query['location.city'] = { $regex: filters.city, $options: 'i' };
  }

  // Filter theo giá
  if (filters.minPrice) {
    query.pricePerDay = { $gte: parseInt(filters.minPrice) };
  }
  if (filters.maxPrice) {
    query.pricePerDay = { ...query.pricePerDay, $lte: parseInt(filters.maxPrice) };
  }

  // Filter theo số ghế
  if (filters.seats) {
    query['specifications.seats'] = parseInt(filters.seats);
  }

  // Filter theo hộp số
  if (filters.transmission) {
    query['specifications.transmission'] = filters.transmission;
  }

  // Filter theo nhiên liệu
  if (filters.fuelType) {
    query['specifications.fuelType'] = filters.fuelType;
  }

  // Tìm kiếm theo text
  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  // Xác định sort
  let sort = { createdAt: -1 };
  if (filters.sortBy === 'price_asc') {
    sort = { pricePerDay: 1 };
  } else if (filters.sortBy === 'price_desc') {
    sort = { pricePerDay: -1 };
  } else if (filters.sortBy === 'rating') {
    sort = { 'rating.average': -1 };
  } else if (filters.sortBy === 'newest') {
    sort = { createdAt: -1 };
  }

  const skip = (page - 1) * limit;

  const vehicles = await Vehicle.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('createdBy', 'fullName email phone');

  const total = await Vehicle.countDocuments(query);

  return {
    vehicles,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// Lấy chi tiết xe
const getVehicleById = async (id) => {
  const vehicle = await Vehicle.findById(id)
    .populate('createdBy', 'fullName email phone')
    .populate({
      path: 'reviews',
      populate: {
        path: 'user',
        select: 'fullName avatar'
      }
    });

  if (!vehicle) {
    throw new AppError('Xe không tồn tại', 404);
  }

  // Tăng viewCount bằng update nguyên tử ($inc), tránh phải load + validate + save
  // toàn bộ document (rất tốn kém) chỉ để tăng 1 con số, đồng thời tránh race condition
  // khi nhiều request xem xe cùng lúc (đọc/ghi không đồng bộ có thể làm mất lượt tăng).
  Vehicle.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).exec();

  return vehicle;
};

// Tạo xe mới
const createVehicle = async (vehicleData) => {
  const vehicle = await Vehicle.create(vehicleData);
  return vehicle;
};

// Cập nhật xe
const updateVehicle = async (id, updateData) => {
  const vehicle = await Vehicle.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!vehicle) {
    throw new AppError('Xe không tồn tại', 404);
  }

  return vehicle;
};

// Xóa xe
const deleteVehicle = async (id) => {
  const vehicle = await Vehicle.findByIdAndDelete(id);
  if (!vehicle) {
    throw new AppError('Xe không tồn tại', 404);
  }
  return vehicle;
};

// Lấy danh sách thương hiệu
const getBrands = async () => {
  const brands = await Vehicle.distinct('brand');
  return brands;
};

// Lấy danh sách thành phố
const getCities = async () => {
  const cities = await Vehicle.distinct('location.city');
  return cities;
};

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getBrands,
  getCities
};