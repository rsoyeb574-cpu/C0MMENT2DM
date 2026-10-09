import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  RotateCcw,
  Sparkles,
  Download,
  Upload,
  Clock,
  Shield,
  Info,
  Check,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    campaigns,
    templates,
    activityLogs,
    resetAllData,
    seedDemoActivity,
    addToast,
  } = useApp();

  const [simulatedDelay, setSimulatedDelay] = useState('800');

  const handleExportJson = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      campaigns,
      templates,
      activityLogs,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comment2dm_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Demo database backup downloaded as JSON.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          <span>Workspace & Sandbox Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure demo parameters, manage browser storage data, and simulate realistic dispatch latencies.
        </p>
      </div>

      {/* Simulator Tuning */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Simulated Webhook & Dispatch Speed</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure how quickly simulated DMs are processed and returned in the test studio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: '150', title: 'Ultra Fast', desc: '~150ms immediate return' },
            { id: '800', title: 'Realistic API Latency', desc: '~800ms Graph API roundtrip' },
            { id: '2500', title: 'Human Pacing', desc: '~2.5s anti-spam pacing' },
          ].map((speed) => (
            <button
              key={speed.id}
              onClick={() => {
                setSimulatedDelay(speed.id);
                addToast(`Simulated latency set to ${speed.title}.`);
              }}
              className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                simulatedDelay === speed.id
                  ? 'bg-indigo-950/40 border-indigo-500 text-slate-100'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="text-xs font-semibold block text-slate-200">{speed.title}</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">{speed.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sandbox Data Controls */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Sandbox Data Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Reset or populate local demo state stored inside your browser's localStorage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={seedDemoActivity}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Generate New Simulated Activity</span>
          </button>

          <button
            onClick={resetAllData}
            className="px-4 py-2 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/30 hover:bg-rose-900/50 rounded-lg border border-rose-800/40 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Initial Demo State</span>
          </button>
        </div>
      </div>

      {/* Export / Import */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Download className="w-4 h-4 text-slate-400" />
            <span>Backup & Export Campaigns</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Export your campaigns, copy templates, and simulated analytics as a single JSON file.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJson}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Demo JSON</span>
          </button>
        </div>
      </div>

      {/* About Box */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Info className="w-4 h-4 text-indigo-400" />
          <span>Comment2DM Phase 1 Architecture</span>
        </div>
        <p className="leading-relaxed">
          Comment2DM is developed for modern content creators, educators, and e-commerce brands who want to turn reel engagement into automatic direct message conversions without manual copy-pasting.
        </p>
      </div>
    </div>
  );
};
