import React from 'react';
import { Users, Heart, Target, Sparkles } from 'lucide-react';

const About: React.FC = () => {
  const values = [
    {
      icon: Target,
      title: 'Sứ mệnh',
      description: 'Kết nối chủ xe và khách hàng một cách Nhanh chóng - An toàn - Tiện lợi'
    },
    {
      icon: Heart,
      title: 'Giá trị cốt lõi',
      description: 'Chất lượng trải nghiệm của khách hàng là ưu tiên hàng đầu'
    },
    {
      icon: Sparkles,
      title: 'Tầm nhìn',
      description: 'Truyền cảm hứng KHÁM PHÁ những điều mới mẻ đến cộng đồng'
    },
    {
      icon: Users,
      title: 'Cộng đồng',
      description: '15.000+ xe gia đình đời mới khắp Việt Nam'
    }
  ];

  const stats = [
    { number: '15.000+', label: 'Xe đa dạng' },
    { number: '500.000+', label: 'Khách hàng' },
    { number: '4.8/5', label: 'Đánh giá' },
    { number: '63', label: 'Tỉnh thành' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Về MOTO</h1>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            Cùng bạn trên mọi hành trình khám phá cuộc sống và thế giới xung quanh
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Câu chuyện của chúng tôi</h2>
          <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
            <p>
              <strong className="text-blue-600">MOTO</strong> được thành lập với sứ mệnh đơn giản: 
              Kết nối những người có xe nhàn rỗi với những người cần di chuyển, 
              tạo ra một cộng đồng chia sẻ xe an toàn và tin cậy.
            </p>
            <p>
              Chúng tôi tin rằng mỗi chuyến đi đều là một hành trình khám phá, 
              là cơ hội để học hỏi và chinh phục những điều mới mẻ. 
              Do đó, chất lượng trải nghiệm của khách hàng luôn là ưu tiên hàng đầu 
              và là nguồn cảm hứng của đội ngũ MOTO.
            </p>
            <p>
              Với hơn <strong>15.000 xe</strong> trên toàn quốc, MOTO tự hào là 
              nền tảng chia sẻ ô tô hàng đầu Việt Nam, phục vụ hơn <strong>500.000 khách hàng</strong> 
              với sự hài lòng lên đến <strong>4.8/5 sao</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Giá trị của MOTO</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="text-blue-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600">{stat.number}</div>
                <div className="text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Đội ngũ MOTO</h2>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
          Những người đam mê, sáng tạo và tận tâm, luôn nỗ lực để mang đến 
          trải nghiệm tốt nhất cho khách hàng
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
              <div className="w-24 h-24 rounded-full bg-blue-100 mx-auto mb-4 flex items-center justify-center">
                <Users size={40} className="text-blue-600" />
              </div>
              <h4 className="font-semibold text-lg">Thành viên {i}</h4>
              <p className="text-gray-500 text-sm">Vị trí</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;