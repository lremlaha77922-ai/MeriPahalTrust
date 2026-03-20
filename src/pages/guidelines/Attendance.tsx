import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const Attendance = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-trust-blue to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            उपस्थिति नीति
          </h1>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          {/* Document Header */}
          <div className="border-b-2 border-trust-blue pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              दैनिक उपस्थिति नीति और नियम
            </h2>
            <p className="text-gray-600">
              मेरी पहल फास्ट हेल्प आर्टिस्ट वेलफेयर एसोसिएशन (ट्रस्ट)
            </p>
          </div>

          {/* Timing Section */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 text-trust-blue mr-3" />
              <h3 className="text-xl font-bold text-gray-900">उपस्थिति समय</h3>
            </div>
            <div className="bg-trust-lightblue p-6 rounded-lg">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                प्रतिदिन सुबह 9:00 बजे से 9:15 बजे के बीच उपस्थिति अनिवार्य है
              </p>
              <ul className="space-y-2 text-gray-700 mt-4">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>9:00 AM - 9:15 AM: समय पर उपस्थिति</span>
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>9:15 AM के बाद: विलंब माना जाएगा</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Attendance Rules */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">उपस्थिति के नियम</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-trust-blue pl-4">
                <h4 className="font-bold text-gray-900 mb-2">1. दैनिक उपस्थिति</h4>
                <p className="text-gray-700">
                  प्रत्येक कार्य दिवस पर सुबह 9:00 बजे से 9:15 बजे के बीच उपस्थिति दर्ज करना अनिवार्य है। 
                  उपस्थिति ऑनलाइन सिस्टम या निर्धारित तरीके से दर्ज की जाएगी।
                </p>
              </div>

              <div className="border-l-4 border-amber-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-2">2. अनुपस्थिति की सीमा</h4>
                <p className="text-gray-700 mb-2">
                  <strong className="text-red-600">महत्वपूर्ण:</strong> लगातार या कुल 5 दिनों की अनुपस्थिति पर स्वचालित चेतावनी जारी की जाएगी।
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>1-4 दिन अनुपस्थित: सूचना पत्र</li>
                  <li>5 दिन अनुपस्थित: प्रथम चेतावनी</li>
                  <li>अनुमति के बिना अनुपस्थिति गंभीर मामला माना जाएगा</li>
                </ul>
              </div>

              <div className="border-l-4 border-trust-blue pl-4">
                <h4 className="font-bold text-gray-900 mb-2">3. आकस्मिक अवकाश</h4>
                <p className="text-gray-700">
                  आपातकालीन स्थिति में अवकाश लेने के लिए कम से कम 24 घंटे पहले सूचना देना आवश्यक है। 
                  सूचना WhatsApp या फोन कॉल के माध्यम से आधिकारिक नंबर पर दी जा सकती है।
                </p>
              </div>

              <div className="border-l-4 border-trust-blue pl-4">
                <h4 className="font-bold text-gray-900 mb-2">4. चिकित्सा अवकाश</h4>
                <p className="text-gray-700">
                  चिकित्सा कारणों से अनुपस्थिति के लिए डॉक्टर का प्रमाण पत्र प्रस्तुत करना होगा। 
                  बिना प्रमाण के लंबी अनुपस्थिति अस्वीकार्य है।
                </p>
              </div>
            </div>
          </div>

          {/* Warning System */}
          <div className="mb-8 bg-red-50 border-l-4 border-red-600 p-6">
            <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2" />
              चेतावनी प्रणाली
            </h3>
            <div className="space-y-3 text-gray-800">
              <p>
                <strong>5 दिन की अनुपस्थिति = 1 चेतावनी</strong>
              </p>
              <p>
                <strong className="text-red-600">3 चेतावनी = तत्काल सेवा समाप्ति</strong>
              </p>
              <p className="text-sm mt-4">
                नोट: चेतावनियां संचयी होती हैं और पूरे कार्यकाल में गणना की जाती हैं। 
                एक बार जारी की गई चेतावनी को रद्द नहीं किया जा सकता।
              </p>
            </div>
          </div>

          {/* Record Keeping */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">उपस्थिति रिकॉर्ड</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span>सभी उपस्थिति रिकॉर्ड डिजिटल सिस्टम में संग्रहीत किए जाते हैं</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span>प्रत्येक सदस्य अपना उपस्थिति इतिहास ऑनलाइन देख सकता है</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span>मासिक उपस्थिति रिपोर्ट जनरेट की जाती है</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span>विवाद की स्थिति में डिजिटल रिकॉर्ड ही मान्य होगा</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Declaration */}
          <div className="border-t-2 border-gray-300 pt-6 mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3">घोषणा</h3>
            <p className="text-gray-700 mb-4">
              मैं उपरोक्त सभी नियमों और शर्तों को पढ़ और समझ चुका/चुकी हूं। मैं इन नियमों का पूर्ण रूप से पालन करने के लिए सहमत हूं। 
              मुझे ज्ञात है कि इन नियमों का उल्लंघन मेरी सेवा समाप्ति का कारण बन सकता है।
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

export default Attendance;