import { useState } from 'react';
import { Copy, Download, Check } from 'lucide-react';
import { AdminAccount } from '../../../data/adminAccounts';

interface Props {
  accounts: AdminAccount[];
}

export default function ExportCodeTab({ accounts }: Props) {
  const [copied, setCopied] = useState(false);

  const generateCode = () => {
    return `export interface AdminAccount {
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
  };

  const code = generateCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'adminAccounts.ts';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Export Code</h2>
        <p className="text-sm text-gray-500">Generate the adminAccounts.ts file with all current accounts hardcoded.</p>
      </div>

      <div className="rounded-xl border border-dark-500 bg-dark-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">src/data/adminAccounts.ts</h3>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-lg border border-dark-500 bg-dark-700 px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white transition"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-lg bg-red-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-red-hover transition"
            >
              <Download className="h-3.5 w-3.5" /> Download .ts
            </button>
          </div>
        </div>

        <div className="relative rounded-lg border border-dark-600 bg-dark-900 overflow-auto max-h-96">
          <pre className="p-4 text-xs leading-relaxed text-green-400 font-mono whitespace-pre">{code}</pre>
        </div>

        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
          <p className="text-xs text-yellow-400 font-semibold mb-1">⚠️ Important</p>
          <p className="text-xs text-gray-400">
            This file contains your admin passwords in plain text. Keep it secure. Replace src/data/adminAccounts.ts in your project with this file, then push to GitHub to make the changes permanent.
          </p>
        </div>
      </div>
    </div>
  );
}
