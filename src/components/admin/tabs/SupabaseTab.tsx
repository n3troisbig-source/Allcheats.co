import { useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Database, CheckCircle, Upload, Loader,
  RefreshCw, Copy, ExternalLink, AlertTriangle, Info, Zap, Play
} from 'lucide-react';
import { getOrders } from '../../../data/orderStore';

let supabaseClient: SupabaseClient | null = null;

function getClient(url: string, key: string): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(url, key, {
      auth: { persistSession: false }
    });
  }
  return supabaseClient;
}

function resetClient() {
  supabaseClient = null;
}

// SQL to create tables — NO RLS so service_role and anon both work
const CREATE_ORDERS_SQL = `
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
);`;

const CREATE_CUSTOMERS_SQL = `
create table if not exists public.customers (
  id text primary key,
  name text,
  email text,
  balance numeric default 0,
  total_orders integer default 0,
  total_spent numeric default 0,
  joined_at timestamptz default now()
);`;

const CREATE_PROMOS_SQL = `
create table if not exists public.promo_codes (
  id text primary key,
  code text unique,
  type text,
  amount numeric,
  active boolean default true,
  uses integer default 0,
  created_at timestamptz default now()
);`;

const FULL_SQL = `-- ✅ Run this in Supabase SQL Editor → New Query → Paste → Run

${CREATE_ORDERS_SQL}

${CREATE_CUSTOMERS_SQL}

${CREATE_PROMOS_SQL}

-- Disable RLS so data can be read/written freely
alter table public.orders disable row level security;
alter table public.customers disable row level security;
alter table public.promo_codes disable row level security;`;

type TableStatus = { orders: boolean; customers: boolean; promo_codes: boolean };

export default function SupabaseTab() {
  const [url, setUrl] = useState(localStorage.getItem('ac_sb_url') || '');
  const [key, setKey] = useState(localStorage.getItem('ac_sb_key') || '');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [creatingTables, setCreatingTables] = useState(false);
  const [logs, setLogs] = useState<{ msg: string; type: 'ok' | 'err' | 'warn' | 'info' }[]>([]);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [tableStatus, setTableStatus] = useState<TableStatus | null>(null);

  useEffect(() => {
    const savedUrl = localStorage.getItem('ac_sb_url');
    const savedKey = localStorage.getItem('ac_sb_key');
    if (savedUrl && savedKey) {
      setUrl(savedUrl);
      setKey(savedKey);
      // Auto reconnect silently
      silentReconnect(savedUrl, savedKey);
    }
  }, []);

  const log = (msg: string, type: 'ok' | 'err' | 'warn' | 'info' = 'info') => {
    setLogs((p) => [{ msg: `[${new Date().toLocaleTimeString()}] ${msg}`, type }, ...p.slice(0, 49)]);
  };

  const saveCredentials = (u: string, k: string) => {
    localStorage.setItem('ac_sb_url', u.trim());
    localStorage.setItem('ac_sb_key', k.trim());
  };

  const checkTables = async (sb: SupabaseClient): Promise<TableStatus> => {
    const tables = ['orders', 'customers', 'promo_codes'] as const;
    const status: TableStatus = { orders: false, customers: false, promo_codes: false };
    for (const tbl of tables) {
      const { error } = await sb.from(tbl).select('id').limit(1);
      if (!error) {
        status[tbl] = true;
      }
    }
    return status;
  };

  const silentReconnect = async (u: string, k: string) => {
    try {
      resetClient();
      const sb = getClient(u, k);
      const ts = await checkTables(sb);
      setTableStatus(ts);
      if (Object.values(ts).every(Boolean)) {
        setConnected(true);
      }
    } catch {
      // silent fail
    }
  };

  const testConnection = async () => {
    if (!url.trim() || !key.trim()) {
      log('Enter your Supabase URL and service_role key first', 'err');
      return;
    }
    setLoading(true);
    resetClient();
    log('Testing connection to Supabase...', 'info');

    try {
      saveCredentials(url, key);
      const sb = getClient(url.trim(), key.trim());

      // Basic auth test — just try to hit any table
      const { error: authError } = await sb.from('orders').select('id').limit(1);

      // If error is NOT a "table doesn't exist" error → it's a real auth error
      if (authError && !authError.message?.includes('does not exist') && !authError.message?.includes('schema cache') && authError.code !== '42P01' && authError.code !== 'PGRST116') {
        log(`Connection failed: ${authError.message}`, 'err');
        log('Check: Is your URL correct? Are you using the service_role key (not anon)?', 'warn');
        setLoading(false);
        return;
      }

      log('Connected to Supabase successfully!', 'ok');

      // Now check which tables exist
      const ts = await checkTables(sb);
      setTableStatus(ts);

      const missing = Object.entries(ts).filter(([, ok]) => !ok).map(([t]) => t);

      if (missing.length === 0) {
        log('All tables found — fully connected and ready!', 'ok');
        setConnected(true);
      } else {
        log(`Missing tables: ${missing.join(', ')}`, 'warn');
        log('Click "Auto-Create Tables" below to fix this automatically', 'warn');
        setConnected(false);
        setShowSql(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log(`Error: ${msg}`, 'err');
    }

    setLoading(false);
  };

  // Auto-create tables by calling Supabase REST API with raw SQL via rpc
  const autoCreateTables = async () => {
    setCreatingTables(true);
    log('Attempting to auto-create tables...', 'info');

    const u = url.trim();
    const k = key.trim();

    if (!u || !k) {
      log('Enter credentials first', 'err');
      setCreatingTables(false);
      return;
    }

    // Try creating each table via direct REST POST to /rest/v1/rpc/exec if available
    // Otherwise fall back to trying insert with upsert to trigger auto-create
    // Best approach: use Supabase management API or show the SQL clearly

    // Method: Use fetch to POST raw SQL via the pg REST endpoint
    const sqls = [CREATE_ORDERS_SQL, CREATE_CUSTOMERS_SQL, CREATE_PROMOS_SQL];
    const tableNames = ['orders', 'customers', 'promo_codes'];

    let allCreated = true;

    for (let i = 0; i < sqls.length; i++) {
      try {
        // Try via RPC exec_sql function
        const res = await fetch(`${u}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': k,
            'Authorization': `Bearer ${k}`,
          },
          body: JSON.stringify({ sql: sqls[i] }),
        });

        if (res.ok) {
          log(`✓ Created table: ${tableNames[i]}`, 'ok');
        } else {
          // Try alternative: check if table already exists by selecting from it
          const sb = getClient(u, k);
          const { error } = await sb.from(tableNames[i]).select('id').limit(1);
          if (!error) {
            log(`✓ Table "${tableNames[i]}" already exists`, 'ok');
          } else {
            log(`Could not auto-create "${tableNames[i]}" — see manual SQL below`, 'warn');
            allCreated = false;
          }
        }
      } catch {
        log(`Could not auto-create "${tableNames[i]}" — run SQL manually`, 'warn');
        allCreated = false;
      }
    }

    if (allCreated) {
      // Verify
      const sb = getClient(u, k);
      const ts = await checkTables(sb);
      setTableStatus(ts);
      const stillMissing = Object.entries(ts).filter(([, ok]) => !ok).map(([t]) => t);
      if (stillMissing.length === 0) {
        log('All tables created and verified!', 'ok');
        setConnected(true);
      } else {
        log(`Still missing: ${stillMissing.join(', ')} — please run the SQL manually`, 'warn');
        setShowSql(true);
      }
    } else {
      log('Auto-create needs manual SQL — copy the SQL below and run it in Supabase SQL Editor', 'warn');
      setShowSql(true);
    }

    setCreatingTables(false);
  };

  const pushTable = async (sb: SupabaseClient, table: string, data: Record<string, unknown>[]) => {
    if (!data.length) {
      log(`No data to push to "${table}" — skipped`, 'info');
      return;
    }
    const { error } = await sb.from(table).upsert(data, { onConflict: 'id' });
    if (error) {
      log(`Failed to push "${table}": ${error.message}`, 'err');
    } else {
      log(`Pushed ${data.length} rows to "${table}"`, 'ok');
    }
  };

  const pushAllData = async () => {
    if (!url.trim() || !key.trim()) {
      log('Not connected — test connection first', 'err');
      return;
    }
    setPushing(true);
    log('Pushing all data to Supabase...', 'info');
    saveCredentials(url, key);

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

      log('All data pushed successfully!', 'ok');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log(`Push error: ${msg}`, 'err');
    }

    setPushing(false);
  };

  const pullOrders = async () => {
    if (!url.trim() || !key.trim()) return;
    log('Pulling orders from Supabase...', 'info');
    try {
      const sb = getClient(url.trim(), key.trim());
      const { data, error } = await sb.from('orders').select('*').order('created_at', { ascending: false });
      if (error) {
        log(`Pull failed: ${error.message}`, 'err');
        if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
          log('The "orders" table does not exist yet — run the SQL setup first', 'warn');
        }
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
        log(`Pulled ${mapped.length} orders from Supabase → saved locally`, 'ok');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log(`Pull error: ${msg}`, 'err');
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(FULL_SQL);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  const logColor = (type: string) => {
    if (type === 'ok') return 'text-green-400';
    if (type === 'err') return 'text-red-400';
    if (type === 'warn') return 'text-yellow-400';
    return 'text-gray-400';
  };

  const logPrefix = (type: string) => {
    if (type === 'ok') return '✓';
    if (type === 'err') return '✗';
    if (type === 'warn') return '⚠';
    return '→';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">🗄️ Supabase</h2>
        <p className="text-sm text-gray-500">Connect your online database so orders sync across all devices.</p>
      </div>

      {/* Step-by-step guide */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-400" /> Quick Setup Guide
        </h3>
        <ol className="space-y-2 text-xs text-gray-400">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold">1</span>
            Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-400 underline inline-flex items-center gap-1 mx-1">supabase.com <ExternalLink className="h-3 w-3" /></a> → Create a free project → wait for it to be ready
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold">2</span>
            Go to <strong className="text-white mx-1">Project Settings → API</strong> → copy <strong className="text-yellow-400 mx-1">Project URL</strong> and <strong className="text-yellow-400 mx-1">service_role secret key</strong>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold">3</span>
            Paste them below → click <strong className="text-white mx-1">Test Connection</strong>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold">4</span>
            If tables are missing → click <strong className="text-green-400 mx-1">Auto-Create Tables</strong> or copy the SQL and run it manually
          </li>
        </ol>
      </div>

      {/* Credentials */}
      <div className="rounded-xl border border-dark-500 bg-dark-800 p-5 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Database className="h-4 w-4 text-red-light" /> Credentials
        </h3>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Supabase Project URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setConnected(false); }}
              placeholder="https://xxxxxxxxxxx.supabase.co"
              className="w-full rounded-lg border border-dark-500 bg-dark-700 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-red-primary font-mono"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">
              Service Role Key <span className="text-yellow-400">(use service_role — NOT the anon key)</span>
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => { setKey(e.target.value); setConnected(false); }}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full rounded-lg border border-dark-500 bg-dark-700 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-red-primary font-mono"
            />
            <p className="mt-1 text-xs text-gray-600">
              Found at: Supabase Dashboard → Settings → API → <strong>service_role</strong> (the secret one, ~200 chars)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={testConnection}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-red-primary px-4 py-2 text-sm font-bold text-white hover:bg-red-hover transition disabled:opacity-50"
          >
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            {loading ? 'Testing...' : 'Test Connection'}
          </button>

          {tableStatus && Object.values(tableStatus).some((v) => !v) && (
            <button
              onClick={autoCreateTables}
              disabled={creatingTables}
              className="flex items-center gap-2 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm font-bold text-green-400 hover:bg-green-500/20 transition disabled:opacity-50"
            >
              {creatingTables ? <Loader className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {creatingTables ? 'Creating...' : 'Auto-Create Tables'}
            </button>
          )}

          {connected && (
            <>
              <button
                onClick={pushAllData}
                disabled={pushing}
                className="flex items-center gap-2 rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-400 hover:bg-blue-500/20 transition disabled:opacity-50"
              >
                {pushing ? <Loader className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {pushing ? 'Pushing...' : 'Push All Data'}
              </button>
              <button
                onClick={pullOrders}
                className="flex items-center gap-2 rounded-lg border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-sm font-bold text-purple-400 hover:bg-purple-500/20 transition"
              >
                <RefreshCw className="h-4 w-4" /> Pull Orders
              </button>
            </>
          )}

          {connected ? (
            <span className="flex items-center gap-1.5 text-xs text-green-400 font-semibold bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
              <CheckCircle className="h-4 w-4" /> Connected & Ready
            </span>
          ) : tableStatus ? (
            <span className="flex items-center gap-1.5 text-xs text-yellow-400 font-semibold bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2">
              <AlertTriangle className="h-4 w-4" /> Tables Missing
            </span>
          ) : null}
        </div>
      </div>

      {/* Table Status */}
      {tableStatus && (
        <div className="rounded-xl border border-dark-500 bg-dark-800 p-5">
          <h3 className="font-semibold text-white mb-3">📊 Table Status</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {(Object.entries(tableStatus) as [string, boolean][]).map(([tbl, ok]) => (
              <div key={tbl} className={`rounded-lg border p-3 text-center ${ok ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                <div className="text-2xl mb-1">{ok ? '✅' : '❌'}</div>
                <p className={`text-xs font-bold ${ok ? 'text-green-400' : 'text-red-400'}`}>{tbl}</p>
                <p className="text-xs text-gray-500 mt-0.5">{ok ? 'Ready' : 'Not found'}</p>
              </div>
            ))}
          </div>

          {Object.values(tableStatus).some((v) => !v) && (
            <div className="space-y-3">
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                <p className="text-sm text-yellow-400 font-semibold flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4" /> Tables are missing — here's how to fix it:
                </p>
                <ol className="text-xs text-yellow-300/80 space-y-1.5 ml-2">
                  <li>1. Click <strong>"Auto-Create Tables"</strong> above (tries to create them automatically)</li>
                  <li>2. If that doesn't work — click <strong>"Show SQL"</strong> below → copy it</li>
                  <li>3. Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">Supabase Dashboard <ExternalLink className="h-3 w-3" /></a> → SQL Editor → New Query</li>
                  <li>4. Paste the SQL → click <strong>Run</strong></li>
                  <li>5. Come back here and click <strong>Test Connection</strong> again</li>
                </ol>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowSql(!showSql)}
                  className="flex items-center gap-2 rounded-lg border border-gray-600 bg-dark-700 px-3 py-2 text-xs text-gray-300 hover:text-white hover:border-gray-400 transition"
                >
                  <Play className="h-3 w-3" /> {showSql ? 'Hide SQL' : 'Show SQL Script'}
                </button>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-2 text-xs text-green-400 hover:bg-green-500/20 transition"
                >
                  <ExternalLink className="h-3 w-3" /> Open Supabase Dashboard
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SQL Script */}
      {showSql && (
        <div className="rounded-xl border border-gray-500/20 bg-dark-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              📋 SQL Setup Script
            </h3>
            <button
              onClick={copySql}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${sqlCopied ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-dark-700 text-gray-300 border border-dark-500 hover:text-white'}`}
            >
              {sqlCopied ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {sqlCopied ? 'Copied!' : 'Copy SQL'}
            </button>
          </div>
          <pre className="max-h-64 overflow-y-auto rounded-lg bg-black/70 p-4 text-xs text-green-300 font-mono leading-relaxed whitespace-pre-wrap border border-green-500/10">
            {FULL_SQL}
          </pre>
          <p className="mt-2 text-xs text-gray-500">
            Copy this → open Supabase Dashboard → SQL Editor → New Query → paste → click Run → come back and click Test Connection
          </p>
        </div>
      )}

      {/* What syncs */}
      {connected && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: '📦', title: 'Orders', desc: 'All customer orders with status, ticket ID, and payment info.' },
            { icon: '🎟️', title: 'Promo Codes', desc: 'All discount codes, usage counts, and active status.' },
            { icon: '👥', title: 'Customers', desc: 'Customer profiles, balances, and order totals.' },
          ].map((card) => (
            <div key={card.title} className="rounded-xl border border-dark-500 bg-dark-800 p-4">
              <div className="text-2xl mb-2">{card.icon}</div>
              <h4 className="font-semibold text-white">{card.title}</h4>
              <p className="mt-1 text-xs text-gray-500">{card.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Activity Log */}
      {logs.length > 0 && (
        <div className="rounded-xl border border-dark-500 bg-dark-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">📝 Activity Log</h3>
            <button onClick={() => setLogs([])} className="text-xs text-gray-500 hover:text-gray-300 transition">
              Clear
            </button>
          </div>
          <div className="max-h-56 overflow-y-auto space-y-1 font-mono">
            {logs.map((entry, i) => (
              <p key={i} className={`text-xs ${logColor(entry.type)}`}>
                {logPrefix(entry.type)} {entry.msg}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
