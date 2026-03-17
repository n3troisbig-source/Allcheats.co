import { useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Megaphone } from 'lucide-react';
import { Announcement } from '../../../data/storeData';

interface Props {
  announcements: Announcement[];
  setAnnouncements: (a: Announcement[]) => void;
}

const typeColors: Record<string, string> = {
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  success: 'border-green-500/30 bg-green-500/10 text-green-400',
  warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  promo: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
};

export default function AnnouncementsTab({ announcements, setAnnouncements }: Props) {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<Announcement['type']>('info');

  const save = (updated: Announcement[]) => {
    setAnnouncements(updated);
    localStorage.setItem('ac_announcements', JSON.stringify(updated));
  };

  const publish = () => {
    if (!message.trim()) return;
    const newA: Announcement = {
      id: Date.now().toString(),
      message: message.trim(),
      type,
      active: true,
      createdAt: new Date().toISOString(),
    };
    save([newA, ...announcements]);
    setMessage('');
  };

  const toggle = (id: string) => save(announcements.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));
  const remove = (id: string) => save(announcements.filter((a) => a.id !== id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Announcements</h2>
        <p className="text-sm text-gray-500">Create banners that appear at the top of your store.</p>
      </div>

      {/* Create */}
      <div className="rounded-xl border border-dark-500 bg-dark-800 p-5 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2"><Megaphone className="h-4 w-4 text-red-light" /> New Announcement</h3>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter announcement message..."
          rows={3}
          className="w-full rounded-lg border border-dark-500 bg-dark-700 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none resize-none focus:border-red-primary"
        />
        <div className="flex flex-wrap gap-2 items-center">
          {(['info', 'success', 'warning', 'promo'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize transition ${type === t ? typeColors[t] : 'border-dark-500 bg-dark-700 text-gray-400 hover:text-white'}`}
            >
              {t === 'info' ? '🔵' : t === 'success' ? '🟢' : t === 'warning' ? '🟡' : '🟣'} {t}
            </button>
          ))}
          <button
            onClick={publish}
            className="ml-auto flex items-center gap-2 rounded-lg bg-red-primary px-4 py-2 text-sm font-bold text-white hover:bg-red-hover transition"
          >
            <Plus className="h-4 w-4" /> Publish
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {announcements.length === 0 && (
          <div className="rounded-xl border border-dark-500 bg-dark-800 p-8 text-center text-sm text-gray-500">No announcements yet.</div>
        )}
        {announcements.map((a) => (
          <div key={a.id} className={`rounded-xl border p-4 flex items-start justify-between gap-3 ${a.active ? typeColors[a.type] : 'border-dark-500 bg-dark-800 text-gray-500'}`}>
            <div>
              <p className="text-sm font-medium">{a.message}</p>
              <p className="mt-1 text-xs opacity-60">{a.type} — {new Date(a.createdAt).toLocaleDateString()} — {a.active ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => toggle(a.id)} className="text-current opacity-70 hover:opacity-100 transition">
                {a.active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
              </button>
              <button onClick={() => remove(a.id)} className="text-red-400 opacity-70 hover:opacity-100 transition">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
