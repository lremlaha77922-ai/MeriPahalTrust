import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-trust-blue text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-trust-gold">
              मेरी पहल फास्ट हेल्प
            </h3>
            <p className="text-gray-200 mb-4">
              आर्टिस्ट वेलफेयर एसोसिएशन (ट्रस्ट) - कलाकारों के कल्याण और सामाजिक विकास के लिए समर्पित संगठन।
            </p>
            <div className="flex items-center space-x-2 text-gray-200">
              <MapPin className="h-4 w-4" />
              <span>जयपुर, राजस्थान</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-trust-gold">त्वरित लिंक</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-200 hover:text-trust-gold transition-colors">
                  होम
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-200 hover:text-trust-gold transition-colors">
                  हमारे बारे में
                </Link>
              </li>
              <li>
                <Link to="/team" className="text-gray-200 hover:text-trust-gold transition-colors">
                  हमारी टीम
                </Link>
              </li>
              <li>
                <Link to="/join" className="text-gray-200 hover:text-trust-gold transition-colors">
                  जुड़ें हमारे साथ
                </Link>
              </li>
              <li>
                <Link to="/guidelines/legal" className="text-gray-200 hover:text-trust-gold transition-colors">
                  कानूनी जानकारी
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-trust-gold">संपर्क करें</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-gray-200">
                <Phone className="h-4 w-4" />
                <span>+91 7073741421</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-200">
                <Mail className="h-4 w-4" />
                <span>info@meripahal.org</span>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-sm text-gray-300">
                कार्यालय समय: सोमवार - शनिवार
              </p>
              <p className="text-sm text-gray-300">9:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-700 mt-8 pt-6 text-center">
          <p className="text-gray-300 text-sm">
            © 2024 मेरी पहल फास्ट हेल्प आर्टिस्ट वेलफेयर एसोसिएशन। सर्वाधिकार सुरक्षित।
          </p>
          <p className="text-gray-400 text-xs mt-2">
            क्षेत्राधिकार: राजस्थान न्यायालय के अधीन
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;