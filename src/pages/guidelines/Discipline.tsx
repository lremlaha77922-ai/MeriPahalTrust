import { AlertTriangle, Ban, FileWarning } from 'lucide-react';

const Discipline = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-trust-blue to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            अनुशासन और सेवा समाप्ति नीति
          </h1>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="border-b-2 border-trust-blue pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              अनुशासनात्मक नीति और सेवा समाप्ति के नियम
            </h2>
            <p className="text-gray-600">
              मेरी पहल फास्ट हेल्प आर्टिस्ट वेलफेयर एसोसिएशन (ट्रस्ट)
            </p>
          </div>

          {/* Warning System */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FileWarning className="h-6 w-6 text-amber-600 mr-2" />
              चेतावनी प्रणाली
            </h3>
            <div className="bg-amber-50 border-l-4 border-amber-600 p-6">
              <p className="text-2xl font-bold text-amber-900 mb-4">
                3 चेतावनी = तत्काल सेवा समाप्ति
              </p>
              <p className="text-gray-800 mb-4">
                संगठन में अनुशासन बनाए रखने के लिए तीन-चेतावनी प्रणाली लागू है। 
                तीसरी चेतावनी के बाद सदस्य की सेवा स्वचालित रूप से समाप्त कर दी जाएगी।
              </p>
              <div className="space-y-3 mt-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">प्रथम चेतावनी</p>
                    <p className="text-sm text-gray-700">लिखित चेतावनी + सुधार का अवसर</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">द्वितीय चेतावनी</p>
                    <p className="text-sm text-gray-700">गंभीर चेतावनी + प्रदर्शन समीक्षा</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">तृतीय चेतावनी</p>
                    <p className="text-sm text-red-700">तत्काल सेवा समाप्ति - कोई अपील नहीं</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grounds for Warning */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">चेतावनी के कारण</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-red-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-2">1. अनुपस्थिति</h4>
                <p className="text-gray-700">
                  लगातार या कुल 5 दिनों की अनुपस्थिति पर स्वचालित चेतावनी जारी होगी।
                </p>
              </div>

              <div className="border-l-4 border-red-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-2">2. कम सर्वे</h4>
                <p className="text-gray-700">
                  लगातार न्यूनतम दैनिक लक्ष्य (10 सर्वे) पूरा न करने पर चेतावनी।
                </p>
              </div>

              <div className="border-l-4 border-red-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-2">3. PDF विलंब</h4>
                <p className="text-gray-700">
                  बार-बार 7:00 AM के बाद दैनिक PDF रिपोर्ट जमा करने पर चेतावनी।
                </p>
              </div>

              <div className="border-l-4 border-red-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-2">4. जमा राशि विलंब</h4>
                <p className="text-gray-700">
                  24 घंटे के भीतर सुरक्षा जमा या अन्य देय राशि जमा न करने पर।
                </p>
              </div>

              <div className="border-l-4 border-red-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-2">5. अनुशासनहीनता</h4>
                <p className="text-gray-700">
                  संगठन के नियमों का उल्लंघन, असभ्य व्यवहार, या टीम के साथ असहयोग।
                </p>
              </div>

              <div className="border-l-4 border-red-600 pl-4">
                <h4 className="font-bold text-gray-900 mb-2">6. गुणवत्ता मुद्दे</h4>
                <p className="text-gray-700">
                  लगातार खराब गुणवत्ता के सर्वे या अपूर्ण डेटा प्रदान करना।
                </p>
              </div>
            </div>
          </div>

          {/* Immediate Termination */}
          <div className="mb-8 bg-red-100 border-2 border-red-600 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center">
              <Ban className="h-6 w-6 mr-2" />
              तत्काल सेवा समाप्ति (बिना चेतावनी)
            </h3>
            <p className="text-gray-800 mb-4">
              निम्नलिखित गंभीर उल्लंघनों पर बिना किसी चेतावनी के तत्काल सेवा समाप्त की जाएगी:
            </p>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded border-l-4 border-red-600">
                <p className="font-bold text-gray-900 mb-1">झूठी जानकारी</p>
                <p className="text-sm text-gray-700">
                  पंजीकरण में या सर्वे में झूठी या बनावटी जानकारी प्रदान करना। 
                  यह सबसे गंभीर उल्लंघन है और इसमें कोई छूट नहीं है।
                </p>
              </div>

              <div className="bg-white p-4 rounded border-l-4 border-red-600">
                <p className="font-bold text-gray-900 mb-1">धोखाधड़ी</p>
                <p className="text-sm text-gray-700">
                  डुप्लीकेट सर्वे, नकली डेटा, या किसी भी प्रकार की धोखाधड़ी।
                </p>
              </div>

              <div className="bg-white p-4 rounded border-l-4 border-red-600">
                <p className="font-bold text-gray-900 mb-1">चोरी या दुरुपयोग</p>
                <p className="text-sm text-gray-700">
                  संगठन की संपत्ति की चोरी या दुरुपयोग, गोपनीय जानकारी का दुरुपयोग।
                </p>
              </div>

              <div className="bg-white p-4 rounded border-l-4 border-red-600">
                <p className="font-bold text-gray-900 mb-1">गंभीर अनुशासनहीनता</p>
                <p className="text-sm text-gray-700">
                  हिंसा, धमकी, गाली-गलौज, या किसी भी प्रकार का उत्पीड़न।
                </p>
              </div>

              <div className="bg-white p-4 rounded border-l-4 border-red-600">
                <p className="font-bold text-gray-900 mb-1">कानूनी उल्लंघन</p>
                <p className="text-sm text-gray-700">
                  कोई भी अवैध गतिविधि जो संगठन की प्रतिष्ठा को नुकसान पहुंचाए।
                </p>
              </div>
            </div>
          </div>

          {/* Termination Process */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">सेवा समाप्ति प्रक्रिया</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-3">जब सेवा समाप्त होती है:</h4>
              <ol className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="font-bold text-trust-blue mr-3">1.</span>
                  <span>तत्काल सभी पहुंच और अधिकार निलंबित</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-trust-blue mr-3">2.</span>
                  <span>लिखित समाप्ति पत्र जारी किया जाएगा</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-trust-blue mr-3">3.</span>
                  <span>सभी संगठन की संपत्ति वापस करनी होगी</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-trust-blue mr-3">4.</span>
                  <span>देय राशि (यदि कोई हो) का निपटान</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-trust-blue mr-3">5.</span>
                  <span>सुरक्षा जमा की स्थिति निर्धारित होगी</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Financial Consequences */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">वित्तीय परिणाम</h3>
            <div className="border border-gray-300 rounded-lg p-6">
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>3 चेतावनी पर समाप्ति:</strong> सुरक्षा जमा आंशिक रूप से वापस (कटौतियों के बाद)
                </p>
                <p>
                  <strong>झूठी जानकारी पर समाप्ति:</strong> सुरक्षा जमा पूर्णतः जब्त + कानूनी कार्रवाई संभव
                </p>
                <p>
                  <strong>संपत्ति क्षति:</strong> जमा राशि से कटौती + अतिरिक्त मुआवजा
                </p>
                <p>
                  <strong>बकाया वेतन:</strong> सभी बकाया चुकाने के बाद ही अंतिम निपटान
                </p>
              </div>
            </div>
          </div>

          {/* Appeal Process */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">अपील प्रक्रिया</h3>
            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-trust-blue">
              <p className="text-gray-700 mb-3">
                पहली और दूसरी चेतावनी के विरुद्ध 7 दिनों के भीतर लिखित अपील की जा सकती है।
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• अपील प्रबंधन को लिखित रूप में भेजनी होगी</p>
                <p>• सभी प्रासंगिक दस्तावेज संलग्न करें</p>
                <p>• निर्णय 15 दिनों में दिया जाएगा</p>
                <p>• प्रबंधन का निर्णय अंतिम होगा</p>
              </div>
              <p className="text-sm text-red-700 mt-4 font-semibold">
                नोट: तत्काल समाप्ति (झूठी जानकारी) के मामलों में कोई अपील नहीं।
              </p>
            </div>
          </div>

          {/* Good Standing */}
          <div className="mb-8 bg-green-50 border-l-4 border-green-600 p-6">
            <h3 className="text-xl font-bold text-green-900 mb-4">अच्छी स्थिति बनाए रखें</h3>
            <p className="text-gray-800 mb-3">
              चेतावनियों से बचने और अच्छी स्थिति बनाए रखने के लिए:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>✓ नियमित उपस्थिति बनाए रखें</li>
              <li>✓ दैनिक लक्ष्य पूरे करें</li>
              <li>✓ समय पर PDF जमा करें</li>
              <li>✓ गुणवत्तापूर्ण कार्य करें</li>
              <li>✓ सभी नियमों का पालन करें</li>
              <li>✓ टीम के साथ सहयोग करें</li>
            </ul>
          </div>

          {/* Declaration */}
          <div className="border-t-2 border-gray-300 pt-6 mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3">घोषणा और स्वीकृति</h3>
            <p className="text-gray-700 mb-4">
              मैं घोषणा करता/करती हूं कि मैंने अनुशासन और सेवा समाप्ति नीति को पूर्णतः पढ़ और समझ लिया है। 
              मैं 3-चेतावनी प्रणाली और तत्काल समाप्ति के नियमों से अवगत हूं। 
              मैं समझता/समझती हूं कि झूठी जानकारी प्रदान करना तत्काल सेवा समाप्ति और कानूनी कार्रवाई का कारण बनेगा। 
              मैं सभी नियमों का पालन करने और अनुशासित रहने के लिए प्रतिबद्ध हूं।
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

export default Discipline;