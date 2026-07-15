const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const vehicleController = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');
const Vehicle = require('../models/Vehicle');
const Notification = require('../models/Notification');
const UserNotification = require('../models/UserNotification');

// Validation rules
const createVehicleValidation = [
  body('name').notEmpty().withMessage('Tên xe là bắt buộc'),
  body('type').isIn(['car', 'motorbike']).withMessage('Loại xe không hợp lệ'),
  body('brand').notEmpty().withMessage('Thương hiệu là bắt buộc'),
  body('model').notEmpty().withMessage('Model là bắt buộc'),
  body('year').isInt({ min: 1900 }).withMessage('Năm sản xuất không hợp lệ'),
  body('licensePlate').notEmpty().withMessage('Biển số là bắt buộc'),
  body('pricePerDay').isInt({ min: 0 }).withMessage('Giá thuê phải là số dương'),
  body('description').notEmpty().withMessage('Mô tả là bắt buộc'),
  body('location.address').notEmpty().withMessage('Địa chỉ là bắt buộc'),
  body('location.city').notEmpty().withMessage('Thành phố là bắt buộc'),
  body('location.district').notEmpty().withMessage('Quận/Huyện là bắt buộc'),
];

// ── Public routes ─────────────────────────────────────────────────────────────
router.get('/', vehicleController.getVehicles);
router.get('/brands', vehicleController.getBrands);
router.get('/cities', vehicleController.getCities);

// ── User: lấy xe của chính mình ───────────────────────────────────────────────
// ⚠️ Phải đặt trước /:id để tránh bị match nhầm
router.get('/my-vehicles', protect, async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: vehicles });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', vehicleController.getVehicleById);

// ── User: đăng xe cho thuê (status mặc định: pending) ────────────────────────
router.post('/', protect, createVehicleValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Admin đăng xe → tự approved; User đăng xe → pending chờ duyệt
    const status = req.user.role === 'admin' ? 'approved' : 'pending';

    const vehicle = await Vehicle.create({
      ...req.body,
      createdBy: req.user.id,
      status,
    });

    // Tạo thông báo cho admin nếu là user thường đăng xe
    if (req.user.role !== 'admin') {
      await Notification.create({
        type: 'new_vehicle',
        title: 'Xe mới chờ duyệt',
        message: `Người dùng vừa đăng xe "${vehicle.name}" (${vehicle.licensePlate}) cần được duyệt.`,
        vehicleId: vehicle._id,
        userId: req.user.id,
        isRead: false,
      });
    }

    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
});

// ── User: sửa xe của chính mình / Admin: sửa bất kỳ xe ──────────────────────
router.put('/:id', protect, async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy xe' });
    }

    // Chỉ cho phép chủ xe hoặc admin
    if (vehicle.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền sửa xe này' });
    }

    // User thường sửa xe → reset về pending để admin duyệt lại
    if (req.user.role !== 'admin') {
      req.body.status = 'pending';
    }

    const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Thông báo chủ xe khi admin duyệt hoặc từ chối
    if (req.user.role === 'admin' && req.body.status && vehicle.createdBy) {
      const owner = vehicle.createdBy.toString();
      if (req.body.status === 'approved') {
        await UserNotification.create({
          userId: owner,
          type: 'vehicle_approved',
          title: 'Xe của bạn đã được duyệt! ✅',
          message: `Xe "${updated.name}" (${updated.licensePlate}) đã được admin duyệt và hiển thị cho khách thuê.`,
          vehicleId: updated._id,
          isRead: false,
        });
      } else if (req.body.status === 'rejected') {
        await UserNotification.create({
          userId: owner,
          type: 'vehicle_rejected',
          title: 'Xe của bạn bị từ chối ⚠️',
          message: `Xe "${updated.name}" (${updated.licensePlate}) chưa được duyệt. Vui lòng kiểm tra lại thông tin và đăng lại.`,
          vehicleId: updated._id,
          isRead: false,
        });
      }
    }

    // Thông báo admin nếu user sửa xe
    if (req.user.role !== 'admin') {
      await Notification.create({
        type: 'updated_vehicle',
        title: 'Xe đã được cập nhật',
        message: `Chủ xe vừa cập nhật thông tin xe "${updated.name}" (${updated.licensePlate}), cần duyệt lại.`,
        vehicleId: updated._id,
        userId: req.user.id,
        isRead: false,
      });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// ── User: xóa xe của chính mình / Admin: xóa bất kỳ xe ──────────────────────
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy xe' });
    }

    if (vehicle.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa xe này' });
    }

    await vehicle.deleteOne();
    res.status(200).json({ success: true, message: 'Đã xóa xe' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;