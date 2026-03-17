import { useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database, CheckCircle, XCircle, Upload, Loader, RefreshCw, Copy, ExternalLink, AlertTriangle, Info } from 'lucide-react';
import { getOrders } from '../../../data/orderStore';

let supabaseClient: SupabaseClient | null = null;

function getClient(url: string, key: string): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}

function resetClient() {
  supabaseClient = null;
}

const SQL_SETUP = `-- Run this in Supabase SQL Editor to create your tables:

create table if not exists public.orders (
  id text primary key,
  ticket_id text,
  customer_name text,
  customer_email text,
  product_id text,
  product_name text,
  variant_name text,
  amount numeric,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.customers (
  id text primary key,
  name text,
  email text,
  balance numeric default 0,
  total_orders integer default 0,
  total_spent numeric default 0,
  joined_at timestamptz default now()
);

create table if not exists public.promo_codes (
  id text primary key,
  code text unique,
  type text,
  amount numeric,
  active boolean default true,
  uses integer default 0,
  created_at timestamptz default now()
);

-- Enable Row Level Security (optional but recommended)
alter table public.orders enable row level security;
alter table public.customers enable row level security;
alter table public.promo_codes enable row level security;

-- Allow full access with service role key
create policy "Allow all" on public.orders for all using (true) with check (true);
create policy "Allow all" on public.customers for all using (true) with check (true);
create policy "Allow all" on public.promo_codes for all using (true) with check (true);`;

export default function SupabaseTab() {
  const [url, setUrl] = useState(localStorage.getItem('ac_sb_url') || '');
  const [key, setKey] = useState(localStorage.getItem('ac_sb_key') || '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [pushing, setPushing] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [step, setStep] = useState(0);
  const [tableStatus, setTableStatus] = useState<{ orders: boolean; customers: boolean; promo_codes: boolean } | null>(null);

  useEffect(() => {
    if (localStorage.getItem('ac_sb_url') && localStorage.getItem('ac_sb_key')) {
      setStatus('success');
    }
  }, []);

  const addLog = (msg: string) => setLogs((p) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...p.slice(0, 29)]);

  const saveCredentials = () => {
    localStorage.setItem('ac_sb_url', url.trim());
    localStorage.setItem('ac_sb_key', key.trim());
    resetClient();
  };

  const testConnection = async () => {
    if (!url.trim() || !key.trim()) {
      addLog('✗ Please enter your Supabase URL and anon/service key');
      setStatus('error');
      return;
    }
    saveCredentials();
    setStatus('loading');
    addLog('⟳ Testing connection to Supabase...');

    try {
      const sb = getClient(url.trim(), key.trim());

      // Try to query the orders table — if it doesn't exist we'll get a specific error
      const results = await Promise.all([
        sb.from('orders').select('id', { count: 'exact', head: true }),
        sb.from('customers').select('id', { count: 'exact', head: true }),
        sb.from('promo_codes').select('id', { count: 'exact', head: true }),
      ]);

      const tableMap = { orders: false, customers: false, promo_codes: false };
      const tableNames = ['orders', 'customers', 'promo_codes'] as const;

      let anyError = false;
      results.forEach((res, i) => {
        const tbl = tableNames[i];
        if (!res.error) {
          tableMap[tbl] = true;
          addLog(`✓ Table "${tbl}" found`);
        } else if (res.error.code === '42P01') {
          // Table doesn't exist
          addLog(`⚠ Table "${tbl}" does not exist — run the SQL setup below`);
          anyError = true;
        } else if (res.error.message?.includes('Invalid API key') || res.error.message?.includes('JWT')) {
          addLog('✗ Invalid API key — check your anon/service key');
          setStatus('error');
          return;
        } else {
          addLog(`✗ "${tbl}" error: ${res.error.message}`);
          anyError = true;
        }
      });

      setTableStatus(tableMap);

      if (!anyError) {
        setStatus('success');
        addLog('✓ All tables found — Supabase fully connected!');
        setStep(3);
      } else {
        setStatus('error');
        addLog('⚠ Connection OK but some tables are missing — run the SQL setup');
        setShowSql(true);
        setStep(2);
      }
    } catch (err: unknown) {
      setStatus('error');
      const msg = err instanceof Error ? err.message : 'Unknown error';
      addLog(`✗ Connection failed: ${msg}`);
      addLog('→ Check: Is your URL correct? Is your key correct? Is Supabase project active?');
    }
  };

  const pushTable = async (
    sb: SupabaseClient,
    table: string,
    data: Record<string, unknown>[]
  ) => {
    if (!data.length) {
      addLog(`⏭ No data to push to "${table}"`);
      return;
    }
    const { error } = await sb.from(table).upsert(data, { onConflict: 'id' });
    if (error) {
      addLog(`✗ Failed to push "${table}": ${error.message}`);
    } else {
      addLog(`✓ Pushed ${data.length} rows to "${table}"`);
    }
  };

  const pushAllData = async () => {
    if (!url.trim() || !key.trim()) {
      addLog('✗ Not connected — test connection first');
      return;
    }
    setPushing(true);
    addLog('📤 Pushing all data to Supabase...');
    saveCredentials();

    try {
      const sb = getClient(url.trim(), key.trim());

      const orders = getOrders().map((o) => ({
        id: o.id,
        ticket_id: o.ticketId,
        customer_name: o.name,
        customer_email: o.email,
        product_name: o.product,
        variant_name: o.variant,
        amount: o.total,
        status: o.status,
        created_at: o.date,
      }));

      const customers = JSON.parse(localStorage.getItem('ac_customers') || '[]');
      const promos = JSON.parse(localStorage.getItem('ac_promo_codes') || '[]');

      await pushTable(sb, 'orders', orders);
      await pushTable(sb, 'customers', customers);
      await pushTable(sb, 'promo_codes', promos);

      addLog('✓ All data pushed successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      addLog(`✗ Push failed: ${msg}`);
    }

    setPushing(false);
  };

  const pullOrders = async () => {
    if (!url.trim() || !key.trim()) return;
    addLog('⟳ Pulling orders from Supabase...');
    try {
      const sb = getClient(url.trim(), key.trim());
      const { data, error } = await sb.from('orders').select('*').order('created_at', { ascending: false });
      if (error) {
        addLog(`✗ Pull failed: ${error.message}`);
      } else {
        const mapped = (data || []).map((o: Record<string, unknown>) => ({
          id: o.id,
          ticketId: o.ticket_id,
          name: o.customer_name,
          email: o.customer_email,
          product: o.product_name,
          variant: o.variant_name,
          total: o.amount,
          paymentMethod: 'CashApp',
          status: o.status,
          date: o.created_at,
        }));
        localStorage.setItem('ac_orders', JSON.stringify(mapped));
        window.dispatchEvent(new CustomEvent('ac_orders_updated'));
        addLog(`✓ Pulled ${mapped.length} orders from Supabase → saved to local`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      addLog(`✗ Pull error: ${msg}`);
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(SQL_SETUP);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  const steps = [
    { num: 1, label: 'Create Supabase Project', done: step >= 1 },
    { num: 2, label: 'Enter URL & Key', done: step >= 2 },
    { num: 3, label: 'Run SQL Setup', done: step >= 3 },
    { num: 4, label: 'Connected!', done: step >= 4 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">🗄️ Supabase</h2>
        <p className="text-sm text-gray-500">Connect your online database so orders and data sync across all devices.</p>
      </div>

      {/* Step Guide */}
      <div className="rounded-xl border border-dark-500 bg-dark-800 p-5">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" /> Setup Guide</h3>
        <div className="flex flex-wrap gap-3 mb-4">
          {steps.map((s) => (
            <div key={s.num} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm border ${s.done ? 'border-green-500/40 bg-green-500/10 text-green-400' : 'border-dark-500 bg-dark-700 text-gray-400'}`}>
              {s.done ? <CheckCircle className="h-3.5 w-3.5" /> : <span className="h-4 w-4 rounded-full border border-gray-600 flex items-center justify-center text-xs">{s.num}</span>}
              {s.label}
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-500 space-y-1">
          <p>1. Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-400 underline inline-flex items-center gap-1">supabase.com <ExternalLink className="h-3 w-3" /></a> → Create a free project</p>
          <p>2. Go to <strong className="text-gray-300">Project Settings → API</strong> → copy the <strong className="text-yellow-400">Project URL</strong> and <strong className="text-yellow-400">service_role key</strong> (NOT anon key — service_role bypasses RLS)</p>
          <p>3. Go to <strong className="text-gray-300">SQL Editor</strong> in Supabase → paste and run the SQL below</p>
          <p>4. Enter your URL + key below and click <strong className="text-green-400">Test Connection</strong></p>
        </div>
        <button
          onClick={() => { setStep(1); setShowSql(true); }}
          className="mt-3 flex items-center gap-2 rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-500/20 transition"
        >
          Show SQL Setup Script
        </button>
      </div>

      {/* SQL Setup */}
      {showSql && (
        <div className="rounded-xl border border-yellow-500/30 bg-dark-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-400" /> SQL Setup — Run this in Supabase SQL Editor</h3>
            <div className="flex gap-2">
              <button
                onClick={copySql}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${sqlCopied ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-dark-700 text-gray-300 border border-dark-500 hover:text-white'}`}
              >
                {sqlCopied ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {sqlCopied ? 'Copied!' : 'Copy SQL'}
              </button>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-green-500/20 border border-green-500/40 px-3 py-1.5 text-xs font-semibold text-green-400 hover:bg-green-500/30 transition"
              >
                <ExternalLink className="h-3 w-3" /> Open Supabase
              </a>
            </div>
          </div>
          <pre className="max-h-64 overflow-y-auto rounded-lg bg-black/60 p-4 text-xs text-green-300 font-mono leading-relaxed whitespace-pre-wrap">
            {SQL_SETUP}
          </pre>
          <p className="mt-2 text-xs text-gray-500">After running this SQL, your tables will be created. Then enter your credentials below and click Test Connection.</p>
        </div>
      )}

      {/* Credentials */}
      <div className="rounded-xl border border-dark-500 bg-dark-800 p-5 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2"><Database className="h-4 w-4 text-red-light" /> Credentials</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Supabase Project URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setStatus('idle'); }}
              placeholder="https://xxxxxxxxxxx.supabase.co"
              className="w-full rounded-lg border border-dark-500 bg-dark-700 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-red-primary font-mono"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">
              Service Role Key <span className="text-yellow-400">(use service_role, not anon)</span>
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => { setKey(e.target.value); setStatus('idle'); }}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full rounded-lg border border-dark-500 bg-dark-700 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-red-primary font-mono"
            />
            <p className="mt-1 text-xs text-gray-600">Found at: Supabase Dashboard → Settings → API → service_role (secret)</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={testConnection}
            disabled={status === 'loading'}
            className="flex items-center gap-2 rounded-lg bg-red-primary px-4 py-2 text-sm font-bold text-white hover:bg-red-hover transition disabled:opacity-50"
          >
            {status === 'loading' ? <Loader className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            Test Connection
          </button>

          {status === 'success' && (
            <>
              <button
                onClick={pushAllData}
                disabled={pushing}
                className="flex items-center gap-2 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm font-bold text-green-400 hover:bg-green-500/20 transition disabled:opacity-50"
              >
                {pushing ? <Loader className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {pushing ? 'Pushing...' : 'Push All Data'}
              </button>
              <button
                onClick={pullOrders}
                className="flex items-center gap-2 rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-400 hover:bg-blue-500/20 transition"
              >
                <RefreshCw className="h-4 w-4" /> Pull Orders
              </button>
            </>
          )}

          {status === 'success' && (
            <span className="flex items-center gap-1 text-xs text-green-400 font-semibold">
              <CheckCircle className="h-4 w-4" /> Connected
            </span>
          )}
          {status === 'error' && (
            <span className="flex items-center gap-1 text-xs text-red-400 font-semibold">
              <XCircle className="h-4 w-4" /> Failed — check logs below
            </span>
          )}
        </div>
      </div>

      {/* Table Status */}
      {tableStatus && (
        <div className="rounded-xl border border-dark-500 bg-dark-800 p-5">
          <h3 className="font-semibold text-white mb-3">Table Status</h3>
          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(tableStatus) as [string, boolean][]).map(([tbl, ok]) => (
              <div key={tbl} className={`rounded-lg border p-3 text-center ${ok ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                <div className="text-lg mb-1">{ok ? '✅' : '❌'}</div>
                <p className={`text-xs font-semibold ${ok ? 'text-green-400' : 'text-red-400'}`}>{tbl}</p>
                <p className="text-xs text-gray-500 mt-0.5">{ok ? 'Ready' : 'Missing — run SQL'}</p>
              </div>
            ))}
          </div>
          {Object.values(tableStatus).some((v) => !v) && (
            <div className="mt-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
              <p className="text-xs text-yellow-400 flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                Some tables are missing. Copy the SQL above, open Supabase Dashboard → SQL Editor, paste it and click Run. Then test connection again.
              </p>
            </div>
          )}
        </div>
      )}

      {/* What Gets Synced */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: '📦', title: 'Orders', desc: 'All customer orders with status, ticket ID, and payment info.' },
          { icon: '🎟️', title: 'Promo Codes', desc: 'All discount codes, usage counts, and active status.' },
          { icon: '👥', title: 'Customers', desc: 'Customer profiles, balances, and order history.' },
        ].map((card) => (
          <div key={card.title} className="rounded-xl border border-dark-500 bg-dark-800 p-4">
            <div className="text-2xl mb-2">{card.icon}</div>
            <h4 className="font-semibold text-white">{card.title}</h4>
            <p className="mt-1 text-xs text-gray-500">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Activity Log */}
      {logs.length > 0 && (
        <div className="rounded-xl border border-dark-500 bg-dark-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">Activity Log</h3>
            <button onClick={() => setLogs([])} className="text-xs text-gray-500 hover:text-gray-300 transition">Clear</button>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1 font-mono">
            {logs.map((log, i) => (
              <p
                key={i}
                className={`text-xs ${
                  log.includes('✓') ? 'text-green-400' :
                  log.includes('✗') ? 'text-red-400' :
                  log.includes('⚠') ? 'text-yellow-400' :
                  'text-gray-400'
                }`}
              >
                {log}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
