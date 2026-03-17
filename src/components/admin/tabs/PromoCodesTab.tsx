import { useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag } from 'lucide-react';
import { PromoCode } from '../../../data/storeData';

interface Props {
  promoCodes: PromoCode[];
  setPromoCodes: (p: PromoCode[]) => void;
}

export default function PromoCodesTab({ promoCodes, setPromoCodes }: Props) {
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [amount, setAmount] = useState('');

  const save = (updated: PromoCode[]) => {
    setPromoCodes(updated);
    localStorage.setItem('ac_promo_codes', JSON.stringify(updated));
  };

  const create = () => {
    if (!code.trim() || !amount) return;
    const newP: PromoCode = {
      id: Date.now().toString(),
      code: code.trim().toUpperCase(),
      type,
      amount: parseFloat(amount),
      active: true,
      usageCount: 0,
    };
    save([...promoCodes, newP]);
    setCode('');
    setAmount('');
  };

  const toggle = (id: string) => save(promoCodes.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  const remove = (id: string) => save(promoCodes.filter((p) => p.id !== id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Promo Codes</h2>
        <p className="text-sm text-gray-500">Create discount codes for your customers.</p>
      </div>

      {/* Create */}
      <div className="rounded-xl border border-dark-500 bg-dark-800 p-5 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2"><Tag className="h-4 w-4 text-red-light" /> New Promo Code</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Code Name</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. SAVE20"
              className="w-full rounded-lg border border-dark-500 bg-dark-700 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-red-primary uppercase"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setType('percentage')}
                className={`flex-1 rounded-lg border py-2.5 text-xs font-semibold transition ${type === 'percentage' ? 'border-red-primary bg-red-primary/10 text-red-light' : 'border-dark-500 bg-dark-700 text-gray-400 hover:text-white'}`}
              >
                % Off
              </button>
              <button
                onClick={() => setType('fixed')}
                className={`flex-1 rounded-lg border py-2.5 text-xs font-semibold transition ${type === 'fixed' ? 'border-red-primary bg-red-primary/10 text-red-light' : 'border-dark-500 bg-dark-700 text-gray-400 hover:text-white'}`}
              >
                $ Off
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Amount ({type === 'percentage' ? '%' : '$'})</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={type === 'percentage' ? '20' : '5'}
              className="w-full rounded-lg border border-dark-500 bg-dark-700 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-red-primary"
            />
          </div>
        </div>
        <button
          onClick={create}
          className="flex items-center gap-2 rounded-lg bg-red-primary px-4 py-2 text-sm font-bold text-white hover:bg-red-hover transition"
        >
          <Plus className="h-4 w-4" /> Create Code
        </button>
      </div>

      {/* List */}
      <div className="rounded-xl border border-dark-500 bg-dark-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-500 bg-dark-700">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Code</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Discount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Uses</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-600">
            {promoCodes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">No promo codes yet.</td>
              </tr>
            )}
            {promoCodes.map((p) => (
              <tr key={p.id} className="hover:bg-dark-700/50 transition">
                <td className="px-4 py-3 font-mono font-bold text-white">{p.code}</td>
                <td className="px-4 py-3 text-gray-400 capitalize">{p.type}</td>
                <td className="px-4 py-3 text-red-light font-semibold">{p.type === 'percentage' ? `${p.amount}%` : `$${p.amount}`}</td>
                <td className="px-4 py-3 text-gray-400">{p.usageCount}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${p.active ? 'border-green-500/20 bg-green-500/10 text-green-400' : 'border-dark-500 bg-dark-700 text-gray-500'}`}>
                    {p.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => toggle(p.id)} className="text-gray-400 hover:text-white transition">
                      {p.active ? <ToggleRight className="h-5 w-5 text-green-400" /> : <ToggleLeft className="h-5 w-5" />}
                    </button>
                    <button onClick={() => remove(p.id)} className="text-red-400 hover:text-red-300 transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
