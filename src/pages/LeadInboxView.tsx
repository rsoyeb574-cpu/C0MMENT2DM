import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lead, LeadStatus, LeadTimelineStage } from '../types';
import {
  Inbox,
  Search,
  Filter,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  FileText,
  ExternalLink,
  ChevronRight,
  X,
  Edit3,
  Trash2,
  Download,
  HelpCircle,
  Send,
  Sparkles,
  MessageSquareHeart,
} from 'lucide-react';

export const LeadInboxView: React.FC = () => {
  const {
    leads,
    updateLeadStatus,
    updateLeadNotes,
    deleteLead,
    campaigns,
    addToast,
    navigateTo,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingNotes, setEditingNotes] = useState<string>('');

  const statusOptions: LeadStatus[] = [
    'New',
    'Interested',
    'Needs follow-up',
    'Link sent',
    'Converted',
    'Not interested',
  ];

  const getStatusBadgeStyle = (status: LeadStatus) => {
    switch (status) {
      case 'New':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Interested':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'Needs follow-up':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'Link sent':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      case 'Converted':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'Not interested':
        return 'bg-slate-700/30 text-slate-400 border-slate-700/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const filteredLeads = leads.filter((lead) => {
    if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
    if (campaignFilter !== 'all' && lead.campaignId !== campaignFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchUsername = lead.username.toLowerCase().includes(q);
      const matchComment = lead.comment.toLowerCase().includes(q);
      const matchNotes = lead.notes?.toLowerCase().includes(q);
      const matchCampaign = lead.campaignName.toLowerCase().includes(q);
      if (!matchUsername && !matchComment && !matchNotes && !matchCampaign) return false;
    }
    return true;
  });

  const handleOpenLead = (lead: Lead) => {
    setSelectedLead(lead);
    setEditingNotes(lead.notes || '');
  };

  const handleSaveNotes = () => {
    if (!selectedLead) return;
    updateLeadNotes(selectedLead.id, editingNotes);
    setSelectedLead((prev) => (prev ? { ...prev, notes: editingNotes } : null));
  };

  const handleExportCSV = () => {
    if (filteredLeads.length === 0) {
      addToast('No leads to export.', 'info');
      return;
    }
    const headers = ['ID', 'Username', 'Status', 'Campaign', 'Matched Keyword', 'Comment', 'Notes', 'Created At'];
    const rows = filteredLeads.map((l) => [
      l.id,
      `@${l.username}`,
      l.status,
      `"${l.campaignName.replace(/"/g, '""')}"`,
      l.matchedKeyword,
      `"${l.comment.replace(/"/g, '""')}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
      l.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `comment2dm_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Leads exported as CSV successfully.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Inbox className="w-5 h-5 text-indigo-400" />
            <span>Lead Inbox & Comment CRM</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track, qualify, and manage every follower who commented on your Instagram posts.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium">Total Captured Leads</span>
          <span className="text-xl font-bold text-slate-100 mt-1 block">{leads.length}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-emerald-400 block font-medium">Converted</span>
          <span className="text-xl font-bold text-emerald-400 mt-1 block">
            {leads.filter((l) => l.status === 'Converted').length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-cyan-400 block font-medium">Link Sent</span>
          <span className="text-xl font-bold text-cyan-400 mt-1 block">
            {leads.filter((l) => l.status === 'Link sent').length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-amber-400 block font-medium">Needs Follow-Up</span>
          <span className="text-xl font-bold text-amber-400 mt-1 block">
            {leads.filter((l) => l.status === 'Needs follow-up').length}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads by username, comment, or notes..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses ({leads.length})</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status} ({leads.filter((l) => l.status === status).length})
              </option>
            ))}
          </select>

          {/* Campaign filter */}
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500 max-w-[200px] truncate"
          >
            <option value="all">All Campaigns</option>
            {campaigns.map((camp) => (
              <option key={camp.id} value={camp.id}>
                {camp.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Lead / Username</th>
                <th className="py-3 px-4">Comment Text</th>
                <th className="py-3 px-4">Campaign & Keyword</th>
                <th className="py-3 px-4">Lead Status</th>
                <th className="py-3 px-4">Timeline</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    No leads found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => handleOpenLead(lead)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    {/* User */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                          {lead.userAvatar ? (
                            <img src={lead.userAvatar} alt={lead.username} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold">
                              {lead.username.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-200 block group-hover:text-indigo-300">
                            @{lead.username}
                          </span>
                          <span className="text-[10px] text-slate-500">{lead.commentTime}</span>
                        </div>
                      </div>
                    </td>

                    {/* Comment */}
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-slate-300 line-clamp-2 leading-relaxed">
                        "{lead.comment}"
                      </p>
                    </td>

                    {/* Campaign */}
                    <td className="py-3 px-4 max-w-[180px]">
                      <span className="text-slate-200 font-medium truncate block">
                        {lead.campaignName}
                      </span>
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        #{lead.matchedKeyword}
                      </span>
                    </td>

                    {/* Status with quick dropdown */}
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                        className={`text-[11px] font-semibold px-2 py-1 rounded-md border cursor-pointer focus:outline-none ${getStatusBadgeStyle(
                          lead.status
                        )}`}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s} className="bg-slate-900 text-slate-200">
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Timeline summary */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-[11px] text-slate-400">
                          {lead.timeline?.length || 6} stages recorded
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleOpenLead(lead)}
                        className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail & Status Timeline Drawer/Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                  {selectedLead.userAvatar ? (
                    <img src={selectedLead.userAvatar} alt={selectedLead.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-300">
                      {selectedLead.username.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>@{selectedLead.username}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusBadgeStyle(selectedLead.status)}`}>
                      {selectedLead.status}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Source: {selectedLead.source} • Matched #{selectedLead.matchedKeyword}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Comment & Direct Message Dispatched */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Instagram Comment
                  </span>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed italic">
                    "{selectedLead.comment}"
                  </p>
                  <span className="text-[10px] text-slate-500 mt-2 block">
                    Comment ID: {selectedLead.commentId}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Direct Message Delivered
                  </span>
                  <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {selectedLead.dmSent}
                  </p>
                  {selectedLead.link && (
                    <a
                      href={selectedLead.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-2 underline"
                    >
                      <span>Destination Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Status Selector & Notes */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-200">Lead Status & CRM Notes</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Update Status:</span>
                    <select
                      value={selectedLead.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as LeadStatus;
                        updateLeadStatus(selectedLead.id, newStatus);
                        setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
                      }}
                      className="px-2.5 py-1 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Add internal notes about this lead (e.g. Budget, team size, follow-up date)..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => navigateTo('followup')}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <MessageSquareHeart className="w-3.5 h-3.5 text-rose-400" />
                    <span>Open in Follow-up Assistant</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer transition-colors"
                  >
                    Save Notes
                  </button>
                </div>
              </div>

              {/* Qualification Answers (if any) */}
              {selectedLead.qualificationAnswers && selectedLead.qualificationAnswers.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-200 block mb-1">
                    Qualification Question Responses
                  </span>
                  {selectedLead.qualificationAnswers.map((qa, i) => (
                    <div key={i} className="text-xs border-b border-slate-900 py-1.5 last:border-0">
                      <span className="text-slate-400 block">{qa.question}</span>
                      <span className="text-slate-200 font-medium block mt-0.5">{qa.answer}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Status Timeline Per Comment: All 6 stages */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-200 block">
                  Status Timeline Per Comment (6-Stage Pipeline)
                </span>

                <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {(selectedLead.timeline || []).map((event, idx) => (
                    <div key={idx} className="relative text-xs">
                      <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center" />
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{event.stage}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{event.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {event.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
              <button
                type="button"
                onClick={() => {
                  deleteLead(selectedLead.id);
                  setSelectedLead(null);
                }}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Lead</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
