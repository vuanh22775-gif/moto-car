const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

// @desc    Upload ảnh xe (1 hoặc nhiều file)
// @route   POST /api/upload/vehicles
// @access  Private
router.post(
  '/vehicles',
  protect,
  upload.array('images', 10), // tối đa 10 ảnh mỗi lần
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Không có file nào được upload' });
    }

    // Trả về mảng URL trỏ vào static endpoint
    const urls = req.files.map(
      file => `${req.protocol}://${req.get('host')}/uploads/vehicles/${file.filename}`
    );

    res.status(200).json({ success: true, urls });
  }
);

// @desc    Xóa ảnh xe
// @route   DELETE /api/upload/vehicles
// @access  Private
router.delete('/vehicles', protect, (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, message: 'Thiếu URL' });

  // Tách tên file từ URL
  const filename = url.split('/uploads/vehicles/').pop();
  if (!filename) return res.status(400).json({ success: false, message: 'URL không hợp lệ' });

  const filePath = path.join(__dirname, '../../uploads/vehicles', filename);

  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      return res.status(500).json({ success: false, message: 'Không thể xóa file' });
    }
    res.status(200).json({ success: true, message: 'Đã xóa ảnh' });
  });
});

module.exports = router;