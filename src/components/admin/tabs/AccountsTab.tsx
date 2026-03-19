import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, ToggleLeft, ToggleRight, ShieldCheck } from 'lucide-react';
import { AdminAccount } from '../../../data/adminAccounts';

interface Props {
  accounts: AdminAccount[];
  setAccounts: (a: AdminAccount[]) => void;
  currentUser: AdminAccount;
}

const roleColor = (role: string) => {
  if (role === 'Owner') return 'border-purple-500/30 bg-purple-500/10 text-purple-400';
  if (role === 'Manager') return 'border-blue-500/30 bg-blue-500/10 text-blue-400';
  return 'border-green-500/30 bg-green-500/10 text-green-400';
};

export default function AccountsTab({ accounts, setAccounts, currentUser }: Props) {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<AdminAccount['role']>('Staff');
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ username: '', password: '', role: 'Staff' as AdminAccount['role'] });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const save = (updated: AdminAccount[]) => {
    setAccounts(updated);
    localStorage.setItem('ac_admin_accounts', JSON.stringify(updated));
  };

  const create = () => {
    if (!newUsername.trim() || newPassword.length < 6) return;
    const newAcc: AdminAccount = {
      id: Date.now().toString(),
      username: newUsername.trim(),
      password: newPassword,
      role: newRole,
      active: true,
      loginCount: 0,
      lastIp: '',
      lastLogin: '',
    };
    save([...accounts, newAcc]);
    setNewUsername('');
    setNewPassword('');
    setNewRole('Staff');
  };

  const startEdit = (a: AdminAccount) => {
    setEditId(a.id);
    setEditData({ username: a.username, password: a.password, role: a.role });
  };

  const saveEdit = (id: string) => {
    save(accounts.map((a) => (a.id === id ? { ...a, ...editData } : a)));
    setEditId(null);
  };

  const toggle = (id: string) => {
    if (id === currentUser.id) return;
    save(accounts.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));
  };

  const remove = (id: string) => {
    if (id === currentUser.id) return;
    const owners = accounts.filter((a) => a.role === 'Owner');
    const target = accounts.find((a) => a.id === id);
    if (target?.role === 'Owner' && owners.length <= 1) return;
    save(accounts.filter((a) => a.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Admin Accounts</h2>
        <p className="text-sm text-gray-500">Create and manage admin keys for your team.</p>
      </div>

      {/* Create */}
      <div className="rounded-xl border border-dark-500 bg-dark-800 p-5 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-red-light" /> Create Admin Account</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Username</label>
            <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Username" className="w-full rounded-lg border border-dark-500 bg-dark-700 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-red-primary" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Password (min 6 chars)</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password" className="w-full rounded-lg border border-dark-500 bg-dark-700 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-red-primary" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Role</label>
            <select value={newRole} onChange={(e) => setNewRole(e.target.value as AdminAccount['role'])} className="w-full rounded-lg border border-dark-500 bg-dark-700 px-3 py-2.5 text-sm text-white outline-none focus:border-red-primary">
              <option value="Owner">👑 Owner</option>
              <option value="Manager">🛡️ Manager</option>
              <option value="Staff">🔑 Staff</option>
            </select>
          </div>
        </div>
        <button onClick={create} className="flex items-center gap-2 rounded-lg bg-red-primary px-4 py-2 text-sm font-bold text-white hover:bg-red-hover transition">
          <Plus className="h-4 w-4" /> Create Account
        </button>
      </div>

      {/* Accounts list */}
      <div className="space-y-3">
        {accounts.map((a) => (
          <div key={a.id} className="rounded-xl border border-dark-500 bg-dark-800 p-4">
            {editId === a.id ? (
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Username</label>
                  <input type="text" value={editData.username} onChange={(e) => setEditData({ ...editData, username: e.target.value })} className="rounded-lg border border-dark-500 bg-dark-700 px-3 py-2 text-sm text-white outline-none focus:border-red-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Password</label>
                  <input type="text" value={editData.password} onChange={(e) => setEditData({ ...editData, password: e.target.value })} className="rounded-lg border border-dark-500 bg-dark-700 px-3 py-2 text-sm text-white outline-none focus:border-red-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Role</label>
                  <select value={editData.role} onChange={(e) => setEditData({ ...editData, role: e.target.value as AdminAccount['role'] })} className="rounded-lg border border-dark-500 bg-dark-700 px-3 py-2 text-sm text-white outline-none focus:border-red-primary">
                    <option value="Owner">👑 Owner</option>
                    <option value="Manager">🛡️ Manager</option>
                    <option value="Staff">🔑 Staff</option>
                  </select>
                </div>
                <button onClick={() => saveEdit(a.id)} className="flex items-center gap-1 rounded-lg bg-green-500/20 border border-green-500/30 px-3 py-2 text-xs font-semibold text-green-400 hover:bg-green-500/30 transition">
                  <Check className="h-3.5 w-3.5" /> Save
                </button>
                <button onClick={() => setEditId(null)} className="flex items-center gap-1 rounded-lg bg-dark-600 border border-dark-500 px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white transition">
                  <X className="h-3.5 w-3.5" /> Cancel
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-dark-600 text-lg font-bold text-white">
                    {a.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{a.username}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${roleColor(a.role)}`}>{a.role}</span>
                      {a.id === currentUser.id && <span className="text-xs text-gray-500">(you)</span>}
                      {!a.active && <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs text-red-400">Disabled</span>}
                    </div>
                    <div className="mt-0.5 flex gap-3 text-xs text-gray-500">
                      <span>Logins: {a.loginCount}</span>
                      {a.lastLogin && <span>Last: {new Date(a.lastLogin).toLocaleDateString()}</span>}
                      {a.lastIp && a.lastIp !== '0.0.0.0' && <span>IP: {a.lastIp}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(a)} className="flex items-center gap-1 rounded-lg border border-dark-500 bg-dark-700 px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white transition">
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                  {a.id !== currentUser.id && (
                    <button onClick={() => toggle(a.id)} className="text-gray-400 hover:text-white transition">
                      {a.active ? <ToggleRight className="h-5 w-5 text-green-400" /> : <ToggleLeft className="h-5 w-5" />}
                    </button>
                  )}
                  {a.id !== currentUser.id && deleteConfirm !== a.id && (
                    <button onClick={() => setDeleteConfirm(a.id)} className="text-red-400 hover:text-red-300 transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  {deleteConfirm === a.id && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => remove(a.id)} className="rounded-lg bg-red-primary px-2 py-1 text-xs font-bold text-white hover:bg-red-hover transition">Confirm</button>
                      <button onClick={() => setDeleteConfirm(null)} className="rounded-lg border border-dark-500 bg-dark-700 px-2 py-1 text-xs text-gray-400 hover:text-white transition">Cancel</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
