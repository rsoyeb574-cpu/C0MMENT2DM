import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Layers,
  CheckCircle2,
  MessageSquare,
  Send,
  MousePointerClick,
  TrendingUp,
  FlaskConical,
  PlusCircle,
  ExternalLink,
  Clock,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    campaigns,
    activityLogs,
    totalComments,
    totalDMsSent,
    totalClicks,
    activeCampaignsCount,
    setActiveTab,
    openCreateCampaign,
    seedDemoActivity,
    recordLinkClick,
  } = useApp();

  const [timeframe, setTimeframe] = useState<'today' | '7d' | '30d'>('7d');

  // Conversion rate
  const ctrPercentage =
    totalDMsSent > 0 ? ((totalClicks / totalDMsSent) * 100).toFixed(1) : '0.0';

  // Sample chart data for 7 days
  const chartData7d = [
    { label: 'Mon', comments: 120, dms: 118, clicks: 82 },
    { label: 'Tue', comments: 240, dms: 236, clicks: 164 },
    { label: 'Wed', comments: 190, dms: 185, clicks: 130 },
    { label: 'Thu', comments: 380, dms: 374, clicks: 270 },
    { label: 'Fri', comments: 450, dms: 442, clicks: 310 },
    { label: 'Sat', comments: 620, dms: 605, clicks: 430 },
    { label: 'Sun', comments: 710, dms: 698, clicks: 512 },
  ];

  const maxVal = Math.max(...chartData7d.map((d) => d.comments));

  return (
    <div className="space-y-6">
      {/* Top Banner / Sandbox Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-100">Automation Command Center</h1>
            <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Live Simulator Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time comment listening, keyword matching, and direct message dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={seedDemoActivity}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Incoming Comment</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Open Test Studio</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Total Campaigns */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Campaigns</span>
            <Layers className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100 font-mono tabular-nums">
              {campaigns.length}
            </span>
            <span className="text-[11px] text-slate-500">configured</span>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Automations</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
              {activeCampaignsCount}
            </span>
            <span className="text-[11px] text-slate-500">running now</span>
          </div>
        </div>

        {/* Comments Handled */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Comments Handled</span>
            <MessageSquare className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100 font-mono tabular-nums">
              {totalComments.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">+18%</span>
          </div>
        </div>

        {/* DMs Sent */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">DMs Dispatched</span>
            <Send className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-300 font-mono tabular-nums">
              {totalDMsSent.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500">98.8% deliv.</span>
          </div>
        </div>

        {/* Link Clicks & CTR */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Link Clicks (CTR)</span>
            <MousePointerClick className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-300 font-mono tabular-nums">
              {totalClicks.toLocaleString()}
            </span>
            <span className="text-[11px] font-mono tabular-nums text-emerald-400 font-semibold">
              {ctrPercentage}% CTR
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Trend Chart + Top Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Chart (8 cols) */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Conversion Velocity & Lead Pipeline</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparison of incoming comments vs automated DMs delivered vs link clicks
              </p>
            </div>

            {/* Segmented Timeframe Control */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 self-start sm:self-auto">
              {(['today', '7d', '30d'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    timeframe === t
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t === 'today' ? 'Today' : t === '7d' ? '7 Days' : '30 Days'}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Bar / Multi-metric Chart */}
          <div className="pt-4">
            <div className="h-48 w-full flex items-end justify-between gap-3 px-2">
              {chartData7d.map((day, idx) => {
                const commentHeight = Math.round((day.comments / maxVal) * 100);
                const dmHeight = Math.round((day.dms / maxVal) * 100);
                const clickHeight = Math.round((day.clicks / maxVal) * 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="w-full flex items-end justify-center gap-1 h-36">
                      {/* Comments Bar */}
                      <div
                        style={{ height: `${commentHeight}%` }}
                        className="w-2.5 sm:w-3.5 bg-slate-700 group-hover:bg-slate-600 rounded-t transition-all"
                        title={`Comments: ${day.comments}`}
                      />
                      {/* DMs Bar */}
                      <div
                        style={{ height: `${dmHeight}%` }}
                        className="w-2.5 sm:w-3.5 bg-indigo-500 group-hover:bg-indigo-400 rounded-t transition-all"
                        title={`DMs Sent: ${day.dms}`}
                      />
                      {/* Clicks Bar */}
                      <div
                        style={{ height: `${clickHeight}%` }}
                        className="w-2.5 sm:w-3.5 bg-rose-500 group-hover:bg-rose-400 rounded-t transition-all"
                        title={`Clicks: ${day.clicks}`}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{day.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-700" />
                <span>Comments Processed</span>
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
        </div>

        {/* Top Performing Campaigns (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-200">Top Automations</h2>
              <button
                onClick={() => setActiveTab('campaigns')}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {campaigns.slice(0, 4).map((camp) => {
                const ctr =
                  camp.dmsSentCount > 0
                    ? ((camp.clicksCount / camp.dmsSentCount) * 100).toFixed(0)
                    : '0';
                return (
                  <div
                    key={camp.id}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {camp.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="font-mono text-indigo-300">[{camp.keyword}]</span>
                        <span>·</span>
                        <span className="font-mono tabular-nums">{camp.dmsSentCount} DMs</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                        {ctr}% CTR
                      </span>
                      <span className="text-[10px] text-slate-500 block tabular-nums">
                        {camp.clicksCount} clicks
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => openCreateCampaign()}
            className="w-full mt-4 py-2 px-3 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/80 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create New Campaign</span>
          </button>
        </div>
      </div>

      {/* Recent Activity Table / Feed */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Real-Time Inbound Activity Feed</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live log of incoming follower comments, matched triggers, and direct messages sent
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              {activityLogs.length} simulated events
            </span>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3 font-medium">Follower</th>
                <th className="pb-3 font-medium">Comment Text</th>
                <th className="pb-3 font-medium">Campaign / Trigger</th>
                <th className="pb-3 font-medium">Status & Latency</th>
                <th className="pb-3 font-medium text-right">Destination & CTR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {activityLogs.slice(0, 7).map((log) => (
                <tr key={log.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">
                        {log.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-mono text-slate-200">@{log.username}</span>
                    </div>
                  </td>

                  <td className="py-3 max-w-xs">
                    <p className="text-slate-300 truncate" title={log.comment}>
                      "{log.comment}"
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                  </td>

                  <td className="py-3">
                    <span className="font-medium text-slate-200 block truncate max-w-[200px]">
                      {log.campaignName}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-mono">
                      Matched: "{log.matchedKeyword}"
                    </span>
                  </td>

                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-slate-200">Delivered</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        ({log.responseTimeMs}ms)
                      </span>
                    </div>
                  </td>

                  <td className="py-3 text-right">
                    {log.clicked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Link Clicked</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => recordLinkClick(log.id)}
                        className="px-2 py-1 text-[11px] text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-800/60 rounded transition-colors cursor-pointer"
                        title="Simulate user clicking link"
                      >
                        Simulate Click
                      </button>
                    )}
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
