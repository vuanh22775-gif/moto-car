import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, Eye, X, Check,
  Car, AlertCircle, Clock, CheckCircle, XCircle
} from 'lucide-react';
import api from '../services/api';
import ImageUploader from '../components/ImageUploader';
import toast from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────────────────────
interface MyVehicle {
  _id: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  pricePerDay: number;
  images: string[];
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  description: string;
  location: { address: string; city: string; district: string; ward?: string };
  specifications: { seats: number; transmission: string; fuelType: string; engine: string; color: string; mileage: number; consumption: string };
  deposit: number;
  createdAt: string;
}

// ─── Hằng số ─────────────────────────────────────────────────────────────────
const STATUS_MAP = {
  pending:  { label: 'Chờ duyệt',  icon: Clock,         className: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Đã duyệt',   icon: CheckCircle,   className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Từ chối',    icon: XCircle,       className: 'bg-red-100 text-red-600' },
  inactive: { label: 'Tạm dừng',   icon: AlertCircle,   className: 'bg-gray-100 text-gray-600' },
};

const EMPTY_FORM = {
  name: '', type: 'car', brand: '', model: '', year: new Date().getFullYear(),
  licensePlate: '', pricePerDay: 0, pricePerHour: 0, deposit: 0, description: '',
  images: [] as string[],
  specifications: { seats: 4, transmission: 'Số tự động', fuelType: 'Xăng', engine: '', color: '', mileage: 0, consumption: '' },
  location: { address: '', city: '', district: '', ward: '' },
};

const MyVehicles: React.FC = () => {
  const [vehicles, setVehicles]   = useState<MyVehicle[]>([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState<'none' | 'form' | 'delete' | 'view'>('none');
  const [selected, setSelected]   = useState<MyVehicle | null>(null);
  const [formData, setFormData]   = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchMyVehicles(); }, []);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchMyVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vehicles/my-vehicles');
      setVehicles(res.data.data);
    } catch {
      toast.error('Không thể tải danh sách xe');
    } finally {
      setLoading(false);
    }
  };

  // ── Modals ───────────────────────────────────────────────────────────────
  const openAdd = () => {
    setSelected(null);
    setFormData(EMPTY_FORM);
    setModal('form');
  };

  const openEdit = (v: MyVehicle) => {
    setSelected(v);
    setFormData({
      name: v.name, type: v.type, brand: v.brand, model: v.model, year: v.year,
      licensePlate: v.licensePlate, pricePerDay: v.pricePerDay, pricePerHour: 0,
      deposit: v.deposit, description: v.description, images: v.images || [],
      specifications: { ...EMPTY_FORM.specifications, ...v.specifications },
      location: { ...EMPTY_FORM.location, ...v.location },
    });
    setModal('form');
  };

  const openDelete = (v: MyVehicle) => { setSelected(v); setModal('delete'); };
  const openView   = (v: MyVehicle) => { setSelected(v); setModal('view'); };
  const closeModal = () => { setModal('none'); setSelected(null); };

  // ── Submit form ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      toast.error('Vui lòng upload ít nhất 1 ảnh xe');
      return;
    }
    setSubmitting(true);
    try {
      if (selected) {
        await api.put(`/vehicles/${selected._id}`, formData);
        toast.success('Đã cập nhật xe — đang chờ admin duyệt lại');
      } else {
        await api.post('/vehicles', formData);
        toast.success('Đã đăng xe — đang chờ admin duyệt');
      }
      closeModal();
      fetchMyVehicles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Xóa xe ──────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await api.delete(`/vehicles/${selected._id}`);
      toast.success('Đã xóa xe');
      closeModal();
      fetchMyVehicles();
    } catch {
      toast.error('Không thể xóa xe');
    } finally {
      setSubmitting(false);
    }
  };

  // ── setField helper ──────────────────────────────────────────────────────
  const setField = (path: string, value: any) => {
    setFormData((prev: typeof EMPTY_FORM) => {
      const next = { ...prev };
      const keys = path.split('.');
      let obj: any = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]] = { ...obj[keys[i]] };
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Xe của tôi</h1>
            <p className="text-sm text-gray-500 mt-1">{vehicles.length} xe đã đăng</p>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium">
            <Plus size={18} /> Đăng xe cho thuê
          </button>
        </div>

        {/* Hướng dẫn */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700">
          <p className="font-medium mb-1">📋 Quy trình đăng xe</p>
          <p>Sau khi bạn đăng xe, admin sẽ kiểm tra và duyệt trong vòng 24h. Xe được duyệt mới hiển thị cho khách thuê.</p>
        </div>

        {/* Danh sách xe */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400">
            <Car size={32} className="animate-pulse mr-3" /> Đang tải...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Car size={36} className="text-blue-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Chưa có xe nào</h2>
            <p className="text-gray-400 text-sm mb-6">Đăng xe của bạn để bắt đầu kiếm thu nhập</p>
            <button onClick={openAdd}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium">
              Đăng xe ngay
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {vehicles.map(v => {
              const st = STATUS_MAP[v.status] || STATUS_MAP.pending;
              const StatusIcon = st.icon;
              return (
                <div key={v._id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex">
                  {/* Ảnh */}
                  <div className="w-40 h-32 flex-shrink-0 bg-gray-100">
                    {v.images?.[0]
                      ? <img src={v.images[0]} alt={v.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <Car size={32} className="text-gray-300" />
                        </div>
                    }
                  </div>

                  {/* Thông tin */}
                  <div className="flex-1 p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{v.name}</h3>
                        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${st.className}`}>
                          <StatusIcon size={11} /> {st.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{v.licensePlate} · {v.location?.city}</p>
                      <p className="text-blue-600 font-bold mt-1">
                        {v.pricePerDay?.toLocaleString('vi-VN')}₫<span className="text-gray-400 font-normal text-xs">/ngày</span>
                      </p>
                      {v.status === 'rejected' && (
                        <p className="text-red-500 text-xs mt-1">⚠️ Xe bị từ chối — hãy chỉnh sửa và đăng lại</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openView(v)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Xem">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => openEdit(v)}
                        className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition" title="Sửa">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => openDelete(v)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Xóa">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal Form Thêm/Sửa ──────────────────────────────────────────── */}
      {modal === 'form' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">{selected ? 'Chỉnh sửa xe' : 'Đăng xe cho thuê'}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
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
                    <label className="label">Năm SX *</label>
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
                      className="input resize-none" placeholder="Mô tả về xe của bạn..." />
                  </div>
                </div>
              </section>

              {/* Giá */}
              <section>
                <h3 className="font-semibold text-gray-700 mb-3">Giá cho thuê</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Giá/ngày (₫) *</label>
                    <input required type="number" min={0} value={formData.pricePerDay}
                      onChange={e => setField('pricePerDay', parseInt(e.target.value))} className="input" />
                  </div>
                  <div>
                    <label className="label">Đặt cọc (₫)</label>
                    <input type="number" min={0} value={formData.deposit}
                      onChange={e => setField('deposit', parseInt(e.target.value))} className="input" />
                  </div>
                </div>
              </section>

              {/* Thông số */}
              <section>
                <h3 className="font-semibold text-gray-700 mb-3">Thông số kỹ thuật</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                      className="input" placeholder="2.0L..." />
                  </div>
                  <div>
                    <label className="label">Km đã đi</label>
                    <input type="number" min={0} value={formData.specifications.mileage}
                      onChange={e => setField('specifications.mileage', parseInt(e.target.value))} className="input" />
                  </div>
                </div>
              </section>

              {/* Địa điểm */}
              <section>
                <h3 className="font-semibold text-gray-700 mb-3">Địa điểm xe</h3>
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
                      className="input" placeholder="Quận 1..." />
                  </div>
                </div>
              </section>

              {/* Ảnh */}
              <section>
                <h3 className="font-semibold text-gray-700 mb-3">Ảnh xe *</h3>
                <ImageUploader
                  images={formData.images}
                  onChange={urls => setFormData(p => ({ ...p, images: urls }))}
                  maxImages={10}
                />
              </section>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition font-medium">
                  <Check size={18} />
                  {submitting ? 'Đang gửi...' : selected ? 'Lưu thay đổi' : 'Đăng xe'}
                </button>
                <button type="button" onClick={closeModal}
                  className="px-6 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Xem chi tiết ───────────────────────────────────────────── */}
      {modal === 'view' && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold">{selected.name}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-3 max-h-[65vh] overflow-y-auto text-sm">
              {selected.images?.[0] && (
                <img src={selected.images[0]} alt="" className="w-full h-44 object-cover rounded-xl" />
              )}
              {[
                ['Biển số', selected.licensePlate],
                ['Loại', selected.type === 'car' ? 'Ô tô' : 'Xe máy'],
                ['Năm SX', String(selected.year)],
                ['Giá/ngày', `${selected.pricePerDay?.toLocaleString('vi-VN')}₫`],
                ['Thành phố', selected.location?.city],
                ['Trạng thái', STATUS_MAP[selected.status]?.label],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-400">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
              <div>
                <p className="text-gray-400 mb-1">Mô tả</p>
                <p className="text-gray-700">{selected.description}</p>
              </div>
            </div>
            <div className="p-5 border-t">
              <button onClick={closeModal}
                className="w-full py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition text-sm">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Xóa ────────────────────────────────────────────────────── */}
      {modal === 'delete' && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-red-500" />
            </div>
            <h2 className="font-bold text-lg mb-2">Xóa xe này?</h2>
            <p className="text-gray-500 text-sm mb-6">
              Xe <span className="font-semibold">"{selected.name}"</span> sẽ bị xóa vĩnh viễn.
            </p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={submitting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition font-medium text-sm">
                {submitting ? 'Đang xóa...' : 'Xóa xe'}
              </button>
              <button onClick={closeModal}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition text-sm">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyVehicles;