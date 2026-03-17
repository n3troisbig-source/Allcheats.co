import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Products from './components/Products';
import Features from './components/Features';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import AdminPanel from './components/admin/AdminPanel';

export default function App() {
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-900 text-gray-200">
      <Navbar onAdminOpen={() => setAdminOpen(true)} />
      <Hero />
      {/* Divider */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-red-primary/30 to-transparent" />
      </div>
      <Products />
      <div className="mx-auto max-w-7xl px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-red-primary/30 to-transparent" />
      </div>
      <Features />
      <div className="mx-auto max-w-7xl px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-red-primary/30 to-transparent" />
      </div>
      <FAQ />
      <Footer />

      {/* Admin Panel */}
      {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}
    </div>
  );
}
