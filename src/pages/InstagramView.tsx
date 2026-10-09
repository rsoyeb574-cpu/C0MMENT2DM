import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Instagram,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert,
  Webhook,
  KeyRound,
  ExternalLink,
  RefreshCw,
  Lock,
} from 'lucide-react';

export const InstagramView: React.FC = () => {
  const { isInstagramConnected, toggleInstagramConnection } = useApp();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            DEMO MODE — Meta Instagram API Integration Status
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Phase 1 is an offline-capable browser simulator. The "Connect Instagram" control below demonstrates the authorization handshake and account linking state without requesting your real Instagram password or Facebook credentials.
          </p>
        </div>
      </div>

      {/* Account Connection Card */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 shrink-0">
              <Instagram className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Instagram Professional Account
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isInstagramConnected
                  ? 'Simulated Account: @creator_studio_in (Mock Active)'
                  : 'No Instagram account currently linked'}
              </p>
            </div>
          </div>

          {/* Connect / Disconnect button */}
          <button
            onClick={toggleInstagramConnection}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              isInstagramConnected
                ? 'bg-slate-800 text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 border border-slate-700'
                : 'bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-95'
            }`}
          >
            <Instagram className="w-4 h-4" />
            <span>{isInstagramConnected ? 'Disconnect Demo Account' : 'Connect Instagram'}</span>
          </button>
        </div>

        {isInstagramConnected ? (
          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Mock Account Linked: <strong>@creator_studio_in</strong> (Creator Mode)</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              Demo Token Active
            </span>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400">
            Click "Connect Instagram" above to simulate an approved Meta OAuth authorization handshake.
          </div>
        )}
      </div>

      {/* Setup Checklist Required in User Brief */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Meta API Setup Checklist</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Production verification checklist required by Meta App Review for automated comment triggers and direct messaging:
          </p>
        </div>

        <div className="space-y-3">
          {/* Checklist Item 1: Instagram connected */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-400 shrink-0">
                <Instagram className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  1. Instagram Connected
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Professional / Creator account linked via Facebook Business Page
                </span>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-900 text-slate-400 border border-slate-700">
                Not configured
              </span>
            </div>
          </div>

          {/* Checklist Item 2: Webhook */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-400 shrink-0">
                <Webhook className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  2. Webhook
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Endpoint listener for real-time <code className="text-slate-300 font-mono">comments</code> and <code className="text-slate-300 font-mono">messages</code> subscription events
                </span>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-900 text-slate-400 border border-slate-700">
                Not configured
              </span>
            </div>
          </div>

          {/* Checklist Item 3: Permissions */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-400 shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  3. Permissions
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Meta Graph API scopes: <code className="text-slate-300 font-mono">instagram_manage_comments</code>, <code className="text-slate-300 font-mono">instagram_manage_messages</code>
                </span>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-900 text-slate-400 border border-slate-700">
                Not configured
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Production Architecture Explainer */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span>How Comment2DM Works In Phase 1 Demo vs Production</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400 leading-relaxed pt-1">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-200 font-medium block">Current Phase 1: Interactive Sandbox</span>
            <p className="text-[11px]">
              Allows you to set up unlimited campaigns, test keywords, test message personalization, and simulate follower triggers in the browser without any Meta developer account approval.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-200 font-medium block">Future Phase 2: Live Meta Graph API</span>
            <p className="text-[11px]">
              Will link via official Meta OAuth Login, listen for webhook events via Cloud Run, and send real Instagram DMs using the verified Instagram Messaging API.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
