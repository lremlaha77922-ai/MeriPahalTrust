import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Languages, User, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdmin } from '@/contexts/AdminContext';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAdmin();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const guidelinePages = [
    { name: language === 'en' ? 'Attendance Policy' : 'उपस्थिति नीति', path: '/guidelines/attendance' },
    { name: language === 'en' ? 'Survey Upload Policy' : 'सर्वे अपलोड नीति', path: '/guidelines/survey-upload' },
    { name: language === 'en' ? 'Daily PDF Policy' : 'दैनिक PDF नीति', path: '/guidelines/pdf-submission' },
    { name: language === 'en' ? 'Registration Fee & Deposit' : 'पंजीकरण शुल्क और जमा', path: '/guidelines/registration-fee' },
    { name: language === 'en' ? 'Survey Targets' : 'सर्वे लक्ष्य', path: '/guidelines/survey-targets' },
    { name: language === 'en' ? 'Discipline & Termination' : 'अनुशासन और समाप्ति', path: '/guidelines/discipline' },
    { name: language === 'en' ? 'Legal Jurisdiction' : 'कानूनी क्षेत्राधिकार', path: '/guidelines/legal' },
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
                {language === 'en' ? 'Meri Pahal Fast Help' : 'मेरी पहल फास्ट हेल्प'}
              </h1>
              <p className="text-sm text-gray-600">{language === 'en' ? 'Artist Welfare Association' : 'आर्टिस्ट वेलफेयर एसोसिएशन'}</p>
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
              {t('header.home')}
            </Link>
            <Link
              to="/about"
              className={`font-medium transition-colors ${
                isActive('/about') ? 'text-trust-blue' : 'text-gray-700 hover:text-trust-blue'
              }`}
            >
              {t('header.about')}
            </Link>
            <Link
              to="/gallery"
              className={`font-medium transition-colors ${
                isActive('/gallery') ? 'text-trust-blue' : 'text-gray-700 hover:text-trust-blue'
              }`}
            >
              {t('header.gallery')}
            </Link>
            <Link
              to="/desi-didi-mart"
              className={`font-medium transition-colors ${
                isActive('/desi-didi-mart') ? 'text-trust-blue' : 'text-gray-700 hover:text-trust-blue'
              }`}
            >
              {t('header.desiDidiMart')}
            </Link>
            <Link
              to="/swastha-sangini"
              className={`font-medium transition-colors ${
                isActive('/swastha-sangini') ? 'text-trust-blue' : 'text-gray-700 hover:text-trust-blue'
              }`}
            >
              {t('header.swasthaSangini')}
            </Link>
            
            {/* Guidelines Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setShowGuidelines(true)}
              onMouseLeave={() => setShowGuidelines(false)}
            >
              <button className="font-medium text-gray-700 hover:text-trust-blue flex items-center">
                {t('header.guidelines')} <ChevronDown className="ml-1 h-4 w-4" />
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
              {t('header.team')}
            </Link>
            {user ? (
              <Link
                to="/account"
                className={`font-medium transition-colors flex items-center space-x-1 ${
                  isActive('/account') ? 'text-trust-blue' : 'text-gray-700 hover:text-trust-blue'
                }`}
              >
                <div className="w-7 h-7 bg-trust-blue rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {(user.username || user.email || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <span>Account</span>
              </Link>
            ) : (
              <Link
                to="/admin"
                className={`font-medium transition-colors ${
                  isActive('/admin') ? 'text-trust-blue' : 'text-gray-700 hover:text-trust-blue'
                }`}
              >
                {t('header.adminLogin')}
              </Link>
            )}

            {/* Cart Icon */}
            <Link
              to="/cart"
              className={`font-medium transition-colors flex items-center ${
                isActive('/cart') ? 'text-trust-blue' : 'text-gray-700 hover:text-trust-blue'
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
            </Link>
            
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center font-medium text-gray-700 hover:text-trust-blue transition-colors"
              title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
            >
              <Languages className="h-5 w-5 mr-1" />
              {language === 'en' ? 'हिं' : 'EN'}
            </button>
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Link to="/join">
              <Button className="bg-trust-gold hover:bg-amber-600 text-white font-semibold">
                {t('header.joinNow')}
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
              {t('header.home')}
            </Link>
            <Link
              to="/about"
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gray-700 hover:text-trust-blue font-medium"
            >
              {t('header.about')}
            </Link>
            <Link
              to="/gallery"
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gray-700 hover:text-trust-blue font-medium"
            >
              {t('header.gallery')}
            </Link>
            <Link
              to="/desi-didi-mart"
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gray-700 hover:text-trust-blue font-medium"
            >
              {t('header.desiDidiMart')}
            </Link>
            <Link
              to="/swastha-sangini"
              onClick={() => setIsOpen(false)}
              className="block py-2 text-gray-700 hover:text-trust-blue font-medium"
            >
              {t('header.swasthaSangini')}
            </Link>
            <div className="py-2">
              <p className="font-semibold text-gray-900 mb-2">{t('header.guidelines')}</p>
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
              {t('header.team')}
            </Link>
            {user ? (
              <Link
                to="/account"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 py-2 text-gray-700 hover:text-trust-blue font-medium"
              >
                <User className="h-4 w-4" />
                <span>My Account</span>
              </Link>
            ) : (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block py-2 text-gray-700 hover:text-trust-blue font-medium"
              >
                {t('header.adminLogin')}
              </Link>
            )}
            <Link
              to="/cart"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2 py-2 text-gray-700 hover:text-trust-blue font-medium"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Cart</span>
            </Link>
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="block py-2 text-gray-700 hover:text-trust-blue font-medium flex items-center"
            >
              <Languages className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
            </button>
            <Link to="/join" onClick={() => setIsOpen(false)}>
              <Button className="w-full bg-trust-gold hover:bg-amber-600 text-white font-semibold mt-2">
                {t('header.joinNow')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
