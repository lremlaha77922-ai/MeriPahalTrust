import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileText, Home, MessageCircle } from 'lucide-react';

const SwasthaSanginiSuccess = () => {
  const location = useLocation();
  const applicationId = location.state?.applicationId || 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white p-8 md:p-12 rounded-2xl shadow-2xl text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-12 w-12 text-green-600 animate-scale-in" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            आवेदन सफल!
          </h1>
          <p className="text-lg text-gray-600">
            Application Submitted Successfully
          </p>
        </div>

        <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-lg mb-8 border-2 border-pink-200">
          <p className="text-sm text-gray-600 mb-2">आपका Application ID:</p>
          <p className="text-3xl font-bold text-pink-600 mb-3">{applicationId}</p>
          <p className="text-sm text-gray-700">
            कृपया इस Application ID को सुरक्षित रखें। आप इसका उपयोग अपने आवेदन की स्थिति जांचने के लिए कर सकते हैं।
          </p>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-8 text-left">
          <h3 className="font-bold text-gray-900 mb-2">आगे क्या होगा?</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">1.</span>
              <span>हमारी टीम 2-3 कार्य दिवसों में आपके आवेदन की समीक्षा करेगी</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">2.</span>
              <span>आपको Email और WhatsApp पर अपडेट मिलेगा</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">3.</span>
              <span>स्वीकृत होने पर आपको आगे की प्रक्रिया की जानकारी दी जाएगी</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">4.</span>
              <span>यदि कोई अतिरिक्त दस्तावेज़ की आवश्यकता होगी, तो हम संपर्क करेंगे</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="bg-pink-600 hover:bg-pink-700 text-white">
              <Home className="mr-2 h-4 w-4" />
              Home पर जाएं
            </Button>
          </Link>
          <Link to="/swastha-sangini">
            <Button variant="outline" className="border-pink-600 text-pink-600 hover:bg-pink-50">
              <FileText className="mr-2 h-4 w-4" />
              Program Details
            </Button>
          </Link>
          <a href="https://wa.me/917073741421" target="_blank" rel="noopener noreferrer">
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp Support
            </Button>
          </a>
        </div>

        <div className="mt-8 pt-6 border-t text-sm text-gray-600">
          <p>
            किसी भी प्रश्न के लिए हमसे संपर्क करें:
          </p>
          <p className="font-semibold text-gray-900 mt-2">
            📞 +91 7073741421 | ✉️ support@meripahal.org
          </p>
        </div>
      </div>
    </div>
  );
};

export default SwasthaSanginiSuccess;
