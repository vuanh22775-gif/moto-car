import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Calendar, MapPin, Car, Users, Clock, ArrowRight, Shield, Star, ChevronRight } from 'lucide-react';
import VehicleCard from '@components/vehicles/VehicleCard';
import { useVehicles } from '@hooks/useVehicles';
import type { Vehicle } from '@types';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { vehicles, loading, fetchVehicles } = useVehicles();
  const [searchData, setSearchData] = useState({
    location: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchVehicles({ limit: 8 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const featuredVehicles = vehicles.slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchData.location) params.append('location', searchData.location);
    if (searchData.startDate) params.append('startDate', searchData.startDate);
    if (searchData.endDate) params.append('endDate', searchData.endDate);
    navigate(`/vehicles?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative text-white">
        {/* Ảnh nền */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=85"
            alt="Hero background"
            className="w-full h-full object-cover object-center"
          />
          {/* Overlay tối để chữ dễ đọc */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20" />
        </div>

        <div className="relative container mx-auto px-4 py-24 lg:py-36">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight drop-shadow-lg">
              MOTO - Cùng Bạn Trên Mọi Hành Trình
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 drop-shadow">
              Trải nghiệm sự khác biệt từ 15.000 xe gia đình đời mới khắp Việt Nam
            </p>
            <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 text-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 text-blue-500" size={20} />
                  <input type="text" placeholder="Địa điểm"
                    value={searchData.location}
                    onChange={(e) => setSearchData({...searchData, location: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 text-blue-500" size={20} />
                  <input type="date" value={searchData.startDate}
                    onChange={(e) => setSearchData({...searchData, startDate: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 text-blue-500" size={20} />
                  <input type="date" value={searchData.endDate}
                    onChange={(e) => setSearchData({...searchData, endDate: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button type="submit"
                  className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium">
                  <Search size={20} /> Tìm Xe
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ── Stats Section ─────────────────────────────────────────────── */}
      <section className="py-12 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '15.000+', label: 'Xe đa dạng' },
              { value: '500.000+', label: 'Khách hàng' },
              { value: '4.8/5', label: 'Đánh giá' },
              { value: '63', label: 'Tỉnh thành' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600">{s.value}</div>
                <div className="text-gray-600 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Service Features ──────────────────────────────────────────── */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Dịch vụ của chúng tôi</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Car, title: 'Xe tự lái', desc: 'Thuê xe tự lái với đa dạng mẫu mã, giá cả hợp lý' },
            { icon: Users, title: 'Xe có tài xế', desc: 'Dịch vụ xe có tài xế chuyên nghiệp, an toàn' },
            { icon: Clock, title: 'Thuê xe dài hạn', desc: 'Gói thuê xe dài hạn với nhiều ưu đãi hấp dẫn' },
          ].map(s => (
            <div key={s.title} className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <s.icon className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
              <p className="text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Vehicles ─────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold">Xe nổi bật</h2>
              <p className="text-gray-500 mt-1">Những chiếc xe được quan tâm nhiều nhất</p>
            </div>
            <Link to="/vehicles" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
              Xem tất cả <ArrowRight size={18} />
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="spinner h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredVehicles.map((vehicle: Vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── About MOTO + Photo Showcase ───────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            {/* Text trái */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                MOTO - Cùng bạn đến mọi hành trình
              </h2>
              <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                <p>
                  Mỗi chuyến đi là một hành trình khám phá cuộc sống và thế giới xung quanh,
                  là cơ hội học hỏi và chinh phục những điều mới lạ của mỗi cá nhân để trở nên tốt hơn.
                  Do đó, chất lượng trải nghiệm của khách hàng là ưu tiên hàng đầu và là nguồn cảm hứng của đội ngũ MOTO.
                </p>
                <p>
                  <strong className="text-blue-600">MOTO</strong> là nền tảng chia sẻ ô tô, sứ mệnh của chúng tôi
                  không chỉ dừng lại ở việc kết nối chủ xe và khách hàng một cách{' '}
                  <strong className="text-blue-600">Nhanh chóng - An toàn - Tiện lợi</strong>,
                  mà còn hướng đến việc truyền cảm hứng{' '}
                  <strong className="text-blue-600">KHÁM PHÁ</strong> những điều mới lạ đến cộng đồng
                  qua những chuyến đi trên nền tảng của chúng tôi.
                </p>
              </div>
              <Link to="/vehicles"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium">
                Khám phá xe ngay <ChevronRight size={18} />
              </Link>
            </div>

            {/* Ảnh phải — kiểu Mioto split diagonal */}
            <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-2">
                <div className="relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&q=80"
                    alt="Lái xe khám phá"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1591134105015-ca5f6a0f34a2?w=600&q=80"
                    alt="Hành trình"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {/* Diagonal divider */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-1 h-full bg-white rotate-12 scale-150 opacity-80" />
              </div>
            </div>
          </div>

          {/* ── Photo Grid 3 ảnh ──────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
            <div className="md:col-span-2 h-72 rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&q=80"
                alt="Đường cao tốc"
                className="w-full h-full object-cover hover:scale-105 transition duration-500"
              />
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex-1 rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&q=80"
                  alt="Xe trên núi"
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                />
              </div>
              <div className="flex-1 rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1502877338535-766e1452684a?w=500&q=80"
                  alt="Xe bãi biển"
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                />
              </div>
            </div>
          </div>

          {/* ── Lý do chọn MOTO ───────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Ảnh trái */}
            <div className="grid grid-cols-2 gap-4 h-96">
              <div className="rounded-2xl overflow-hidden row-span-2">
                <img
                  src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&q=80"
                  alt="Xe sang"
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                />
              </div>
              <div className="rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&q=80"
                  alt="Nội thất xe"
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                />
              </div>
              <div className="rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&q=80"
                  alt="Xe đêm"
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                />
              </div>
            </div>

            {/* Text phải */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Tại sao chọn MOTO?</h2>
              <div className="space-y-6">
                {[
                  { icon: Shield, title: 'An toàn & Bảo hiểm', desc: 'Tất cả xe đều được kiểm tra kỹ lưỡng và có bảo hiểm toàn diện trong suốt chuyến đi.' },
                  { icon: Star, title: 'Chất lượng cao', desc: 'Hơn 15.000 xe đời mới, đa dạng từ xe phổ thông đến cao cấp, đáp ứng mọi nhu cầu.' },
                  { icon: Clock, title: 'Tiện lợi 24/7', desc: 'Đặt xe online nhanh chóng, hỗ trợ khách hàng 24/7, nhận và trả xe linh hoạt.' },
                  { icon: Users, title: 'Cộng đồng tin cậy', desc: 'Hơn 500.000 khách hàng tin tưởng, với hệ thống đánh giá minh bạch từ người dùng thực.' },
                ].map(item => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon size={22} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Sẵn sàng cho chuyến đi tiếp theo?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Hàng nghìn xe đang chờ bạn khám phá
          </p>
          <Link to="/vehicles"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition text-lg">
            Đặt xe ngay <ArrowRight size={20} />
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;