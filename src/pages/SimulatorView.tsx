import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PhoneMockup } from '../components/PhoneMockup';
import { SimulatorExecutionResult } from '../types';
import {
  FlaskConical,
  CheckCircle2,
  Sparkles,
  Play,
  RotateCcw,
  Code2,
  ExternalLink,
  MessageCircle,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export const SimulatorView: React.FC = () => {
  const {
    campaigns,
    runSimulator,
    recordLinkClick,
    activityLogs,
    setActiveTab,
  } = useApp();

  const [username, setUsername] = useState('arjun_creator');
  const [commentText, setCommentText] = useState('PDF please! Super excited to read this.');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [result, setResult] = useState<SimulatorExecutionResult | null>(null);
  const [showJsonPayload, setShowJsonPayload] = useState(false);

  const presets = [
    { user: 'rohit_founder', comment: 'PDF please! Sending this to my team', label: 'Ebook Lead Magnet' },
    { user: 'ananya_design', comment: 'AI prompt sheet link bro! 🙌', label: 'Prompt Sheet' },
    { user: 'vikram_codes', comment: 'PRO coupon code please', label: 'Course Discount' },
    { user: 'sneha_growth', comment: 'What camera is that? GEAR please', label: 'Affiliate Gear' },
    { user: 'aarav_vip', comment: 'COMMUNITY invite link', label: 'WhatsApp VIP' },
  ];

  const handleApplyPreset = (user: string, comment: string) => {
    setUsername(user);
    setCommentText(comment);
  };

  const handleSimulate = async () => {
    if (!commentText.trim()) return;

    setIsRunning(true);
    setResult(null);
    setActiveStepIndex(0);

    // Step 1: Detect keyword
    await new Promise((r) => setTimeout(r, 350));
    setActiveStepIndex(1);

    // Step 2: Match campaign
    await new Promise((r) => setTimeout(r, 400));
    setActiveStepIndex(2);

    // Step 3: Prepare DM
    await new Promise((r) => setTimeout(r, 350));
    setActiveStepIndex(3);

    // Step 4: Dispatch DM
    const execResult = await runSimulator(username, commentText, selectedCampaignId || undefined);
    await new Promise((r) => setTimeout(r, 300));

    setResult(execResult);
    setActiveStepIndex(4);
    setIsRunning(false);
  };

  const activeLog = result?.activityId
    ? activityLogs.find((l) => l.id === result.activityId)
    : null;

  return (
    <div className="space-y-6">
      {/* Prominent Demo Mode Disclaimer Header */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              DEMO MODE — No real Instagram message was sent.
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
              In-Memory Sandbox
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            This test engine simulates real-time Instagram Graph API webhooks and direct message dispatch logic. It allows you to safely test keywords, copy personalization, and link delivery without Meta verification or risk of shadowbans.
          </p>
        </div>
      </div>

      {/* Main Grid: Form / Pipeline & Live Mobile View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulator Controls & Pipeline */}
        <div className="lg:col-span-7 space-y-6">
          {/* Simulation Input Card */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                <FlaskConical className="w-4 h-4 text-indigo-400" />
                <span>Simulate Follower Interaction</span>
              </div>
              <span className="text-[11px] text-slate-400">Step 1 of 2</span>
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5">Quick Sample Comments:</span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p.user, p.comment)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Campaign Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target Campaign
              </label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="">Auto-Detect from Comment Text (Recommended)</option>
                {campaigns.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {camp.name} ({camp.status === 'active' ? 'Active' : 'Paused'}) — Keyword: [{camp.keyword}]
                  </option>
                ))}
              </select>
            </div>

            {/* Follower Username */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Follower Instagram Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-500 font-mono">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="follower_handle"
                  className="w-full pl-7 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Follower Comment Text */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Comment Left on Reel / Post
              </label>
              <textarea
                rows={2}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="e.g. Can you please send the PDF blueprint?"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            {/* Action Button */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setUsername('demo_follower');
                  setCommentText('PDF');
                  setResult(null);
                  setActiveStepIndex(-1);
                }}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset form</span>
              </button>

              <button
                type="button"
                onClick={handleSimulate}
                disabled={isRunning || !commentText.trim()}
                className={`px-5 py-2.5 text-xs font-semibold text-white rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  isRunning
                    ? 'bg-indigo-600/60 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-lg shadow-indigo-600/30'
                }`}
              >
                {isRunning ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing Webhook...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Simulate Comment Event</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sequential Execution Pipeline */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">
                Execution Pipeline & Logic Flow
              </span>
              {result && (
                <span className="text-[11px] font-mono tabular-nums text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Total latency: ~{activeLog?.responseTimeMs || 820}ms
                </span>
              )}
            </div>

            <div className="space-y-3">
              {/* Step 1: Keyword detected */}
              <div
                className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                  activeStepIndex >= 1
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : activeStepIndex === 0
                    ? 'bg-indigo-950/30 border-indigo-500/40 text-indigo-200 animate-pulse'
                    : 'bg-slate-950/50 border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      activeStepIndex >= 1
                        ? 'bg-emerald-500 text-slate-950'
                        : activeStepIndex === 0
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {activeStepIndex >= 1 ? '✓' : '1'}
                  </div>
                  <div>
                    <span className="text-xs font-semibold block">Keyword detected ✓</span>
                    <span className="text-[11px] text-slate-400 block">
                      {result?.matchedKeyword
                        ? `Found trigger keyword: "${result.matchedKeyword}"`
                        : 'Scans comment text using match engine'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {activeStepIndex >= 1 ? 'OK' : 'Wait'}
                </span>
              </div>

              {/* Step 2: Campaign matched */}
              <div
                className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                  activeStepIndex >= 2
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : activeStepIndex === 1
                    ? 'bg-indigo-950/30 border-indigo-500/40 text-indigo-200 animate-pulse'
                    : 'bg-slate-950/50 border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      activeStepIndex >= 2
                        ? 'bg-emerald-500 text-slate-950'
                        : activeStepIndex === 1
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {activeStepIndex >= 2 ? '✓' : '2'}
                  </div>
                  <div>
                    <span className="text-xs font-semibold block">Campaign matched ✓</span>
                    <span className="text-[11px] text-slate-400 block">
                      {result?.matchedCampaign
                        ? `Matched: "${result.matchedCampaign.name}"`
                        : 'Verifies active status and user rate limit rules'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {activeStepIndex >= 2 ? 'OK' : 'Wait'}
                </span>
              </div>

              {/* Step 3: DM prepared */}
              <div
                className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                  activeStepIndex >= 3
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : activeStepIndex === 2
                    ? 'bg-indigo-950/30 border-indigo-500/40 text-indigo-200 animate-pulse'
                    : 'bg-slate-950/50 border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      activeStepIndex >= 3
                        ? 'bg-emerald-500 text-slate-950'
                        : activeStepIndex === 2
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {activeStepIndex >= 3 ? '✓' : '3'}
                  </div>
                  <div>
                    <span className="text-xs font-semibold block">DM prepared ✓</span>
                    <span className="text-[11px] text-slate-400 block">
                      Variables {'{{username}}'} & {'{{link}}'} injected dynamically
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {activeStepIndex >= 3 ? 'OK' : 'Wait'}
                </span>
              </div>

              {/* Step 4: Demo DM sent */}
              <div
                className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                  activeStepIndex >= 4
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : activeStepIndex === 3
                    ? 'bg-indigo-950/30 border-indigo-500/40 text-indigo-200 animate-pulse'
                    : 'bg-slate-950/50 border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      activeStepIndex >= 4
                        ? 'bg-emerald-500 text-slate-950'
                        : activeStepIndex === 3
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {activeStepIndex >= 4 ? '✓' : '4'}
                  </div>
                  <div>
                    <span className="text-xs font-semibold block">Demo DM sent ✓</span>
                    <span className="text-[11px] text-slate-400 block">
                      Dispatched to recipient inbox in simulated environment
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {activeStepIndex >= 4 ? 'Delivered' : 'Wait'}
                </span>
              </div>
            </div>

            {/* Technical Webhook JSON Toggle */}
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowJsonPayload(!showJsonPayload)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{showJsonPayload ? 'Hide' : 'View'} Simulated Meta Webhook Payload</span>
              </button>

              {showJsonPayload && (
                <div className="mt-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                  <pre>
                    {JSON.stringify(
                      {
                        object: 'instagram',
                        entry: [
                          {
                            id: '17841400012345678',
                            time: Date.now(),
                            changes: [
                              {
                                field: 'comments',
                                value: {
                                  from: { id: '9876543210', username },
                                  media: { id: '1792345678901234' },
                                  id: 'comment_' + Date.now(),
                                  text: commentText,
                                },
                              },
                            ],
                          },
                        ],
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Recipient DM View */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Simulated Recipient Phone</span>
            </div>
            {result && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Delivered
              </span>
            )}
          </div>

          <PhoneMockup
            senderName="Creator Studio"
            senderHandle="creator_studio_in"
            recipientHandle={result ? result.username : username}
            messageText={
              result
                ? result.preparedMessage || ''
                : 'Run a simulation on the left to see the instant DM delivery here in real time!'
            }
            linkUrl={result ? result.deliveredLink : undefined}
            hasClicked={activeLog?.clicked}
            onLinkClick={() => {
              if (result?.activityId) {
                recordLinkClick(result.activityId);
              }
            }}
            timeString={result ? 'Just now' : 'Standby'}
          />

          {result && (
            <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs w-full max-w-[340px] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Recipient:</span>
                <span className="font-mono text-slate-200">@{result.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Trigger Matched:</span>
                <span className="text-indigo-400 font-semibold">{result.matchedKeyword}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Campaign CTR:</span>
                <span className="font-mono tabular-nums text-emerald-400">
                  {activeLog?.clicked ? 'Recorded (+1 Clicks)' : 'Awaiting click'}
                </span>
              </div>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="w-full mt-2 py-1.5 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span>View Dashboard Metrics</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
