import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, Users, Car, Calendar,
  DollarSign, CheckCircle, RefreshCw
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Overview {
  totalUsers: number;
  newUsersThisPeriod: number;
  totalVehicles: number;
  totalBookings: number;
  totalRevenue: number;
  completedBookings: number;
}

interface ReportData {
  overview: Overview;
  bookingsByStatus: { _id: string; count: number }[];
  revenueByTime: { _id: string; revenue: number; count: number }[];
  topVehicles: { _id: string; name: string; licensePlate: string; type: string; image?: string; count: number; revenue: number }[];
  bookingsByVehicleType: { _id: string; count: number }[];
  bookingsByPayment: { _id: string; count: number }[];
}

// ─── Hằng số ─────────────────────────────────────────────────────────────────
const STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận',
  active: 'Đang thuê', completed: 'Hoàn thành',
  cancelled: 'Đã hủy', rejected: 'Từ chối',
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', confirmed: '#3b82f6',
  active: '#10b981', completed: '#6b7280',
  cancelled: '#ef4444', rejected: '#f87171',
};

const PAYMENT_LABEL: Record<string, string> = {
  cash: 'Tiền mặt', credit_card: 'Thẻ tín dụng',
  bank_transfer: 'Chuyển khoản', momo: 'MoMo',
  zalopay: 'ZaloPay', vnpay: 'VNPay',
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

const fmtMoney = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B₫';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M₫';
  return n?.toLocaleString('vi-VN') + '₫';
};

// ─── Stat Card ───────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}
const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── Custom Tooltip cho biểu đồ doanh thu ────────────────────────────────────
const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      <p className="text-blue-600">Doanh thu: <span className="font-bold">{fmtMoney(payload[0]?.value)}</span></p>
      {payload[1] && <p className="text-green-600">Số đơn: <span className="font-bold">{payload[1]?.value}</span></p>}
    </div>
  );
};

// ─── Component chính ──────────────────────────────────────────────────────────
const AdminReports: React.FC = () => {
  const [data, setData]       = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod]   = useState<'week' | 'month' | 'year'>('month');

  const fetchReports = async (p = period) => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reports', { params: { period: p } });
      setData(res.data.data);
    } catch {
      toast.error('Không thể tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(period); }, [period]);

  const overview = data?.overview;

  // Chuẩn hóa data cho PieChart trạng thái
  const statusPieData = (data?.bookingsByStatus || []).map(b => ({
    name: STATUS_LABEL[b._id] || b._id,
    value: b.count,
    color: STATUS_COLORS[b._id] || '#94a3b8',
  }));

  // Chuẩn hóa data cho PieChart loại xe
  const vehicleTypePie = (data?.bookingsByVehicleType || []).map((b, i) => ({
    name: b._id === 'car' ? 'Ô tô' : 'Xe máy',
    value: b.count,
    color: CHART_COLORS[i],
  }));

  // Chuẩn hóa data cho PieChart thanh toán
  const paymentPie = (data?.bookingsByPayment || []).map((b, i) => ({
    name: PAYMENT_LABEL[b._id] || b._id,
    value: b.count,
    color: CHART_COLORS[i],
  }));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
          <p className="text-sm text-gray-500 mt-1">Tổng quan hoạt động hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Chọn khoảng thời gian */}
          <div className="flex bg-gray-100 rounded-lg p-1 text-sm">
            {(['week', 'month', 'year'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md transition font-medium ${period === p ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                {p === 'week' ? '7 ngày' : p === 'month' ? '30 ngày' : 'Năm nay'}
              </button>
            ))}
          </div>
          <button onClick={() => fetchReports(period)} disabled={loading}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-500">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center py-32 text-gray-400">
          <TrendingUp size={32} className="animate-pulse mr-3" /> Đang tải dữ liệu...
        </div>
      ) : (
        <>
          {/* ── Stat Cards ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <StatCard icon={DollarSign} label="Tổng doanh thu" color="bg-blue-500"
              value={fmtMoney(overview?.totalRevenue || 0)}
              sub={`Trong ${period === 'week' ? '7 ngày' : period === 'month' ? '30 ngày' : 'năm nay'}`} />
            <StatCard icon={Calendar} label="Tổng đơn đặt xe" color="bg-green-500"
              value={(overview?.totalBookings || 0).toLocaleString()}
              sub={`${overview?.completedBookings || 0} đã hoàn thành`} />
            <StatCard icon={Users} label="Tổng người dùng" color="bg-purple-500"
              value={(overview?.totalUsers || 0).toLocaleString()}
              sub={`+${overview?.newUsersThisPeriod || 0} mới trong kỳ`} />
            <StatCard icon={Car} label="Xe đang hoạt động" color="bg-orange-500"
              value={(overview?.totalVehicles || 0).toLocaleString()}
              sub="Đã được duyệt" />
            <StatCard icon={CheckCircle} label="Tỷ lệ hoàn thành" color="bg-teal-500"
              value={overview?.totalBookings
                ? Math.round((overview.completedBookings / overview.totalBookings) * 100) + '%'
                : '0%'}
              sub="Đơn hoàn thành / tổng đơn" />
            <StatCard icon={TrendingUp} label="Doanh thu TB / đơn" color="bg-pink-500"
              value={overview?.completedBookings
                ? fmtMoney(Math.round((overview.totalRevenue || 0) / overview.completedBookings))
                : '—'}
              sub="Tính trên đơn hoàn thành" />
          </div>

          {/* ── Biểu đồ doanh thu theo thời gian ────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <h2 className="font-semibold text-gray-800 mb-4">
              Doanh thu & số đơn theo thời gian
            </h2>
            {data?.revenueByTime?.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                Chưa có dữ liệu trong kỳ này
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data?.revenueByTime || []} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis yAxisId="revenue" orientation="left" tickFormatter={v => fmtMoney(v)}
                    tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="count" orientation="right" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<RevenueTooltip />} />
                  <Legend />
                  <Line yAxisId="revenue" type="monotone" dataKey="revenue" name="Doanh thu"
                    stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line yAxisId="count" type="monotone" dataKey="count" name="Số đơn"
                    stroke="#10b981" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── Row 2: Trạng thái + Loại xe + Thanh toán ──────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

            {/* Pie trạng thái booking */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Trạng thái đơn</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    paddingAngle={3} dataKey="value">
                    {statusPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any, n: any) => [v + ' đơn', n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {statusPieData.map(s => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-gray-600">{s.name}</span>
                    </div>
                    <span className="font-medium text-gray-800">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pie loại xe */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Theo loại xe</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={vehicleTypePie} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    paddingAngle={3} dataKey="value">
                    {vehicleTypePie.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any, n: any) => [v + ' đơn', n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {vehicleTypePie.map(s => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-gray-600">{s.name}</span>
                    </div>
                    <span className="font-medium text-gray-800">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pie thanh toán */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Phương thức thanh toán</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={paymentPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    paddingAngle={3} dataKey="value">
                    {paymentPie.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any, n: any) => [v + ' đơn', n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {paymentPie.map(s => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-gray-600">{s.name}</span>
                    </div>
                    <span className="font-medium text-gray-800">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Top xe được đặt nhiều nhất ─────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Top 5 xe được đặt nhiều nhất</h2>
            {data?.topVehicles?.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">Chưa có dữ liệu</p>
            ) : (
              <>
                {/* Bar chart */}
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data?.topVehicles || []} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false}
                      tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 14) + '…' : v} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(v: any) => [v + ' đơn', 'Số lượt đặt']} />
                    <Bar dataKey="count" name="Lượt đặt" radius={[6, 6, 0, 0]}>
                      {(data?.topVehicles || []).map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Bảng chi tiết */}
                <table className="w-full text-sm mt-4">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase border-b border-gray-100">
                      <th className="pb-2 text-left">#</th>
                      <th className="pb-2 text-left">Xe</th>
                      <th className="pb-2 text-right">Lượt đặt</th>
                      <th className="pb-2 text-right">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(data?.topVehicles || []).map((v, i) => (
                      <tr key={v._id} className="hover:bg-gray-50 transition">
                        <td className="py-2.5 pr-3">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}>
                            {i + 1}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-7 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                              {v.image
                                ? <img src={v.image} alt="" className="w-full h-full object-cover" />
                                : <Car size={14} className="m-auto mt-1.5 text-gray-300" />
                              }
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{v.name}</p>
                              <p className="text-xs text-gray-400">{v.licensePlate} · {v.type === 'car' ? 'Ô tô' : 'Xe máy'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 text-right font-medium text-gray-800">{v.count}</td>
                        <td className="py-2.5 text-right font-medium text-blue-600">{fmtMoney(v.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReports;