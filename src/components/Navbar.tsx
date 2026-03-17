import { useState, useEffect } from 'react';
import { Menu, X, ShieldCheck, Lock, Users, LogIn } from 'lucide-react';

interface Props {
  onAdminOpen: () => void;
  loggedInUser: { username: string; role: string } | null;
}

const roleColor = (role: string) => {
  if (role === 'Owner') return 'border-purple-500/40 bg-purple-500/10 text-purple-300';
  if (role === 'Manager') return 'border-blue-500/40 bg-blue-500/10 text-blue-300';
  return 'border-green-500/40 bg-green-500/10 text-green-300';
};

const roleEmoji = (role: string) => {
  if (role === 'Owner') return '👑';
  if (role === 'Manager') return '🛡️';
  return '🔑';
};

export default function Navbar({ onAdminOpen, loggedInUser }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [viewers, setViewers] = useState(() => Math.floor(Math.random() * 40) + 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(prev => {
        const delta = Math.floor(Math.random() * 7) - 3;
        return Math.min(150, Math.max(40, prev + delta));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-dark-600 bg-dark-900/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('hero')}>
          <ShieldCheck className="h-7 w-7 text-red-light" />
          <span className="text-xl font-bold tracking-tight text-white">
            Allcheats<span className="text-red-light">.co</span>
          </span>
        </div>

        {/* Live viewer count - center */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          </span>
          <Users className="h-3 w-3" />
          <span>{viewers} browsing now</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden items-center gap-4 md:flex">
          <button onClick={() => scrollTo('hero')} className="text-sm text-gray-300 transition hover:text-red-light">Home</button>
          <button onClick={() => scrollTo('products')} className="text-sm text-gray-300 transition hover:text-red-light">Products</button>
          <button onClick={() => scrollTo('features')} className="text-sm text-gray-300 transition hover:text-red-light">Features</button>
          <button onClick={() => scrollTo('faq')} className="text-sm text-gray-300 transition hover:text-red-light">FAQ</button>

          {/* Discord */}
          <a
            href="https://discord.gg/skxTSTBS"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition px-3 py-2 text-sm font-semibold text-white"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.055a19.998 19.998 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.201 13.201 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
            Discord
          </a>

          {/* Admin button — shows username if logged in */}
          {loggedInUser ? (
            <button
              onClick={onAdminOpen}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition hover:brightness-110 ${roleColor(loggedInUser.role)}`}
            >
              <span className="text-base leading-none">{roleEmoji(loggedInUser.role)}</span>
              <span>{loggedInUser.username}</span>
              <span className="text-xs opacity-70">({loggedInUser.role})</span>
            </button>
          ) : (
            <button
              onClick={onAdminOpen}
              className="flex items-center gap-1.5 rounded-lg border border-dark-500 bg-dark-700 px-3 py-2 text-sm font-semibold text-gray-300 transition hover:border-red-primary/50 hover:text-red-light"
            >
              <Lock className="h-3.5 w-3.5" /> Admin
            </button>
          )}

          <button onClick={() => scrollTo('products')} className="rounded-lg bg-red-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-hover">
            Shop Now
          </button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-gray-300" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="animate-slide-down border-t border-dark-600 bg-dark-800 md:hidden">
          <div className="flex flex-col gap-1 p-4">
            {/* Logged in badge for mobile */}
            {loggedInUser && (
              <div className={`mb-2 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold ${roleColor(loggedInUser.role)}`}>
                <span>{roleEmoji(loggedInUser.role)}</span>
                <span>Logged in as {loggedInUser.username}</span>
                <span className="ml-auto text-xs opacity-70">{loggedInUser.role}</span>
              </div>
            )}

            <button onClick={() => scrollTo('hero')} className="rounded-lg px-4 py-3 text-left text-sm text-gray-300 hover:bg-dark-600 hover:text-red-light">Home</button>
            <button onClick={() => scrollTo('products')} className="rounded-lg px-4 py-3 text-left text-sm text-gray-300 hover:bg-dark-600 hover:text-red-light">Products</button>
            <button onClick={() => scrollTo('features')} className="rounded-lg px-4 py-3 text-left text-sm text-gray-300 hover:bg-dark-600 hover:text-red-light">Features</button>
            <button onClick={() => scrollTo('faq')} className="rounded-lg px-4 py-3 text-left text-sm text-gray-300 hover:bg-dark-600 hover:text-red-light">FAQ</button>
            <a
              href="https://discord.gg/skxTSTBS"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition px-4 py-3 text-sm font-semibold text-white"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.055a19.998 19.998 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.201 13.201 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
              Join Discord
            </a>
            <button
              onClick={() => { onAdminOpen(); setMobileOpen(false); }}
              className={`flex items-center gap-2 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                loggedInUser
                  ? `border ${roleColor(loggedInUser.role)}`
                  : 'text-gray-300 hover:bg-dark-600 hover:text-red-light'
              }`}
            >
              {loggedInUser ? (
                <>
                  <span>{roleEmoji(loggedInUser.role)}</span>
                  {loggedInUser.username} — Open Panel
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" /> Admin Panel
                </>
              )}
            </button>
            <button onClick={() => scrollTo('products')} className="mt-2 rounded-lg bg-red-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-hover">
              Shop Now
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
