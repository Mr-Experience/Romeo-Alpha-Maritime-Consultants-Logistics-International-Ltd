import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { TranslationProvider } from './context/TranslationContext';
import { NotificationProvider } from './context/NotificationContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import About from './components/About';

import Careers from './components/Careers';
import Contact from './components/Contact';
import Marketplace from './components/Marketplace';
import MarketplaceDetail from './components/MarketplaceDetail';
import MarketplaceInquiry from './components/MarketplaceInquiry';
import OperationDetail from './components/OperationDetail';
import ServiceMaritime from './components/ServiceMaritime';
import ServiceCharter from './components/ServiceCharter';
import ServiceOffshore from './components/ServiceOffshore';
import ServiceSecurity from './components/ServiceSecurity';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import Team from './components/Team';
// Import legacy styles (now in src/styles)
import './styles/styles.css';
import './styles/footer_styles.css';


function App() {
  return (
    <TranslationProvider>
      <NotificationProvider>
        <Router>
          <AppContentWithLocation />
        </Router>
      </NotificationProvider>
    </TranslationProvider>
  );
}

// Helper to get location access safely
const AppContentWithLocation = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/admin-dashboard';
  const isLogin = location.pathname === '/admin-login';
  const isMarketplaceDetail = location.pathname.startsWith('/marketplace/');
  const isMarketplaceInquiry = location.pathname.startsWith('/marketplace-inquiry/');

  return (
    <div className="page-wrapper">
      {!isDashboard && !isMarketplaceDetail && !isMarketplaceInquiry && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />


        <Route path="/careers" element={<Careers />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/:id" element={<MarketplaceDetail />} />

        <Route path="/operation-detail" element={<OperationDetail />} />
        <Route path="/service/maritime" element={<ServiceMaritime />} />
        <Route path="/service/charter" element={<ServiceCharter />} />
        <Route path="/service/offshore" element={<ServiceOffshore />} />
        <Route path="/service/security" element={<ServiceSecurity />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/team" element={<Team />} />
      </Routes>
      {!isLogin && !isDashboard && !isMarketplaceDetail && !isMarketplaceInquiry && <Footer />}
    </div>
  );
};

export default App;
