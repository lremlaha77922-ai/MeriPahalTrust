import { FileText, Clock, AlertTriangle } from 'lucide-react';

const PdfSubmission = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-trust-blue to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            दैनिक PDF जमा नीति
          </h1>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="border-b-2 border-trust-blue pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              दैनिक PDF रिपोर्ट जमा करने की नीति
            </h2>
            <p className="text-gray-600">
              मेरी पहल फास्ट हेल्प आर्टिस्ट वेलफेयर एसोसिएशन (ट्रस्ट)
            </p>
          </div>

          {/* Timing Section */}
          <div className="mb-8 bg-red-50 border-l-4 border-red-600 p-6">
            <div className="flex items-center mb-3">
              <Clock className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">अनिवार्य जमा समय</h3>
            </div>
            <p className="text-2xl font-bold text-red-600 mb-3">
              सुबह 6:00 बजे से 7:00 बजे के बीच
            </p>
            <div className="space-y-2 text-gray-800">
              <p className="flex items-center">
                <span className="w-3 h-3 bg-green-600 rounded-full mr-2"></span>
                <strong>6:00 AM - 7:00 AM:</strong> समय पर जमा (स्वीकृत)
              </p>
              <p className="flex items-center">
                <span className="w-3 h-3 bg-red-600 rounded-full mr-2"></span>
                <strong>7:00 AM के बाद:</strong> विलंब चिह्नित (अस्वीकार्य)
              </p>
            </div>
          </div>

          {/* PDF Requirements */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              <FileText className="inline h-6 w-6 mr-2 text-trust-blue" />
              PDF की आवश्यकताएं
            </h3>
            <div className="space-y-4">
              <div className="border-l-4 border-trust-blue pl-4">
                <h4 className="font-bold text-gray-900 mb-2">1. फाइल प्रारूप</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>केवल PDF फॉर्मेट स्वीकार्य</li>
                  <li>अधिकतम फाइल साइज: 5 MB</li>
                  <li>स्पष्ट और पठनीय गुणवत्ता</li>
                  <li>सभी पेज पूर्ण रूप से दृश्यमान</li>
                </ul>
              </div>

              <div className="border-l-4 border-trust-blue pl-4">
                <h4 className="font-bold text-gray-900 mb-2">2. रिपोर्ट की सामग्री</h4>
                <p className="text-gray-700 mb-2">दैनिक PDF रिपोर्ट में निम्नलिखित जानकारी होनी चाहिए:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>कार्य की तिथि</li>
                  <li>सदस्य का नाम और ID</li>
                  <li>दिन भर में किए गए सर्वे की सूची</li>
                  <li>कुल सर्वे संख्या</li>
                  <li>कार्य क्षेत्र का विवरण</li>
                  <li>किसी भी समस्या या विशेष टिप्पणी</li>
                </ul>
              </div>

              <div className="border-l-4 border-trust-blue pl-4">
                <h4 className="font-bold text-gray-900 mb-2">3. फाइल नामकरण</h4>
                <p className="text-gray-700">
                  PDF फाइल का नाम निम्न प्रारूप में होना चाहिए:
                </p>
                <div className="bg-gray-100 p-3 rounded mt-2 font-mono text-sm">
                  [आपका नाम]_[तिथि]_DailyReport.pdf
                  <br />
                  उदाहरण: RajeshKumar_15Jan2024_DailyReport.pdf
                </div>
              </div>
            </div>
          </div>

          {/* Submission Process */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">जमा करने की प्रक्रिया</h3>
            <div className="bg-trust-lightblue p-6 rounded-lg">
              <ol className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="font-bold text-trust-blue mr-3">1.</span>
                  <span>पिछले दिन के सभी सर्वे का डेटा एकत्र करें</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-trust-blue mr-3">2.</span>
                  <span>निर्धारित फॉर्मेट में दैनिक रिपोर्ट तैयार करें</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-trust-blue mr-3">3.</span>
                  <span>रिपोर्ट को PDF में परिवर्तित करें</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-trust-blue mr-3">4.</span>
                  <span>सुबह 6:00 से 7:00 के बीच सिस्टम में अपलोड करें</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-trust-blue mr-3">5.</span>
                  <span>सफल अपलोड की पुष्टि प्राप्त करें</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Late Submission */}
          <div className="mb-8 bg-amber-50 border-l-4 border-amber-600 p-6">
            <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2" />
              विलंब से जमा करने के परिणाम
            </h3>
            <div className="space-y-3 text-gray-800">
              <p>
                <strong>7:00 AM के बाद जमा:</strong> रिपोर्ट "विलंबित" चिह्नित होगी
              </p>
              <p>
                <strong>बार-बार विलंब:</strong> चेतावनी जारी की जाएगी
              </p>
              <p>
                <strong>PDF जमा न करना:</strong> गंभीर अनुशासनात्मक कार्रवाई
              </p>
              <p className="text-sm mt-4">
                नोट: आपातकालीन परिस्थितियों में विलंब के लिए पूर्व सूचना अनिवार्य है।
              </p>
            </div>
          </div>

          {/* Quality Standards */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">गुणवत्ता मानक</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span>सभी पेज स्पष्ट और पठनीय होने चाहिए</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span>कोई पेज छूटना नहीं चाहिए</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span>सभी आवश्यक जानकारी पूर्ण होनी चाहिए</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span>डेटा में कोई विरोधाभास नहीं होना चाहिए</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span>हस्ताक्षर या डिजिटल प्रमाणीकरण (यदि आवश्यक हो)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Technical Issues */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">तकनीकी समस्याएं</h3>
            <div className="border border-gray-300 rounded-lg p-6">
              <p className="text-gray-700 mb-3">
                यदि तकनीकी कारणों से समय पर PDF जमा नहीं कर पाते हैं:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>तुरंत WhatsApp या फोन से सूचित करें</li>
                <li>समस्या का स्क्रीनशॉट लें</li>
                <li>समस्या हल होने पर तुरंत अपलोड करें</li>
                <li>प्रशासन से अनुमति लें विलंब के लिए</li>
              </ul>
              <p className="text-sm text-gray-600 mt-3">
                वैध तकनीकी कारणों को विचार में लिया जाएगा, लेकिन प्रमाण आवश्यक है।
              </p>
            </div>
          </div>

          {/* Declaration */}
          <div className="border-t-2 border-gray-300 pt-6 mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3">घोषणा</h3>
            <p className="text-gray-700 mb-4">
              मैं घोषणा करता/करती हूं कि मैं प्रतिदिन सुबह 6:00 से 7:00 बजे के बीच दैनिक PDF रिपोर्ट जमा करूंगा/करूंगी। 
              रिपोर्ट में दी गई सभी जानकारी सत्य और सटीक होगी। मैं समझता/समझती हूं कि इस नियम का पालन न करने पर 
              अनुशासनात्मक कार्रवाई की जा सकती है।
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

export default PdfSubmission;