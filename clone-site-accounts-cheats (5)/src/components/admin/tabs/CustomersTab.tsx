import { useEffect, useState } from 'react';
import { Search, Plus, Minus, Users, RefreshCw } from 'lucide-react';
import {
  getCustomers,
  getOrders,
  adjustCustomerBalance,
  ORDER_EVENT,
  Customer,
  Order,
} from '../../../data/orderStore';

export default function CustomersTab() {
  const [customers, setCustomers] = useState<Customer[]>(() => getCustomers());
  const [orders, setOrders] = useState<Order[]>(() => getOrders());
  const [search, setSearch] = useState('');
  const [balanceInputs, setBalanceInputs] = useState<Record<string, string>>({});
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Refresh everything whenever orders or customers change
  const refresh = () => {
    setCustomers(getCustomers());
    setOrders(getOrders());
    setLastRefresh(new Date());
  };

  useEffect(() => {
    window.addEventListener(ORDER_EVENT, refresh);
    window.addEventListener('storage', refresh);
    // Poll every 5 seconds to catch any cross-tab updates
    const interval = setInterval(refresh, 5000);
    return () => {
      window.removeEventListener(ORDER_EVENT, refresh);
      window.removeEventListener('storage', refresh);
      clearInterval(interval);
    };
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdjust = (email: string, sign: 1 | -1) => {
    const amt = parseFloat(balanceInputs[email] || '0');
    if (!amt || isNaN(amt)) return;
    adjustCustomerBalance(email, sign * amt);
    setBalanceInputs((prev) => ({ ...prev, [email]: '' }));
    refresh();
  };

  // Get orders for a specific customer
  const customerOrders = (email: string) =>
    orders.filter((o) => o.email === email).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Customers</h2>
          <p className="text-sm text-gray-500">
            Auto-updates from real orders.{' '}
            <span className="text-gray-600">Last refresh: {lastRefresh.toLocaleTimeString()}</span>
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 rounded-lg border border-dark-500 bg-dark-700 px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white transition"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full rounded-lg border border-dark-500 bg-dark-700 py-2.5 pl-9 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-red-primary"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-dark-500 bg-dark-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-blue-400" />
            <p className="text-xs text-gray-500">Total Customers</p>
          </div>
          <p className="text-xl font-bold text-white">{customers.length}</p>
        </div>
        <div className="rounded-xl border border-dark-500 bg-dark-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Revenue from Paid Orders</p>
          <p className="text-xl font-bold text-white">
            ${customers.reduce((s, c) => s + c.totalSpent, 0).toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-dark-500 bg-dark-800 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Orders Placed</p>
          <p className="text-xl font-bold text-white">
            {customers.reduce((s, c) => s + c.totalOrders, 0)}
          </p>
        </div>
      </div>

      {/* Customer list */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dark-500 bg-dark-800 p-10 text-center">
            <Users className="mx-auto mb-3 h-8 w-8 text-gray-600" />
            <p className="text-sm text-gray-500">
              {customers.length === 0
                ? 'No customers yet. Customer profiles are created automatically when someone places an order.'
                : 'No customers match your search.'}
            </p>
          </div>
        )}
        {filtered.map((c) => {
          const recentOrders = customerOrders(c.email);
          return (
            <div key={c.id} className="rounded-xl border border-dark-500 bg-dark-800 p-4">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-red-primary to-dark-600 text-base font-bold text-white">
                    {c.name[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.email}</p>
                    <p className="text-xs text-gray-600">Joined {new Date(c.joinDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 items-start">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Orders</p>
                    <p className="text-sm font-bold text-white">{c.totalOrders}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total Spent</p>
                    <p className="text-sm font-bold text-green-400">${c.totalSpent.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Balance</p>
                    <p className="text-sm font-bold text-blue-400">${c.balance.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Balance controls */}
              <div className="mt-3 flex items-center gap-2 border-t border-dark-600 pt-3">
                <span className="text-xs text-gray-500 mr-1">Adjust balance:</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={balanceInputs[c.email] || ''}
                  onChange={(e) => setBalanceInputs({ ...balanceInputs, [c.email]: e.target.value })}
                  placeholder="0.00"
                  className="w-20 rounded-lg border border-dark-500 bg-dark-700 px-2 py-1.5 text-xs text-white outline-none focus:border-red-primary"
                />
                <button
                  onClick={() => handleAdjust(c.email, 1)}
                  className="flex items-center gap-0.5 rounded-lg bg-green-500/20 border border-green-500/30 px-2.5 py-1.5 text-xs font-semibold text-green-400 hover:bg-green-500/30 transition"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
                <button
                  onClick={() => handleAdjust(c.email, -1)}
                  className="flex items-center gap-0.5 rounded-lg bg-red-500/20 border border-red-500/30 px-2.5 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/30 transition"
                >
                  <Minus className="h-3 w-3" /> Deduct
                </button>
              </div>

              {/* Recent orders for this customer */}
              {recentOrders.length > 0 && (
                <div className="mt-3 border-t border-dark-600 pt-3">
                  <p className="text-xs text-gray-500 mb-2">Recent orders:</p>
                  <div className="space-y-1.5">
                    {recentOrders.map((o) => (
                      <div key={o.id} className="flex items-center justify-between rounded-lg bg-dark-700 px-3 py-2">
                        <div>
                          <span className="text-xs font-mono text-gray-400">{o.id}</span>
                          <span className="mx-2 text-gray-600">•</span>
                          <span className="text-xs text-gray-300">{o.product} — {o.variant}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">${o.total.toFixed(2)}</span>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                            o.status === 'Paid' ? 'text-green-400 bg-green-500/10 border-green-500/20' :
                            o.status === 'Pending' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
                            'text-red-400 bg-red-500/10 border-red-500/20'
                          }`}>{o.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
