import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const {
    campaigns,
    totalComments,
    totalDMsSent,
    totalClicks,
    activeCampaignsCount,
    addToast,
  } = useApp();

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <span>Conversion Analytics & Performance</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Deep dive into keyword match rates, DM delivery velocity, and destination link CTR.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
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
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Inbound Comments</span>
            <MessageSquare className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              {totalComments.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">+24.2%</span>
          </div>
          <span className="text-[10px] text-slate-500 block">Total detected on active reels</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Match Rate</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-300 font-mono tabular-nums">
              {matchRate}%
            </span>
            <span className="text-[11px] text-slate-500">trigger rate</span>
          </div>
          <span className="text-[10px] text-slate-500 block">Comments containing valid triggers</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>DMs Delivered</span>
            <Send className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-300 font-mono tabular-nums">
              {totalDMsSent.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">99.2% rate</span>
          </div>
          <span className="text-[10px] text-slate-500 block">Avg dispatch latency: 840ms</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Link Clicks (CTR)</span>
            <MousePointerClick className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-300 font-mono tabular-nums">
              {totalClicks.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-emerald-400 font-mono tabular-nums">
              {ctrRate}% CTR
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block">High intent clicks on DM link</span>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200">
          Audience Conversion Pipeline (Drop-off Analysis)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Step 1: Comment Left</span>
              <span className="font-mono text-white font-bold">100%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-slate-400 h-full w-full rounded-full" />
            </div>
            <span className="text-[11px] text-slate-400 font-mono tabular-nums">
              {totalComments} followers commented
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Step 2: Keyword Matched</span>
              <span className="font-mono text-amber-400 font-bold">{matchRate}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                style={{ width: `${matchRate}%` }}
                className="bg-amber-400 h-full rounded-full"
              />
            </div>
            <span className="text-[11px] text-slate-400 font-mono tabular-nums">
              Exact / Contains rule verified
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Step 3: DM Delivered</span>
              <span className="font-mono text-indigo-400 font-bold">96.8%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full w-[96.8%] rounded-full" />
            </div>
            <span className="text-[11px] text-slate-400 font-mono tabular-nums">
              {totalDMsSent} DMs in inbox
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Step 4: Link Clicked</span>
              <span className="font-mono text-rose-400 font-bold">{ctrRate}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, parseFloat(ctrRate))}%` }}
                className="bg-rose-500 h-full rounded-full"
              />
            </div>
            <span className="text-[11px] text-slate-400 font-mono tabular-nums">
              {totalClicks} link clicks recorded
            </span>
          </div>
        </div>
      </div>

      {/* Volume Timeline Chart */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200">
            Engagement Velocity Over Time
          </h2>
          <span className="text-xs text-slate-400">Daily breakdown</span>
        </div>

        <div className="h-44 w-full flex items-end justify-between gap-3 px-2 pt-4">
          {chartData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              <div className="w-full flex items-end justify-center gap-1.5 h-32">
                <div
                  style={{ height: `${(d.comments / maxComments) * 100}%` }}
                  className="w-3 bg-slate-700 group-hover:bg-slate-600 rounded-t transition-all"
                  title={`Comments: ${d.comments}`}
                />
                <div
                  style={{ height: `${(d.dms / maxComments) * 100}%` }}
                  className="w-3 bg-indigo-500 group-hover:bg-indigo-400 rounded-t transition-all"
                  title={`DMs Sent: ${d.dms}`}
                />
                <div
                  style={{ height: `${(d.clicks / maxComments) * 100}%` }}
                  className="w-3 bg-rose-500 group-hover:bg-rose-400 rounded-t transition-all"
                  title={`Clicks: ${d.clicks}`}
                />
              </div>
              <span className="text-[11px] font-mono text-slate-400">{d.day}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-700" />
            <span>Comments</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
            <span>DMs Dispatched</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span>Link Clicks</span>
          </div>
        </div>
      </div>

      {/* Top Keywords Leaderboard */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200">
          Keyword Conversion Leaderboard
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3 font-medium">Trigger Keyword</th>
                <th className="pb-3 font-medium">Times Triggered</th>
                <th className="pb-3 font-medium">DMs Dispatched</th>
                <th className="pb-3 font-medium">Link Clicks</th>
                <th className="pb-3 font-medium text-right">Click-Through Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {keywordStats.map((k, i) => (
                <tr key={i} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3">
                    <span className="font-mono font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded">
                      "{k.keyword}"
                    </span>
                  </td>
                  <td className="py-3 font-mono tabular-nums">{k.triggerCount}</td>
                  <td className="py-3 font-mono tabular-nums text-slate-200">{k.dmsSent}</td>
                  <td className="py-3 font-mono tabular-nums text-rose-300">{k.clicks}</td>
                  <td className="py-3 font-mono tabular-nums font-bold text-emerald-400 text-right">
                    {k.ctr}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
