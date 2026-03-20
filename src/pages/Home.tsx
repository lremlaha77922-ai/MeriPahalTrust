import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Users, Target, Shield, FileText, Clock } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const Home = () => {
  const featuresRef = useScrollReveal();
  const benefitsRef = useScrollReveal();
  const processRef = useScrollReveal();
  const statsRef = useScrollReveal();

  const features = [
    {
      icon: Users,
      title: 'सामाजिक कार्य',
      description: 'कलाकारों और समाज के कल्याण के लिए समर्पित',
    },
    {
      icon: Target,
      title: 'सर्वे कार्य',
      description: 'दैनिक सर्वे और डेटा संग्रहण',
    },
    {
      icon: Shield,
      title: 'पारदर्शिता',
      description: 'पूर्ण पारदर्शी कार्य प्रणाली',
    },
    {
      icon: FileText,
      title: 'नियम व शर्तें',
      description: 'स्पष्ट दिशानिर्देश और नीतियां',
    },
  ];

  const benefits = [
    'नियमित आय का अवसर',
    'लचीला कार्य समय',
    'व्यावसायिक प्रशिक्षण',
    'सामाजिक सुरक्षा',
    'टीम सपोर्ट',
    'करियर ग्रोथ',
  ];

  const stats = [
    { value: '500+', label: 'सक्रिय सदस्य' },
    { value: '10,000+', label: 'दैनिक सर्वे' },
    { value: '5+', label: 'वर्षों का अनुभव' },
    { value: '95%', label: 'संतुष्टि दर' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-trust-blue to-blue-700 text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in-up">
              मेरी पहल फास्ट हेल्प
              <br />
              <span className="text-trust-gold">आर्टिस्ट वेलफेयर एसोसिएशन</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 animate-fade-in-up delay-200">
              कलाकारों के कल्याण और सामाजिक विकास के लिए समर्पित संगठन
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
              <Link to="/join">
                <Button className="bg-trust-gold hover:bg-amber-600 text-white px-8 py-6 text-lg font-semibold hover-scale">
                  अभी जुड़ें
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" className="bg-white text-trust-blue hover:bg-gray-100 px-8 py-6 text-lg font-semibold hover-scale">
                  और जानें
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-6 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 text-center">
            <div className="flex items-center space-x-2 hover-scale">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-gray-700">पंजीकृत ट्रस्ट</span>
            </div>
            <div className="flex items-center space-x-2 hover-scale">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-gray-700">पारदर्शी प्रणाली</span>
            </div>
            <div className="flex items-center space-x-2 hover-scale">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-gray-700">समय पर भुगतान</span>
            </div>
            <div className="flex items-center space-x-2 hover-scale">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-gray-700">कानूनी संरक्षण</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-trust-lightblue py-16">
        <div className="container mx-auto px-4" ref={statsRef.ref}>
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-800 ${
            statsRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center hover-scale cursor-default"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl md:text-5xl font-bold text-trust-blue mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-700 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              हमारी विशेषताएं
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              पारदर्शी और व्यवस्थित कार्य प्रणाली के साथ आपके करियर को नई ऊंचाई दें
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" ref={featuresRef.ref}>
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-white border border-gray-200 rounded-lg p-6 hover-lift transition-all duration-300 ${
                  featuresRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 bg-trust-lightblue rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="h-7 w-7 text-trust-blue" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                आपको क्या मिलेगा?
              </h2>
              <p className="text-lg text-gray-600">
                हमारे साथ जुड़ने के फायदे
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6" ref={benefitsRef.ref}>
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className={`flex items-center space-x-3 transition-all duration-500 ${
                    benefitsRef.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <span className="text-lg text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              कैसे काम करता है?
            </h2>
            <p className="text-lg text-gray-600">सरल और पारदर्शी प्रक्रिया</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto" ref={processRef.ref}>
            <div className={`text-center transition-all duration-800 ${
              processRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`} style={{ transitionDelay: '0ms' }}>
              <div className="w-16 h-16 bg-trust-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 hover-scale">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                पंजीकरण करें
              </h3>
              <p className="text-gray-600">
                ऑनलाइन फॉर्म भरें और आवश्यक दस्तावेज़ अपलोड करें
              </p>
            </div>
            <div className={`text-center transition-all duration-800 ${
              processRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`} style={{ transitionDelay: '200ms' }}>
              <div className="w-16 h-16 bg-trust-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 hover-scale">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                प्रशिक्षण प्राप्त करें
              </h3>
              <p className="text-gray-600">
                हमारी टीम से पूर्ण प्रशिक्षण और मार्गदर्शन पाएं
              </p>
            </div>
            <div className={`text-center transition-all duration-800 ${
              processRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`} style={{ transitionDelay: '400ms' }}>
              <div className="w-16 h-16 bg-trust-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 hover-scale">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                कार्य शुरू करें
              </h3>
              <p className="text-gray-600">
                दैनिक सर्वे और कार्य करें, नियमित आय प्राप्त करें
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-trust-blue to-blue-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            अपना करियर शुरू करने के लिए तैयार हैं?
          </h2>
          <p className="text-xl mb-8 text-gray-100">
            आज ही हमारे साथ जुड़ें और अपने भविष्य को सुरक्षित करें
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/join">
              <Button className="bg-trust-gold hover:bg-amber-600 text-white px-8 py-6 text-lg font-semibold hover-scale">
                अभी पंजीकरण करें
              </Button>
            </Link>
            <Link to="/team">
              <Button variant="outline" className="bg-white text-trust-blue hover:bg-gray-100 px-8 py-6 text-lg font-semibold hover-scale">
                टीम से मिलें
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="bg-amber-50 border-t-4 border-trust-gold py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-start space-x-3">
            <Clock className="h-6 w-6 text-trust-gold flex-shrink-0 mt-1 animate-float" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">महत्वपूर्ण सूचना</h3>
              <p className="text-gray-700">
                सभी दिशानिर्देशों को ध्यान से पढ़ें। दैनिक उपस्थिति (9:00-9:15 AM) और PDF जमा (6:00-7:00 AM) अनिवार्य है। 
                न्यूनतम 10 सर्वे प्रतिदिन आवश्यक है। सभी नियम राजस्थान न्यायालय के अधीन हैं।
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
