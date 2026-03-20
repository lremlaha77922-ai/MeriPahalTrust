import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'header.home': 'Home',
    'header.about': 'About Us',
    'header.gallery': 'Photo Gallery',
    'header.desiDidiMart': 'Desi Didi Mart',
    'header.swasthaSangini': 'Swastha Sangini Card',
    'header.guidelines': 'Guidelines',
    'header.team': 'Our Team',
    'header.adminLogin': 'Admin Login',
    'header.joinNow': 'Join Now',
    
    // Footer
    'footer.title': 'Meri Pahal Fast Help',
    'footer.subtitle': 'Artist Welfare Association (Trust)',
    'footer.description': 'An organization dedicated to the welfare of artists and social development.',
    'footer.location': 'Jaipur, Rajasthan',
    'footer.quickLinks': 'Quick Links',
    'footer.contact': 'Contact Us',
    'footer.officeHours': 'Office Hours: Monday - Saturday',
    'footer.timing': '9:00 AM - 6:00 PM',
    'footer.copyright': '© 2024 Meri Pahal Fast Help Artist Welfare Association. All rights reserved.',
    'footer.jurisdiction': 'Jurisdiction: Under Rajasthan Court',
    
    // Home Page
    'home.hero.title': 'Meri Pahal Fast Help',
    'home.hero.subtitle': 'Artist Welfare Association',
    'home.hero.description': 'An organization dedicated to the welfare and social development of artists',
    'home.hero.joinButton': 'Join Now',
    'home.hero.learnMore': 'Learn More',
    
    // Trust Badges
    'home.badges.registered': 'Registered Trust',
    'home.badges.transparent': 'Transparent System',
    'home.badges.timely': 'Timely Payment',
    'home.badges.legal': 'Legal Protection',
    
    // Stats
    'home.stats.members': 'Active Members',
    'home.stats.surveys': 'Daily Surveys',
    'home.stats.experience': 'Years of Experience',
    'home.stats.satisfaction': 'Satisfaction Rate',
    
    // Features
    'home.features.title': 'Our Features',
    'home.features.subtitle': 'Take your career to new heights with a transparent and organized work system',
    'home.features.social': 'Social Work',
    'home.features.socialDesc': 'Dedicated to the welfare of artists and society',
    'home.features.survey': 'Survey Work',
    'home.features.surveyDesc': 'Daily surveys and data collection',
    'home.features.transparency': 'Transparency',
    'home.features.transparencyDesc': 'Completely transparent work system',
    'home.features.terms': 'Rules & Terms',
    'home.features.termsDesc': 'Clear guidelines and policies',
    
    // Benefits
    'home.benefits.title': 'What Will You Get?',
    'home.benefits.subtitle': 'Benefits of joining us',
    'home.benefits.income': 'Regular income opportunity',
    'home.benefits.flexible': 'Flexible work hours',
    'home.benefits.training': 'Professional training',
    'home.benefits.security': 'Social security',
    'home.benefits.support': 'Team support',
    'home.benefits.growth': 'Career growth',
    
    // Process
    'home.process.title': 'How Does It Work?',
    'home.process.subtitle': 'Simple and transparent process',
    'home.process.step1.title': 'Register',
    'home.process.step1.desc': 'Fill the online form and upload required documents',
    'home.process.step2.title': 'Get Training',
    'home.process.step2.desc': 'Receive complete training and guidance from our team',
    'home.process.step3.title': 'Start Working',
    'home.process.step3.desc': 'Conduct daily surveys and work, receive regular income',
    
    // CTA
    'home.cta.title': 'Ready to Start Your Career?',
    'home.cta.subtitle': 'Join us today and secure your future',
    'home.cta.register': 'Register Now',
    'home.cta.meetTeam': 'Meet the Team',
    
    // Notice
    'home.notice.title': 'Important Notice',
    'home.notice.text': 'Please read all guidelines carefully. Daily attendance (9:00-9:15 AM) and PDF submission (6:00-7:00 AM) are mandatory. Minimum 10 surveys per day required. All rules are subject to Rajasthan Court.',
    
    // Join Page
    'join.title': 'Registration Form',
    'join.subtitle': 'Meri Pahal Fast Help Artist Welfare Association (Trust)',
    'join.step1': 'Personal Information',
    'join.step2': 'Bank Details',
    'join.step3': 'Documents',
    'join.fullName': 'Full Name',
    'join.fatherHusbandName': "Father's/Husband's Name",
    'join.dob': 'Date of Birth',
    'join.mobile': 'Mobile Number',
    'join.alternateMobile': 'Alternate Mobile',
    'join.email': 'Email',
    'join.aadhar': 'Aadhar Number',
    'join.education': 'Education',
    'join.address': 'Full Address',
    'join.bankName': 'Bank Name',
    'join.accountNumber': 'Account Number',
    'join.ifscCode': 'IFSC Code',
    'join.uploadPhoto': 'Upload Photo',
    'join.uploadAadhar': 'Upload Aadhar',
    'join.uploadSignature': 'Upload Signature',
    'join.declaration': 'Declaration',
    'join.declarationText': 'I declare that I have read and accept all rules, terms, and guidelines. I understand that providing false information may result in immediate termination of my service. I accept the jurisdiction of Rajasthan Court.',
    'join.agree': 'I accept all terms and conditions',
    'join.previous': 'Previous',
    'join.next': 'Next',
    'join.submit': 'Submit Application',
    'join.submitting': 'Submitting...',
    
    // Common
    'common.loading': 'Loading...',
    'common.required': 'Required',
    'common.optional': 'Optional',
    'common.chooseFile': 'Choose File',
    'common.view': 'View',
    'common.download': 'Download',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.search': 'Search',
    'common.filter': 'Filter',
  },
  hi: {
    // Header
    'header.home': 'होम',
    'header.about': 'हमारे बारे में',
    'header.gallery': 'फोटो गैलरी',
    'header.desiDidiMart': 'देसी दीदी मार्ट',
    'header.swasthaSangini': 'स्वस्थ संगिनी कार्ड',
    'header.guidelines': 'दिशानिर्देश',
    'header.team': 'हमारी टीम',
    'header.adminLogin': 'एडमिन लॉगिन',
    'header.joinNow': 'अभी जुड़ें',
    
    // Footer
    'footer.title': 'मेरी पहल फास्ट हेल्प',
    'footer.subtitle': 'आर्टिस्ट वेलफेयर एसोसिएशन (ट्रस्ट)',
    'footer.description': 'कलाकारों के कल्याण और सामाजिक विकास के लिए समर्पित संगठन।',
    'footer.location': 'जयपुर, राजस्थान',
    'footer.quickLinks': 'त्वरित लिंक',
    'footer.contact': 'संपर्क करें',
    'footer.officeHours': 'कार्यालय समय: सोमवार - शनिवार',
    'footer.timing': '9:00 AM - 6:00 PM',
    'footer.copyright': '© 2024 मेरी पहल फास्ट हेल्प आर्टिस्ट वेलफेयर एसोसिएशन। सर्वाधिकार सुरक्षित।',
    'footer.jurisdiction': 'क्षेत्राधिकार: राजस्थान न्यायालय के अधीन',
    
    // Home Page
    'home.hero.title': 'मेरी पहल फास्ट हेल्प',
    'home.hero.subtitle': 'आर्टिस्ट वेलफेयर एसोसिएशन',
    'home.hero.description': 'कलाकारों के कल्याण और सामाजिक विकास के लिए समर्पित संगठन',
    'home.hero.joinButton': 'अभी जुड़ें',
    'home.hero.learnMore': 'और जानें',
    
    // Rest of Hindi translations...
    'home.badges.registered': 'पंजीकृत ट्रस्ट',
    'home.badges.transparent': 'पारदर्शी प्रणाली',
    'home.badges.timely': 'समय पर भुगतान',
    'home.badges.legal': 'कानूनी संरक्षण',
    
    'join.title': 'पंजीकरण फॉर्म',
    'join.fullName': 'पूरा नाम',
    'common.loading': 'लोड हो रहा है...',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
