import { useState, useCallback } from 'react';
import { Upload, FolderOpen, CheckCircle, XCircle, Github, Loader } from 'lucide-react';

interface FileEntry {
  path: string;
  content: string;
}

export default function UploadTab() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [dragging, setDragging] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [logs, setLogs] = useState<{ msg: string; ok: boolean }[]>([]);

  const readFiles = useCallback(async (items: DataTransferItemList | FileList) => {
    const entries: FileEntry[] = [];

    const readFile = (file: File, path: string): Promise<void> =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          entries.push({ path, content: e.target?.result as string });
          resolve();
        };
        reader.readAsText(file);
      });

    if ('length' in items && items[0] instanceof File) {
      const fileArr = Array.from(items as FileList);
      await Promise.all(fileArr.map((f) => readFile(f, (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name)));
    }

    setFiles(entries);
    setLogs([{ msg: `Loaded ${entries.length} files`, ok: true }]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length > 0) {
        readFiles(e.dataTransfer.files);
      }
    },
    [readFiles]
  );

  const handleFolderInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) readFiles(e.target.files);
  };

  const pushAll = async () => {
    const token = localStorage.getItem('ac_gh_token');
    const username = localStorage.getItem('ac_gh_user');
    const repo = localStorage.getItem('ac_gh_repo');
    if (!token || !username || !repo) {
      setLogs((p) => [{ msg: 'GitHub not configured — go to GitHub Updater tab first', ok: false }, ...p]);
      return;
    }
    setPushing(true);
    const newLogs: { msg: string; ok: boolean }[] = [];
    for (const file of files) {
      try {
        let sha: string | undefined;
        try {
          const existing = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${file.path}`, {
            headers: { Authorization: `token ${token}` },
          });
          if (existing.ok) sha = (await existing.json()).sha;
        } catch {}

        const body: Record<string, string> = {
          message: `Upload ${file.path} via Allchats.co Control`,
          content: btoa(unescape(encodeURIComponent(file.content))),
        };
        if (sha) body.sha = sha;

        const res = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${file.path}`, {
          method: 'PUT',
          headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        newLogs.push({ msg: `${res.ok ? '✓' : '✗'} ${file.path}`, ok: res.ok });
      } catch {
        newLogs.push({ msg: `✗ ${file.path} — error`, ok: false });
      }
    }
    setLogs((p) => [...newLogs, ...p]);
    setPushing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Upload &amp; Push</h2>
        <p className="text-sm text-gray-500">Upload your entire project folder and push it to GitHub.</p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-10 text-center transition ${dragging ? 'border-red-primary bg-red-primary/10' : 'border-dark-500 bg-dark-800 hover:border-dark-400'}`}
      >
        <FolderOpen className="mx-auto mb-3 h-10 w-10 text-gray-500" />
        <p className="font-semibold text-white">Drag &amp; Drop your project folder here</p>
        <p className="mt-1 text-sm text-gray-500">or</p>
        <label className="mt-3 inline-block cursor-pointer rounded-lg bg-dark-600 border border-dark-500 px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition">
          Browse Folder
          <input
            type="file"
            multiple
            // @ts-ignore
            webkitdirectory=""
            onChange={handleFolderInput}
            className="hidden"
          />
        </label>
      </div>

      {files.length > 0 && (
        <div className="rounded-xl border border-dark-500 bg-dark-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">{files.length} Files Loaded</h3>
            <button
              onClick={pushAll}
              disabled={pushing}
              className="flex items-center gap-2 rounded-lg bg-red-primary px-4 py-2 text-sm font-bold text-white hover:bg-red-hover transition disabled:opacity-60"
            >
              {pushing ? <Loader className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
              Push All Files to GitHub
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {files.slice(0, 50).map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                <Upload className="h-3 w-3 shrink-0 text-gray-600" />
                {f.path}
              </div>
            ))}
            {files.length > 50 && <p className="text-xs text-gray-500">...and {files.length - 50} more</p>}
          </div>
        </div>
      )}

      {logs.length > 0 && (
        <div className="rounded-xl border border-dark-500 bg-dark-800 p-5">
          <h3 className="mb-3 font-semibold text-white">Push Log</h3>
          <div className="max-h-48 overflow-y-auto space-y-1.5">
            {logs.map((log, i) => (
              <div key={i} className={`flex items-center gap-2 text-xs ${log.ok ? 'text-green-400' : 'text-red-400'}`}>
                {log.ok ? <CheckCircle className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
                {log.msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
