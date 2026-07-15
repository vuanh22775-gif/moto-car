const ChatMessage = require('../models/ChatMessage');
const { v4: uuidv4 } = require('uuid');

// Lấy hoặc tạo session
const getOrCreateSession = (sessionId) => {
  return sessionId || uuidv4();
};

// Lưu tin nhắn
const saveMessage = async (sessionId, sender, message, userId = null) => {
  const chatMessage = await ChatMessage.create({
    sessionId,
    sender,
    message,
    user: userId
  });
  return chatMessage;
};

// Lấy lịch sử chat
const getChatHistory = async (sessionId, limit = 50) => {
  const messages = await ChatMessage.find({ sessionId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'fullName avatar');
  return messages.reverse();
};

// ─── Knowledge base ───────────────────────────────────────────────────────────
// Mỗi entry có: keywords (mảng từ khóa), response (câu trả lời)
// Bot tìm entry có nhiều keywords khớp nhất thay vì dừng ở entry đầu tiên
const knowledgeBase = [
  {
    keywords: ['xin chào', 'chào', 'hello', 'hi', 'hey', 'alo'],
    response: 'Xin chào! 👋 Tôi là Mia, trợ lý ảo của MOTO. Tôi có thể giúp bạn:\n\n🚗 Tìm hiểu dịch vụ thuê xe\n💰 Tư vấn giá cả\n📋 Hướng dẫn đặt xe\n📞 Kết nối hỗ trợ\n\nBạn cần giúp gì hôm nay?'
  },
  {
    keywords: ['dịch vụ', 'cung cấp', 'có gì', 'bạn làm gì', 'moto làm gì'],
    response: 'MOTO cung cấp các dịch vụ:\n\n🚗 Cho thuê xe tự lái\n🚙 Cho thuê xe có tài xế\n📅 Thuê xe dài hạn theo tháng\n🛡️ Bảo hiểm toàn diện trong suốt chuyến đi\n🛠️ Hỗ trợ 24/7\n\nBạn quan tâm đến dịch vụ nào?'
  },
  {
    keywords: ['thuê xe', 'đặt xe', 'mướn xe', 'book xe', 'book'],
    response: 'Để thuê xe tại MOTO, bạn thực hiện:\n\n1️⃣ Đăng nhập hoặc đăng ký tài khoản\n2️⃣ Chọn xe phù hợp tại mục "Danh sách xe"\n3️⃣ Chọn ngày nhận & trả xe\n4️⃣ Điền thông tin và xác nhận đặt\n5️⃣ Thanh toán đặt cọc\n\nBạn muốn xem danh sách xe ngay không? 🚗'
  },
  {
    keywords: ['tự lái', 'lái xe', 'tự lái xe'],
    response: 'Dịch vụ thuê xe tự lái tại MOTO:\n\n✅ Không cần tài xế\n✅ Linh hoạt thời gian & lộ trình\n✅ Đa dạng từ xe phổ thông đến cao cấp\n\nYêu cầu:\n📄 CCCD/CMND còn hiệu lực\n🪪 Bằng lái xe phù hợp\n💳 Đặt cọc theo giá trị xe\n\nBạn muốn xem các loại xe có sẵn không?'
  },
  {
    keywords: ['tài xế', 'có tài xế', 'thuê tài xế'],
    response: 'Dịch vụ thuê xe có tài xế:\n\n👨‍✈️ Tài xế chuyên nghiệp, kinh nghiệm\n🗺️ Am hiểu đường địa phương\n⏰ Phục vụ 24/7\n🔒 An toàn tuyệt đối\n\nPhù hợp cho:\n• Đi sân bay, ga tàu\n• Du lịch, tham quan\n• Hội nghị, sự kiện\n\nLiên hệ hotline 1900 1234 để đặt lịch!'
  },
  {
    keywords: ['giá', 'bao nhiêu', 'chi phí', 'phí', 'tiền', 'cost', 'price', 'bảng giá'],
    response: 'Bảng giá tham khảo tại MOTO:\n\n🚗 Xe phổ thông (4-5 chỗ): từ 500.000đ/ngày\n🚙 Xe gia đình (7 chỗ): từ 800.000đ/ngày\n🚐 Xe minivan: từ 1.200.000đ/ngày\n⭐ Xe cao cấp: từ 1.500.000đ/ngày\n🏍️ Xe máy: từ 150.000đ/ngày\n\n💡 Giá có thể thay đổi theo mùa và loại xe cụ thể.'
  },
  {
    keywords: ['đặt cọc', 'cọc', 'deposit', 'hoàn tiền', 'refund'],
    response: 'Chính sách đặt cọc của MOTO:\n\n💰 Đặt cọc 30% tổng giá trị hợp đồng\n✅ Hoàn trả 100% nếu hủy trước 48 giờ\n⚠️ Hoàn trả 50% nếu hủy trong 24-48 giờ\n❌ Không hoàn nếu hủy trong 24 giờ\n\nThắc mắc về đặt cọc? Gọi 1900 1234 để được tư vấn!'
  },
  {
    keywords: ['hủy', 'hủy đơn', 'cancel', 'hủy đặt'],
    response: 'Chính sách hủy đặt xe:\n\n✅ Hủy trước 48h: hoàn tiền 100%\n⚠️ Hủy trong 24-48h: hoàn tiền 50%\n❌ Hủy trong 24h: không hoàn tiền\n\nĐể hủy đặt xe:\n1. Vào mục "Chuyến của tôi"\n2. Chọn đơn cần hủy\n3. Nhấn "Hủy đơn" và xác nhận\n\nCần hỗ trợ? Gọi 1900 1234!'
  },
  {
    keywords: ['bảo hiểm', 'tai nạn', 'sự cố', 'hỏng xe'],
    response: 'Chính sách bảo hiểm tại MOTO:\n\n🛡️ Bảo hiểm xe trong suốt thời gian thuê\n🏥 Bảo hiểm người ngồi xe\n📞 Hỗ trợ 24/7 khi có sự cố\n🔧 Xe thay thế nếu xe hỏng do lỗi kỹ thuật\n\nLưu ý: Không áp dụng nếu vi phạm hợp đồng hoặc lỗi của người thuê.'
  },
  {
    keywords: ['giấy tờ', 'cần gì', 'yêu cầu', 'điều kiện', 'bằng lái'],
    response: 'Giấy tờ cần thiết khi thuê xe:\n\n📄 CCCD/CMND còn hiệu lực\n🪪 Bằng lái xe (hạng phù hợp với loại xe)\n📱 Số điện thoại liên hệ\n\nLưu ý:\n• Bằng lái B2 cho xe dưới 9 chỗ\n• Bằng lái D cho xe 10-16 chỗ\n• Không cho mượn xe cho người khác'
  },
  {
    keywords: ['nhận xe', 'trả xe', 'địa điểm', 'ở đâu', 'lấy xe'],
    response: 'Địa điểm nhận & trả xe:\n\n📍 Bạn có thể chọn địa điểm nhận xe khi đặt\n🚗 Giao xe tận nơi (phí phát sinh tùy khoảng cách)\n🏢 Nhận tại văn phòng MOTO\n\nGiờ làm việc: 7:00 - 21:00 hàng ngày\n📞 Hotline: 1900 1234'
  },
  {
    keywords: ['thanh toán', 'payment', 'trả tiền', 'chuyển khoản', 'momo', 'vnpay', 'tiền mặt'],
    response: 'Phương thức thanh toán tại MOTO:\n\n💵 Tiền mặt khi nhận xe\n🏦 Chuyển khoản ngân hàng\n📱 MoMo\n💳 VNPay\n💳 Thẻ tín dụng/ghi nợ\n\nThanh toán đặt cọc online để giữ xe, phần còn lại thanh toán khi nhận xe.'
  },
  {
    keywords: ['hỗ trợ', 'liên hệ', 'contact', 'hotline', 'gọi', 'email', 'help'],
    response: 'Kết nối với MOTO:\n\n📞 Hotline: 1900 1234 (8:00 - 22:00)\n📧 Email: support@moto.com\n💬 Chat trực tiếp tại đây\n🌐 Website: moto.vn\n\nPhản hồi trong vòng 5 phút trong giờ làm việc!'
  },
  {
    keywords: ['đăng ký', 'đăng kí', 'tạo tài khoản', 'register', 'sign up'],
    response: 'Đăng ký tài khoản MOTO rất đơn giản:\n\n1️⃣ Click "Đăng ký" ở góc trên phải\n2️⃣ Điền thông tin cá nhân\n3️⃣ Xác nhận email\n4️⃣ Bắt đầu thuê xe!\n\n✨ Đăng ký miễn phí, không mất phí thường niên!'
  },
  {
    keywords: ['cho thuê xe', 'đăng xe', 'chủ xe', 'kiếm tiền', 'thu nhập'],
    response: 'Đăng ký cho thuê xe với MOTO:\n\n1️⃣ Đăng ký tài khoản chủ xe\n2️⃣ Xác thực giấy tờ và xe\n3️⃣ Đăng tải thông tin & ảnh xe\n4️⃣ Bắt đầu nhận đặt xe!\n\n💰 Thu nhập trung bình 15-30 triệu/tháng\n🛡️ Bảo hiểm xe được MOTO hỗ trợ\n\nLiên hệ 1900 1234 để biết thêm!'
  },
  {
    keywords: ['cảm ơn', 'thanks', 'thank you', 'ok', 'được rồi', 'oke'],
    response: 'Không có gì! 😊 MOTO luôn sẵn sàng hỗ trợ bạn. Nếu có thêm câu hỏi, đừng ngần ngại hỏi nhé!\n\n🚗 Chúc bạn có chuyến đi vui vẻ!'
  },
];

// ─── Xử lý tin nhắn bot ───────────────────────────────────────────────────────
const processBotMessage = async (message) => {
  const lower = message.toLowerCase().trim();

  // Tính điểm khớp cho từng entry trong knowledge base
  let bestMatch = null;
  let bestScore = 0;

  for (const entry of knowledgeBase) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        // Keyword dài hơn → điểm cao hơn (tránh match quá chung)
        score += keyword.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  // Có match → trả lời theo knowledge base
  if (bestMatch && bestScore > 0) {
    return bestMatch.response;
  }

  // Không match → trả lời động dựa theo nội dung
  if (lower.includes('?') || lower.endsWith('?')) {
    return 'Câu hỏi hay đó! 🤔 Tôi chưa có thông tin về vấn đề này. Bạn có thể:\n\n📞 Gọi hotline 1900 1234\n📧 Email support@moto.com\n\nĐội ngũ MOTO sẽ hỗ trợ bạn ngay!';
  }

  // Fallback thông minh — gợi ý chủ đề
  return 'Tôi hiểu bạn đang hỏi về "' + message.slice(0, 30) + (message.length > 30 ? '...' : '') + '". ' +
    'Để hỗ trợ tốt hơn, bạn có thể hỏi về:\n\n' +
    '• 🚗 Dịch vụ và giá thuê xe\n' +
    '• 📋 Cách đặt xe và giấy tờ cần thiết\n' +
    '• 💰 Chính sách đặt cọc và hủy đơn\n' +
    '• 📞 Liên hệ hỗ trợ\n\n' +
    'Hoặc gọi trực tiếp hotline 1900 1234!';
};

module.exports = {
  getOrCreateSession,
  saveMessage,
  getChatHistory,
  processBotMessage
};