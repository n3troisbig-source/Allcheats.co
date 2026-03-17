import { useEffect, useState } from 'react';
import { DollarSign, Package, Tag, Users, Clock } from 'lucide-react';
import { getOrders, ORDER_EVENT, Order } from '../../../data/orderStore';
import { Announcement } from '../../../data/storeData';

interface Props {
  promoCodes: { active: boolean }[];
  accounts: { id: string }[];
  announcements: Announcement[];
  role: string;
}

export default function OverviewTab({ promoCodes, accounts, announcements, role }: Props) {
  const [orders, setOrders] = useState<Order[]>(() => getOrders());

  // Re-read orders whenever anything changes
  useEffect(() => {
    const refresh = () => setOrders(getOrders());
    window.addEventListener(ORDER_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(ORDER_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const totalRevenue = orders.filter((o) => o.status === 'Paid').reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === 'Pending');
  const recentOrders = orders.slice(0, 5);
  const activeAnnouncements = announcements.filter((a) => a.active);
  const activePromos = promoCodes.filter((p) => p.active);

  const statusColor = (s: string) => {
    if (s === 'Paid') return 'text-green-400 bg-green-500/10 border-green-500/20';
    if (s === 'Pending') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Overview</h2>
        <p className="text-sm text-gray-500">Your store dashboard at a glance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-dark-500 bg-dark-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Revenue</p>
              <p className="text-xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-dark-500 bg-dark-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Package className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Orders</p>
              <p className="text-xl font-bold text-white">{orders.length}</p>
              {pendingOrders.length > 0 && (
                <p className="text-xs text-yellow-400">{pendingOrders.length} pending</p>
              )}
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-dark-500 bg-dark-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <Tag className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Active Promos</p>
              <p className="text-xl font-bold text-white">{activePromos.length}</p>
            </div>
          </div>
        </div>
        {role === 'Owner' && (
          <div className="rounded-xl border border-dark-500 bg-dark-800 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <Users className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Admin Accounts</p>
                <p className="text-xl font-bold text-white">{accounts.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pending Orders Alert */}
      {pendingOrders.length > 0 && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
          <p className="text-sm font-semibold text-yellow-400">
            ⚠️ {pendingOrders.length} order{pendingOrders.length > 1 ? 's' : ''} waiting for payment confirmation
          </p>
          <p className="mt-1 text-xs text-yellow-400/70">
            Go to the Orders tab to mark them as Paid once payment is received.
          </p>
        </div>
      )}

      {/* Recent Orders */}
      <div className="rounded-xl border border-dark-500 bg-dark-800 p-5">
        <h3 className="mb-4 font-semibold text-white">Recent Orders</h3>
        <div className="space-y-3">
          {recentOrders.length === 0 && (
            <p className="text-sm text-gray-500">No orders yet. Orders appear here when customers purchase.</p>
          )}
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between rounded-lg border border-dark-600 bg-dark-700 p-3">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">{order.id}</p>
                  <p className="text-xs text-gray-400">{order.name} ({order.email})</p>
                  <p className="text-xs text-gray-500">{order.product} — {order.variant}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-bold text-white">${order.total.toFixed(2)}</span>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColor(order.status)}`}>{order.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Announcements */}
      {activeAnnouncements.length > 0 && (
        <div className="rounded-xl border border-dark-500 bg-dark-800 p-5">
          <h3 className="mb-4 font-semibold text-white">Active Announcements</h3>
          <div className="space-y-2">
            {activeAnnouncements.map((a) => (
              <div key={a.id} className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
                {a.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
