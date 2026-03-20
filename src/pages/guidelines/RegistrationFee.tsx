import { IndianRupee, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const RegistrationFee = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-trust-blue to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            पंजीकरण शुल्क और जमा नीति
          </h1>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="border-b-2 border-trust-blue pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              पंजीकरण शुल्क, सुरक्षा जमा और भुगतान नीति
            </h2>
            <p className="text-gray-600">
              मेरी पहल फास्ट हेल्प आर्टिस्ट वेलफेयर एसोसिएशन (ट्रस्ट)
            </p>
          </div>

          {/* Registration Fee */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <IndianRupee className="h-6 w-6 text-trust-blue mr-2" />
              पंजीकरण शुल्क
            </h3>
            <div className="bg-trust-lightblue p-6 rounded-lg">
              <p className="text-lg text-gray-800 mb-3">
                संगठन में शामिल होने के लिए एकमुश्त पंजीकरण शुल्क देना होगा।
              </p>
              <div className="bg-white p-4 rounded border-l-4 border-trust-blue">
                <p className="text-gray-700">
                  <strong>पंजीकरण शुल्क:</strong> ₹101 (एकमुश्त)
                </p>
                <p className="text-gray-700">
                  <strong>देय समय:</strong> पंजीकरण के समय
                </p>
                <p className="text-gray-700">
                  <strong>वापसी:</strong> यह शुल्क गैर-वापसी योग्य है
                </p>
              </div>
            </div>
          </div>

          {/* Security Deposit */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">सुरक्षा जमा राशि</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-trust-blue pl-4">
                <h4 className="font-bold text-gray-900 mb-2">जमा राशि का उद्देश्य</h4>
                <p className="text-gray-700">
                  सुरक्षा जमा राशि संगठन की संपत्ति, उपकरण और विश्वास की सुरक्षा के लिए ली जाती है। 
                  यह राशि सेवा समाप्ति पर वापस की जाएगी, बशर्ते कोई देनदारी न हो।
                </p>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-600 p-6">
                <h4 className="font-bold text-gray-900 mb-3">24 घंटे की जमा नीति</h4>
                <p className="text-2xl font-bold text-amber-900 mb-2">
                  सुरक्षा जमा राशि: ₹5,000
                </p>
                <p className="text-lg font-semibold text-amber-900 mb-2">
                  पंजीकरण के 24 घंटों के भीतर जमा करनी होगी
                </p>
                <ul className="space-y-2 text-gray-800 mt-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>24 घंटे के भीतर जमा: पंजीकरण पूर्ण और सक्रिय</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>24 घंटे के बाद: स्वचालित चेतावनी + पंजीकरण निलंबित</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">भुगतान के तरीके</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-gray-300 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">ऑनलाइन भुगतान</h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• UPI (Google Pay, PhonePe, Paytm)</li>
                  <li>• बैंक ट्रांसफर / NEFT / RTGS</li>
                  <li>• डेबिट/क्रेडिट कार्ड</li>
                </ul>
              </div>
              <div className="border border-gray-300 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">नकद भुगतान</h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• कार्यालय में व्यक्तिगत रूप से</li>
                  <li>• रसीद अनिवार्य</li>
                  <li>• अधिकृत व्यक्ति से ही लेनदेन</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Payment Verification */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">भुगतान सत्यापन</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4">
                भुगतान करने के बाद निम्नलिखित जानकारी और दस्तावेज प्रदान करें:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">1.</span>
                  <span>भुगतान की रसीद या स्क्रीनशॉट</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">2.</span>
                  <span>Transaction ID / Reference Number</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">3.</span>
                  <span>भुगतान की तिथि और समय</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">4.</span>
                  <span>भुगतान करने वाले का नाम (पंजीकृत नाम से मेल खाना चाहिए)</span>
                </li>
              </ul>
              <p className="text-sm text-gray-600 mt-4">
                सत्यापन में 2-24 घंटे लग सकते हैं। सत्यापन के बाद ही पंजीकरण सक्रिय होगा।
              </p>
            </div>
          </div>

          {/* Refund Policy */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">वापसी नीति</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-green-600 pl-4 bg-green-50 p-4">
                <h4 className="font-bold text-gray-900 mb-2">सुरक्षा जमा वापसी</h4>
                <p className="text-gray-700 mb-2">
                  सुरक्षा जमा राशि निम्नलिखित परिस्थितियों में वापस की जाएगी:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>स्वेच्छा से सेवा छोड़ने पर (उचित नोटिस के साथ)</li>
                  <li>सभी देनदारियां चुकाने के बाद</li>
                  <li>कोई लंबित कार्य या शिकायत न हो</li>
                  <li>सभी संगठन की संपत्ति वापस करने के बाद</li>
                </ul>
                <p className="text-sm text-gray-600 mt-2">
                  वापसी प्रक्रिया 15-30 दिनों में पूर्ण होगी।
                </p>
              </div>

              <div className="border-l-4 border-red-600 pl-4 bg-red-50 p-4">
                <h4 className="font-bold text-gray-900 mb-2">जमा राशि जब्त होने की स्थिति</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>झूठी जानकारी प्रदान करने पर</li>
                  <li>अनुशासनात्मक कारणों से सेवा समाप्ति पर</li>
                  <li>संगठन की संपत्ति में क्षति या चोरी</li>
                  <li>बिना सूचना के अचानक नौकरी छोड़ना</li>
                  <li>किसी भी वित्तीय देनदारी के मामले में</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Late Payment Consequences */}
          <div className="mb-8 bg-red-50 border-l-4 border-red-600 p-6">
            <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center">
              <Clock className="h-6 w-6 mr-2" />
              देर से भुगतान के परिणाम
            </h3>
            <div className="space-y-3 text-gray-800">
              <p>
                <strong>24 घंटे के बाद:</strong> स्वचालित चेतावनी + पंजीकरण अस्थायी रूप से निलंबित
              </p>
              <p>
                <strong>48 घंटे के बाद:</strong> पंजीकरण रद्द हो सकता है
              </p>
              <p>
                <strong>बिना भुगतान के कार्य शुरू करना:</strong> सख्त कार्रवाई
              </p>
            </div>
          </div>

          {/* Declaration */}
          <div className="border-t-2 border-gray-300 pt-6 mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3">घोषणा</h3>
            <p className="text-gray-700 mb-4">
              मैं घोषणा करता/करती हूं कि मैंने पंजीकरण शुल्क और सुरक्षा जमा नीति को पूर्णतः पढ़ और समझ लिया है। 
              मैं 24 घंटों के भीतर आवश्यक राशि जमा करने के लिए सहमत हूं। मैं समझता/समझती हूं कि देरी या गैर-भुगतान 
              से मेरा पंजीकरण रद्द हो सकता है। मैं वापसी नीति से भी अवगत हूं।
            </p>
            <p className="text-sm text-gray-600">
              यह नीति राजस्थान न्यायालय के अधिकार क्षेत्र में आती है।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationFee;