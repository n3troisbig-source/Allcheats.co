import { useState } from 'react';
import {
  LayoutDashboard, Package, Megaphone, Tag, Users, Globe,
  ShoppingBag, BookOpen, Code2, Github, Upload, Database,
  UserCheck, LogOut, ShieldCheck, X, Menu
} from 'lucide-react';
import { AdminAccount, defaultAdminAccounts } from '../../data/adminAccounts';
import {
  defaultProducts, defaultPromoCodes, defaultAnnouncements,
  Product, PromoCode, Announcement
} from '../../data/storeData';

import AdminLogin from './AdminLogin';
import OverviewTab from './tabs/OverviewTab';
import OrdersTab from './tabs/OrdersTab';
import AnnouncementsTab from './tabs/AnnouncementsTab';
import PromoCodesTab from './tabs/PromoCodesTab';
import AccountsTab from './tabs/AccountsTab';
import IpLogsTab from './tabs/IpLogsTab';
import ProductsTab from './tabs/ProductsTab';
import KeyTutorialTab from './tabs/KeyTutorialTab';
import ExportCodeTab from './tabs/ExportCodeTab';
import GitHubTab from './tabs/GitHubTab';
import UploadTab from './tabs/UploadTab';
import SupabaseTab from './tabs/SupabaseTab';
import CustomersTab from './tabs/CustomersTab';

interface IpLog {
  id: string;
  username: string;
  role: string;
  ip: string;
  timestamp: string;
}

interface Props {
  onClose: () => void;
}

type TabId =
  | 'overview' | 'orders' | 'announcements' | 'promos'
  | 'accounts' | 'iplogs' | 'products' | 'keytutorial'
  | 'export' | 'github' | 'upload' | 'supabase' | 'customers';

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  roles: ('Owner' | 'Manager' | 'Staff')[];
}

const tabs: TabDef[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" />, roles: ['Owner', 'Manager', 'Staff'] },
  { id: 'orders', label: 'Orders', icon: <Package className="h-4 w-4" />, roles: ['Owner', 'Manager', 'Staff'] },
  { id: 'announcements', label: 'Announcements', icon: <Megaphone className="h-4 w-4" />, roles: ['Owner', 'Manager'] },
  { id: 'promos', label: 'Promo Codes', icon: <Tag className="h-4 w-4" />, roles: ['Owner', 'Manager'] },
  { id: 'accounts', label: 'Accounts', icon: <Users className="h-4 w-4" />, roles: ['Owner'] },
  { id: 'iplogs', label: 'IP Logs', icon: <Globe className="h-4 w-4" />, roles: ['Owner'] },
  { id: 'products', label: 'Products', icon: <ShoppingBag className="h-4 w-4" />, roles: ['Owner'] },
  { id: 'keytutorial', label: 'Key Tutorial', icon: <BookOpen className="h-4 w-4" />, roles: ['Owner'] },
  { id: 'export', label: 'Export Code', icon: <Code2 className="h-4 w-4" />, roles: ['Owner'] },
  { id: 'github', label: 'GitHub Updater', icon: <Github className="h-4 w-4" />, roles: ['Owner'] },
  { id: 'upload', label: 'Upload & Push', icon: <Upload className="h-4 w-4" />, roles: ['Owner'] },
  { id: 'supabase', label: 'Supabase', icon: <Database className="h-4 w-4" />, roles: ['Owner'] },
  { id: 'customers', label: 'Customers', icon: <UserCheck className="h-4 w-4" />, roles: ['Owner'] },
];

const roleColor = (role: string) => {
  if (role === 'Owner') return 'border-purple-500/30 bg-purple-500/10 text-purple-400';
  if (role === 'Manager') return 'border-blue-500/30 bg-blue-500/10 text-blue-400';
  return 'border-green-500/30 bg-green-500/10 text-green-400';
};

export default function AdminPanel({ onClose }: Props) {
  const [currentUser, setCurrentUser] = useState<AdminAccount | null>(() => {
    const stored = localStorage.getItem('ac_logged_in');
    return stored ? JSON.parse(stored) : null;
  });
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Shared state for tabs that don't self-manage
  const [accounts, setAccounts] = useState<AdminAccount[]>(() => {
    const stored = localStorage.getItem('ac_admin_accounts');
    return stored ? JSON.parse(stored) : defaultAdminAccounts;
  });
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    const stored = localStorage.getItem('ac_promo_codes');
    return stored ? JSON.parse(stored) : defaultPromoCodes;
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const stored = localStorage.getItem('ac_announcements');
    return stored ? JSON.parse(stored) : defaultAnnouncements;
  });
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = localStorage.getItem('ac_products');
    return stored ? JSON.parse(stored) : defaultProducts;
  });
  const [ipLogs] = useState<IpLog[]>(() => {
    return JSON.parse(localStorage.getItem('ac_ip_logs') || '[]');
  });

  const logout = () => {
    localStorage.removeItem('ac_logged_in');
    setCurrentUser(null);
  };

  const handleLogin = (account: AdminAccount) => {
    setCurrentUser(account);
  };

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-[100] overflow-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-lg border border-dark-500 bg-dark-800 p-2 text-gray-400 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>
        <AdminLogin onLogin={handleLogin} />
      </div>
    );
  }

  const allowedTabs = tabs.filter((t) => t.roles.includes(currentUser.role));

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            promoCodes={promoCodes}
            accounts={accounts}
            announcements={announcements}
            role={currentUser.role}
          />
        );
      case 'orders':
        return <OrdersTab />;
      case 'announcements':
        return <AnnouncementsTab announcements={announcements} setAnnouncements={setAnnouncements} />;
      case 'promos':
        return <PromoCodesTab promoCodes={promoCodes} setPromoCodes={setPromoCodes} />;
      case 'accounts':
        return <AccountsTab accounts={accounts} setAccounts={setAccounts} currentUser={currentUser} />;
      case 'iplogs':
        return <IpLogsTab logs={ipLogs} />;
      case 'products':
        return <ProductsTab products={products} setProducts={setProducts} />;
      case 'keytutorial':
        return <KeyTutorialTab />;
      case 'export':
        return <ExportCodeTab accounts={accounts} />;
      case 'github':
        return <GitHubTab />;
      case 'upload':
        return <UploadTab />;
      case 'supabase':
        return <SupabaseTab />;
      case 'customers':
        return <CustomersTab />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex bg-dark-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-10 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-20 flex h-full w-64 flex-col border-r border-dark-600 bg-dark-800 transition-transform md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center gap-2 border-b border-dark-600 p-4">
          <ShieldCheck className="h-6 w-6 text-red-light" />
          <div>
            <p className="text-sm font-bold text-white">Allcheats.co</p>
            <p className="text-xs text-gray-500">Allchats.co Control</p>
          </div>
        </div>

        {/* User info */}
        <div className="border-b border-dark-600 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-dark-600 text-sm font-bold text-white">
              {currentUser.username[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{currentUser.username}</p>
              <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${roleColor(currentUser.role)}`}>{currentUser.role}</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {allowedTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-red-primary text-white'
                    : 'text-gray-400 hover:bg-dark-700 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div className="border-t border-dark-600 p-3 space-y-2">
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg border border-dark-500 px-3 py-2.5 text-sm font-medium text-gray-400 hover:text-red-400 hover:border-red-500/30 transition"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
          <button
            onClick={onClose}
            className="flex w-full items-center gap-2 rounded-lg border border-dark-500 px-3 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition"
          >
            <X className="h-4 w-4" /> Close Panel
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-dark-600 bg-dark-800 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden rounded-lg border border-dark-500 p-1.5 text-gray-400 hover:text-white transition"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-semibold text-white">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-gray-500 sm:block">Logged in as</span>
            <span className="hidden text-xs font-semibold text-white sm:block">{currentUser.username}</span>
            <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${roleColor(currentUser.role)}`}>{currentUser.role}</span>
          </div>
        </header>

        {/* Tab content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {renderTab()}
        </main>
      </div>
    </div>
  );
}
