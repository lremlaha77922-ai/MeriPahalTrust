import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Team from '@/pages/Team';
import Join from '@/pages/Join';
import Admin from '@/pages/Admin';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminPanel from '@/pages/admin/AdminPanel';
import OrderManagement from '@/pages/admin/OrderManagement';
import EmployeeDashboard from '@/pages/EmployeeDashboard';
import DesiDidiMart from '@/pages/DesiDidiMart';
import SwasthaSangini from '@/pages/SwasthaSangini';
import SwasthaSanginiApply from '@/pages/SwasthaSanginiApply';
import SwasthaSanginiSuccess from '@/pages/SwasthaSanginiSuccess';
import SwasthaSanginiAdmin from '@/pages/SwasthaSanginiAdmin';
import CoordinatorPortal from '@/pages/CoordinatorPortal';
import MobileCoordinatorApp from '@/pages/MobileCoordinatorApp';
import MobileSurveyApp from '@/pages/MobileSurveyApp';
import Gallery from '@/pages/Gallery';
import Shop from '@/pages/Shop';
import Cart from '@/pages/Cart';
import ProductDetail from '@/pages/ProductDetail';
import NotFound from '@/pages/NotFound';

// Guideline Pages
import Attendance from '@/pages/guidelines/Attendance';
import SurveyUpload from '@/pages/guidelines/SurveyUpload';
import PdfSubmission from '@/pages/guidelines/PdfSubmission';
import RegistrationFee from '@/pages/guidelines/RegistrationFee';
import SurveyTargets from '@/pages/guidelines/SurveyTargets';
import Discipline from '@/pages/guidelines/Discipline';
import Legal from '@/pages/guidelines/Legal';
import Agreement from '@/pages/guidelines/Agreement';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/desi-didi-mart" element={<DesiDidiMart />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/swastha-sangini" element={<SwasthaSangini />} />
            <Route path="/swastha-sangini/apply" element={<SwasthaSanginiApply />} />
            <Route path="/swastha-sangini/success" element={<SwasthaSanginiSuccess />} />
            <Route path="/swastha-sangini/admin" element={<SwasthaSanginiAdmin />} />
            <Route path="/coordinator-portal" element={<CoordinatorPortal />} />
            <Route path="/mobile-coordinator" element={<MobileCoordinatorApp />} />
            <Route path="/mobile-survey" element={<MobileSurveyApp />} />
            <Route path="/team" element={<Team />} />
            <Route path="/join" element={<Join />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/panel" element={<AdminPanel />} />
            <Route path="/admin/orders" element={<OrderManagement />} />
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            
            {/* Guideline Routes */}
            <Route path="/guidelines/attendance" element={<Attendance />} />
            <Route path="/guidelines/survey-upload" element={<SurveyUpload />} />
            <Route path="/guidelines/pdf-submission" element={<PdfSubmission />} />
            <Route path="/guidelines/registration-fee" element={<RegistrationFee />} />
            <Route path="/guidelines/survey-targets" element={<SurveyTargets />} />
            <Route path="/guidelines/discipline" element={<Discipline />} />
            <Route path="/guidelines/legal" element={<Legal />} />
            <Route path="/guidelines/agreement" element={<Agreement />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <WhatsAppButton />
        <Toaster position="top-right" richColors />
      </div>
    </BrowserRouter>
  );
}

export default App;
