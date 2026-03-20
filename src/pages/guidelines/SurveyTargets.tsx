import { Target, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

const SurveyTargets = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-trust-blue to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            सर्वे लक्ष्य और मानक
          </h1>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="border-b-2 border-trust-blue pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              दैनिक, साप्ताहिक और मासिक सर्वे लक्ष्य
            </h2>
            <p className="text-gray-600">
              मेरी पहल फास्ट हेल्प आर्टिस्ट वेलफेयर एसोसिएशन (ट्रस्ट)
            </p>
          </div>

          {/* Target Overview */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Target className="h-6 w-6 text-trust-blue mr-2" />
              लक्ष्य अवलोकन
            </h3>
            <p className="text-gray-700 mb-6">
              प्रत्येक सदस्य को निर्धारित लक्ष्यों को प्राप्त करना अनिवार्य है। ये लक्ष्य संगठन की सफलता और 
              सदस्यों के प्रदर्शन मूल्यांकन का आधार हैं।
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Daily Target */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-trust-blue rounded-lg p-6 text-center">
                <Calendar className="h-12 w-12 text-trust-blue mx-auto mb-3" />
                <h4 className="text-lg font-bold text-gray-900 mb-2">दैनिक लक्ष्य</h4>
                <div className="text-4xl font-bold text-trust-blue mb-2">10</div>
                <p className="text-gray-700 text-sm">सर्वे प्रति दिन (न्यूनतम)</p>
              </div>

              {/* Weekly Target */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-600 rounded-lg p-6 text-center">
                <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-gray-900 mb-2">साप्ताहिक लक्ष्य</h4>
                <div className="text-4xl font-bold text-green-600 mb-2">70</div>
                <p className="text-gray-700 text-sm">सर्वे प्रति सप्ताह</p>
              </div>

              {/* Monthly Target */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-trust-gold rounded-lg p-6 text-center">
                <Target className="h-12 w-12 text-trust-gold mx-auto mb-3" />
                <h4 className="text-lg font-bold text-gray-900 mb-2">मासिक लक्ष्य</h4>
                <div className="text-4xl font-bold text-trust-gold mb-2">306</div>
                <p className="text-gray-700 text-sm">सर्वे प्रति महीना</p>
              </div>
            </div>
          </div>

          {/* Daily Target Details */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">दैनिक लक्ष्य विवरण</h3>
            <div className="bg-trust-lightblue p-6 rounded-lg">
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    न्यूनतम: 10 सर्वे प्रतिदिन
                  </p>
                  <p className="text-gray-700">
                    यह न्यूनतम आवश्यकता है। प्रतिदिन कम से कम 10 सर्वे पूर्ण करना अनिवार्य है।
                  </p>
                </div>
                <div className="bg-white p-4 rounded border-l-4 border-trust-blue">
                  <p className="text-gray-800">
                    <strong>महत्वपूर्ण:</strong> यदि किसी दिन 10 से कम सर्वे होते हैं, तो अगले दिन की कमी पूरी करनी होगी।
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    उदाहरण: यदि सोमवार को केवल 8 सर्वे हुए, तो मंगलवार को कम से कम 12 सर्वे करने होंगे (10 + 2 बकाया)।
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Target Details */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">साप्ताहिक लक्ष्य विवरण</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-green-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-2">कुल साप्ताहिक लक्ष्य: 70 सर्वे</h4>
                <p className="text-gray-700 mb-3">
                  सोमवार से रविवार तक कुल 70 सर्वे पूर्ण करना आवश्यक है।
                </p>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-gray-700 mb-2"><strong>गणना:</strong></p>
                  <p className="text-sm text-gray-600">
                    7 दिन × 10 सर्वे = 70 साप्ताहिक सर्वे
                  </p>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <p className="text-gray-800">
                  <strong>लचीलापन:</strong> यदि किसी दिन अवकाश लिया गया है, तो अन्य दिनों में अतिरिक्त सर्वे करके साप्ताहिक लक्ष्य पूरा किया जा सकता है।
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Target Details */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">मासिक लक्ष्य विवरण</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-trust-gold pl-4">
                <h4 className="font-bold text-gray-900 mb-2">कुल मासिक लक्ष्य: 306 सर्वे</h4>
                <p className="text-gray-700 mb-3">
                  महीने के अंत तक कुल 306 सर्वे पूर्ण होने चाहिए।
                </p>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-gray-700 mb-2"><strong>गणना आधार:</strong></p>
                  <p className="text-sm text-gray-600 mb-1">
                    औसत 30.6 दिन × 10 सर्वे = 306 मासिक सर्वे
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    (यह गणना 365 ÷ 12 = 30.6 औसत दिन प्रति माह के आधार पर की गई है)
                  </p>
                </div>
              </div>
              <div className="bg-amber-50 p-4 rounded border border-amber-300">
                <p className="text-gray-800 mb-2">
                  <strong>मासिक समीक्षा:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                  <li>प्रत्येक महीने के अंत में प्रदर्शन समीक्षा की जाएगी</li>
                  <li>306 से कम सर्वे पर कारण पूछा जाएगा</li>
                  <li>लगातार कम प्रदर्शन पर चेतावनी जारी होगी</li>
                  <li>उत्कृष्ट प्रदर्शन पर प्रोत्साहन दिया जाएगा</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Performance Tracking */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">प्रदर्शन ट्रैकिंग</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4">
                आपका प्रदर्शन निम्नलिखित तरीकों से ट्रैक किया जाएगा:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span>दैनिक सर्वे काउंट ऑनलाइन डैशबोर्ड पर दिखाई देगा</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span>साप्ताहिक प्रगति रिपोर्ट जनरेट होगी</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span>मासिक समीक्षा में विस्तृत विश्लेषण</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span>लक्ष्य से कम होने पर स्वचालित अलर्ट</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Consequences */}
          <div className="mb-8 bg-red-50 border-l-4 border-red-600 p-6">
            <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center">
              <AlertCircle className="h-6 w-6 mr-2" />
              लक्ष्य न पूरा होने के परिणाम
            </h3>
            <div className="space-y-3 text-gray-800">
              <p>
                <strong>दैनिक लक्ष्य कम:</strong> अगले दिन कमी पूरी करनी होगी
              </p>
              <p>
                <strong>साप्ताहिक लक्ष्य कम:</strong> सूचना पत्र + अगले सप्ताह ध्यान देना
              </p>
              <p>
                <strong>मासिक लक्ष्य कम:</strong> चेतावनी पत्र + प्रदर्शन समीक्षा
              </p>
              <p>
                <strong>लगातार कम प्रदर्शन:</strong> सेवा समाप्ति तक की कार्रवाई संभव
              </p>
            </div>
          </div>

          {/* Incentives */}
          <div className="mb-8 bg-green-50 border-l-4 border-green-600 p-6">
            <h3 className="text-xl font-bold text-green-900 mb-4">प्रोत्साहन और पुरस्कार</h3>
            <div className="space-y-2 text-gray-800">
              <p>
                <strong>लक्ष्य से अधिक प्रदर्शन:</strong> विशेष मान्यता
              </p>
              <p>
                <strong>लगातार उत्कृष्ट प्रदर्शन:</strong> बोनस और पुरस्कार
              </p>
              <p>
                <strong>मासिक सर्वश्रेष्ठ प्रदर्शनकर्ता:</strong> प्रमाण पत्र और विशेष लाभ
              </p>
            </div>
          </div>

          {/* Declaration */}
          <div className="border-t-2 border-gray-300 pt-6 mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3">घोषणा</h3>
            <p className="text-gray-700 mb-4">
              मैं घोषणा करता/करती हूं कि मैंने सर्वे लक्ष्यों को समझ लिया है और प्रतिदिन न्यूनतम 10 सर्वे, 
              प्रति सप्ताह 70 सर्वे और प्रति महीने 306 सर्वे पूर्ण करने के लिए प्रतिबद्ध हूं। 
              मैं समझता/समझती हूं कि ये लक्ष्य मेरे कार्य का अनिवार्य हिस्सा हैं।
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

export default SurveyTargets;