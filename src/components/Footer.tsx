import { ShieldCheck, DollarSign } from 'lucide-react';

export default function Footer() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-dark-600 bg-dark-900 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-red-light" />
              <span className="text-lg font-bold text-white">
                Allcheats<span className="text-red-light">.co</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              Premium AI-powered gaming software and accounts. Your trusted source for gaming tools.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => scrollTo('hero')} className="text-sm text-gray-500 transition hover:text-red-light">Home</button>
              </li>
              <li>
                <button onClick={() => scrollTo('products')} className="text-sm text-gray-500 transition hover:text-red-light">Products</button>
              </li>
              <li>
                <button onClick={() => scrollTo('features')} className="text-sm text-gray-500 transition hover:text-red-light">Features</button>
              </li>
              <li>
                <button onClick={() => scrollTo('faq')} className="text-sm text-gray-500 transition hover:text-red-light">FAQ</button>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">Products</h4>
            <ul className="space-y-2">
              <li className="text-sm text-gray-500">All Cheats AI</li>
              <li className="text-sm text-gray-500">Acc Gen</li>
              <li className="text-sm text-gray-500">Perm Acc Gen</li>
              <li className="text-sm text-gray-500">Month Access</li>
              <li className="text-sm text-gray-500">5% Discount Week</li>
              <li className="text-sm text-gray-500 italic text-yellow-600">🍀 All Luck — Any Rank Possible</li>
            </ul>
          </div>

          {/* Payment */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">Payment</h4>
            <div className="flex items-center gap-2 rounded-lg border border-dark-500 bg-dark-700 p-3">
              <DollarSign className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-xs text-gray-500">CashApp</p>
                <p className="font-mono text-sm font-bold text-green-400">$allcheats</p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs text-gray-500">Owners</p>
              <p className="text-sm text-gray-400">Redxvk, Royku &amp; Death</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-dark-600 pt-6 text-center">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Allcheats.co — All rights reserved. Owned by Redxvk, Royku &amp; Death.
          </p>
        </div>
      </div>
    </footer>
  );
}
