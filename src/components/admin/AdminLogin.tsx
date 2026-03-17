import { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { defaultAdminAccounts, AdminAccount } from '../../data/adminAccounts';

interface Props {
  onLogin: (account: AdminAccount) => void;
}

export default function AdminLogin({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    const stored = localStorage.getItem('ac_admin_accounts');
    const accounts: AdminAccount[] = stored ? JSON.parse(stored) : defaultAdminAccounts;
    const match = accounts.find(
      (a) => a.username.toLowerCase() === username.toLowerCase() && a.password === password && a.active
    );
    if (match) {
      setError('');
      // Log IP attempt (simulated)
      const logs = JSON.parse(localStorage.getItem('ac_ip_logs') || '[]');
      logs.unshift({ id: Date.now().toString(), username: match.username, role: match.role, ip: '0.0.0.0', timestamp: new Date().toISOString() });
      localStorage.setItem('ac_ip_logs', JSON.stringify(logs.slice(0, 100)));
      // Update login count
      const updated = accounts.map((a) =>
        a.id === match.id ? { ...a, loginCount: a.loginCount + 1, lastLogin: new Date().toISOString(), lastIp: '0.0.0.0' } : a
      );
      localStorage.setItem('ac_admin_accounts', JSON.stringify(updated));
      localStorage.setItem('ac_logged_in', JSON.stringify(match));
      onLogin(match);
    } else {
      setError('Invalid username or password, or account is disabled.');
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 bg-grid flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-primary/40 bg-red-primary/10">
              <ShieldCheck className="h-8 w-8 text-red-light" />
            </div>
          </div>
          <h1 className="glow-text text-2xl font-extrabold text-white">Admin Panel</h1>
          <p className="mt-1 text-sm text-gray-500">Allcheats.co — Allchats.co Control</p>
        </div>

        <div className="rounded-2xl border border-dark-500 bg-dark-800 p-6">
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter username"
              className="w-full rounded-lg border border-dark-500 bg-dark-700 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition focus:border-red-primary focus:ring-1 focus:ring-red-primary/30"
            />
          </div>
          <div className="mb-5">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter password"
                className="w-full rounded-lg border border-dark-500 bg-dark-700 px-4 py-2.5 pr-10 text-sm text-white placeholder-gray-600 outline-none transition focus:border-red-primary focus:ring-1 focus:ring-red-primary/30"
              />
              <button
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-primary/30 bg-red-primary/10 p-3 text-xs text-red-light">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            className="animate-pulse-glow w-full rounded-xl bg-red-primary py-3 text-sm font-bold text-white transition hover:bg-red-hover"
          >
            Login to Admin Panel
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-gray-600">
          Access restricted to authorized personnel only.
        </p>
      </div>
    </div>
  );
}
