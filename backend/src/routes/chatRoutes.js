const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// Routes
router.post('/message', chatController.sendMessage);
router.get('/history', chatController.getHistory);

// Protected routes (optional - for authenticated users)
router.post('/message/auth', protect, chatController.sendMessage);

module.exports = router;