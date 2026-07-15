const chatService = require('../services/chatService');

// GHI CHÚ SỬA LỖI QUAN TRỌNG:
// Bản gốc của controller này tự viết lại toàn bộ logic lưu tin nhắn/tạo phản hồi bot,
// trùng lặp hoàn toàn với backend/src/services/chatService.js (không dùng service đó),
// đồng thời có 2 lỗi nghiêm trọng:
//  1. Bắt buộc client phải gửi sẵn `sessionId`, nhưng lần chat đầu tiên của người dùng
//     mới thì frontend chưa có sessionId (localStorage rỗng) -> luôn trả về lỗi 400,
//     nghĩa là tính năng chat KHÔNG BAO GIỜ hoạt động được cho người dùng mới.
//  2. Response trả về { userMessage, botMessage } (2 document Mongo đầy đủ) trong khi
//     frontend (client/src/hooks/useChat.ts) lại đọc `{ sessionId, response }` từ
//     response.data.data -> luôn nhận giá trị undefined.
// Bản sửa dưới đây dùng lại chatService (tránh trùng lặp code) và trả về đúng field
// mà frontend đang cần.

// @desc    Gửi tin nhắn chat
// @route   POST /api/chat/message
// @access  Public/Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { message, sessionId: incomingSessionId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message là bắt buộc'
      });
    }

    // Tự tạo sessionId mới nếu client chưa có, thay vì bắt buộc phải có sẵn
    const sessionId = chatService.getOrCreateSession(incomingSessionId);
    const userId = req.user ? req.user.id : null;

    await chatService.saveMessage(sessionId, 'user', message, userId);

    const botResponseText = await chatService.processBotMessage(message);
    const botMessage = await chatService.saveMessage(sessionId, 'bot', botResponseText, userId);

    res.status(201).json({
      success: true,
      data: {
        sessionId,
        response: botResponseText,
        botMessage
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy lịch sử chat
// @route   GET /api/chat/history
// @access  Public/Private
exports.getHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId là bắt buộc'
      });
    }

    const messages = await chatService.getChatHistory(sessionId);

    // Chuẩn hóa lại field cho khớp với kiểu ChatMessage phía frontend
    // (id, sender, message, timestamp) thay vì trả nguyên document Mongo.
    const formatted = messages.map((m) => ({
      id: m._id.toString(),
      sender: m.sender,
      message: m.message,
      timestamp: m.createdAt,
      user: m.user
    }));

    res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};