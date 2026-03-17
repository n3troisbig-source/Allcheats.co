import { useState } from 'react';
import { Database, CheckCircle, XCircle, Upload, Loader } from 'lucide-react';

export default function SupabaseTab() {
  const [url, setUrl] = useState(localStorage.getItem('ac_sb_url') || '');
  const [key, setKey] = useState(localStorage.getItem('ac_sb_key') || '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs((p) => [msg, ...p.slice(0, 19)]);

  const testConnection = async () => {
    if (!url || !key) return;
    localStorage.setItem('ac_sb_url', url);
    localStorage.setItem('ac_sb_key', key);
    setStatus('loading');
    try {
      const res = await fetch(`${url}/rest/v1/`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });
      if (res.ok || res.status === 200 || res.status === 404) {
        setStatus('success');
        addLog('✓ Supabase connection successful');
      } else {
        setStatus('error');
        addLog(`✗ Connection failed — status ${res.status}`);
      }
    } catch {
      setStatus('error');
      addLog('✗ Connection failed — check URL and key');
    }
  };

  const pushData = async (table: string, data: unknown[]) => {
    if (!url || !key) return;
    try {
      const res = await fetch(`${url}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(data),
      });
      addLog(`${res.ok ? '✓' : '✗'} Pushed ${data.length} rows to ${table} (status ${res.status})`);
    } catch {
      addLog(`✗ Error pushing to ${table}`);
    }
  };

  const pushAllData = () => {
    const orders = JSON.parse(localStorage.getItem('ac_orders') || '[]');
    const promos = JSON.parse(localStorage.getItem('ac_promo_codes') || '[]');
    const customers = JSON.parse(localStorage.getItem('ac_customers') || '[]');
    if (orders.length) pushData('orders', orders);
    if (promos.length) pushData('promo_codes', promos);
    if (customers.length) pushData('customers', customers);
    addLog('📤 Started pushing all data to Supabase...');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Supabase</h2>
        <p className="text-sm text-gray-500">Connect your online database to sync data across all devices.</p>
      </div>

      {/* Config */}
      <div className="rounded-xl border border-dark-500 bg-dark-800 p-5 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2"><Database className="h-4 w-4 text-red-light" /> Supabase Configuration</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Supabase URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xxxxx.supabase.co"
              className="w-full rounded-lg border border-dark-500 bg-dark-700 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-red-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Anon Key</label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full rounded-lg border border-dark-500 bg-dark-700 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-red-primary font-mono"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={testConnection}
            className="flex items-center gap-2 rounded-lg border border-dark-500 bg-dark-700 px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition"
          >
            {status === 'loading' ? <Loader className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            Test Connection
          </button>
          <button
            onClick={pushAllData}
            className="flex items-center gap-2 rounded-lg bg-red-primary px-4 py-2 text-sm font-bold text-white hover:bg-red-hover transition"
          >
            <Upload className="h-4 w-4" /> Push All Data
          </button>
          {status === 'success' && <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle className="h-3.5 w-3.5" /> Connected</span>}
          {status === 'error' && <span className="flex items-center gap-1 text-xs text-red-400"><XCircle className="h-3.5 w-3.5" /> Failed</span>}
        </div>
      </div>

      {/* Info */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[{ icon: '📦', title: 'Orders', desc: 'Sync all customer orders to your database.' },
          { icon: '🎟️', title: 'Promo Codes', desc: 'Sync all promo codes and usage data.' },
          { icon: '👥', title: 'Customers', desc: 'Sync all customer accounts and balances.' }].map((card) => (
          <div key={card.title} className="rounded-xl border border-dark-500 bg-dark-800 p-4">
            <div className="text-2xl mb-2">{card.icon}</div>
            <h4 className="font-semibold text-white">{card.title}</h4>
            <p className="mt-1 text-xs text-gray-500">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Logs */}
      {logs.length > 0 && (
        <div className="rounded-xl border border-dark-500 bg-dark-800 p-5">
          <h3 className="mb-3 font-semibold text-white">Activity Log</h3>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {logs.map((log, i) => (
              <p key={i} className={`text-xs ${log.startsWith('✓') ? 'text-green-400' : log.startsWith('✗') ? 'text-red-400' : 'text-gray-400'}`}>{log}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
