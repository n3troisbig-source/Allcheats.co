import { Globe } from 'lucide-react';

interface IpLog {
  id: string;
  username: string;
  role: string;
  ip: string;
  timestamp: string;
}

interface Props {
  logs: IpLog[];
}

const roleColor = (role: string) => {
  if (role === 'Owner') return 'border-purple-500/30 bg-purple-500/10 text-purple-400';
  if (role === 'Manager') return 'border-blue-500/30 bg-blue-500/10 text-blue-400';
  return 'border-green-500/30 bg-green-500/10 text-green-400';
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function IpLogsTab({ logs }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">IP Logs</h2>
        <p className="text-sm text-gray-500">Track every admin login with their IP address and timestamp.</p>
      </div>

      <div className="rounded-xl border border-dark-500 bg-dark-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-500 bg-dark-700">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">IP Address</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Time</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-600">
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No login logs yet.</td>
              </tr>
            )}
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-dark-700/50 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-dark-600 text-xs font-bold text-white">
                      {log.username[0].toUpperCase()}
                    </div>
                    <span className="text-white font-medium">{log.username}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${roleColor(log.role)}`}>{log.role}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 font-mono text-xs text-gray-300">
                    <Globe className="h-3.5 w-3.5 text-gray-500" />
                    {log.ip || 'Unknown'}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-xs text-gray-500">{timeAgo(log.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
