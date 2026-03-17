import { useState } from 'react';
import { Menu, X, ShieldCheck, Lock } from 'lucide-react';

interface Props {
  onAdminOpen: () => void;
}

export default function Navbar({ onAdminOpen }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-dark-600 bg-dark-900/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('hero')}>
          <ShieldCheck className="h-7 w-7 text-red-light" />
          <span className="text-xl font-bold tracking-tight text-white">
            Allcheats<span className="text-red-light">.co</span>
          </span>
        </div>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <button onClick={() => scrollTo('hero')} className="text-sm text-gray-300 transition hover:text-red-light">Home</button>
          <button onClick={() => scrollTo('products')} className="text-sm text-gray-300 transition hover:text-red-light">Products</button>
          <button onClick={() => scrollTo('features')} className="text-sm text-gray-300 transition hover:text-red-light">Features</button>
          <button onClick={() => scrollTo('faq')} className="text-sm text-gray-300 transition hover:text-red-light">FAQ</button>
          <button
            onClick={onAdminOpen}
            className="flex items-center gap-1.5 rounded-lg border border-dark-500 bg-dark-700 px-3 py-2 text-sm font-semibold text-gray-300 transition hover:border-red-primary/50 hover:text-red-light"
          >
            <Lock className="h-3.5 w-3.5" /> Admin
          </button>
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
            <button onClick={() => scrollTo('hero')} className="rounded-lg px-4 py-3 text-left text-sm text-gray-300 hover:bg-dark-600 hover:text-red-light">Home</button>
            <button onClick={() => scrollTo('products')} className="rounded-lg px-4 py-3 text-left text-sm text-gray-300 hover:bg-dark-600 hover:text-red-light">Products</button>
            <button onClick={() => scrollTo('features')} className="rounded-lg px-4 py-3 text-left text-sm text-gray-300 hover:bg-dark-600 hover:text-red-light">Features</button>
            <button onClick={() => scrollTo('faq')} className="rounded-lg px-4 py-3 text-left text-sm text-gray-300 hover:bg-dark-600 hover:text-red-light">FAQ</button>
            <button
              onClick={() => { onAdminOpen(); setMobileOpen(false); }}
              className="flex items-center gap-2 rounded-lg px-4 py-3 text-left text-sm text-gray-300 hover:bg-dark-600 hover:text-red-light"
            >
              <Lock className="h-4 w-4" /> Admin Panel
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
