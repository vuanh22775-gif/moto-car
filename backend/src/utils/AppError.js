// Lớp Error có kèm mã HTTP status.
// Trước đây các service throw `new Error(...)` thông thường, khiến middleware xử lý lỗi
// trong server.js (dùng err.status) luôn mặc định trả về 500 Internal Server Error
// cho MỌI lỗi nghiệp vụ (VD: sai mật khẩu, email đã tồn tại, không có quyền, không tìm thấy...).
// Điều này khiến frontend không thể phân biệt lỗi client (400/401/403/404) với lỗi server thật sự.
class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;