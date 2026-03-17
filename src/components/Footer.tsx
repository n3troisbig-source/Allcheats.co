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
              <p className="text-sm text-gray-400">Red.gov &amp; Royku</p>
              <p className="text-xs text-gray-500 mt-1">Site made by Death</p>
            </div>
            <a
              href="https://discord.gg/skxTSTBS"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition px-3 py-2 text-xs font-bold text-white w-full justify-center"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.055a19.998 19.998 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.201 13.201 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
              Join Our Discord
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-dark-600 pt-6 text-center">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Allcheats.co — All rights reserved. Owned by Red.gov &amp; Royku. Site made by Death.
          </p>
        </div>
      </div>
    </footer>
  );
}
