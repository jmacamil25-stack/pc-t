
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/pages/HomePage';
import InventoryPage from './components/pages/InventoryPage';
import VehicleDetailPage from './components/pages/VehicleDetailPage';
import AboutPage from './components/pages/AboutPage';
import ContactPage from './components/pages/ContactPage';
import FinancingPage from './components/pages/FinancingPage';
import TradeInPage from './components/pages/TradeInPage';
import AdminPage from './components/pages/AdminPage';
import ChatBot from './components/ChatBot';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const Layout: React.FC<{children: React.ReactNode}> = ({children}) => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {!isAdmin && <Header />}
            <main className={`flex-grow ${!isAdmin ? 'pt-20' : ''}`}>
                {children}
            </main>
            {!isAdmin && <Footer />}
            {!isAdmin && <ChatBot />}
        </div>
    )
}

const App: React.FC = () => {
  return (
    <HashRouter>
      <ScrollToTop />
      <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/inventory/:id" element={<VehicleDetailPage />} />
            <Route path="/financing" element={<FinancingPage />} />
            <Route path="/trade-in" element={<TradeInPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
