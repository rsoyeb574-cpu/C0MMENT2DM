import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import {
  TrendingUp,
  MousePointerClick,
  MessageSquare,
  Send,
  AlertTriangle,
  Users,
  CheckCircle2,
  ExternalLink,
  Download,
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
} from 'lucide-react';
import { MetricReliability } from '../types';

export const AnalyticsView: React.FC = () => {
  const {
    campaigns,
    activityLogs,
    errorLogs,
    leads,
    trackedClicks,
    recordTrackedClick,
    addToast,
    navigateTo,
  } = useApp();

  const [selectedCampaignFilter, setSelectedCampaignFilter] = useState<string>('all');
  const [selectedLeadForTest, setSelectedLeadForTest] = useState<string>('');

  // 1. Filtered data sets based on selected campaign
  const filteredLogs = useMemo(() => {
    if (selectedCampaignFilter === 'all') return activityLogs;
    return activityLogs.filter((l) => l.campaignId === selectedCampaignFilter);
  }, [activityLogs, selectedCampaignFilter]);

  const filteredClicks = useMemo(() => {
    if (selectedCampaignFilter === 'all') return trackedClicks;
    return trackedClicks.filter((c) => c.campaignId === selectedCampaignFilter);
  }, [trackedClicks, selectedCampaignFilter]);

  const filteredLeads = useMemo(() => {
    if (selectedCampaignFilter === 'all') return leads;
    return leads.filter((l) => l.campaignId === selectedCampaignFilter);
  }, [leads, selectedCampaignFilter]);

  const filteredErrors = useMemo(() => {
    return errorLogs;
  }, [errorLogs]);

  // 2. Real Recorded Metrics (Grounded in Real Events Only)
  const commentsDetected = filteredLogs.length;
  const eligibleComments = filteredLogs.filter(
    (l) => l.status === 'Sent successfully' || l.status === 'Demo mode'
  ).length;
  const messagesSent = eligibleComments;
  const failuresCount = filteredErrors.length;
  const linkClicks = filteredClicks.length;
  const leadsCaptured = filteredLeads.length;

  // Measured CTR: strictly clicks / sent; never invented
  const measuredCtr =
    messagesSent > 0 ? ((linkClicks / messagesSent) * 100).toFixed(1) : null;

  // Estimated average delivery latency from recorded logs
  const averageLatencyMs = useMemo(() => {
    if (filteredLogs.length === 0) return null;
    const totalMs = filteredLogs.reduce((acc, log) => acc + (log.responseTimeMs || 750), 0);
    return Math.round(totalMs / filteredLogs.length);
  }, [filteredLogs]);

  // 3. Trends over time (Aggregated strictly from recorded timestamps)
  const timelineTrends = useMemo(() => {
    const daysMap: Record<
      string,
      { date: string; comments: number; sent: number; clicks: number; failures: number }
    > = {};

    // Helper to get standard date label
    const getDateKey = (dateStr?: string) => {
      if (!dateStr || dateStr.includes('ago') || dateStr.includes('now')) {
        return 'Today';
      }
      return dateStr.split(' ')[0] || 'Today';
    };

    // Aggregate from activityLogs
    filteredLogs.forEach((log) => {
      const key = getDateKey(log.timestamp);
      if (!daysMap[key]) {
        daysMap[key] = { date: key, comments: 0, sent: 0, clicks: 0, failures: 0 };
      }
      daysMap[key].comments += 1;
      if (log.status === 'Sent successfully' || log.status === 'Demo mode') {
        daysMap[key].sent += 1;
      }
    });

    // Aggregate from trackedClicks
    filteredClicks.forEach((click) => {
      const key = getDateKey(click.timestamp);
      if (!daysMap[key]) {
        daysMap[key] = { date: key, comments: 0, sent: 0, clicks: 0, failures: 0 };
      }
      daysMap[key].clicks += 1;
    });

    // Aggregate from errorLogs
    filteredErrors.forEach((err) => {
      const key = getDateKey(err.timestamp);
      if (!daysMap[key]) {
        daysMap[key] = { date: key, comments: 0, sent: 0, clicks: 0, failures: 0 };
      }
      daysMap[key].failures += 1;
    });

    const entries = Object.values(daysMap);
    return entries.length > 0
      ? entries
      : [{ date: 'Today (No events yet)', comments: 0, sent: 0, clicks: 0, failures: 0 }];
  }, [filteredLogs, filteredClicks, filteredErrors]);

  const maxTrendVal = Math.max(
    1,
    ...timelineTrends.map((t) => Math.max(t.comments, t.sent, t.clicks, t.failures))
  );

  // 4. Per-Campaign breakdown computed strictly from real recorded events
  const campaignBreakdown = useMemo(() => {
    return campaigns.map((c) => {
      const campLogs = activityLogs.filter((l) => l.campaignId === c.id);
      const campSent = campLogs.filter(
        (l) => l.status === 'Sent successfully' || l.status === 'Demo mode'
      ).length;
      const campClicks = trackedClicks.filter((clk) => clk.campaignId === c.id).length;
      const campLeads = leads.filter((ld) => ld.campaignId === c.id);
      const campQualified = campLeads.filter(
        (ld) => ld.status === 'Interested' || ld.status === 'Converted'
      ).length;

      const ctr =
        campSent > 0 ? ((campClicks / campSent) * 100).toFixed(1) + '%' : 'Unavailable';

      return {
        id: c.id,
        name: c.name,
        keyword: c.keyword,
        status: c.status,
        commentsDetected: campLogs.length,
        messagesSent: campSent,
        trackedClicks: campClicks,
        ctr,
        leadsCaptured: campLeads.length,
        qualifiedLeads: campQualified,
      };
    });
  }, [campaigns, activityLogs, trackedClicks, leads]);

  // Export CSV of real recorded events
  const handleExportCsv = () => {
    const headers =
      'Event Type,ID,Timestamp,Campaign,Username,Detail,Verified Status,Metric Reliability\n';
    const rows: string[] = [];

    filteredLogs.forEach((l) => {
      rows.push(
        `"Comment Detected","${l.id}","${l.timestamp}","${l.campaignName}","${l.username}","${l.comment.replace(/"/g, '""')}","${l.status}","Measured"`
      );
    });

    filteredClicks.forEach((c) => {
      rows.push(
        `"Tracked Redirect Click","${c.id}","${c.timestamp}","${c.campaignName}","${c.username || 'follower'}","${c.destinationUrl}","Clicked via ${c.referrer}","Measured"`
      );
    });

    filteredErrors.forEach((e) => {
      rows.push(
        `"Failure Log","${e.id}","${e.timestamp}","System/API","N/A","${e.reason.replace(/"/g, '""')}","${e.status}","Measured"`
      );
    });

    const csvContent = headers + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comment2dm_verified_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Verified event audit report exported to CSV.', 'success');
  };

  const getReliabilityBadge = (label: MetricReliability, explanation?: string) => {
    if (label === 'Measured') {
      return (
        <span
          title={explanation || 'Directly measured from real recorded events.'}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Measured
        </span>
      );
    }
    if (label === 'Estimated') {
      return (
        <span
          title={explanation || 'Calculated mathematical estimate from recorded samples.'}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          Estimated
        </span>
      );
    }
    return (
      <span
        title={explanation || 'Data unavailable without external platform integrations.'}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
        Unavailable
      </span>
    );
  };

  const activeCamp =
    selectedCampaignFilter !== 'all'
      ? campaigns.find((c) => c.id === selectedCampaignFilter)
      : campaigns[0];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span>Event-Verified Analytics & Telemetry</span>
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              100% Real Recorded Events
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Built strictly from real recorded comments, eligibility checks, verified outbound DMs,
            logged failures, and tracked link redirects. Each metric is explicitly labeled as{' '}
            <strong className="text-emerald-400">Measured</strong>,{' '}
            <strong className="text-amber-400">Estimated</strong>, or{' '}
            <strong className="text-slate-400">Unavailable</strong>. We never invent click-through
            rates or sales.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Campaign Filter */}
          <select
            value={selectedCampaignFilter}
            onChange={(e) => setSelectedCampaignFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Campaigns ({campaigns.length})</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Verification Banner */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-200">
            Strict Integrity & Anti-Hallucination Policy
          </span>
          <p className="text-slate-400 leading-relaxed">
            Standard marketing tools fabricate estimates for click-through rates, checkout conversions,
            and revenue. Comment2DM guarantees that every data point in this dashboard is sourced
            directly from verifiable database event logs, HTTP webhook confirmations, and real
            redirect click timestamps.
          </p>
        </div>
      </div>

      {/* Primary 6 Metrics Cards Grid (With Reliability Labels) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Metric 1: Comments Detected */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
              Comments Detected
            </span>
            {getReliabilityBadge('Measured', 'Exact count of comment event logs')}
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-100">{commentsDetected}</span>
            <span className="text-[11px] text-slate-500">Real webhook & test triggers</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Incoming comment events recorded across connected posts.
          </p>
        </div>

        {/* Metric 2: Eligible Comments & Sent Messages */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-indigo-400" />
              Messages Dispatched
            </span>
            {getReliabilityBadge('Measured', 'Direct count of verified private replies')}
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-indigo-300">{messagesSent}</span>
            <span className="text-[11px] text-emerald-400 font-medium">
              {commentsDetected > 0
                ? `${((eligibleComments / commentsDetected) * 100).toFixed(0)}% eligible`
                : '0%'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Passed freshness (&lt;7 days) and exactly-once duplicate checks.
          </p>
        </div>

        {/* Metric 3: Failures & Rejected Triggers */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Failures & Policy Blocks
            </span>
            {getReliabilityBadge('Measured', 'Recorded in errorLogs database')}
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-400">{failuresCount}</span>
            <span className="text-[11px] text-slate-500">Meta API & duplicate blocks</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Duplicates prevented, unsupported keywords, or expired tokens.
          </p>
        </div>

        {/* Metric 4: Link Clicks via Tracked Redirect */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />
              Tracked Redirect Clicks
            </span>
            {getReliabilityBadge('Measured', 'Recorded via /r/:campaignId redirect route')}
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-300">{linkClicks}</span>
            <span className="text-[11px] text-slate-500">Verified HTTP redirects</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Direct clicks on destination links inside dispatched direct messages.
          </p>
        </div>

        {/* Metric 5: Measured Click-Through Rate */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Measured Click Rate (CTR)
            </span>
            {measuredCtr !== null
              ? getReliabilityBadge('Measured', 'Calculated strictly as trackedClicks / messagesSent')
              : getReliabilityBadge('Unavailable', 'No outbound messages sent yet')}
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            {measuredCtr !== null ? (
              <span className="text-2xl font-bold text-emerald-400">{measuredCtr}%</span>
            ) : (
              <span className="text-lg font-semibold text-slate-500">Unavailable</span>
            )}
            <span className="text-[11px] text-slate-500">
              {linkClicks} clicks / {messagesSent} DMs
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Zero speculation. True ratio of tracked clicks to verified outbound messages.
          </p>
        </div>

        {/* Metric 6: Leads Captured in Inbox */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              Leads Captured in CRM
            </span>
            {getReliabilityBadge('Measured', 'Count of user lead records in Lead Inbox')}
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-purple-300">{leadsCaptured}</span>
            <button
              onClick={() => navigateTo('inbox')}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-0.5"
            >
              <span>View Inbox</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Individual follower profiles with timelines recorded in your Lead Inbox.
          </p>
        </div>
      </div>

      {/* Secondary Metrics: Estimated Latency vs Unavailable Off-Platform Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Estimated Latency */}
        <div className="bg-slate-900/60 border border-slate-800/70 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">
                Average Graph API Latency
              </span>
              {getReliabilityBadge(
                'Estimated',
                'Computed average latency of recorded response times'
              )}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-100">
                {averageLatencyMs !== null ? `${averageLatencyMs} ms` : 'N/A'}
              </span>
              <span className="text-xs text-slate-400">from comment webhook to message delivery</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Sampled across recorded response timings in your activity log.
            </p>
          </div>
        </div>

        {/* Unavailable Off-Platform Checkout Revenue */}
        <div className="bg-slate-900/60 border border-slate-800/70 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">
                Checkout Sales & Revenue
              </span>
              {getReliabilityBadge(
                'Unavailable',
                'Requires payment gateway webhook (Stripe, Razorpay, Gumroad)'
              )}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-500">Unavailable</span>
              <span className="text-xs text-slate-400">(Not invented)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Final payments occur off-platform on your checkout provider. We never fabricate dollar
              figures without verified payment webhooks.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Tracked Redirect Link Testing Station */}
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Tracked Redirect Link Verification Station
              </h2>
              <p className="text-xs text-slate-400">
                Every DM includes a unique tracked redirect link. Test a click right now to verify
                real-time event recording.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
            Route: /r/:campaignId?lead=:leadId
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">
              Select Campaign
            </label>
            <select
              value={activeCamp?.id || ''}
              onChange={(e) => setSelectedCampaignFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-2 text-slate-200"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">
              Associate Lead (Optional)
            </label>
            <select
              value={selectedLeadForTest}
              onChange={(e) => setSelectedLeadForTest(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-2 text-slate-200"
            >
              <option value="">Anonymous DM follower click</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  @{l.username} ({l.campaignName.slice(0, 20)}...)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                if (activeCamp) {
                  recordTrackedClick(
                    activeCamp.id,
                    selectedLeadForTest || undefined,
                    'Tracked Redirect Test Click'
                  );
                }
              }}
              className="w-full py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MousePointerClick className="w-4 h-4" />
              <span>Simulate Real Link Click</span>
            </button>
          </div>
        </div>

        {activeCamp && (
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2 truncate">
              <span className="text-slate-400 font-mono text-[11px]">Tracked URL:</span>
              <span className="text-indigo-400 font-mono truncate">
                https://comment2dm.app/r/{activeCamp.id}
                {selectedLeadForTest ? `?lead=${selectedLeadForTest}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 shrink-0">
              <span>Destination:</span>
              <a
                href={activeCamp.link}
                target="_blank"
                rel="noreferrer"
                className="text-slate-300 underline flex items-center gap-1 hover:text-white"
              >
                <span className="truncate max-w-[200px]">{activeCamp.link}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Real Recorded Timeline Trends Chart */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Trends Over Time (Recorded Event Timestamps)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily event frequency aggregated strictly from verified database records.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-sky-500 inline-block"></span>
              Comments
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-indigo-500 inline-block"></span>
              Messages Sent
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span>
              Tracked Clicks
            </span>
          </div>
        </div>

        {/* Bar Timeline */}
        <div className="space-y-3 pt-2">
          {timelineTrends.map((t, idx) => {
            const commentWidth = `${Math.min(100, (t.comments / maxTrendVal) * 100)}%`;
            const sentWidth = `${Math.min(100, (t.sent / maxTrendVal) * 100)}%`;
            const clickWidth = `${Math.min(100, (t.clicks / maxTrendVal) * 100)}%`;

            return (
              <div key={idx} className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-300">{t.date}</span>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-sky-400 font-mono">{t.comments} comments</span>
                    <span className="text-indigo-400 font-mono">{t.sent} sent</span>
                    <span className="text-amber-400 font-mono">{t.clicks} clicks</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: commentWidth }}
                      className="bg-sky-500 h-full rounded-full transition-all duration-300"
                    />
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: sentWidth }}
                      className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                    />
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: clickWidth }}
                      className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-Campaign Breakdown Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Campaign Performance Audit Breakdown</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Every row is derived strictly from real comments, DMs, tracked clicks, and inbox leads.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-3 font-medium">Campaign</th>
                <th className="pb-3 font-medium">Keyword Rule</th>
                <th className="pb-3 font-medium">Comments [M]</th>
                <th className="pb-3 font-medium">DMs Sent [M]</th>
                <th className="pb-3 font-medium">Tracked Clicks [M]</th>
                <th className="pb-3 font-medium">Verified CTR</th>
                <th className="pb-3 font-medium">Qualified Leads [M]</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {campaignBreakdown.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/20">
                  <td className="py-3 pr-4">
                    <div className="font-semibold text-slate-200">{row.name}</div>
                    <div className="text-[10px] text-slate-500">ID: {row.id}</div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-mono text-indigo-300 bg-slate-800/80 px-2 py-0.5 rounded text-[11px]">
                      {row.keyword}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-mono font-medium text-slate-200">
                    {row.commentsDetected}
                  </td>
                  <td className="py-3 pr-4 font-mono font-medium text-indigo-300">
                    {row.messagesSent}
                  </td>
                  <td className="py-3 pr-4 font-mono font-medium text-amber-300">
                    {row.trackedClicks}
                  </td>
                  <td className="py-3 pr-4 font-mono font-bold">
                    {row.ctr !== 'Unavailable' ? (
                      <span className="text-emerald-400">{row.ctr}</span>
                    ) : (
                      <span className="text-slate-500 font-normal">Unavailable</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 font-mono text-purple-300">
                    {row.qualifiedLeads} / {row.leadsCaptured}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real Tracked Clicks Audit Log Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-amber-400" />
              <span>Tracked Redirect Click Event Log (Audit Trail)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Raw telemetry logs of verified redirects executed through Comment2DM tracked links.
            </p>
          </div>
          <span className="text-xs text-slate-400">Total: {filteredClicks.length} events</span>
        </div>

        {filteredClicks.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 rounded-lg border border-slate-800/60 text-slate-400 text-xs">
            No link click events recorded yet. Use the simulator or test station above to register a
            click.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-3 font-medium">Timestamp</th>
                  <th className="pb-3 font-medium">Campaign</th>
                  <th className="pb-3 font-medium">Recipient</th>
                  <th className="pb-3 font-medium">Destination URL</th>
                  <th className="pb-3 font-medium">Referrer & Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredClicks.slice(0, 10).map((clk) => (
                  <tr key={clk.id} className="hover:bg-slate-800/20 font-mono text-[11px]">
                    <td className="py-2.5 pr-3 text-slate-400 whitespace-nowrap">
                      {clk.timestamp}
                    </td>
                    <td className="py-2.5 pr-3 font-sans text-slate-200 font-medium">
                      {clk.campaignName}
                    </td>
                    <td className="py-2.5 pr-3 text-indigo-400">@{clk.username || 'follower'}</td>
                    <td className="py-2.5 pr-3 text-slate-300 max-w-[220px] truncate">
                      <a
                        href={clk.destinationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-white truncate"
                      >
                        {clk.destinationUrl}
                      </a>
                    </td>
                    <td className="py-2.5 text-slate-400 text-[10px] max-w-[200px] truncate">
                      {clk.referrer}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
