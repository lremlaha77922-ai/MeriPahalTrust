import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const guidelinePages = [
    { name: 'उपस्थिति नीति', path: '/guidelines/attendance' },
    { name: 'सर्वे अपलोड नीति', path: '/guidelines/survey-upload' },
    { name: 'दैनिक PDF नीति', path: '/guidelines/pdf-submission' },
    { name: 'पंजीकरण शुल्क और जमा', path: '/guidelines/registration-fee' },
    { name: 'सर्वे लक्ष्य', path: '/guidelines/survey-targets' },
    { name: 'अनुशासन और समाप्ति', path: '/guidelines/discipline' },
    { name: 'कानूनी क्षेत्राधिकार', path: '/guidelines/legal' },
  ];

  return (
    <header className={`bg-white shadow-md sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'py-2' : 'py-0'
    }`}>
      <div className="container mx-auto px-4">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'py-2' : 'py-4'
        }`}>
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-trust-blue rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">मप</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-trust-blue font-bold text-lg leading-tight">
                मेरी पहल फास्ट हेल्प
              </h1>
              <p className="text-sm text-gray-600">आर्टिस्ट वेलफेयर एसोसिएशन</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link
              to="/"
              className={`font-medium transition-colors ${
                isActive('/') ? 'text-trust-blue' : 'text-gray-700 hover:text-trust-blue'
              }`}
            >
              होम
            </Link>
            <Link
              to="/about"
              className={`font-medium transition-colors ${
                isActive('/about') ? 'text-trust-blue' : 'text-gray-700 hover:text-trust-blue'
              }`}
            >
              हमारे बारे में
            </Link>
            <Link
              to="/gallery"
              className={`font-medium transition-colors ${
                isActive('/gallery') ? 'text-trust-blue' : 'text-gray-700 hover:text-trust-blue'
              }`}
            >
              फोटो गैलरी
            </Link>
            <Link
              to="/desi-didi-mart"
              className={`font-medium transition-colors ${
                isActive('/desi-didi-mart') ? 'text-trust-blue' : 'text-gray-700 hover:text-trust-blue'
              }`}
            >
              देसी दीदी मार्ट
            </Link>
            <Link
              to="/swastha-sangini"
              className={`font-medium transition-colors ${
                isActive('/swastha-sangini') ? 'text-trust-blue' : 'text-gray-700 hover:text-trust-blue'
              }`}
            >
              स्वस्थ संगिनी कार्ड
            </Link>
            
            {/* Guidelines Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setShowGuidelines(true)}
              onMouseLeave={() => setShowGuidelines(false)}
            >
              <button className="font-medium text-gray-700 hover:text-trust-blue flex items-center">
                दिशानिर्देश <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {showGuidelines && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-lg rounded-lg py-2 z-50">
                  {guidelinePages.map((page) => (
                    <Link
                      key={page.path}
                      to={page.path}
                      className="block px-4 py-2 text-gray-700 hover:bg-trust-lightblue hover:text-trust-blue transition-colors"
                    >
                      {page.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/team"
              className={`font-medium transition-colors ${
                isActive('/team') ? 'text-trust-blue' : 'text-gray-700 hover:text-trust-blue'
              }`}
            >
              हमारी टीम
            </Link>
            <Link
              to="/admin"
              className={`font-medium transition-colors ${
                isActive('/admin') ? 'text-trust-blue' : 'text-gray-700 hover:text-trust-blue'
              }`}
            >
              एडमिन लॉगिन
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Link to="/join">
              <Button className="bg-trust-gold hover:bg-amber-600 text-white font-semibold">
                अभी जुड़ें
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-gray-700"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden pb-4 space-y-2">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gray-700 hover:text-trust-blue font-medium"
            >
              होम
            </Link>
            <Link
              to="/about"
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gray-700 hover:text-trust-blue font-medium"
            >
              हमारे बारे में
            </Link>
            <Link
              to="/gallery"
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gray-700 hover:text-trust-blue font-medium"
            >
              फोटो गैलरी
            </Link>
            <Link
              to="/desi-didi-mart"
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gray-700 hover:text-trust-blue font-medium"
            >
              देसी दीदी मार्ट
            </Link>
            <Link
              to="/swastha-sangini"
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gray-700 hover:text-trust-blue font-medium"
            >
              स्वस्थ संगिनी कार्ड
            </Link>
            <div className="py-2">
              <p className="font-semibold text-gray-900 mb-2">दिशानिर्देश</p>
              <div className="pl-4 space-y-2">
                {guidelinePages.map((page) => (
                  <Link
                    key={page.path}
                    to={page.path}
                    onClick={() => setIsOpen(false)}
                    className="block py-1 text-gray-600 hover:text-trust-blue text-sm"
                  >
                    {page.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              to="/team"
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gray-700 hover:text-trust-blue font-medium"
            >
              हमारी टीम
            </Link>
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gray-700 hover:text-trust-blue font-medium"
            >
              एडमिन लॉगिन
            </Link>
            <Link to="/join" onClick={() => setIsOpen(false)}>
              <Button className="w-full bg-trust-gold hover:bg-amber-600 text-white font-semibold mt-2">
                अभी जुड़ें
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
