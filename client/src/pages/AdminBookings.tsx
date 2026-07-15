import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, ChevronLeft, ChevronRight, Eye, X,
  Calendar, Car, User, Phone, MapPin, Clock, AlertCircle
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

// ─── Types ──────────────────────────────────────────────────────────────────
interface BookingUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
}

interface BookingVehicle {
  _id: string;
  name: string;
  licensePlate: string;
  images: string[];
  type: string;
}

interface Booking {
  _id: string;
  user: BookingUser;
  vehicle: BookingVehicle;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  totalDays: number;
  totalPrice: number;
  deposit: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  pickupLocation: string;
  returnLocation: string;
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
}

// ─── Hằng số ────────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; className: string }> = {
  pending:   { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Đã xác nhận',  className: 'bg-blue-100 text-blue-700' },
  active:    { label: 'Đang thuê',     className: 'bg-green-100 text-green-700' },
  completed: { label: 'Hoàn thành',   className: 'bg-gray-100 text-gray-700' },
  cancelled: { label: 'Đã hủy',       className: 'bg-red-100 text-red-600' },
  rejected:  { label: 'Từ chối',      className: 'bg-red-100 text-red-600' },
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash: 'Tiền mặt', credit_card: 'Thẻ tín dụng',
  bank_transfer: 'Chuyển khoản', momo: 'MoMo',
  zalopay: 'ZaloPay', vnpay: 'VNPay',
};

const NEXT_STATUSES: Record<string, { value: string; label: string; className: string }[]> = {
  pending:   [
    { value: 'confirmed', label: 'Xác nhận',  className: 'bg-blue-600 hover:bg-blue-700 text-white' },
    { value: 'rejected',  label: 'Từ chối',   className: 'bg-red-600 hover:bg-red-700 text-white' },
  ],
  confirmed: [
    { value: 'active',    label: 'Bàn giao xe', className: 'bg-green-600 hover:bg-green-700 text-white' },
    { value: 'cancelled', label: 'Hủy',        className: 'bg-red-600 hover:bg-red-700 text-white' },
  ],
  active:    [
    { value: 'completed', label: 'Hoàn thành', className: 'bg-gray-700 hover:bg-gray-800 text-white' },
  ],
};

const fmt = (d: string) => new Date(d).toLocaleDateString('vi-VN');
const fmtMoney = (n: number) => n?.toLocaleString('vi-VN') + '₫';

// ─── Component chính ─────────────────────────────────────────────────────────
const AdminBookings: React.FC = () => {
  const [bookings, setBookings]       = useState<Booking[]>([]);
  const [loading, setLoading]         = useState(false);
  const [pagination, setPagination]   = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [selected, setSelected]       = useState<Booking | null>(null);
  const [modal, setModal]             = useState<'none' | 'view' | 'status'>('none');
  const [newStatus, setNewStatus]     = useState('');
  const [reason, setReason]           = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchBookings = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 10 };
      if (filterStatus) params.status = filterStatus;
      if (search) params.search = search;

      const res = await api.get('/admin/bookings', { params });
      setBookings(res.data.data);
      setPagination({
        page: res.data.pagination.page,
        totalPages: res.data.pagination.totalPages,
        total: res.data.pagination.total,
      });
    } catch {
      toast.error('Không thể tải danh sách đặt xe');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search]);

  useEffect(() => { fetchBookings(1); }, [fetchBookings]);

  // ── Actions ────────────────────────────────────────────────────────────
  const openView = (b: Booking) => { setSelected(b); setModal('view'); };

  const openStatus = (b: Booking, status: string) => {
    setSelected(b);
    setNewStatus(status);
    setReason('');
    setModal('status');
  };

  const closeModal = () => { setModal('none'); setSelected(null); setReason(''); };

  const handleUpdateStatus = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await api.put(`/admin/bookings/${selected._id}/status`, {
        status: newStatus,
        reason,
      });
      toast.success('Cập nhật trạng thái thành công');
      closeModal();
      fetchBookings(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(false);
    }
  };

  const needsReason = newStatus === 'cancelled' || newStatus === 'rejected';

  // ── Render ─────────────────────────────────────────────────────────────
  // Đơn pending tạo trong vòng 1 giờ = "mới"
  const newBookings = bookings.filter(b => {
    if (b.status !== 'pending') return false;
    const diff = Date.now() - new Date(b.createdAt).getTime();
    return diff < 60 * 60 * 1000; // 1 giờ
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đặt xe</h1>
          <p className="text-sm text-gray-500 mt-1">Tổng cộng {pagination.total} đơn</p>
        </div>
      </div>

      {/* ── Banner đơn mới ── */}
      {newBookings.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-700 font-semibold text-sm">
              {newBookings.length} đơn đặt xe mới trong 1 giờ qua!
            </p>
            <p className="text-red-500 text-xs mt-0.5">Hãy xác nhận sớm để khách không phải chờ lâu.</p>
          </div>
          <button
            onClick={() => setFilterStatus('pending')}
            className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition font-medium flex-shrink-0"
          >
            Xem ngay
          </button>
        </div>
      )}

      {/* Bộ lọc */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên khách, xe..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_MAP).map(([v, { label }]) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </select>
      </div>

      {/* Bảng */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Calendar size={32} className="animate-pulse mr-3" /> Đang tải...
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Calendar size={48} className="mb-3 opacity-30" />
            <p>Không có đơn đặt xe nào</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Khách hàng</th>
                <th className="px-4 py-3 text-left">Xe</th>
                <th className="px-4 py-3 text-left">Thời gian</th>
                <th className="px-4 py-3 text-left">Tổng tiền</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map(b => {
                const st = STATUS_MAP[b.status] || STATUS_MAP.pending;
                const nextActions = NEXT_STATUSES[b.status] || [];
                const isNew = b.status === 'pending' && (Date.now() - new Date(b.createdAt).getTime()) < 60 * 60 * 1000;
                return (
                  <tr key={b._id} className={`hover:bg-gray-50 transition ${isNew ? 'bg-red-50/40' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div>
                          <p className="font-medium text-gray-900">{b.user?.fullName}</p>
                          <p className="text-xs text-gray-400">{b.user?.phone}</p>
                        </div>
                        {isNew && (
                          <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold animate-pulse">
                            MỚI
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-8 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                          {b.vehicle?.images?.[0]
                            ? <img src={b.vehicle.images[0]} alt="" className="w-full h-full object-cover" />
                            : <Car size={14} className="m-auto mt-1.5 text-gray-400" />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{b.vehicle?.name}</p>
                          <p className="text-xs text-gray-400">{b.vehicle?.licensePlate}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <p>{fmt(b.startDate)} → {fmt(b.endDate)}</p>
                      <p className="text-xs text-gray-400">{b.totalDays} ngày</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {fmtMoney(b.totalPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${st.className}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        <button
                          onClick={() => openView(b)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        {nextActions.map(action => (
                          <button
                            key={action.value}
                            onClick={() => openStatus(b, action.value)}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition ${action.className}`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Phân trang */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Trang {pagination.page} / {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchBookings(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => fetchBookings(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Xem chi tiết ───────────────────────────────────────────── */}
      {modal === 'view' && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-bold text-lg">Chi tiết đơn đặt xe</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Trạng thái */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_MAP[selected.status]?.className}`}>
                  {STATUS_MAP[selected.status]?.label}
                </span>
                <span className="text-sm text-gray-400">
                  Đặt lúc {new Date(selected.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>

              {/* Thông tin xe */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-medium mb-3 flex items-center gap-1.5">
                  <Car size={13} /> Thông tin xe
                </p>
                <div className="flex gap-4">
                  {selected.vehicle?.images?.[0] && (
                    <img src={selected.vehicle.images[0]} alt=""
                      className="w-24 h-18 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-gray-900">{selected.vehicle?.name}</p>
                    <p className="text-gray-500">Biển số: {selected.vehicle?.licensePlate}</p>
                    <p className="text-gray-500">Loại: {selected.vehicle?.type === 'car' ? 'Ô tô' : 'Xe máy'}</p>
                  </div>
                </div>
              </div>

              {/* Thông tin khách */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-medium mb-3 flex items-center gap-1.5">
                  <User size={13} /> Thông tin khách hàng
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <User size={14} className="text-gray-400" />
                    {selected.user?.fullName}
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone size={14} className="text-gray-400" />
                    {selected.user?.phone}
                  </div>
                  <div className="col-span-2 flex items-center gap-2 text-gray-700">
                    <span className="text-gray-400 text-xs">@</span>
                    {selected.user?.email}
                  </div>
                </div>
              </div>

              {/* Thời gian & địa điểm */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-medium mb-3 flex items-center gap-1.5">
                  <Clock size={13} /> Thời gian & Địa điểm
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Ngày nhận</p>
                    <p className="font-medium">{fmt(selected.startDate)} {selected.startTime}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Ngày trả</p>
                    <p className="font-medium">{fmt(selected.endDate)} {selected.endTime}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1 flex items-center gap-1"><MapPin size={11} /> Địa điểm nhận</p>
                    <p className="font-medium">{selected.pickupLocation}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1 flex items-center gap-1"><MapPin size={11} /> Địa điểm trả</p>
                    <p className="font-medium">{selected.returnLocation}</p>
                  </div>
                </div>
              </div>

              {/* Thanh toán */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-medium mb-3">Thanh toán</p>
                <div className="space-y-2 text-sm">
                  {[
                    ['Số ngày thuê', `${selected.totalDays} ngày`],
                    ['Phương thức', PAYMENT_METHOD_LABEL[selected.paymentMethod] || selected.paymentMethod],
                    ['Đặt cọc', fmtMoney(selected.deposit)],
                    ['Tổng tiền', fmtMoney(selected.totalPrice)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-gray-500">{k}</span>
                      <span className={`font-medium ${k === 'Tổng tiền' ? 'text-blue-600 text-base' : 'text-gray-800'}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ghi chú / Lý do hủy */}
              {selected.notes && (
                <div className="text-sm">
                  <p className="text-gray-500 mb-1">Ghi chú</p>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-3">{selected.notes}</p>
                </div>
              )}
              {selected.cancellationReason && (
                <div className="text-sm">
                  <p className="text-gray-500 mb-1">Lý do hủy/từ chối</p>
                  <p className="text-red-600 bg-red-50 rounded-lg p-3">{selected.cancellationReason}</p>
                </div>
              )}
            </div>

            {/* Actions từ modal xem */}
            {(NEXT_STATUSES[selected.status] || []).length > 0 && (
              <div className="p-6 border-t flex gap-3">
                {(NEXT_STATUSES[selected.status] || []).map(action => (
                  <button
                    key={action.value}
                    onClick={() => { closeModal(); openStatus(selected, action.value); }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${action.className}`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal Xác nhận đổi trạng thái ──────────────────────────────── */}
      {modal === 'status' && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle size={24} className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Xác nhận thay đổi</h2>
                <p className="text-sm text-gray-500">
                  Chuyển sang: <span className={`font-medium px-1.5 py-0.5 rounded text-xs ${STATUS_MAP[newStatus]?.className}`}>
                    {STATUS_MAP[newStatus]?.label}
                  </span>
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Đơn của <span className="font-semibold">{selected.user?.fullName}</span> — xe{' '}
              <span className="font-semibold">{selected.vehicle?.name}</span>
            </p>

            {needsReason && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Lý do {newStatus === 'cancelled' ? 'hủy' : 'từ chối'} *
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Nhập lý do..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleUpdateStatus}
                disabled={actionLoading || (needsReason && !reason.trim())}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium text-sm"
              >
                {actionLoading ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
              <button
                onClick={closeModal}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;