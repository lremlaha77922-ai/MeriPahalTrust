import { FileText, Download, Building2, User, Phone, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Agreement = () => {
  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-trust-blue to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            प्राधिकरण एवं कार्यान्वयन अनुबंध
          </h1>
          <p className="text-center text-blue-100 mt-2">Authority & Execution Agreement</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
          {/* Download Button */}
          <div className="flex justify-end mb-6">
            <Button onClick={handleDownload} className="bg-trust-blue hover:bg-blue-700">
              <Download className="mr-2 h-4 w-4" />
              Download / Print
            </Button>
          </div>

          {/* Agreement Date */}
          <div className="text-center mb-8">
            <p className="text-lg text-gray-700">
              यह अनुबंध दिनांक <span className="font-bold border-b-2 border-gray-400 px-3">___</span> / 
              <span className="font-bold border-b-2 border-gray-400 px-3 mx-1">___</span> / 
              <span className="font-bold border-b-2 border-gray-400 px-3">2026</span> को निम्न पक्षों के बीच संपन्न किया गया:
            </p>
          </div>

          {/* Party 1 */}
          <div className="mb-8 border-2 border-trust-blue rounded-lg p-6">
            <h2 className="text-xl font-bold text-trust-blue mb-4 flex items-center">
              <Building2 className="h-6 w-6 mr-2" />
              🔹 पक्ष – 1
            </h2>
            <div className="space-y-2 text-gray-800">
              <p className="font-bold text-lg">मेरी पहल फास्ट हेल्प आर्टिस्ट वेलफेयर एसोसिएशन (MPFHAWA)</p>
              <p><strong>पता:</strong> जयपुर, राजस्थान</p>
              <p><strong>प्रतिनिधि:</strong> विजय तिवारी (अध्यक्ष)</p>
            </div>
          </div>

          {/* Party 2 */}
          <div className="mb-8 border-2 border-green-600 rounded-lg p-6">
            <h2 className="text-xl font-bold text-green-600 mb-4 flex items-center">
              <User className="h-6 w-6 mr-2" />
              🔹 पक्ष – 2 (सहयोगी संस्था / Partner Organization)
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="font-bold text-lg">संस्था का नाम: <span className="border-b-2 border-gray-400 px-2">_______________________</span></p>
              <p><strong>मालिक/प्रमुख:</strong> <span className="border-b-2 border-gray-400 px-2">_______________________</span></p>
              <p><strong>पता:</strong> <span className="border-b-2 border-gray-400 px-2">_______________________</span></p>
              <p><strong>जिला:</strong> <span className="border-b-2 border-gray-400 px-2">_______________________</span></p>
              <p><strong>राज्य:</strong> <span className="border-b-2 border-gray-400 px-2">_______________________</span></p>
              <p><strong>मोबाइल नंबर:</strong> <span className="border-b-2 border-gray-400 px-2">_______________________</span></p>
            </div>
          </div>

          {/* Purpose */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-trust-blue pl-4">
              🔹 अनुबंध का उद्देश्य
            </h3>
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-gray-800 leading-relaxed">
                पक्ष–1 द्वारा पक्ष–2 को राज्य: <span className="font-bold border-b-2 border-gray-400 px-2">_______________________</span> में 
                <strong> "महिलाओं के मासिक धर्म स्वच्छता अभियान"</strong> के संचालन, प्रबंधन एवं विस्तार हेतु अधिकृत किया जाता है।
              </p>
              <p className="text-gray-800 leading-relaxed mt-4">
                साथ ही, इस अभियान के अंतर्गत पंजीकृत प्रत्येक महिला को <strong className="text-green-700">₹150 वार्षिक पंजीकरण शुल्क</strong> के बदले 
                MPFHAWA द्वारा <strong>12 महीनों तक सैनिटरी पैड एवं प्रोटीन बॉक्स</strong> उपलब्ध कराया जाएगा।
              </p>
            </div>
          </div>

          {/* Rights & Responsibilities */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-trust-blue pl-4">
              🔹 अधिकार एवं जिम्मेदारियाँ
            </h3>
            <p className="font-semibold text-gray-800 mb-3">पक्ष–2 को निम्न अधिकार प्रदान किए जाते हैं:</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-trust-blue font-bold mr-3">✓</span>
                <span>टीम गठन (जिला, ब्लॉक, पंचायत स्तर)</span>
              </li>
              <li className="flex items-start">
                <span className="text-trust-blue font-bold mr-3">✓</span>
                <span>सर्वेक्षण एवं डेटा संग्रह</span>
              </li>
              <li className="flex items-start">
                <span className="text-trust-blue font-bold mr-3">✓</span>
                <span>जागरूकता अभियान संचालन</span>
              </li>
              <li className="flex items-start">
                <span className="text-trust-blue font-bold mr-3">✓</span>
                <span>सैनिटरी पैड एवं प्रोटीन बॉक्स वितरण</span>
              </li>
              <li className="flex items-start">
                <span className="text-trust-blue font-bold mr-3">✓</span>
                <span>पंजीकरण शुल्क (₹150) संग्रह एवं जमा</span>
              </li>
              <li className="flex items-start">
                <span className="text-trust-blue font-bold mr-3">✓</span>
                <span>रिपोर्टिंग (दैनिक/साप्ताहिक/मासिक) MPFHAWA को</span>
              </li>
            </ul>
          </div>

          {/* Team Structure */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-trust-blue pl-4">
              🔹 टीम संरचना एवं वेतन
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-trust-blue text-white">
                  <tr>
                    <th className="border border-gray-300 px-4 py-3 text-left">पद</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">योग्यता</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">सैलरी</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-4 py-3">जिला परियोजना अधिकारी (DC)</td>
                    <td className="border border-gray-300 px-4 py-3">स्नातक</td>
                    <td className="border border-gray-300 px-4 py-3 font-bold text-green-700">₹18,000</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">ब्लॉक परियोजना अधिकारी (BC)</td>
                    <td className="border border-gray-300 px-4 py-3">12वीं</td>
                    <td className="border border-gray-300 px-4 py-3 font-bold text-green-700">₹16,000</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-4 py-3">पंचायत परियोजना अधिकारी (PC)</td>
                    <td className="border border-gray-300 px-4 py-3">10वीं</td>
                    <td className="border border-gray-300 px-4 py-3 font-bold text-green-700">₹14,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 space-y-2">
              <p className="flex items-start text-gray-700">
                <span className="text-green-600 font-bold mr-2">✔️</span>
                <span>सभी नियुक्तियाँ पक्ष–2 द्वारा की जाएंगी</span>
              </p>
              <p className="flex items-start text-gray-700">
                <span className="text-green-600 font-bold mr-2">✔️</span>
                <span>सभी डेटा 7 दिन के भीतर पक्ष–1 को भेजना अनिवार्य</span>
              </p>
            </div>
          </div>

          {/* Financial Terms */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-trust-blue pl-4">
              🔹 शुल्क एवं वित्तीय प्रावधान (Fees & Financial Terms)
            </h3>

            {/* Security Deposit */}
            <div className="mb-6">
              <h4 className="font-bold text-lg text-gray-900 mb-3">1. सिक्योरिटी डिपॉजिट</h4>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                <p className="text-gray-800 mb-2">
                  <strong className="text-amber-900">₹5,000</strong> की refundable security राशि केवल पक्ष–2 द्वारा जमा की जाएगी
                </p>
                <p className="text-gray-700 mb-3">भुगतान केवल MPFHAWA के आधिकारिक बैंक खाते में ऑनलाइन किया जाएगा:</p>
                <div className="bg-white p-4 rounded border">
                  <p><strong>Bank Name:</strong> YES BANK</p>
                  <p><strong>Branch:</strong> C-Scheme, Jaipur – 302001</p>
                  <p><strong>Account Number:</strong> 002488700000981</p>
                  <p><strong>IFSC Code:</strong> YESB0000024</p>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-gray-700">
                  <li>• सेवा समाप्ति के 30 दिनों के भीतर वापसी (नियम पालन पर)</li>
                  <li>• उल्लंघन की स्थिति में जब्ती संभव</li>
                </ul>
              </div>
            </div>

            {/* Registration Fee */}
            <div className="mb-6">
              <h4 className="font-bold text-lg text-gray-900 mb-3">2. सदस्य पंजीकरण शुल्क (DC / BC / PC)</h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-800">प्रत्येक सदस्य से <strong className="text-blue-900">₹101</strong> शुल्क लिया जाएगा</p>
                <p className="text-gray-700 mt-2"><strong>उपयोग:</strong> ID कार्ड, पंजीकरण, किट</p>
              </div>
            </div>

            {/* Collection Rules */}
            <div className="mb-6">
              <h4 className="font-bold text-lg text-gray-900 mb-3">3. राशि संग्रह नियम</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• हर भुगतान पर रसीद देना अनिवार्य</li>
                <li>• 24–48 घंटे में MPFHAWA में जमा</li>
                <li>• डिजिटल + लिखित रिकॉर्ड अनिवार्य</li>
              </ul>
            </div>

            {/* Financial Transparency */}
            <div className="mb-6">
              <h4 className="font-bold text-lg text-gray-900 mb-3">4. वित्तीय पारदर्शिता</h4>
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-gray-800">• MPFHAWA द्वारा ऑडिट संभव</p>
                <p className="text-gray-800">• गड़बड़ी पर तत्काल कार्रवाई</p>
              </div>
            </div>
          </div>

          {/* Work Rules */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-trust-blue pl-4">
              🔹 कार्य नियम एवं प्रदर्शन मानक
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                <p className="font-semibold text-blue-900">7 दिन प्रोबेशन</p>
                <p className="text-sm text-gray-700">20 सर्वे अनिवार्य</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                <p className="font-semibold text-green-900">लक्ष्य</p>
                <p className="text-sm text-gray-700">10/दिन | 70/सप्ताह | 306/महीना</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg">
                <p className="font-semibold text-amber-900">उपस्थिति</p>
                <p className="text-sm text-gray-700">9:00–9:15</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
                <p className="font-semibold text-red-900">अनुपस्थिति</p>
                <p className="text-sm text-gray-700">5 दिन = टर्मिनेशन</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-gray-700">
              <p>• <strong>रिपोर्टिंग:</strong> शाम 6–7 बजे</p>
              <p>• <strong>लाइव लोकेशन:</strong> 8 घंटे</p>
            </div>
          </div>

          {/* Financial Rules for ₹150 */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-trust-blue pl-4">
              🔹 वित्तीय नियम (₹150 शुल्क)
            </h3>
            <div className="bg-red-50 border-2 border-red-300 p-6 rounded-lg">
              <ul className="space-y-2 text-gray-800">
                <li className="flex items-start">
                  <span className="text-red-600 font-bold mr-2">⚠️</span>
                  <span>₹150 शुल्क 24 घंटे में MPFHAWA में जमा</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 font-bold mr-2">⚠️</span>
                  <span>सभी लाभार्थियों का रिकॉर्ड अनिवार्य</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 font-bold mr-2">⚠️</span>
                  <span>गड़बड़ी = कानूनी कार्रवाई</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Resignation */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-trust-blue pl-4">
              🔹 त्यागपत्र / समाप्ति
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>• 10 दिन पूर्व लिखित सूचना</li>
              <li>• बिना सूचना = 4 महीने वेतन रोका जा सकता है</li>
            </ul>
          </div>

          {/* Legal Provisions */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-trust-blue pl-4">
              🔹 कानूनी प्रावधान
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-800 mb-2">• <strong>वैधता:</strong> 31 दिसंबर 2026</p>
              <p className="text-gray-800">• <strong>विवाद:</strong> जयपुर न्यायालय</p>
            </div>
          </div>

          {/* Privacy */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-trust-blue pl-4">
              🔹 गोपनीयता
            </h3>
            <p className="text-gray-700">सभी डेटा गोपनीय रहेगा। उल्लंघन पर कार्रवाई होगी।</p>
          </div>

          {/* Agreement Acceptance */}
          <div className="mb-8 bg-green-50 border-2 border-green-300 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-green-900 mb-3 flex items-center">
              <FileText className="h-6 w-6 mr-2" />
              🔹 स्वीकृति
            </h3>
            <p className="text-gray-800 font-semibold">दोनों पक्ष इस अनुबंध की शर्तों से सहमत हैं।</p>
          </div>

          {/* Signatures */}
          <div className="border-t-2 border-gray-300 pt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">🔹 हस्ताक्षर</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Party 1 Signature */}
              <div className="border-2 border-trust-blue rounded-lg p-6">
                <h4 className="font-bold text-lg text-trust-blue mb-4">पक्ष – 1</h4>
                <p className="text-gray-800 mb-2">MPFHAWA</p>
                <div className="border-b-2 border-gray-400 h-16 mb-3"></div>
                <p className="text-sm text-gray-600">हस्ताक्षर</p>
                <p className="font-semibold text-gray-900 mt-3">नाम: विजय तिवारी</p>
                <p className="text-sm text-gray-600">अध्यक्ष</p>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">दिनांक: _______________</p>
                </div>
              </div>

              {/* Party 2 Signature */}
              <div className="border-2 border-green-600 rounded-lg p-6">
                <h4 className="font-bold text-lg text-green-600 mb-4">पक्ष – 2</h4>
                <p className="text-gray-800 mb-2">सहयोगी संस्था</p>
                <div className="border-b-2 border-gray-400 h-16 mb-3"></div>
                <p className="text-sm text-gray-600">हस्ताक्षर</p>
                <p className="font-semibold text-gray-900 mt-3">
                  नाम: <span className="border-b border-gray-400">_______________________</span>
                </p>
                <p className="text-sm text-gray-600">पदनाम: <span className="border-b border-gray-400">_______________</span></p>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">दिनांक: _______________</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="mt-8 bg-gray-100 p-6 rounded-lg text-center">
            <p className="text-sm text-gray-600">
              यह अनुबंध कानूनी रूप से बाध्यकारी दस्तावेज़ है। कृपया सभी शर्तों को ध्यानपूर्वक पढ़ें।
            </p>
            <p className="text-sm text-gray-600 mt-2">
              किसी भी प्रश्न या स्पष्टीकरण के लिए संपर्क करें: contact@mpfhawa.org
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agreement;
