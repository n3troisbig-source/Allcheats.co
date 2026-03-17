import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Products from './components/Products';
import Features from './components/Features';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import AdminPanel from './components/admin/AdminPanel';
import LiveFeed from './components/LiveFeed';

export default function App() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<{ username: string; role: string } | null>(() => {
    const stored = localStorage.getItem('ac_logged_in');
    return stored ? JSON.parse(stored) : null;
  });

  // Listen for login/logout events from AdminPanel
  useEffect(() => {
    const onStorage = () => {
      const stored = localStorage.getItem('ac_logged_in');
      setLoggedInUser(stored ? JSON.parse(stored) : null);
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('ac_auth_changed', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('ac_auth_changed', onStorage);
    };
  }, []);

  const handleAdminClose = () => {
    setAdminOpen(false);
    // Re-read login state when panel closes
    const stored = localStorage.getItem('ac_logged_in');
    setLoggedInUser(stored ? JSON.parse(stored) : null);
  };

  return (
    <div className="min-h-screen bg-dark-900 text-gray-200">
      <Navbar
        onAdminOpen={() => setAdminOpen(true)}
        loggedInUser={loggedInUser}
      />
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

      {/* Admin Panel — auto open if already logged in */}
      {adminOpen && <AdminPanel onClose={handleAdminClose} />}

      {/* Live purchase feed - bottom left */}
      <LiveFeed />
    </div>
  );
}
