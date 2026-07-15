import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, ChevronLeft, ChevronRight, Eye,
  Edit2, UserCheck, UserX, Shield, User,
  X, Check, AlertCircle, Mail, Phone, Calendar
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────────────────────
interface UserItem {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

// ─── Hằng số ─────────────────────────────────────────────────────────────────
const ROLE_MAP = {
  admin: { label: 'Admin', className: 'bg-purple-100 text-purple-700' },
  user:  { label: 'Người dùng', className: 'bg-blue-100 text-blue-700' },
};

const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const fmtFull = (d?: string) => d ? new Date(d).toLocaleString('vi-VN') : '—';

// ─── Component chính ──────────────────────────────────────────────────────────
const AdminUsers: React.FC = () => {
  const [users, setUsers]           = useState<UserItem[]>([]);
  const [loading, setLoading]       = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch]         = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Modal
  const [modal, setModal]           = useState<'none' | 'view' | 'edit' | 'toggle'>('none');
  const [selected, setSelected]     = useState<UserItem | null>(null);
  const [editData, setEditData]     = useState({ fullName: '', phone: '', address: '', role: 'user' as 'user' | 'admin' });
  const [actionLoading, setActionLoading] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 10 };
      if (search) params.search = search;
      if (filterRole) params.role = filterRole;
      const res = await api.get('/admin/users', { params });
      setUsers(res.data.data);
      setPagination({
        page: res.data.pagination.page,
        totalPages: res.data.pagination.totalPages,
        total: res.data.pagination.total,
      });
    } catch {
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [search, filterRole]);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  // ── Modal helpers ────────────────────────────────────────────────────────
  const openView = (u: UserItem) => { setSelected(u); setModal('view'); };

  const openEdit = (u: UserItem) => {
    setSelected(u);
    setEditData({ fullName: u.fullName, phone: u.phone || '', address: u.address || '', role: u.role });
    setModal('edit');
  };

  const openToggle = (u: UserItem) => { setSelected(u); setModal('toggle'); };
  const closeModal = () => { setModal('none'); setSelected(null); };

  // ── Cập nhật thông tin ───────────────────────────────────────────────────
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setActionLoading(true);
    try {
      await api.put(`/admin/users/${selected._id}`, editData);
      toast.success('Cập nhật thành công');
      closeModal();
      fetchUsers(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Khoá / mở khoá tài khoản ────────────────────────────────────────────
  const handleToggleActive = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await api.put(`/admin/users/${selected._id}`, { isActive: !selected.isActive });
      toast.success(selected.isActive ? 'Đã khoá tài khoản' : 'Đã mở khoá tài khoản');
      closeModal();
      fetchUsers(pagination.page);
    } catch {
      toast.error('Không thể thực hiện thao tác');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
        <p className="text-sm text-gray-500 mt-1">Tổng cộng {pagination.total} tài khoản</p>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, username..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả vai trò</option>
          <option value="user">Người dùng</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Bảng */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <User size={32} className="animate-pulse mr-3" /> Đang tải...
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <User size={48} className="mb-3 opacity-30" />
            <p>Không có người dùng nào</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Người dùng</th>
                <th className="px-4 py-3 text-left">Liên hệ</th>
                <th className="px-4 py-3 text-left">Vai trò</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left">Ngày tạo</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => {
                const role = ROLE_MAP[u.role] || ROLE_MAP.user;
                return (
                  <tr key={u._id} className="hover:bg-gray-50 transition">
                    {/* Avatar + tên */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {u.avatar
                            ? <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                            : <span className="text-blue-600 font-semibold text-sm">
                                {u.fullName?.charAt(0)?.toUpperCase()}
                              </span>
                          }
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.fullName}</p>
                          <p className="text-xs text-gray-400">@{u.username}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email + SĐT */}
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{u.email}</p>
                      <p className="text-xs text-gray-400">{u.phone || '—'}</p>
                    </td>

                    {/* Vai trò */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${role.className}`}>
                        {role.label}
                      </span>
                    </td>

                    {/* Trạng thái */}
                    <td className="px-4 py-3">
                      {u.isActive
                        ? <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                            Hoạt động
                          </span>
                        : <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                            Đã khoá
                          </span>
                      }
                    </td>

                    {/* Ngày tạo */}
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmt(u.createdAt)}</td>

                    {/* Thao tác */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openView(u)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="Xem">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => openEdit(u)}
                          className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition" title="Sửa">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => openToggle(u)}
                          className={`p-1.5 rounded transition ${u.isActive
                            ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                          title={u.isActive ? 'Khoá tài khoản' : 'Mở khoá'}
                        >
                          {u.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
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
            <p className="text-sm text-gray-500">Trang {pagination.page} / {pagination.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => fetchUsers(pagination.page - 1)} disabled={pagination.page === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => fetchUsers(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Xem chi tiết ───────────────────────────────────────────── */}
      {modal === 'view' && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-lg">Chi tiết người dùng</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-5">
              {/* Avatar + tên lớn */}
              <div className="flex flex-col items-center mb-5">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden mb-3">
                  {selected.avatar
                    ? <img src={selected.avatar} alt="" className="w-full h-full object-cover" />
                    : <span className="text-3xl font-bold text-blue-600">
                        {selected.fullName?.charAt(0)?.toUpperCase()}
                      </span>
                  }
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{selected.fullName}</h3>
                <p className="text-gray-400 text-sm">@{selected.username}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_MAP[selected.role]?.className}`}>
                    {ROLE_MAP[selected.role]?.label}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${selected.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {selected.isActive ? 'Hoạt động' : 'Đã khoá'}
                  </span>
                </div>
              </div>

              {/* Thông tin chi tiết */}
              <div className="space-y-3 text-sm">
                {[
                  { icon: Mail, label: 'Email', value: selected.email },
                  { icon: Phone, label: 'Số điện thoại', value: selected.phone || '—' },
                  { icon: User, label: 'Địa chỉ', value: selected.address || '—' },
                  { icon: Calendar, label: 'Ngày tạo', value: fmtFull(selected.createdAt) },
                  { icon: Calendar, label: 'Đăng nhập lần cuối', value: fmtFull(selected.lastLogin) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Icon size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-400 text-xs">{label}</p>
                      <p className="text-gray-800 font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 border-t flex gap-3">
              <button onClick={() => { closeModal(); openEdit(selected); }}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                <Edit2 size={15} /> Chỉnh sửa
              </button>
              <button onClick={closeModal}
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Chỉnh sửa ──────────────────────────────────────────────── */}
      {modal === 'edit' && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-lg">Chỉnh sửa người dùng</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleEdit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên</label>
                <input value={editData.fullName} onChange={e => setEditData(p => ({ ...p, fullName: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
                <input value={editData.phone} onChange={e => setEditData(p => ({ ...p, phone: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Địa chỉ</label>
                <input value={editData.address} onChange={e => setEditData(p => ({ ...p, address: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Shield size={14} /> Vai trò
                </label>
                <select value={editData.role} onChange={e => setEditData(p => ({ ...p, role: e.target.value as 'user' | 'admin' }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="user">Người dùng</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium text-sm">
                  <Check size={16} /> {actionLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button type="button" onClick={closeModal}
                  className="px-5 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Khoá / Mở khoá ────────────────────────────────────────── */}
      {modal === 'toggle' && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${selected.isActive ? 'bg-red-100' : 'bg-green-100'}`}>
              <AlertCircle size={28} className={selected.isActive ? 'text-red-500' : 'text-green-600'} />
            </div>
            <h2 className="font-bold text-lg mb-2">
              {selected.isActive ? 'Khoá tài khoản?' : 'Mở khoá tài khoản?'}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {selected.isActive
                ? <>Tài khoản <span className="font-semibold text-gray-700">"{selected.fullName}"</span> sẽ bị khoá và không thể đăng nhập.</>
                : <>Tài khoản <span className="font-semibold text-gray-700">"{selected.fullName}"</span> sẽ được mở khoá và có thể đăng nhập lại.</>
              }
            </p>
            <div className="flex gap-3">
              <button onClick={handleToggleActive} disabled={actionLoading}
                className={`flex-1 py-2.5 rounded-lg text-white font-medium text-sm disabled:opacity-50 transition ${selected.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                {actionLoading ? 'Đang xử lý...' : selected.isActive ? 'Khoá tài khoản' : 'Mở khoá'}
              </button>
              <button onClick={closeModal}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;