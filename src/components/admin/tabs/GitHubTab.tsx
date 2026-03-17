import { useState } from 'react';
import { Github, CheckCircle, XCircle, Upload, Loader } from 'lucide-react';

interface CommitLog {
  message: string;
  success: boolean;
  time: string;
}

export default function GitHubTab() {
  const [token, setToken] = useState(localStorage.getItem('ac_gh_token') || '');
  const [username, setUsername] = useState(localStorage.getItem('ac_gh_user') || '');
  const [repo, setRepo] = useState(localStorage.getItem('ac_gh_repo') || '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<CommitLog[]>([]);

  const saveConfig = () => {
    localStorage.setItem('ac_gh_token', token);
    localStorage.setItem('ac_gh_user', username);
    localStorage.setItem('ac_gh_repo', repo);
  };

  const testConnection = async () => {
    if (!token || !username || !repo) return;
    saveConfig();
    setStatus('loading');
    try {
      const res = await fetch(`https://api.github.com/repos/${username}/${repo}`, {
        headers: { Authorization: `token ${token}` },
      });
      if (res.ok) {
        setStatus('success');
        addLog('Connection test successful ✓', true);
      } else {
        setStatus('error');
        addLog('Connection failed — check credentials', false);
      }
    } catch {
      setStatus('error');
      addLog('Connection failed — network error', false);
    }
  };

  const pushFile = async (path: string, content: string, message: string) => {
    if (!token || !username || !repo) return;
    setStatus('loading');
    try {
      // Get current file SHA
      let sha: string | undefined;
      try {
        const existing = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`, {
          headers: { Authorization: `token ${token}` },
        });
        if (existing.ok) {
          const data = await existing.json();
          sha = data.sha;
        }
      } catch {}

      const body: Record<string, string> = {
        message,
        content: btoa(unescape(encodeURIComponent(content))),
      };
      if (sha) body.sha = sha;

      const res = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setStatus('success');
        addLog(`Pushed ${path} — "${message}"`, true);
      } else {
        setStatus('error');
        addLog(`Failed to push ${path}`, false);
      }
    } catch {
      setStatus('error');
      addLog(`Error pushing ${path}`, false);
    }
  };

  const addLog = (message: string, success: boolean) => {
    setLogs((prev) => [{ message, success, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 19)]);
  };

  const pushAdminAccounts = () => {
    const stored = localStorage.getItem('ac_admin_accounts') || '[]';
    const accounts = JSON.parse(stored);
    const code = `export interface AdminAccount {
  id: string;
  username: string;
  password: string;
  role: 'Owner' | 'Manager' | 'Staff';
  active: boolean;
  loginCount: number;
  lastIp: string;
  lastLogin: string;
}

export const defaultAdminAccounts: AdminAccount[] = ${JSON.stringify(accounts, null, 2)};
`;
    pushFile('src/data/adminAccounts.ts', code, 'Update admin accounts via Allchats.co Control');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">GitHub Updater</h2>
        <p className="text-sm text-gray-500">Push code changes directly to GitHub from the admin panel.</p>
      </div>

      {/* Config */}
      <div className="rounded-xl border border-dark-500 bg-dark-800 p-5 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2"><Github className="h-4 w-4" /> GitHub Configuration</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Personal Access Token</label>
            <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="ghp_xxxxx..." className="w-full rounded-lg border border-dark-500 bg-dark-700 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-red-primary font-mono" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">GitHub Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" className="w-full rounded-lg border border-dark-500 bg-dark-700 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-red-primary" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Repository Name</label>
            <input type="text" value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="repo-name" className="w-full rounded-lg border border-dark-500 bg-dark-700 px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-red-primary" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={testConnection} className="flex items-center gap-2 rounded-lg bg-dark-600 border border-dark-500 px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition">
            {status === 'loading' ? <Loader className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
            Test Connection
          </button>
          {status === 'success' && <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle className="h-3.5 w-3.5" /> Connected</span>}
          {status === 'error' && <span className="flex items-center gap-1 text-xs text-red-400"><XCircle className="h-3.5 w-3.5" /> Failed</span>}
        </div>
      </div>

      {/* Push actions */}
      <div className="rounded-xl border border-dark-500 bg-dark-800 p-5 space-y-3">
        <h3 className="font-semibold text-white">Push Files</h3>
        <button onClick={pushAdminAccounts} className="flex items-center gap-2 rounded-lg bg-red-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-red-hover transition">
          <Upload className="h-4 w-4" /> Push Admin Accounts (adminAccounts.ts)
        </button>
      </div>

      {/* Commit log */}
      {logs.length > 0 && (
        <div className="rounded-xl border border-dark-500 bg-dark-800 p-5">
          <h3 className="mb-3 font-semibold text-white">Commit History</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className={`flex items-center gap-2 rounded-lg border p-2 text-xs ${log.success ? 'border-green-500/20 bg-green-500/5 text-green-400' : 'border-red-500/20 bg-red-500/5 text-red-400'}`}>
                {log.success ? <CheckCircle className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
                <span className="flex-1">{log.message}</span>
                <span className="text-gray-500">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
