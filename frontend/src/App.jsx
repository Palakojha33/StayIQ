import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Cancellations from './pages/Cancellations';
import Reviews from './pages/Reviews';
import Recommendations from './pages/Recommendations';
import Pricing from './pages/Pricing';
import Recovery from './pages/Recovery';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} />;
      case 'cancellations':
        return <Cancellations />;
      case 'reviews':
        return <Reviews />;
      case 'recommendations':
        return <Recommendations />;
      case 'pricing':
        return <Pricing />;
      case 'recovery':
        return <Recovery />;
      default:
        return <Dashboard setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div class="min-h-screen flex flex-col bg-brand-darkest">
      {/* Navbar shell */}
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Page Content Wrapper */}
      <main class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer class="border-t border-brand-border/20 py-6 text-center text-xs text-slate-500">
        <p>© 2026 StayIQ Hospitality Intelligence. Built for ML optimization & dynamic hotel management.</p>
      </footer>
    </div>
  );
}
