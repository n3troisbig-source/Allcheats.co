import { useEffect, useState } from 'react';
import { Search, CheckCircle, Clock, XCircle, Package } from 'lucide-react';
import { getOrders, updateOrderStatus, ORDER_EVENT, Order } from '../../../data/orderStore';

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>(() => getOrders());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Cancelled'>('All');

  // Live-update whenever orders change anywhere
  useEffect(() => {
    const refresh = () => setOrders(getOrders());
    window.addEventListener(ORDER_EVENT, refresh);
    window.addEventListener('storage', refresh);

    // Also poll every 3 seconds in case another tab placed an order
    const interval = setInterval(refresh, 3000);

    return () => {
      window.removeEventListener(ORDER_EVENT, refresh);
      window.removeEventListener('storage', refresh);
      clearInterval(interval);
    };
  }, []);

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      o.email.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      o.ticketId.toLowerCase().includes(q) ||
      o.name.toLowerCase().includes(q) ||
      o.product.toLowerCase().includes(q) ||
      o.variant.toLowerCase().includes(q);
    const matchFilter = filter === 'All' || o.status === filter;
    return matchSearch && matchFilter;
  });

  const handleStatus = (id: string, status: Order['status']) => {
    updateOrderStatus(id, status);
    setOrders(getOrders());
  };

  const statusColor = (s: string) => {
    if (s === 'Paid') return 'text-green-400 bg-green-500/10 border-green-500/20';
    if (s === 'Pending') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  const pendingCount = orders.filter((o) => o.status === 'Pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Orders</h2>
        <p className="text-sm text-gray-500">
          Real-time customer orders. {pendingCount > 0 && <span className="text-yellow-400 font-semibold">{pendingCount} pending payment.</span>}
        </p>
      </div>

      {/* Summary row */}
      <div className="grid gap-3 grid-cols-3">
        <div className="rounded-lg border border-dark-500 bg-dark-800 p-3 text-center">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-lg font-bold text-white">{orders.length}</p>
        </div>
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 text-center">
          <p className="text-xs text-yellow-400/70">Pending</p>
          <p className="text-lg font-bold text-yellow-400">{orders.filter(o => o.status === 'Pending').length}</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center">
          <p className="text-xs text-red-400/70">Cancelled</p>
          <p className="text-lg font-bold text-red-400">{orders.filter(o => o.status === 'Cancelled').length}</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, order ID, ticket ID, product..."
            className="w-full rounded-lg border border-dark-500 bg-dark-700 py-2.5 pl-9 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-red-primary"
          />
        </div>
        <div className="flex gap-2">
          {(['All', 'Pending', 'Cancelled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                filter === f ? 'bg-red-primary text-white' : 'border border-dark-500 bg-dark-700 text-gray-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dark-500 bg-dark-800 p-10 text-center">
            <Package className="mx-auto mb-3 h-8 w-8 text-gray-600" />
            <p className="text-sm text-gray-500">
              {orders.length === 0
                ? 'No orders yet. When a customer fills out the purchase form, their order will appear here instantly.'
                : 'No orders match your search.'}
            </p>
          </div>
        )}
        {filtered.map((order) => (
          <div key={order.id} className="rounded-xl border border-dark-500 bg-dark-800 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Order header */}
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-bold text-white font-mono">{order.id}</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-400 font-mono">Ticket: {order.ticketId}</span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                {/* Customer */}
                <p className="text-sm font-semibold text-white">{order.name}</p>
                <p className="text-xs text-gray-400">{order.email}</p>
                {/* Product */}
                <div className="mt-2 rounded-lg border border-dark-600 bg-dark-700 px-3 py-2">
                  <p className="text-xs font-semibold text-gray-300">{order.product}</p>
                  <p className="text-xs text-gray-500">{order.variant}</p>
                </div>
                {/* Meta */}
                <p className="mt-2 text-xs text-gray-500">
                  via {order.paymentMethod} — {new Date(order.date).toLocaleString()}
                </p>
              </div>
              {/* Right side */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="text-xl font-bold text-white">${order.total.toFixed(2)}</span>
                <div className="flex flex-col gap-1.5">
                  {order.status !== 'Paid' && (
                    <button
                      onClick={() => handleStatus(order.id, 'Paid')}
                      className="flex items-center gap-1 rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-1.5 text-xs font-semibold text-green-400 hover:bg-green-500/20 transition"
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Mark Paid
                    </button>
                  )}
                  {order.status !== 'Pending' && (
                    <button
                      onClick={() => handleStatus(order.id, 'Pending')}
                      className="flex items-center gap-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 text-xs font-semibold text-yellow-400 hover:bg-yellow-500/20 transition"
                    >
                      <Clock className="h-3.5 w-3.5" /> Pending
                    </button>
                  )}
                  {order.status !== 'Cancelled' && (
                    <button
                      onClick={() => handleStatus(order.id, 'Cancelled')}
                      className="flex items-center gap-1 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
