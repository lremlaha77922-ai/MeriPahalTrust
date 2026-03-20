import { Scale, MapPin, FileText, Shield } from 'lucide-react';

const Legal = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-trust-blue to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            कानूनी क्षेत्राधिकार और नियम
          </h1>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="border-b-2 border-trust-blue pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              कानूनी प्रावधान और क्षेत्राधिकार
            </h2>
            <p className="text-gray-600">
              मेरी पहल फास्ट हेल्प आर्टिस्ट वेलफेयर एसोसिएशन (ट्रस्ट)
            </p>
          </div>

          {/* Jurisdiction */}
          <div className="mb-8 bg-blue-50 border-2 border-trust-blue p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <MapPin className="h-8 w-8 text-trust-blue mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">क्षेत्राधिकार</h3>
            </div>
            <p className="text-3xl font-bold text-trust-blue mb-4">राजस्थान न्यायालय</p>
            <p className="text-lg text-gray-800">
              इस संगठन से संबंधित सभी कानूनी मामले, विवाद और न्यायिक कार्यवाही केवल और केवल 
              <strong> जयपुर, राजस्थान</strong> के न्यायालयों के अधिकार क्षेत्र में होंगी।
            </p>
          </div>

          {/* Organization Details */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="h-6 w-6 text-trust-blue mr-2" />
              संगठन का विवरण
            </h3>
            <div className="bg-gray-50 p-6 rounded-lg space-y-3">
              <div className="border-b border-gray-300 pb-3">
                <p className="text-sm text-gray-600 mb-1">संगठन का पूरा नाम</p>
                <p className="text-lg font-semibold text-gray-900">
                  मेरी पहल फास्ट हेल्प आर्टिस्ट वेलफेयर एसोसिएशन (ट्रस्ट)
                </p>
              </div>
              <div className="border-b border-gray-300 pb-3">
                <p className="text-sm text-gray-600 mb-1">संगठन का प्रकार</p>
                <p className="text-lg font-semibold text-gray-900">पंजीकृत ट्रस्ट (Registered Trust)</p>
              </div>
              <div className="border-b border-gray-300 pb-3">
                <p className="text-sm text-gray-600 mb-1">मुख्यालय</p>
                <p className="text-lg font-semibold text-gray-900">जयपुर, राजस्थान, भारत</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">कानूनी क्षेत्राधिकार</p>
                <p className="text-lg font-semibold text-gray-900">राजस्थान न्यायालय</p>
              </div>
            </div>
          </div>

          {/* Legal Framework */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Scale className="h-6 w-6 text-trust-blue mr-2" />
              कानूनी ढांचा
            </h3>
            <div className="space-y-4">
              <div className="border-l-4 border-trust-blue pl-4">
                <h4 className="font-bold text-gray-900 mb-2">1. लागू कानून</h4>
                <p className="text-gray-700">
                  यह संगठन और इसकी सभी गतिविधियां भारतीय संविधान, भारतीय ट्रस्ट अधिनियम, 
                  और राजस्थान राज्य के सभी लागू कानूनों के अधीन हैं।
                </p>
              </div>

              <div className="border-l-4 border-trust-blue pl-4">
                <h4 className="font-bold text-gray-900 mb-2">2. अनुबंध की वैधता</h4>
                <p className="text-gray-700">
                  संगठन और सदस्यों के बीच सभी समझौते भारतीय अनुबंध अधिनियम, 1872 के अनुसार मान्य हैं। 
                  पंजीकरण फॉर्म भरना और स्वीकृति प्राप्त करना कानूनी रूप से बाध्यकारी अनुबंध माना जाएगा।
                </p>
              </div>

              <div className="border-l-4 border-trust-blue pl-4">
                <h4 className="font-bold text-gray-900 mb-2">3. डिजिटल हस्ताक्षर</h4>
                <p className="text-gray-700">
                  ऑनलाइन फॉर्म में डिजिटल रूप से दी गई स्वीकृति और घोषणाएं सूचना प्रौद्योगिकी अधिनियम, 2000 
                  के तहत कानूनी रूप से मान्य हैं और भौतिक हस्ताक्षर के समतुल्य मानी जाएंगी।
                </p>
              </div>
            </div>
          </div>

          {/* Dispute Resolution */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">विवाद समाधान</h3>
            <div className="bg-amber-50 border-l-4 border-amber-600 p-6">
              <h4 className="font-bold text-gray-900 mb-3">विवाद की स्थिति में प्रक्रिया:</h4>
              <ol className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="font-bold text-trust-blue mr-3 flex-shrink-0">1.</span>
                  <div>
                    <p className="font-semibold">आंतरिक समाधान</p>
                    <p className="text-sm">पहले संगठन के प्रबंधन से बात करें। अधिकांश मुद्दे आपसी चर्चा से हल हो जाते हैं।</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-trust-blue mr-3 flex-shrink-0">2.</span>
                  <div>
                    <p className="font-semibold">लिखित शिकायत</p>
                    <p className="text-sm">यदि मौखिक चर्चा से समाधान नहीं होता, तो लिखित शिकायत दर्ज करें।</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-trust-blue mr-3 flex-shrink-0">3.</span>
                  <div>
                    <p className="font-semibold">मध्यस्थता</p>
                    <p className="text-sm">यदि आवश्यक हो, तो दोनों पक्ष मध्यस्थता के लिए सहमत हो सकते हैं।</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-trust-blue mr-3 flex-shrink-0">4.</span>
                  <div>
                    <p className="font-semibold">कानूनी कार्रवाई</p>
                    <p className="text-sm">अंतिम उपाय के रूप में, विवाद को राजस्थान न्यायालय में ले जाया जा सकता है।</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>

          {/* Member Rights */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Shield className="h-6 w-6 text-trust-blue mr-2" />
              सदस्यों के अधिकार
            </h3>
            <div className="bg-green-50 p-6 rounded-lg">
              <p className="text-gray-800 mb-4">संगठन के प्रत्येक सदस्य को निम्नलिखित अधिकार प्राप्त हैं:</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 font-bold mr-3">✓</span>
                  <span>स्पष्ट और पारदर्शी नियमों और शर्तों का अधिकार</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 font-bold mr-3">✓</span>
                  <span>निष्पक्ष व्यवहार और समान अवसर का अधिकार</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 font-bold mr-3">✓</span>
                  <span>समय पर भुगतान प्राप्त करने का अधिकार</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 font-bold mr-3">✓</span>
                  <span>शिकायत दर्ज करने और सुनवाई का अधिकार</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 font-bold mr-3">✓</span>
                  <span>व्यक्तिगत और वित्तीय डेटा की गोपनीयता का अधिकार</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 font-bold mr-3">✓</span>
                  <span>सुरक्षित और सम्मानजनक कार्य वातावरण का अधिकार</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 font-bold mr-3">✓</span>
                  <span>कानूनी उपाय तलाशने का अधिकार</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Member Responsibilities */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">सदस्यों के कर्तव्य</h3>
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-gray-800 mb-4">प्रत्येक सदस्य को निम्नलिखित कर्तव्यों का पालन करना होगा:</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span>सभी नियमों और दिशानिर्देशों का पालन करना</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span>सत्य और सटीक जानकारी प्रदान करना</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span>संगठन की संपत्ति और प्रतिष्ठा की रक्षा करना</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span>गोपनीय जानकारी की सुरक्षा बनाए रखना</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span>अनुशासित और पेशेवर आचरण बनाए रखना</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span>सभी वित्तीय दायित्वों को पूरा करना</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Privacy and Data Protection */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">गोपनीयता और डेटा सुरक्षा</h3>
            <div className="border border-gray-300 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                संगठन सदस्यों की व्यक्तिगत और वित्तीय जानकारी की सुरक्षा को गंभीरता से लेता है:
              </p>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• सभी व्यक्तिगत डेटा सुरक्षित रूप से संग्रहीत किया जाता है</li>
                <li>• जानकारी केवल आधिकारिक उद्देश्यों के लिए उपयोग की जाती है</li>
                <li>• सदस्य की सहमति के बिना तीसरे पक्ष को डेटा साझा नहीं किया जाता</li>
                <li>• सदस्य अपनी जानकारी देखने और अपडेट करने का अनुरोध कर सकते हैं</li>
                <li>• डेटा सुरक्षा सूचना प्रौद्योगिकी अधिनियम, 2000 के अनुसार है</li>
              </ul>
            </div>
          </div>

          {/* Amendments */}
          <div className="mb-8 bg-gray-100 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">नियमों में संशोधन</h3>
            <p className="text-gray-700">
              संगठन को किसी भी नीति या नियम में संशोधन करने का अधिकार है। सभी परिवर्तनों की सूचना 
              सदस्यों को कम से कम 15 दिन पहले दी जाएगी। संशोधित नियम सूचना की तिथि से लागू होंगे।
            </p>
          </div>

          {/* Final Declaration */}
          <div className="border-t-2 border-gray-300 pt-6 mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3">अंतिम घोषणा और स्वीकृति</h3>
            <div className="bg-blue-50 border-l-4 border-trust-blue p-6">
              <p className="text-gray-800 mb-4">
                मैं, <strong>[सदस्य का नाम]</strong>, घोषणा करता/करती हूं कि:
              </p>
              <ul className="space-y-2 text-gray-700 mb-4">
                <li>1. मैंने सभी नियम, शर्तें और दिशानिर्देश पूर्णतः पढ़ और समझ लिए हैं</li>
                <li>2. मैं स्वेच्छा से और बिना किसी दबाव के इन नियमों को स्वीकार करता/करती हूं</li>
                <li>3. मैं समझता/समझती हूं कि ये नियम कानूनी रूप से बाध्यकारी हैं</li>
                <li>4. मैं राजस्थान न्यायालय के क्षेत्राधिकार को स्वीकार करता/करती हूं</li>
                <li>5. मैं सभी दायित्वों और जिम्मेदारियों को पूरा करने के लिए प्रतिबद्ध हूं</li>
              </ul>
              <p className="text-sm text-gray-600 font-semibold mt-6">
                इस घोषणा पर आपका डिजिटल हस्ताक्षर कानूनी रूप से मान्य है और भौतिक हस्ताक्षर के समतुल्य माना जाएगा।
              </p>
            </div>
          </div>

          {/* Jurisdiction Reminder */}
          <div className="mt-8 bg-trust-blue text-white p-6 rounded-lg text-center">
            <Scale className="h-12 w-12 mx-auto mb-3" />
            <p className="text-xl font-bold mb-2">
              केवल राजस्थान न्यायालय का क्षेत्राधिकार
            </p>
            <p className="text-sm">
              सभी कानूनी मामले जयपुर, राजस्थान के न्यायालयों में ही सुने जाएंगे
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;