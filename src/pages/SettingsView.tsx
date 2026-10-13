import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  RotateCcw,
  Sparkles,
  Download,
  Clock,
  Info,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { fetchDbStatus, triggerDbMigration, DbStatusResponse } from '../services/dbApi';

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
  const [dbStatus, setDbStatus] = useState<DbStatusResponse | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  const loadDbStatus = async () => {
    setIsLoadingDb(true);
    try {
      const status = await fetchDbStatus();
      setDbStatus(status);
    } catch {
      // Handled in fetchDbStatus
    } finally {
      setIsLoadingDb(false);
    }
  };

  useEffect(() => {
    loadDbStatus();
  }, []);

  const handleRunMigration = async () => {
    setIsMigrating(true);
    try {
      const res = await triggerDbMigration();
      if (res.success) {
        addToast(`PostgreSQL Migration Success: ${res.migratedTables.length} tables verified!`, 'success');
      } else {
        addToast(`Migration: ${res.message}`, 'error');
      }
      await loadDbStatus();
    } catch (err: any) {
      addToast(`Migration failed: ${err.message}`, 'error');
    } finally {
      setIsMigrating(false);
    }
  };

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

  const requiredTables = [
    'users',
    'instagram_accounts',
    'campaigns',
    'message_templates',
    'comment_events',
    'dm_events',
    'link_clicks',
    'usage_records',
    'leads',
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          <span>System & Database Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure PostgreSQL connection, execute table migrations, monitor Vercel serverless persistence, and adjust sandbox parameters.
        </p>
      </div>

      {/* PostgreSQL Database (Neon) Status Card */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              <span>PostgreSQL Database (Neon Serverless)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Production relational database connection for multi-user campaigns, comment tracking, and DM events.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDbStatus}
              disabled={isLoadingDb}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDb ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>

            <button
              onClick={handleRunMigration}
              disabled={isMigrating}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-purple-950"
            >
              <Server className="w-3.5 h-3.5" />
              <span>{isMigrating ? 'Migrating...' : 'Run Migration Now'}</span>
            </button>
          </div>
        </div>

        {/* Database Status Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Connection Mode</span>
            <div className="flex items-center gap-2 mt-1">
              {dbStatus?.connected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-xs font-semibold text-emerald-300">PostgreSQL (Connected)</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span className="text-xs font-semibold text-amber-300">Demo Mode (In-Memory)</span>
                </>
              )}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              {dbStatus?.connected ? 'Neon pooler active' : 'Fallback active when DATABASE_URL is unset'}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Host & SSL Security</span>
            <div className="flex items-center gap-1.5 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-200 truncate">
                {dbStatus?.host || 'ep-neon.tech'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              sslmode=require ({dbStatus?.ssl ? 'Enforced' : 'Self-hosted'})
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 block">Database Latency</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-200">
                {dbStatus?.latencyMs !== undefined ? `${dbStatus.latencyMs} ms` : 'Demo Sandbox'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Pool max: 10 connections (serverless safe)
            </span>
          </div>
        </div>

        {/* Verified Tables Grid */}
        <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Database Tables Status ({dbStatus?.tables?.length || 0} / {requiredTables.length} Active)
            </span>
            <span className="text-[11px] text-slate-500">
              Vercel Serverless Ready (Stateless)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {requiredTables.map((tbl) => {
              const exists = dbStatus?.tables?.includes(tbl);
              return (
                <div
                  key={tbl}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-xs ${
                    exists
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {exists ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                  <span className="font-mono text-[11px] truncate">{tbl}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security & CLI instructions */}
        <div className="p-3.5 rounded-lg bg-purple-950/20 border border-purple-900/30 text-xs text-purple-300/90 space-y-2">
          <div className="flex items-center gap-2 font-medium text-purple-200">
            <Terminal className="w-4 h-4 text-purple-400" />
            <span>How to Run Migration in Terminal or Vercel Build Step</span>
          </div>
          <p className="text-[11px] text-purple-300/80 leading-relaxed">
            Run the one-time migration from your terminal anytime with your <code className="bg-purple-900/40 px-1 py-0.5 rounded text-purple-100 font-mono">DATABASE_URL</code> set:
          </p>
          <div className="bg-slate-950 px-3 py-2 rounded font-mono text-[11px] text-purple-300 flex items-center justify-between border border-purple-900/40">
            <span>npm run db:migrate</span>
            <span className="text-[10px] text-slate-500"># or click 'Run Migration Now' above</span>
          </div>
          <p className="text-[10px] text-slate-400">
            🔒 <strong>Security Guarantee:</strong> <code className="text-purple-300">DATABASE_URL</code> is never printed to client code, browser consoles, or public build outputs. All credentials are fully masked.
          </p>
        </div>
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
            Reset or populate local demo state stored inside your browser sandbox.
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

      {/* Export / Backup */}
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
          <span>Comment2DM Architecture & Vercel Serverless</span>
        </div>
        <p className="leading-relaxed">
          Comment2DM is fully Vercel serverless compliant with stateless execution, no local disk file storage, pooled PostgreSQL connectivity via Neon, and AES-256-GCM token encryption for official Meta Graph API integration.
        </p>
      </div>
    </div>
  );
};
