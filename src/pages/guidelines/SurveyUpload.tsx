import { Upload, AlertCircle, CheckCircle } from 'lucide-react';

const SurveyUpload = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-trust-blue to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            सर्वे अपलोड नीति
          </h1>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="border-b-2 border-trust-blue pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              दैनिक सर्वे अपलोड नीति और दिशानिर्देश
            </h2>
            <p className="text-gray-600">
              मेरी पहल फास्ट हेल्प आर्टिस्ट वेलफेयर एसोसिएशन (ट्रस्ट)
            </p>
          </div>

          {/* Daily Limit */}
          <div className="mb-8 bg-amber-50 border-l-4 border-amber-600 p-6">
            <div className="flex items-center mb-3">
              <AlertCircle className="h-6 w-6 text-amber-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">दैनिक सर्वे सीमा</h3>
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-2">
              प्रतिदिन अधिकतम 20 सर्वे की सीमा है
            </p>
            <p className="text-gray-700">
              कोई भी सदस्य एक दिन में 20 से अधिक सर्वे अपलोड नहीं कर सकता। यह सीमा गुणवत्ता नियंत्रण और कार्य के समान वितरण को सुनिश्चित करने के लिए निर्धारित की गई है।
            </p>
          </div>

          {/* Upload Guidelines */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">अपलोड दिशानिर्देश</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-trust-blue pl-4">
                <h4 className="font-bold text-gray-900 mb-2">1. सर्वे की गुणवत्ता</h4>
                <p className="text-gray-700 mb-2">
                  प्रत्येक सर्वे में निम्नलिखित जानकारी पूर्ण और सही होनी चाहिए:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>उत्तरदाता का पूरा नाम</li>
                  <li>संपर्क विवरण (मोबाइल नंबर/पता)</li>
                  <li>सभी प्रश्नों के उत्तर</li>
                  <li>आवश्यक हस्ताक्षर या सहमति</li>
                  <li>सर्वे की तिथि और समय</li>
                </ul>
              </div>

              <div className="border-l-4 border-trust-blue pl-4">
                <h4 className="font-bold text-gray-900 mb-2">2. डेटा की सत्यता</h4>
                <p className="text-gray-700">
                  सर्वे में दी गई सभी जानकारी पूर्णतः सत्य और वास्तविक होनी चाहिए। 
                  झूठी या बनावटी जानकारी प्रदान करना गंभीर अनुशासनात्मक कार्रवाई का कारण बनेगा।
                </p>
              </div>

              <div className="border-l-4 border-trust-blue pl-4">
                <h4 className="font-bold text-gray-900 mb-2">3. अपलोड का समय</h4>
                <p className="text-gray-700">
                  सर्वे डेटा को उसी दिन सिस्टम में अपलोड किया जाना चाहिए जिस दिन सर्वे किया गया हो। 
                  पुराने सर्वे (1 दिन से अधिक पुराने) स्वीकार नहीं किए जाएंगे।
                </p>
              </div>

              <div className="border-l-4 border-trust-blue pl-4">
                <h4 className="font-bold text-gray-900 mb-2">4. डुप्लीकेट सर्वे</h4>
                <p className="text-gray-700">
                  एक ही व्यक्ति का सर्वे एक निर्धारित अवधि में केवल एक बार ही किया जा सकता है। 
                  डुप्लीकेट सर्वे की जांच सिस्टम द्वारा स्वचालित रूप से की जाती है।
                </p>
              </div>
            </div>
          </div>

          {/* Quality Check */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">गुणवत्ता जांच</h3>
            <div className="bg-trust-lightblue p-6 rounded-lg">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>नियमित रूप से सर्वे की गुणवत्ता की जांच की जाती है</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>संदिग्ध सर्वे के लिए सत्यापन फोन कॉल की जा सकती है</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>गुणवत्ता मानकों को पूरा न करने पर सर्वे अस्वीकृत किया जा सकता है</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>बार-बार खराब गुणवत्ता के सर्वे चेतावनी का कारण बन सकते हैं</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Penalties */}
          <div className="mb-8 bg-red-50 border-l-4 border-red-600 p-6">
            <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center">
              <AlertCircle className="h-6 w-6 mr-2" />
              उल्लंघन और दंड
            </h3>
            <div className="space-y-3 text-gray-800">
              <p>
                <strong>झूठी जानकारी:</strong> तत्काल सेवा समाप्ति
              </p>
              <p>
                <strong>20 से अधिक सर्वे:</strong> अतिरिक्त सर्वे अस्वीकृत + चेतावनी
              </p>
              <p>
                <strong>डुप्लीकेट सर्वे:</strong> सर्वे अस्वीकृत + पहली बार में चेतावनी
              </p>
              <p>
                <strong>अपूर्ण डेटा:</strong> सर्वे अस्वीकृत + सुधार का एक मौका
              </p>
            </div>
          </div>

          {/* Best Practices */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              <Upload className="inline h-6 w-6 mr-2 text-trust-blue" />
              सर्वोत्तम प्रथाएं
            </h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span>सर्वे करते समय सभी विवरण स्पष्ट रूप से लिखें</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span>उत्तरदाता की सहमति अवश्य लें</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span>मोबाइल नंबर की पुष्टि करें (दोबारा पढ़कर सुनें)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span>फोटो लें यदि आवश्यक हो (गोपनीयता का ध्यान रखें)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span>अपलोड करने से पहले सभी फील्ड की जांच करें</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Declaration */}
          <div className="border-t-2 border-gray-300 pt-6 mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3">घोषणा</h3>
            <p className="text-gray-700 mb-4">
              मैं घोषणा करता/करती हूं कि मैं सभी सर्वे डेटा सत्यता और ईमानदारी से एकत्र करूंगा/करूंगी। 
              मैं दैनिक सीमा का पालन करूंगा/करूंगी और केवल गुणवत्तापूर्ण सर्वे ही अपलोड करूंगा/करूंगी। 
              झूठी जानकारी प्रदान करने पर मेरी सेवा तत्काल समाप्त की जा सकती है, इस बात से मैं अवगत हूं।
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

export default SurveyUpload;