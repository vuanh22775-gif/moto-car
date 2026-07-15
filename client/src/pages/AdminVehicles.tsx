import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Edit2, Trash2, Eye,
  ChevronLeft, ChevronRight, Car, AlertCircle, X, Check
} from 'lucide-react';
import {
  adminGetVehicles,
  adminCreateVehicle,
  adminUpdateVehicle,
  adminDeleteVehicle,
  type VehicleFormData
} from '../services/adminVehicleService';
import type { Vehicle } from '../types';
import ImageUploader from '../components/ImageUploader';
import toast from 'react-hot-toast';

// ─── Hằng số ────────────────────────────────────────────────────────────────
const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  approved:  { label: 'Đã duyệt',         className: 'bg-green-100 text-green-700' },
  pending:   { label: 'Chờ duyệt',        className: 'bg-yellow-100 text-yellow-700' },
  rejected:  { label: 'Từ chối',          className: 'bg-red-100 text-red-700' },
  inactive:  { label: 'Không hoạt động',  className: 'bg-gray-100 text-gray-600' },
};

const EMPTY_FORM: VehicleFormData = {
  name: '', type: 'car', brand: '', model: '', year: new Date().getFullYear(),
  licensePlate: '', pricePerDay: 0, pricePerHour: 0, deposit: 0,
  description: '', images: [''], features: [],
  status: 'pending',
  specifications: { seats: 4, transmission: 'Số tự động', fuelType: 'Xăng', engine: '', color: '', mileage: 0, weight: 0, consumption: '' },
  location: { address: '', city: '', district: '', ward: '' },
};

// ─── Component chính ─────────────────────────────────────────────────────────
const AdminVehicles: React.FC = () => {
  const [vehicles, setVehicles]       = useState<Vehicle[]>([]);
  const [loading, setLoading]         = useState(false);
  const [pagination, setPagination]   = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType]   = useState('');
  const [filterSource, setFilterSource] = useState(''); // 'admin' | 'user' | ''

  // Modal states
  const [modal, setModal]             = useState<'none' | 'create' | 'edit' | 'delete' | 'view'>('none');
  const [selectedVehicle, setSelected] = useState<Vehicle | null>(null);
  const [formData, setFormData]       = useState<VehicleFormData>(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);

  // ── Fetch danh sách xe ──────────────────────────────────────────────────
  const fetchVehicles = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminGetVehicles({
        page, limit: 10,
        search: search || undefined,
        status: filterStatus || undefined,
        type: filterType || undefined,
        source: filterSource || undefined,
      });
      setVehicles(res.data);
      setPagination({
        page: res.pagination.page,
        totalPages: res.pagination.totalPages,
        total: res.pagination.total,
      });
    } catch {
      toast.error('Không thể tải danh sách xe');
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterType, filterSource]);

  useEffect(() => { fetchVehicles(1); }, [fetchVehicles]);

  // ── Mở modal ────────────────────────────────────────────────────────────
  const openCreate = () => {
    setFormData(EMPTY_FORM);
    setSelected(null);
    setModal('create');
  };

  const openEdit = async (vehicle: Vehicle) => {
    setSelected(vehicle);
    // Map Vehicle → VehicleFormData
    setFormData({
      name: vehicle.name,
      type: vehicle.type,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      pricePerDay: vehicle.pricePerDay,
      pricePerHour: vehicle.pricePerHour,
      deposit: vehicle.deposit,
      description: vehicle.description,
      images: vehicle.images?.length ? vehicle.images : [''],
      features: vehicle.features || [],
      status: vehicle.status,
      specifications: { ...EMPTY_FORM.specifications, ...vehicle.specifications },
      location: { ...EMPTY_FORM.location, ...vehicle.location },
    });
    setModal('edit');
  };

  const openView = (vehicle: Vehicle) => { setSelected(vehicle); setModal('view'); };
  const openDelete = (vehicle: Vehicle) => { setSelected(vehicle); setModal('delete'); };
  const closeModal = () => { setModal('none'); setSelected(null); };

  // ── Submit tạo/sửa ──────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        images: formData.images.filter(Boolean),
      };
      if (modal === 'create') {
        await adminCreateVehicle(payload);
        toast.success('Thêm xe thành công');
      } else if (modal === 'edit' && selectedVehicle) {
        await adminUpdateVehicle((selectedVehicle as any)._id || selectedVehicle.id, payload);
        toast.success('Cập nhật xe thành công');
      }
      closeModal();
      fetchVehicles(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Xóa xe ──────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!selectedVehicle) return;
    setFormLoading(true);
    try {
      await adminDeleteVehicle((selectedVehicle as any)._id || selectedVehicle.id);
      toast.success('Xóa xe thành công');
      closeModal();
      fetchVehicles(pagination.page);
    } catch {
      toast.error('Không thể xóa xe');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Helpers form ─────────────────────────────────────────────────────────
  const setField = (path: string, value: any) => {
    setFormData((prev: VehicleFormData) => {
      const next = { ...prev };
      const keys = path.split('.');
      let obj: any = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]] = { ...obj[keys[i]] };
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────
  const pendingUserVehicles = vehicles.filter(v => v.status === 'pending' && (v as any).createdBy?.role === 'user');

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý xe</h1>
          <p className="text-sm text-gray-500 mt-1">Tổng cộng {pagination.total} xe</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} /> Thêm xe mới
        </button>
      </div>

      {/* ── Banner cảnh báo xe user chờ duyệt ── */}
      {pendingUserVehicles.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-700 font-semibold text-sm">
              {pendingUserVehicles.length} xe của người dùng đang chờ xử lý!
            </p>
            <p className="text-red-500 text-xs mt-0.5">Hãy duyệt hoặc từ chối để chủ xe biết kết quả.</p>
          </div>
          <button
            onClick={() => { setFilterStatus('pending'); setFilterSource('user'); }}
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
            placeholder="Tìm theo tên, biển số..."
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
          <option value="approved">Đã duyệt</option>
          <option value="pending">Chờ duyệt</option>
          <option value="rejected">Từ chối</option>
          <option value="inactive">Không hoạt động</option>
        </select>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả loại xe</option>
          <option value="car">Ô tô</option>
          <option value="motorbike">Xe máy</option>
        </select>
        {/* Filter nguồn xe */}
        <select
          value={filterSource}
          onChange={e => setFilterSource(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả nguồn</option>
          <option value="admin">Admin thêm</option>
          <option value="user">User đăng</option>
        </select>
      </div>

      {/* Bảng danh sách */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Car size={32} className="animate-pulse mr-3" /> Đang tải...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Car size={48} className="mb-3 opacity-30" />
            <p>Không có xe nào</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Xe</th>
                <th className="px-4 py-3 text-left">Chủ xe</th>
                <th className="px-4 py-3 text-left">Giá/ngày</th>
                <th className="px-4 py-3 text-left">Đánh giá</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vehicles.map(v => {
                const st = STATUS_LABEL[v.status] || STATUS_LABEL.pending;
                const owner = (v as any).createdBy;
                const isUserVehicle = owner?.role === 'user';
                const isNewPending = v.status === 'pending' && isUserVehicle;
                return (
                  <tr key={(v as any)._id || v.id}
                    className={`hover:bg-gray-50 transition ${isNewPending ? 'bg-red-50/40' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {v.images?.[0]
                            ? <img src={v.images[0]} alt={v.name} className="w-full h-full object-cover" />
                            : <Car size={20} className="m-auto mt-2 text-gray-400" />
                          }
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-gray-900">{v.name}</p>
                            {isNewPending && (
                              <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold animate-pulse">
                                MỚI
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">{v.licensePlate}</p>
                        </div>
                      </div>
                    </td>
                    {/* Cột chủ xe */}
                    <td className="px-4 py-3">
                      {owner ? (
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              isUserVehicle ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                            }`}>
                              {isUserVehicle ? 'USER' : 'ADMIN'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 mt-0.5">{owner.fullName}</p>
                          <p className="text-xs text-gray-400">{owner.email}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {v.pricePerDay?.toLocaleString('vi-VN')}₫
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      ⭐ {v.rating?.average?.toFixed(1) || '0.0'} ({v.rating?.count || 0})
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${st.className}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openView(v)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="Xem">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => openEdit(v)} className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded transition" title="Sửa">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => openDelete(v)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition" title="Xóa">
                          <Trash2 size={16} />
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
            <p className="text-sm text-gray-500">
              Trang {pagination.page} / {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchVehicles(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => fetchVehicles(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Tạo / Sửa ─────────────────────────────────────────────── */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">
                {modal === 'create' ? 'Thêm xe mới' : 'Chỉnh sửa xe'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Thông tin cơ bản */}
              <section>
                <h3 className="font-semibold text-gray-700 mb-3">Thông tin cơ bản</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="label">Tên xe *</label>
                    <input required value={formData.name} onChange={e => setField('name', e.target.value)}
                      className="input" placeholder="VD: Toyota Camry 2022" />
                  </div>
                  <div>
                    <label className="label">Loại xe *</label>
                    <select required value={formData.type} onChange={e => setField('type', e.target.value)} className="input">
                      <option value="car">Ô tô</option>
                      <option value="motorbike">Xe máy</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Trạng thái</label>
                    <select value={formData.status} onChange={e => setField('status', e.target.value)} className="input">
                      <option value="pending">Chờ duyệt</option>
                      <option value="approved">Đã duyệt</option>
                      <option value="rejected">Từ chối</option>
                      <option value="inactive">Không hoạt động</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Thương hiệu *</label>
                    <input required value={formData.brand} onChange={e => setField('brand', e.target.value)}
                      className="input" placeholder="Toyota, Honda..." />
                  </div>
                  <div>
                    <label className="label">Model *</label>
                    <input required value={formData.model} onChange={e => setField('model', e.target.value)}
                      className="input" placeholder="Camry, Civic..." />
                  </div>
                  <div>
                    <label className="label">Năm sản xuất *</label>
                    <input required type="number" min={1990} max={new Date().getFullYear() + 1}
                      value={formData.year} onChange={e => setField('year', parseInt(e.target.value))} className="input" />
                  </div>
                  <div>
                    <label className="label">Biển số *</label>
                    <input required value={formData.licensePlate} onChange={e => setField('licensePlate', e.target.value)}
                      className="input" placeholder="51G-123.45" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Mô tả *</label>
                    <textarea required rows={3} value={formData.description}
                      onChange={e => setField('description', e.target.value)}
                      className="input resize-none" placeholder="Mô tả chi tiết về xe..." />
                  </div>
                </div>
              </section>

              {/* Giá */}
              <section>
                <h3 className="font-semibold text-gray-700 mb-3">Giá thuê & đặt cọc</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Giá/ngày (₫) *</label>
                    <input required type="number" min={0} value={formData.pricePerDay}
                      onChange={e => setField('pricePerDay', parseInt(e.target.value))} className="input" />
                  </div>
                  <div>
                    <label className="label">Giá/giờ (₫)</label>
                    <input type="number" min={0} value={formData.pricePerHour}
                      onChange={e => setField('pricePerHour', parseInt(e.target.value))} className="input" />
                  </div>
                  <div>
                    <label className="label">Đặt cọc (₫)</label>
                    <input type="number" min={0} value={formData.deposit}
                      onChange={e => setField('deposit', parseInt(e.target.value))} className="input" />
                  </div>
                </div>
              </section>

              {/* Thông số kỹ thuật */}
              <section>
                <h3 className="font-semibold text-gray-700 mb-3">Thông số kỹ thuật</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="label">Số chỗ</label>
                    <input type="number" min={1} value={formData.specifications.seats}
                      onChange={e => setField('specifications.seats', parseInt(e.target.value))} className="input" />
                  </div>
                  <div>
                    <label className="label">Hộp số</label>
                    <select value={formData.specifications.transmission}
                      onChange={e => setField('specifications.transmission', e.target.value)} className="input">
                      <option>Số tự động</option>
                      <option>Số sàn</option>
                      <option>Tay ga</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Nhiên liệu</label>
                    <select value={formData.specifications.fuelType}
                      onChange={e => setField('specifications.fuelType', e.target.value)} className="input">
                      <option>Xăng</option>
                      <option>Dầu</option>
                      <option>Điện</option>
                      <option>Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Màu sắc</label>
                    <input value={formData.specifications.color}
                      onChange={e => setField('specifications.color', e.target.value)}
                      className="input" placeholder="Trắng, Đen..." />
                  </div>
                  <div>
                    <label className="label">Động cơ</label>
                    <input value={formData.specifications.engine}
                      onChange={e => setField('specifications.engine', e.target.value)}
                      className="input" placeholder="2.0L, 1.5T..." />
                  </div>
                  <div>
                    <label className="label">Mức tiêu hao</label>
                    <input value={formData.specifications.consumption}
                      onChange={e => setField('specifications.consumption', e.target.value)}
                      className="input" placeholder="7L/100km" />
                  </div>
                  <div>
                    <label className="label">Số km đã đi</label>
                    <input type="number" min={0} value={formData.specifications.mileage}
                      onChange={e => setField('specifications.mileage', parseInt(e.target.value))} className="input" />
                  </div>
                </div>
              </section>

              {/* Địa điểm */}
              <section>
                <h3 className="font-semibold text-gray-700 mb-3">Địa điểm</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="label">Địa chỉ *</label>
                    <input required value={formData.location.address}
                      onChange={e => setField('location.address', e.target.value)}
                      className="input" placeholder="Số nhà, tên đường" />
                  </div>
                  <div>
                    <label className="label">Thành phố *</label>
                    <input required value={formData.location.city}
                      onChange={e => setField('location.city', e.target.value)}
                      className="input" placeholder="Hà Nội, TP.HCM..." />
                  </div>
                  <div>
                    <label className="label">Quận/Huyện *</label>
                    <input required value={formData.location.district}
                      onChange={e => setField('location.district', e.target.value)}
                      className="input" placeholder="Quận 1, Hoàn Kiếm..." />
                  </div>
                  <div>
                    <label className="label">Phường/Xã</label>
                    <input value={formData.location.ward}
                      onChange={e => setField('location.ward', e.target.value)}
                      className="input" placeholder="Phường Bến Nghé..." />
                  </div>
                </div>
              </section>

              {/* Ảnh */}
              <section>
                <h3 className="font-semibold text-gray-700 mb-3">Ảnh xe *</h3>
                <ImageUploader
                  images={formData.images.filter(Boolean)}
                  onChange={urls => setFormData(p => ({ ...p, images: urls }))}
                  maxImages={10}
                />
              </section>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={formLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium">
                  <Check size={18} />
                  {formLoading ? 'Đang lưu...' : modal === 'create' ? 'Thêm xe' : 'Lưu thay đổi'}
                </button>
                <button type="button" onClick={closeModal}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Xem chi tiết ───────────────────────────────────────────── */}
      {modal === 'view' && selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-lg">{selectedVehicle.name}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto text-sm">
              {selectedVehicle.images?.[0] && (
                <img src={selectedVehicle.images[0]} alt={selectedVehicle.name}
                  className="w-full h-48 object-cover rounded-xl mb-4" />
              )}
              {[
                ['Loại xe', selectedVehicle.type === 'car' ? 'Ô tô' : 'Xe máy'],
                ['Thương hiệu', selectedVehicle.brand],
                ['Model', selectedVehicle.model],
                ['Năm SX', String(selectedVehicle.year)],
                ['Biển số', selectedVehicle.licensePlate],
                ['Giá/ngày', `${selectedVehicle.pricePerDay?.toLocaleString('vi-VN')}₫`],
                ['Đặt cọc', `${selectedVehicle.deposit?.toLocaleString('vi-VN')}₫`],
                ['Thành phố', selectedVehicle.location?.city],
                ['Địa chỉ', selectedVehicle.location?.address],
                ['Đánh giá', `⭐ ${selectedVehicle.rating?.average?.toFixed(1)} (${selectedVehicle.rating?.count} lượt)`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium text-gray-800">{v}</span>
                </div>
              ))}
              <div>
                <p className="text-gray-500 mb-1">Mô tả</p>
                <p className="text-gray-700">{selectedVehicle.description}</p>
              </div>
            </div>
            <div className="p-5 border-t flex gap-3">
              <button onClick={() => { closeModal(); openEdit(selectedVehicle); }}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition">
                <Edit2 size={16} /> Chỉnh sửa
              </button>
              <button onClick={closeModal}
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Xác nhận xóa ──────────────────────────────────────────── */}
      {modal === 'delete' && selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-red-500" />
            </div>
            <h2 className="font-bold text-lg mb-2">Xóa xe này?</h2>
            <p className="text-gray-500 text-sm mb-6">
              Xe <span className="font-semibold text-gray-700">"{selectedVehicle.name}"</span> sẽ bị xóa vĩnh viễn và không thể khôi phục.
            </p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={formLoading}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition font-medium">
                {formLoading ? 'Đang xóa...' : 'Xóa xe'}
              </button>
              <button onClick={closeModal}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVehicles;