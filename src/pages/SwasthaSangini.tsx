import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { SwasthaSettings } from '@/types';
import {
  Heart,
  Users,
  Target,
  Award,
  CheckCircle,
  ArrowRight,
  MessageCircle,
  Facebook,
  DollarSign,
  Briefcase,
  TrendingUp,
  Shield,
  Star,
  Phone,
} from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const SwasthaSangini = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const featuresRef = useScrollReveal();
  const benefitsRef = useScrollReveal();
  const rolesRef = useScrollReveal();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('swastha_settings')
        .select('*');

      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data?.forEach((item: SwasthaSettings) => {
        settingsMap[item.setting_key] = item.setting_value;
      });

      setSettings(settingsMap);
    } catch (error) {
      console.error('Settings fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Heart,
      title: 'महिला स्वास्थ्य',
      description: 'महिलाओं के स्वास्थ्य और कल्याण पर केंद्रित कार्यक्रम',
      color: 'from-pink-500 to-rose-600',
    },
    {
      icon: Users,
      title: 'सामाजिक विकास',
      description: 'समुदाय में महिलाओं के सशक्तिकरण की पहल',
      color: 'from-purple-500 to-indigo-600',
    },
    {
      icon: Target,
      title: 'लक्ष्य प्राप्ति',
      description: 'स्पष्ट लक्ष्य और उपलब्धि ट्रैकिंग',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      icon: Award,
      title: 'प्रमाणन',
      description: 'स्वस्थ संगिनी कार्ड प्रमाणन और मान्यता',
      color: 'from-amber-500 to-orange-600',
    },
  ];

  const benefits = [
    'नियमित वेतन और प्रोत्साहन',
    'व्यावसायिक प्रशिक्षण और विकास',
    'स्वास्थ्य बीमा कवरेज',
    'लचीला कार्य समय',
    'करियर ग्रोथ के अवसर',
    'सामाजिक सुरक्षा',
    'मान्यता प्राप्त प्रमाणपत्र',
    'नेटवर्किंग के अवसर',
  ];

  const coordinatorRoles = [
    {
      title: 'District Coordinator',
      description: 'जिला स्तर पर कार्यक्रम का संचालन और निगरानी',
      salary: '₹16,000 - ₹18,000',
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    },
    {
      title: 'Block Coordinator',
      description: 'ब्लॉक स्तर पर कार्यक्रम का समन्वय और प्रबंधन',
      salary: '₹15,000 - ₹17,000',
      icon: Briefcase,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    },
    {
      title: 'Panchayat Coordinator',
      description: 'पंचायत स्तर पर फील्ड वर्क और जागरूकता',
      salary: '₹14,000 - ₹16,000',
      icon: Users,
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
    },
  ];

  const initiatives = [
    'महिला स्वास्थ्य जागरूकता कार्यक्रम',
    'पोषण और स्वच्छता शिक्षा',
    'मातृत्व और शिशु देखभाल',
    'महिला सुरक्षा और अधिकार',
    'स्वरोजगार और कौशल विकास',
    'सामुदायिक स्वास्थ्य शिविर',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full mb-6 animate-fade-in">
              <Heart className="h-5 w-5 mr-2 animate-pulse" />
              <span className="font-semibold">All India Women Development Initiative</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in-up">
              स्वस्थ संगिनी कार्ड
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-pink-100 animate-fade-in-up delay-200">
              {loading ? 'Loading...' : (settings.program_description || 'महिला सशक्तिकरण और स्वास्थ्य जागरूकता कार्यक्रम')}
            </p>
            <p className="text-lg mb-8 text-pink-50 animate-fade-in-up delay-300">
              मेरी पहल फास्ट हेल्प ग्रुप के साथ जुड़ें
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-400">
              <Link to="/swastha-sangini/apply">
                <Button size="lg" className="bg-white text-pink-600 hover:bg-pink-50 font-bold text-lg px-8 py-6 hover-scale">
                  <ArrowRight className="mr-2 h-5 w-5" />
                  अभी आवेदन करें
                </Button>
              </Link>
              {settings.whatsapp_group_link && (
                <a href={settings.whatsapp_group_link} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-pink-600 font-bold text-lg px-8 py-6 hover-scale">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    WhatsApp Group Join करें
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">कार्यक्रम की विशेषताएं</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-600 to-red-600 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" ref={featuresRef.ref}>
            {features.map((feature, index) => (
              <div
                key={index}
                className={`transition-all duration-500 ${
                  featuresRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`bg-gradient-to-br ${feature.color} text-white p-6 rounded-xl shadow-lg hover-lift h-full`}>
                  <feature.icon className="h-12 w-12 mb-4" />
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-white/90">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Salary Information */}
      <section className="py-16 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl border-2 border-amber-200 hover-lift">
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-4 rounded-full">
                <DollarSign className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">वेतन संरचना</h3>
                <p className="text-lg text-gray-700 mb-4">
                  {loading ? 'Loading...' : (settings.salary_info || 'प्रतिमाह वेतन: ₹15,000 - ₹25,000 (अनुभव के आधार पर)')}
                </p>
                <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                  <p className="text-gray-700">
                    <strong className="text-amber-700">नोट:</strong> वेतन पद, अनुभव और प्रदर्शन के आधार पर निर्धारित किया जाता है। 
                    अतिरिक्त प्रोत्साहन और बोनस की सुविधा उपलब्ध है।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coordinator Roles */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Coordinator Positions</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-600 to-red-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">विभिन्न स्तरों पर नेतृत्व के अवसर</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto" ref={rolesRef.ref}>
            {coordinatorRoles.map((role, index) => (
              <div
                key={index}
                className={`transition-all duration-500 ${
                  rolesRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className={`${role.color} text-white p-6 rounded-2xl shadow-xl hover-scale h-full`}>
                  <role.icon className="h-12 w-12 mb-4" />
                  <h3 className="text-2xl font-bold mb-3">{role.title}</h3>
                  <p className="text-white/90 mb-4">{role.description}</p>
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                    <p className="text-sm font-semibold mb-1">अनुमानित वेतन:</p>
                    <p className="text-2xl font-bold">{role.salary}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">सदस्यों को मिलने वाले लाभ</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-600 to-red-600 mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-6" ref={benefitsRef.ref}>
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 bg-white p-4 rounded-lg shadow-md hover-lift transition-all duration-500 ${
                    benefitsRef.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <span className="text-lg text-gray-700 font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Initiatives */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Shield className="h-16 w-16 text-pink-600 mx-auto mb-4 animate-float" />
              <h2 className="text-4xl font-bold text-gray-900 mb-4">हमारी सामाजिक पहल</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-600 to-red-600 mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {initiatives.map((initiative, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-lg border-l-4 border-pink-500 hover-lift"
                >
                  <Star className="h-5 w-5 text-pink-600 flex-shrink-0" />
                  <span className="text-gray-800 font-medium">{initiative}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Links */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">हमसे जुड़े रहें</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {settings.whatsapp_group_link && (
                <a href={settings.whatsapp_group_link} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white font-bold hover-scale">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    WhatsApp Group
                  </Button>
                </a>
              )}
              {settings.facebook_page_link && (
                <a href={settings.facebook_page_link} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold hover-scale">
                    <Facebook className="mr-2 h-5 w-5" />
                    Facebook Page
                  </Button>
                </a>
              )}
              <a href="tel:+917073741421">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white font-bold hover-scale">
                  <Phone className="mr-2 h-5 w-5" />
                  संपर्क करें
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            स्वस्थ संगिनी बनें, समाज बदलें!
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            महिला सशक्तिकरण और स्वास्थ्य जागरूकता के इस महान अभियान में शामिल हों। 
            आज ही आवेदन करें और अपने करियर को नई दिशा दें।
          </p>
          <Link to="/swastha-sangini/apply">
            <Button size="lg" className="bg-white text-pink-600 hover:bg-pink-50 font-bold text-lg px-10 py-6 hover-scale">
              <ArrowRight className="mr-2 h-6 w-6" />
              अभी आवेदन करें
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default SwasthaSangini;
