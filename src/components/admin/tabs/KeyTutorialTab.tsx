import { useState } from 'react';
import { CheckCircle, Circle, ChevronRight } from 'lucide-react';

const steps = [
  {
    title: 'Create the Admin Key',
    description: 'Go to the Accounts tab and click "Create Account". Enter a username, password (min 6 chars), and choose a role (Owner / Manager / Staff). Click Create Account.',
    icon: '1️⃣',
  },
  {
    title: 'Go to Export Tab',
    description: 'Navigate to the Export Code tab. You will see a generated adminAccounts.ts file with all current accounts hardcoded. Copy the entire code to your clipboard.',
    icon: '2️⃣',
  },
  {
    title: 'Replace the File in Your Project',
    description: 'Open your project folder on your computer. Navigate to src/data/adminAccounts.ts. Replace the entire contents of that file with the copied code.',
    icon: '3️⃣',
  },
  {
    title: 'Push to GitHub',
    description: 'Save the file, then commit and push your changes to GitHub. You can use the GitHub Updater tab to push directly, or use git commands in your terminal: git add . && git commit -m "Update admin keys" && git push',
    icon: '4️⃣',
  },
  {
    title: 'Test on Live Site',
    description: 'Wait for Vercel/your host to auto-deploy (usually 30 seconds). Then go to your live site, open the Admin Panel, and test logging in with the new credentials.',
    icon: '5️⃣',
  },
];

export default function KeyTutorialTab() {
  const [completed, setCompleted] = useState<number[]>([]);

  const toggle = (i: number) => {
    setCompleted((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Key Tutorial</h2>
        <p className="text-sm text-gray-500">Step-by-step guide for creating and deploying admin keys.</p>
      </div>

      <div className="rounded-xl border border-dark-500 bg-dark-800 p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-400">Progress: {completed.length}/{steps.length} steps</p>
          <div className="h-2 w-48 rounded-full bg-dark-600 overflow-hidden">
            <div
              className="h-full rounded-full bg-red-primary transition-all"
              style={{ width: `${(completed.length / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`rounded-xl border p-4 transition cursor-pointer ${completed.includes(i) ? 'border-green-500/30 bg-green-500/5' : 'border-dark-500 bg-dark-700 hover:border-dark-400'}`}
              onClick={() => toggle(i)}
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5 shrink-0">
                  {completed.includes(i) ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{step.icon}</span>
                    <h4 className={`font-semibold ${completed.includes(i) ? 'text-green-400' : 'text-white'}`}>{step.title}</h4>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-400">{step.description}</p>
                </div>
                <ChevronRight className={`h-4 w-4 shrink-0 text-gray-500 mt-0.5 transition-transform ${completed.includes(i) ? 'rotate-90' : ''}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
        <p className="text-sm font-semibold text-blue-400 mb-1">💡 Pro Tip</p>
        <p className="text-xs text-gray-400">
          Admin accounts created in the Accounts tab are saved to localStorage (your browser). To make them permanent across all devices and deployments, always export the code and push it to your project files using the Export Code and GitHub Updater tabs.
        </p>
      </div>
    </div>
  );
}
