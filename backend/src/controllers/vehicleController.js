const vehicleService = require('../services/vehicleService');
const { validationResult } = require('express-validator');

// @desc    Lấy danh sách xe
// @route   GET /api/vehicles
// @access  Public
exports.getVehicles = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, ...filters } = req.query;
    const result = await vehicleService.getVehicles(
      filters,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: result.vehicles,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy chi tiết xe
// @route   GET /api/vehicles/:id
// @access  Public
exports.getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Tạo xe mới
// @route   POST /api/vehicles
// @access  Private/Admin
exports.createVehicle = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const vehicleData = {
      ...req.body,
      createdBy: req.user.id
    };

    const vehicle = await vehicleService.createVehicle(vehicleData);

    res.status(201).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật xe
// @route   PUT /api/vehicles/:id
// @access  Private/Admin
exports.updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.updateVehicle(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa xe
// @route   DELETE /api/vehicles/:id
// @access  Private/Admin
exports.deleteVehicle = async (req, res, next) => {
  try {
    await vehicleService.deleteVehicle(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Xóa xe thành công'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy danh sách thương hiệu
// @route   GET /api/vehicles/brands
// @access  Public
exports.getBrands = async (req, res, next) => {
  try {
    const brands = await vehicleService.getBrands();

    res.status(200).json({
      success: true,
      data: brands
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy danh sách thành phố
// @route   GET /api/vehicles/cities
// @access  Public
exports.getCities = async (req, res, next) => {
  try {
    const cities = await vehicleService.getCities();

    res.status(200).json({
      success: true,
      data: cities
    });
  } catch (error) {
    next(error);
  }
};