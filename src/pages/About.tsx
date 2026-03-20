import { useState, useEffect } from 'react';
import { Target, Heart, Users, Award, Building2, FileText, Download, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface LegalDocument {
  id: string;
  document_name: string;
  document_type: string;
  file_url: string;
  file_size_kb: number;
  description: string;
  created_at: string;
}

const About = () => {
  const [legalDocs, setLegalDocs] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLegalDocuments();
  }, []);

  const fetchLegalDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLegalDocs(data || []);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-trust-blue to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            हमारे बारे में
          </h1>
          <p className="text-xl text-center text-gray-100 max-w-3xl mx-auto">
            मेरी पहल फास्ट हेल्प आर्टिस्ट वेलफेयर एसोसिएशन (ट्रस्ट)
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              हमारा परिचय
            </h2>
            <div className="prose prose-lg text-gray-700 space-y-4">
              <p className="text-lg leading-relaxed">
                <strong>मेरी पहल फास्ट हेल्प आर्टिस्ट वेलफेयर एसोसिएशन</strong> एक पंजीकृत ट्रस्ट है जो कलाकारों और समाज के कल्याण के लिए समर्पित है। हमारा उद्देश्य कलाकारों को आर्थिक सुरक्षा प्रदान करना और उन्हें समाज सेवा के कार्यों में सक्रिय रूप से शामिल करना है।
              </p>
              <p className="text-lg leading-relaxed">
                हम सर्वे और डेटा संग्रहण के माध्यम से सामाजिक विकास में योगदान देते हैं। हमारा संगठन पूर्ण पारदर्शिता और अनुशासन के साथ कार्य करता है, जहां प्रत्येक सदस्य के अधिकार और कर्तव्य स्पष्ट रूप से परिभाषित हैं।
              </p>
              <p className="text-lg leading-relaxed">
                जयपुर, राजस्थान में स्थित हमारा संगठन कानूनी रूप से मान्यता प्राप्त है और सभी कार्य राजस्थान न्यायालय के क्षेत्राधिकार के अंतर्गत संचालित होते हैं।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-trust-lightblue rounded-full flex items-center justify-center mr-4">
                  <Target className="h-6 w-6 text-trust-blue" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">हमारा लक्ष्य</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                कलाकारों को आत्मनिर्भर बनाना और उन्हें एक सम्मानजनक आजीविका प्रदान करना। 
                हमारा लक्ष्य एक ऐसा मंच तैयार करना है जहां प्रतिभाशाली व्यक्ति अपनी कला और कौशल का उपयोग करते हुए 
                समाज की सेवा कर सकें और स्वयं का विकास कर सकें।
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-trust-lightblue rounded-full flex items-center justify-center mr-4">
                  <Heart className="h-6 w-6 text-trust-blue" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">हमारा मिशन</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                पारदर्शी और न्यायपूर्ण कार्य प्रणाली के माध्यम से सामाजिक और आर्थिक विकास को बढ़ावा देना। 
                हम विश्वास, अनुशासन और प्रतिबद्धता के सिद्धांतों पर आधारित एक मजबूत संगठन बनाने के लिए प्रतिबद्ध हैं।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            हमारे मूल्य
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-trust-blue text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">पारदर्शिता</h3>
              <p className="text-gray-600">
                हमारी सभी प्रक्रियाएं पूर्णतः पारदर्शी हैं। प्रत्येक सदस्य को अपने अधिकारों और जिम्मेदारियों की पूर्ण जानकारी प्राप्त है।
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-trust-blue text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">अनुशासन</h3>
              <p className="text-gray-600">
                समय पर उपस्थिति, दैनिक लक्ष्य और नियमों का पालन हमारे संगठन की मजबूती का आधार है।
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-trust-blue text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">कल्याण</h3>
              <p className="text-gray-600">
                प्रत्येक सदस्य का कल्याण हमारी प्राथमिकता है। हम आर्थिक सुरक्षा और व्यावसायिक विकास सुनिश्चित करते हैं।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Work Culture */}
      <section className="py-16 bg-trust-lightblue">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              हमारी कार्य संस्कृति
            </h2>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span><strong>समयबद्धता:</strong> सभी कार्य निर्धारित समय सीमा के भीतर पूर्ण किए जाते हैं।</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span><strong>लक्ष्य-केंद्रित:</strong> दैनिक, साप्ताहिक और मासिक लक्ष्यों को प्राप्त करने पर ध्यान।</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span><strong>टीमवर्क:</strong> सामूहिक प्रयास और एक-दूसरे का समर्थन।</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span><strong>निरंतर विकास:</strong> नियमित प्रशिक्षण और कौशल विकास कार्यक्रम।</span>
                </li>
                <li className="flex items-start">
                  <span className="text-trust-blue font-bold mr-3">•</span>
                  <span><strong>न्यायपूर्ण व्यवहार:</strong> सभी सदस्यों के साथ समान और सम्मानजनक व्यवहार।</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bank Details */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              बैंक विवरण
            </h2>
            <div className="bg-gradient-to-r from-trust-lightblue to-blue-50 border-2 border-trust-blue p-8 rounded-lg">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-trust-blue text-white rounded-full flex items-center justify-center mr-4">
                  <Building2 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">आधिकारिक बैंक खाता</h3>
                  <p className="text-gray-600">सभी भुगतान केवल इसी खाते में करें</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">बैंक का नाम</p>
                  <p className="text-xl font-bold text-gray-900">YES BANK</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">शाखा</p>
                  <p className="text-xl font-bold text-gray-900">C-Scheme, Jaipur – 302001</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">खाता संख्या</p>
                  <p className="text-xl font-bold text-trust-blue">002488700000981</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">IFSC Code</p>
                  <p className="text-xl font-bold text-trust-blue">YESB0000024</p>
                </div>
              </div>
              <div className="mt-6 bg-amber-50 border-l-4 border-amber-600 p-4 rounded">
                <p className="text-sm text-amber-900">
                  <strong>महत्वपूर्ण:</strong> कृपया भुगतान के बाद Transaction ID और Screenshot अवश्य भेजें।
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Documents */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              कानूनी दस्तावेज़
            </h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {legalDocs.map((doc) => (
                  <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <div className="w-12 h-12 bg-trust-lightblue rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <FileText className="h-6 w-6 text-trust-blue" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{doc.document_name}</h3>
                          {doc.description && (
                            <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded">{doc.document_type}</span>
                            {doc.file_size_kb && (
                              <span>{Math.round(doc.file_size_kb / 1024)} MB</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center bg-trust-blue text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          देखें
                        </a>
                        <a
                          href={doc.file_url}
                          download
                          className="flex items-center bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          डाउनलोड
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
                {legalDocs.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p>कोई दस्तावेज़ उपलब्ध नहीं है</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Legal Information */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gray-50 border-l-4 border-trust-blue p-8 rounded-r-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              कानूनी जानकारी
            </h3>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>संगठन का नाम:</strong> मेरी पहल फास्ट हेल्प आर्टिस्ट वेलफेयर एसोसिएशन (ट्रस्ट)
              </p>
              <p>
                <strong>पंजीकरण:</strong> पंजीकृत ट्रस्ट
              </p>
              <p>
                <strong>मुख्यालय:</strong> जयपुर, राजस्थान
              </p>
              <p>
                <strong>क्षेत्राधिकार:</strong> राजस्थान न्यायालय
              </p>
              <p className="text-sm text-gray-600 mt-4">
                सभी कानूनी मामले और विवाद राजस्थान न्यायालय के अधीन होंगे। 
                संगठन से संबंधित सभी समझौते और नियम भारतीय कानून के अनुसार मान्य हैं।
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;