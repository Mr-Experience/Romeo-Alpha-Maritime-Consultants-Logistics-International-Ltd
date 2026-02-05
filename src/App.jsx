import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { TranslationProvider } from './context/TranslationContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import About from './components/About';

import Team from './components/Team';
import Careers from './components/Careers';
import Contact from './components/Contact';
import Marketplace from './components/Marketplace';
import MarketplaceDetail from './components/MarketplaceDetail';
import OperationDetail from './components/OperationDetail';
import ServiceMaritime from './components/ServiceMaritime';
import ServiceCharter from './components/ServiceCharter';
import ServiceOffshore from './components/ServiceOffshore';
import ServiceSecurity from './components/ServiceSecurity';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import PartnershipForm from './components/PartnershipForm';
// Import legacy styles (now in src/styles)
import './styles/styles.css';
import './styles/footer_styles.css';

// Placeholder components for routes we haven't migrated yet
const Placeholder = ({ title }) => (
  <div style={{ padding: '100px 20px', textAlign: 'center' }}>
    <h2>{title}</h2>
    <p>This page is being migrated...</p>
  </div>
);



function App() {
  return (
    <TranslationProvider>
      <Router>
        <AppContentWithLocation />
      </Router>
    </TranslationProvider>
  );
}

// Helper to get location access safely
const AppContentWithLocation = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/admin-dashboard';
  const isLogin = location.pathname === '/admin-login';

  return (
    <div className="page-wrapper">
      {!isDashboard && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />

        <Route path="/team" element={<Team />} />
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
        <Route path="/partnership" element={<PartnershipForm />} />
      </Routes>
      {!isLogin && !isDashboard && <Footer />}
    </div>
  );
};

export default App;
