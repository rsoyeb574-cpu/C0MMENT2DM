import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import {
  TrendingUp,
  MousePointerClick,
  MessageSquare,
  Send,
  Zap,
  Calendar,
  ArrowUpRight,
  Filter,
  Download,
  Sparkles,
  Layers,
  CheckCircle2,
  Instagram,
  ShieldAlert,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const {
    campaigns,
    totalComments,
    totalDMsSent,
    totalClicks,
    activeCampaignsCount,
    setActiveTab,
    addToast,
  } = useApp();

  const [dataMode, setDataMode] = useState<'demo' | 'live'>('demo');
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  const matchRate = totalComments > 0 ? ((totalDMsSent / totalComments) * 100).toFixed(1) : '96.4';
  const ctrRate = totalDMsSent > 0 ? ((totalClicks / totalDMsSent) * 100).toFixed(1) : '56.8';

  const chartData = [
    { day: 'Mon', comments: 140, dms: 136, clicks: 84 },
    { day: 'Tue', comments: 260, dms: 254, clicks: 172 },
    { day: 'Wed', comments: 210, dms: 205, clicks: 140 },
    { day: 'Thu', comments: 410, dms: 398, clicks: 285 },
    { day: 'Fri', comments: 490, dms: 480, clicks: 330 },
    { day: 'Sat', comments: 660, dms: 645, clicks: 460 },
    { day: 'Sun', comments: 750, dms: 735, clicks: 540 },
  ];

  const maxComments = Math.max(...chartData.map((d) => d.comments));

  const keywordStats = [
    { keyword: 'PDF', triggerCount: 615, dmsSent: 594, clicks: 428, ctr: '72.1%' },
    { keyword: 'AI', triggerCount: 842, dmsSent: 819, clicks: 651, ctr: '79.5%' },
    { keyword: 'GEAR', triggerCount: 318, dmsSent: 310, clicks: 198, ctr: '63.9%' },
    { keyword: 'PRO', triggerCount: 1140, dmsSent: 1112, clicks: 780, ctr: '70.1%' },
    { keyword: 'COMMUNITY', triggerCount: 489, dmsSent: 476, clicks: 395, ctr: '83.0%' },
  ];

  const handleExportCsv = () => {
    const headers = 'Campaign,Keyword,Comments,DMsSent,Clicks,CTR\n';
    const rows = campaigns
      .map(
        (c) =>
          `"${c.name}","${c.keyword}",${c.commentsCount},${c.dmsSentCount},${c.clicksCount},"${(
            (c.clicksCount / (c.dmsSentCount || 1)) *
            100
          ).toFixed(1)}%"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comment2dm_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Analytics report downloaded as CSV.');
  };

  return (
    <div className="space-y-6">
      {/* Header with Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span>Conversion Analytics & Performance</span>
            </h1>
            <StatusBadge status={dataMode === 'demo' ? 'Demo mode' : 'Setup required'} />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {dataMode === 'demo'
              ? 'Showing simulated sandbox performance benchmarks. Real Meta analytics are separated.'
              : 'Live analytics dashboard. Requires active Instagram Business authorization.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Data Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button
              onClick={() => setDataMode('demo')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                dataMode === 'demo'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Demo Sandbox
            </button>
            <button
              onClick={() => setDataMode('live')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                dataMode === 'live'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live Analytics
            </button>
          </div>

          {dataMode === 'demo' && (
            <>
              <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
                <button
                  onClick={() => setTimeRange('7d')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    timeRange === '7d'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => setTimeRange('30d')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    timeRange === '30d'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Last 30 Days
                </button>
              </div>

              <button
                onClick={handleExportCsv}
                className="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </>
          )}
        </div>
      </div>

      {dataMode === 'live' ? (
        /* Honest Live Unconfigured State */
        <div className="p-10 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
            <Instagram className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-base font-bold text-slate-200">No Live Instagram Account Authorized</h2>
              <StatusBadge status="Setup required" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              We never fabricate live numbers. To collect real comment conversion metrics and link click analytics, configure your Meta Instagram Business Login credentials.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => setDataMode('demo')}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              View Demo Sandbox Analytics
            </button>
            <button
              onClick={() => setActiveTab('instagram')}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              Open Instagram Setup
            </button>
          </div>
        </div>
      ) : (
        /* Demo Mode KPIs and Visuals */
        <>
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Simulated Match Rate</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
                  {matchRate}%
                </span>
                <span className="text-[10px] text-amber-400/90 font-mono">sandbox</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Comments matching trigger rules</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Average Dispatch Speed</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">
                  ~820ms
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">sub-second</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Webhook parse to DM pipeline</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Simulated CTR (Clicks / DMs)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-rose-300 tabular-nums">
                  {ctrRate}%
                </span>
                <span className="text-[10px] text-amber-400/90 font-mono">benchmark</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Followers tapping DM link</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Active Sandbox Automations</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                  {activeCampaignsCount}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">of {campaigns.length} total</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Campaigns actively listening</p>
            </div>
          </div>

          {/* Time Series Bar Chart */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-200">
                  Simulated Volume & Conversion Distribution ({timeRange === '7d' ? 'Last 7 Days' : 'Last 30 Days'})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visual breakdown of comments vs automated DMs prepared vs tracked clicks
                </p>
              </div>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Sandbox Simulation
              </span>
            </div>

            <div className="h-52 w-full flex items-end justify-between gap-3 pt-4 px-2">
              {chartData.map((d, idx) => {
                const commentH = Math.round((d.comments / maxComments) * 100);
                const dmH = Math.round((d.dms / maxComments) * 100);
                const clickH = Math.round((d.clicks / maxComments) * 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="w-full flex items-end justify-center gap-1 h-40">
                      <div
                        style={{ height: `${commentH}%` }}
                        className="w-3 bg-slate-700 group-hover:bg-slate-600 rounded-t transition-all"
                        title={`Comments: ${d.comments}`}
                      />
                      <div
                        style={{ height: `${dmH}%` }}
                        className="w-3 bg-indigo-500 group-hover:bg-indigo-400 rounded-t transition-all"
                        title={`DMs: ${d.dms}`}
                      />
                      <div
                        style={{ height: `${clickH}%` }}
                        className="w-3 bg-rose-500 group-hover:bg-rose-400 rounded-t transition-all"
                        title={`Clicks: ${d.clicks}`}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{d.day}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-700" />
                <span>Simulated Comments</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
                <span>DMs Prepared</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                <span>Link Clicks</span>
              </div>
            </div>
          </div>

          {/* Keyword Performance Table */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200">
              Simulated Keyword Performance Ranking
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium">
                    <th className="pb-3">Keyword</th>
                    <th className="pb-3">Trigger Events</th>
                    <th className="pb-3">DMs Dispatched</th>
                    <th className="pb-3">Link Clicks</th>
                    <th className="pb-3 text-right">Click-Through Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {keywordStats.map((stat, idx) => (
                    <tr key={idx} className="hover:bg-slate-950/40">
                      <td className="py-3 font-mono font-bold text-indigo-300">
                        "{stat.keyword}"
                      </td>
                      <td className="py-3 font-mono tabular-nums">{stat.triggerCount}</td>
                      <td className="py-3 font-mono tabular-nums text-slate-200">
                        {stat.dmsSent}
                      </td>
                      <td className="py-3 font-mono tabular-nums text-rose-300">
                        {stat.clicks}
                      </td>
                      <td className="py-3 font-mono tabular-nums font-bold text-emerald-400 text-right">
                        {stat.ctr}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
