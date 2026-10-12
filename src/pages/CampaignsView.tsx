import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Campaign } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  Layers,
  PlusCircle,
  Search,
  Play,
  Pause,
  Edit2,
  Copy,
  Trash2,
  FlaskConical,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';

export const CampaignsView: React.FC = () => {
  const {
    campaigns,
    openCreateCampaign,
    openEditCampaign,
    toggleCampaignStatus,
    duplicateCampaign,
    deleteCampaign,
    setActiveTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');

  const filteredCampaigns = campaigns.filter((camp) => {
    const matchesSearch =
      camp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camp.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (camp.postCaption && camp.postCaption.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ? true : camp.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Automated Campaigns</span>
            </h1>
            <StatusBadge status="Demo mode" />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your Instagram post monitors, trigger keywords, and automated direct message sequences.
          </p>
        </div>

        <button
          onClick={() => openCreateCampaign()}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/30 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns by name or keyword..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status segmented control */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          {(['all', 'active', 'paused'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === s
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s === 'all' ? 'All' : s === 'active' ? 'Active' : 'Paused'}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns List */}
      {filteredCampaigns.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No campaigns found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? `No campaigns match "${searchQuery}". Try a different keyword or reset filters.`
              : 'Create your first comment-to-DM automation campaign to get started!'}
          </p>
          <button
            onClick={() => openCreateCampaign()}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Campaign</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCampaigns.map((camp) => {
            const ctr =
              camp.dmsSentCount > 0
                ? ((camp.clicksCount / camp.dmsSentCount) * 100).toFixed(1)
                : '0.0';

            return (
              <div
                key={camp.id}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Left Section: Post & Campaign Info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Post Thumbnail */}
                  <div className="w-14 h-14 rounded-lg bg-slate-800 overflow-hidden relative shrink-0 border border-slate-700/60">
                    {camp.postThumbnail ? (
                      <img
                        src={camp.postThumbnail}
                        alt="Reel preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                        IG
                      </div>
                    )}
                  </div>

                  {/* Campaign Details */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-100 truncate">
                        {camp.name}
                      </h3>

                      {/* Status indicator button */}
                      <button
                        onClick={() => toggleCampaignStatus(camp.id)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer ${
                          camp.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750'
                        }`}
                        title="Click to toggle status"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            camp.status === 'active' ? 'bg-emerald-400' : 'bg-slate-500'
                          }`}
                        />
                        <span>{camp.status === 'active' ? 'Active' : 'Paused'}</span>
                      </button>
                    </div>

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1 font-mono text-indigo-300">
                        <span className="text-slate-500">Trigger:</span>
                        <span className="bg-indigo-950/60 border border-indigo-800/60 px-1.5 py-0.2 rounded font-semibold text-[11px]">
                          {camp.keyword}
                        </span>
                      </div>
                      <span>·</span>
                      <span className="capitalize">{camp.matchType} Match</span>
                      <span>·</span>
                      <span>Created {camp.createdAt}</span>
                    </div>

                    {/* Destination preview */}
                    <p className="text-[11px] text-slate-400 truncate max-w-md font-mono">
                      Link: {camp.link}
                    </p>

                    {camp.offer && (
                      <p className="text-[11px] text-slate-300 truncate max-w-md">
                        <span className="text-slate-500 font-medium">Offer: </span>
                        <span>{camp.offer}</span>
                      </p>
                    )}

                    {camp.publicCommentReply && (
                      <p className="text-[11px] text-slate-400 italic truncate max-w-md">
                        <span className="text-indigo-400 not-italic font-medium">Public Reply: </span>
                        <span>"{camp.publicCommentReply}"</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Middle Section: Tabular Metrics Strip */}
                <div className="flex items-center gap-6 py-2 px-4 rounded-lg bg-slate-950/60 border border-slate-800/80 shrink-0">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">
                      Comments
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-200 tabular-nums">
                      {camp.commentsCount.toLocaleString()}
                    </span>
                  </div>

                  <div className="h-6 w-px bg-slate-800" />

                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">
                      DMs Sent
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-300 tabular-nums">
                      {camp.dmsSentCount.toLocaleString()}
                    </span>
                  </div>

                  <div className="h-6 w-px bg-slate-800" />

                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">
                      Clicks
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-300 tabular-nums">
                      {camp.clicksCount.toLocaleString()}
                    </span>
                  </div>

                  <div className="h-6 w-px bg-slate-800" />

                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">
                      CTR
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                      {ctr}%
                    </span>
                  </div>
                </div>

                {/* Right Section: Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Test in Simulator button */}
                  <button
                    onClick={() => setActiveTab('simulator')}
                    className="p-2 text-slate-400 hover:text-indigo-300 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Test this campaign in simulator"
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                  </button>

                  {/* Pause / Resume */}
                  <button
                    onClick={() => toggleCampaignStatus(camp.id)}
                    className="p-2 text-slate-400 hover:text-slate-200 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                    title={camp.status === 'active' ? 'Pause Campaign' : 'Activate Campaign'}
                  >
                    {camp.status === 'active' ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEditCampaign(camp)}
                    className="p-2 text-slate-400 hover:text-slate-200 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Edit Campaign"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={() => duplicateCampaign(camp.id)}
                    className="p-2 text-slate-400 hover:text-slate-200 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Duplicate Campaign"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => deleteCampaign(camp.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Delete Campaign"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
