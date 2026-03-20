import { Button } from '@/components/ui/button';
import { ShoppingBag, Store, Users, Gift, Star, Check, ArrowRight, Phone, Globe, ShoppingCart, Package, TrendingUp, Award, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const DesiDidiMart = () => {
  const productsRef = useScrollReveal();
  const featuresRef = useScrollReveal();

  const products = [
    {
      category: 'घर का राशन',
      items: ['मसाले (मिर्च, हल्दी, धनिया)', 'आटा, बेसन', 'सरसों का तेल, रिफाइनरी तेल', 'दाल, चावल', 'चाय, चीनी', 'मिनरल वाटर'],
      icon: '🌾',
      color: 'from-amber-500 to-orange-600',
    },
    {
      category: 'खाद्य पदार्थ',
      items: ['अचार, मुरब्बा', 'बिस्किट, नमकीन', 'अगरबत्ती'],
      icon: '🍪',
      color: 'from-green-500 to-emerald-600',
    },
    {
      category: 'सफाई सामग्री',
      items: ['झाड़ू', 'फर्श क्लीनर', 'हैंडवॉश', 'वाइपर', 'हर्बल सोप'],
      icon: '🧹',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      category: 'कपड़े और जूते',
      items: ['कपड़े', 'जूते-चप्पल', 'जूट के बैग', 'कपड़े के बैग'],
      icon: '👗',
      color: 'from-purple-500 to-pink-600',
    },
    {
      category: 'इलेक्ट्रॉनिक्स',
      items: ['LED बल्ब', 'चार्जेबल बल्ब', 'मोबाइल चार्जर', 'पावर बैंक', 'स्मार्ट TV'],
      icon: '💡',
      color: 'from-indigo-500 to-blue-600',
    },
  ];

  const features = [
    {
      title: 'स्थानीय स्तर पर स्थापना',
      description: 'पंचायत, ब्लॉक और जिला स्तर पर मार्ट की स्थापना',
      icon: <Store className="h-8 w-8" />,
      color: 'bg-blue-500',
    },
    {
      title: 'नि:शुल्क प्रशिक्षण',
      description: 'महिलाओं को उत्पाद निर्माण का निःशुल्क प्रशिक्षण',
      icon: <Users className="h-8 w-8" />,
      color: 'bg-green-500',
    },
    {
      title: '30-40% की छूट',
      description: 'बाजार मूल्य से 30% से 40% तक सस्ते उत्पाद',
      icon: <Gift className="h-8 w-8" />,
      color: 'bg-amber-500',
    },
    {
      title: '100% देसी और शुद्ध',
      description: 'केवल शुद्ध, देसी व गुणवत्तायुक्त उत्पाद',
      icon: <Star className="h-8 w-8" />,
      color: 'bg-purple-500',
    },
    {
      title: 'ऑनलाइन + ऑफलाइन',
      description: 'वेबसाइट और मोबाइल ऐप के जरिए भी उपलब्ध',
      icon: <Globe className="h-8 w-8" />,
      color: 'bg-indigo-500',
    },
    {
      title: 'SHG को आमंत्रण',
      description: 'स्वयं सहायता समूहों से उत्पाद खरीदारी',
      icon: <Package className="h-8 w-8" />,
      color: 'bg-pink-500',
    },
  ];

  const membershipBenefits = [
    '30% से 40% तक की छूट',
    'प्रति माह ₹3000 की खरीददारी पर 12वें महीने में ₹3000 का बोनस',
    'विशेष सदस्यता कार्ड',
    'प्राथमिकता सेवा',
    'नए उत्पादों की पहली जानकारी',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full mb-6 animate-fade-in">
              <Sparkles className="h-5 w-5 mr-2" />
              <span className="font-semibold">महिला सशक्तिकरण की पहल</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in-up">
              देसी दीदी मार्ट
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-pink-100 animate-fade-in-up delay-200">
              100% देसी • 100% शुद्ध • 30-40% सस्ता
            </p>
            <p className="text-lg mb-8 text-pink-50 animate-fade-in-up delay-300">
              मेरी पहल फास्ट हेल्प आर्टिस्ट वेलफेयर एसोसिएशन ट्रस्ट द्वारा संचालित
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-400">
              <a href="https://wa.me/917073741421" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-white text-pink-600 hover:bg-pink-50 font-bold text-lg px-8 py-6 hover-scale">
                  <Phone className="mr-2 h-5 w-5" />
                  अभी संपर्क करें
                </Button>
              </a>
              <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-pink-600 font-bold text-lg px-8 py-6 hover-scale">
                <ShoppingCart className="mr-2 h-5 w-5" />
                डिस्ट्रीब्यूटर बनें
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
                <Heart className="h-10 w-10 mr-3 text-pink-600" />
                देसी दीदी मार्ट क्या है?
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-600 to-red-600 mx-auto mb-6"></div>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-8 rounded-2xl shadow-lg border-2 border-pink-200 hover-lift">
              <p className="text-lg text-gray-800 leading-relaxed mb-6">
                <strong className="text-pink-600">👉 संगीत कलाकार यूनियन के सदस्यों के लिए विशेष पहल</strong>
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                "देसी दीदी मार्ट" एक सशक्त पहल है जिसका संचालन <strong>मेरी पहल फास्ट हेल्प आर्टिस्ट वेलफेयर एसोसिएशन (ट्रस्ट)</strong> द्वारा किया जा रहा है। 
              </p>
              <p className="text-gray-700 leading-relaxed">
                इस योजना का मुख्य उद्देश्य है – <strong className="text-pink-600">महिला सशक्तिकरण और स्वरोजगार</strong> को बढ़ावा देना, ताकि हमारे कलाकारों, सदस्यों और उनके परिवारजनों को <strong className="text-pink-600">आत्मनिर्भर</strong> बनाया जा सके।
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">मार्ट की विशेषताएँ</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-600 to-red-600 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto" ref={featuresRef.ref}>
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-white p-6 rounded-xl shadow-lg hover-lift border-t-4 border-pink-500 transition-all duration-500 ${
                  featuresRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`${feature.color} text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 mr-3 text-pink-600" />
              उपलब्ध उत्पाद
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-600 to-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">सभी उत्पाद हमारी महिला सदस्यों द्वारा निर्मित</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto" ref={productsRef.ref}>
            {products.map((product, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${product.color} text-white p-6 rounded-2xl shadow-xl hover-scale transition-all duration-500 ${
                  productsRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="text-5xl mb-4">{product.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{product.category}</h3>
                <ul className="space-y-2">
                  {product.items.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-pink-100 to-rose-100 p-6 rounded-xl max-w-3xl mx-auto border-2 border-pink-300 hover-lift">
              <p className="text-gray-800 text-lg font-semibold">
                ✨ और भी कई उपयोगी वस्तुएं उपलब्ध हैं!
              </p>
              <p className="text-gray-600 mt-2">
                सभी उत्पाद 100% शुद्ध, देसी और बाजार से 30-40% सस्ते
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Membership Benefits Section */}
      <div className="py-16 bg-gradient-to-br from-pink-600 to-rose-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Award className="h-16 w-16 mx-auto mb-4 animate-float" />
              <h2 className="text-4xl font-bold mb-4">सदस्यता कार्ड की विशेष सुविधा</h2>
              <div className="w-24 h-1 bg-white mx-auto"></div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border-2 border-white/30">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-6">सदस्यों को लाभ:</h3>
                  <ul className="space-y-4">
                    {membershipBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <Star className="h-6 w-6 mr-3 flex-shrink-0 text-yellow-300" />
                        <span className="text-lg">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white text-gray-900 p-6 rounded-xl shadow-2xl hover-lift">
                  <div className="text-center mb-4">
                    <Gift className="h-12 w-12 mx-auto text-pink-600 mb-3" />
                    <h4 className="text-2xl font-bold text-pink-600">बोनस स्कीम</h4>
                  </div>
                  <div className="space-y-3 text-center">
                    <p className="text-lg">
                      <strong>11 महीने</strong> लगातार
                    </p>
                    <p className="text-3xl font-bold text-pink-600">₹3,000</p>
                    <p className="text-lg">प्रति माह खरीददारी</p>
                    <div className="my-4 border-t-2 border-dashed border-pink-300"></div>
                    <p className="text-lg">
                      <strong>12वें महीने में पाएं</strong>
                    </p>
                    <p className="text-4xl font-bold text-green-600">₹3,000</p>
                    <p className="text-xl font-semibold text-pink-600">बोनस कार्ड! 🎉</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SHG Invitation Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 rounded-2xl shadow-2xl hover-lift">
              <div className="flex items-start space-x-4">
                <Package className="h-12 w-12 flex-shrink-0" />
                <div>
                  <h3 className="text-3xl font-bold mb-4">SHG (स्वयं सहायता समूह) को आमंत्रण</h3>
                  <p className="text-lg mb-4">
                    जो स्वयं सहायता समूह पहले से उत्पाद तैयार कर रहे हैं, वे अपने नमूने भेज सकते हैं।
                  </p>
                  <p className="text-lg mb-6">
                    मूल्यांकन के बाद उनसे <strong>उचित मूल्य</strong> पर उत्पाद खरीदकर मार्ट में रखा जाएगा।
                  </p>
                  <a href="https://wa.me/917073741421" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 font-bold hover-scale">
                      <Phone className="mr-2 h-5 w-5" />
                      अभी संपर्क करें
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Distributor Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-8 rounded-2xl shadow-2xl hover-lift">
              <div className="text-center">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 animate-float" />
                <h3 className="text-3xl font-bold mb-4">डिस्ट्रीब्यूटर बनें</h3>
                <p className="text-xl mb-6">
                  हम डिस्ट्रीब्यूटर बना रहे हैं ताकि अधिक से अधिक लोगों तक हमारे उत्पाद पहुँच सकें।
                </p>
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg hover-scale">
                    <p className="text-3xl font-bold mb-2">💰</p>
                    <p className="font-semibold">अच्छी कमाई</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg hover-scale">
                    <p className="text-3xl font-bold mb-2">🤝</p>
                    <p className="font-semibold">पूर्ण सहयोग</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg hover-scale">
                    <p className="text-3xl font-bold mb-2">📈</p>
                    <p className="font-semibold">व्यवसाय वृद्धि</p>
                  </div>
                </div>
                <a href="https://wa.me/917073741421" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-lg px-8 py-6 hover-scale">
                    <Phone className="mr-2 h-5 w-5" />
                    डिस्ट्रीब्यूटर के लिए संपर्क करें
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Online/Offline Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              ऑनलाइन + ऑफलाइन संचालन
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-600 to-red-600 mx-auto mb-8"></div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl shadow-lg border-2 border-blue-200 hover-lift">
                <Store className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">ऑफलाइन स्टोर</h3>
                <p className="text-gray-700 leading-relaxed">
                  पंचायत, ब्लॉक और जिला स्तर पर भौतिक दुकानें जहां आप सीधे जाकर खरीददारी कर सकते हैं।
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-lg border-2 border-purple-200 hover-lift">
                <Globe className="h-16 w-16 mx-auto mb-4 text-purple-600" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">ऑनलाइन शॉपिंग</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  वेबसाइट और मोबाइल ऐप के जरिए घर बैठे ऑर्डर करें और डिलीवरी प्राप्त करें।
                </p>
                <p className="text-sm text-gray-600 italic">
                  (जल्द ही लॉन्च होने वाला है)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              "देसी दीदी मार्ट – एक कदम आत्मनिर्भर भारत की ओर!"
            </h2>
            <p className="text-xl mb-8">
              अगर आप इस शानदार योजना का हिस्सा बनना चाहते हैं या अपने उत्पाद बेचने/खरीदने के इच्छुक हैं, तो हमसे संपर्क करें:
            </p>
            
            <div className="bg-white/20 backdrop-blur-sm p-8 rounded-2xl max-w-md mx-auto mb-8 hover-lift">
              <Phone className="h-12 w-12 mx-auto mb-4 animate-float" />
              <p className="text-lg mb-2">व्हाट्सएप पर संपर्क करें</p>
              <a href="https://wa.me/917073741421" target="_blank" rel="noopener noreferrer">
                <p className="text-4xl font-bold mb-4">7073741421</p>
              </a>
              <a href="https://wa.me/917073741421" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-white text-pink-600 hover:bg-pink-50 font-bold hover-scale">
                  <ArrowRight className="mr-2 h-5 w-5" />
                  WhatsApp पर मैसेज करें
                </Button>
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/join">
                <Button size="lg" className="bg-white text-pink-600 hover:bg-pink-50 font-bold px-8 hover-scale">
                  सदस्य बनें
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-pink-600 font-bold px-8 hover-scale">
                  ट्रस्ट के बारे में जानें
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesiDidiMart;
