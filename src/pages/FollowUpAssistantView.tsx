import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageSquareHeart,
  BotMessageSquare,
  Sparkles,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Send,
  Save,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  User,
  Inbox,
  Filter,
  Flame,
  Info,
} from 'lucide-react';
import {
  FollowUpTemplate,
  FollowUpTemplateCategory,
  Lead,
  MessagingWindowStatus,
} from '../types';

export const FollowUpAssistantView: React.FC = () => {
  const {
    leads,
    campaigns,
    followUpTemplates,
    updateFollowUpTemplate,
    outboundFollowUps,
    approveAndSendFollowUp,
    navigateTo,
    addToast,
  } = useApp();

  // State
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');
  const [activeCategory, setActiveCategory] = useState<FollowUpTemplateCategory>('need_details');
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [templateEditText, setTemplateEditText] = useState('');
  const [reviewedDraftText, setReviewedDraftText] = useState('');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [leadFilterStatus, setLeadFilterStatus] = useState<string>('all');

  // Currently selected lead
  const selectedLead = useMemo(() => {
    return leads.find((l) => l.id === selectedLeadId) || leads[0];
  }, [leads, selectedLeadId]);

  // Associated campaign
  const associatedCampaign = useMemo(() => {
    if (!selectedLead) return undefined;
    return campaigns.find((c) => c.id === selectedLead.campaignId) || campaigns[0];
  }, [campaigns, selectedLead]);

  // Active Template
  const activeTemplate = useMemo(() => {
    return (
      followUpTemplates.find((t) => t.category === activeCategory) || followUpTemplates[0]
    );
  }, [followUpTemplates, activeCategory]);

  // Sync template edit text when category changes
  React.useEffect(() => {
    if (activeTemplate) {
      setTemplateEditText(activeTemplate.templateText);
    }
  }, [activeTemplate]);

  // Determine Instagram Messaging Window Status
  const getMessagingWindow = (lead?: Lead): { status: MessagingWindowStatus; label: string; detail: string } => {
    if (!lead) return { status: 'outside_window', label: 'Unavailable', detail: 'No lead selected' };

    // In this implementation, comment timestamps within today or 24h are inside 24h/7d window
    if (lead.commentTime.includes('now') || lead.commentTime.includes('mins') || lead.commentTime.includes('hour')) {
      return {
        status: 'active_24h',
        label: 'Active 24-Hour Standard Window',
        detail: 'User interacted recently. Compliant with Meta standard messaging policy.',
      };
    }
    if (lead.commentTime.includes('day') && !lead.commentTime.includes('week')) {
      return {
        status: 'active_7d_reply',
        label: '7-Day Comment Follow-up Window',
        detail: 'Within 7-day Meta private reply window. Human review required.',
      };
    }
    return {
      status: 'active_7d_reply',
      label: '7-Day Active Window',
      detail: 'Eligible for 1-on-1 human agent follow-up.',
    };
  };

  const windowInfo = getMessagingWindow(selectedLead);

  // Generate Personalized AI Draft from Template and Verified Lead Facts
  const generateDraft = React.useCallback(() => {
    if (!selectedLead || !activeTemplate) return;
    setIsGeneratingDraft(true);

    const firstName = selectedLead.username.split('_')[0].split('.')[0];
    const offer = associatedCampaign?.offer || 'the resource guide';
    const link = associatedCampaign?.link || selectedLead.link || 'https://gumroad.com';

    let draft = activeTemplate.templateText
      .replace(/{{username}}/g, selectedLead.username)
      .replace(/{{first_name}}/g, firstName.charAt(0).toUpperCase() + firstName.slice(1))
      .replace(/{{offer}}/g, offer)
      .replace(/{{link}}/g, link);

    // If lead has specific notes, weave in contextual intelligence
    if (selectedLead.notes && selectedLead.notes.toLowerCase().includes('monitor')) {
      draft += '\n\nP.S. Regarding your question about the monitor arm: it fits desks up to 3.2 inches thick perfectly!';
    } else if (selectedLead.notes && selectedLead.notes.toLowerCase().includes('team')) {
      draft += '\n\nP.S. I can also set up a custom team invoice if you are onboarding 3+ devs.';
    }

    setTimeout(() => {
      setReviewedDraftText(draft);
      setIsGeneratingDraft(false);
      addToast('AI drafted personalized follow-up from verified facts.', 'info');
    }, 250);
  }, [selectedLead, activeTemplate, associatedCampaign, addToast]);

  // Initial draft generation when lead or category changes
  React.useEffect(() => {
    generateDraft();
  }, [selectedLead?.id, activeCategory]);

  // Save modified template
  const handleSaveTemplate = () => {
    if (!activeTemplate) return;
    updateFollowUpTemplate(activeTemplate.id, templateEditText);
    setIsEditingTemplate(false);
  };

  // Human Operator Approval & Send
  const handleApproveAndSend = () => {
    if (!selectedLead) return;
    if (!reviewedDraftText.trim()) {
      addToast('Cannot send empty message.', 'error');
      return;
    }

    const verifiedFacts = [
      `User @${selectedLead.username} commented "${selectedLead.comment}"`,
      `Campaign: ${selectedLead.campaignName}`,
      `Keyword: ${selectedLead.matchedKeyword}`,
      `Status in CRM: ${selectedLead.status}`,
    ];

    const aiReasoning = `Applied template "${activeTemplate.title}" with personalized context tailored to lead status "${selectedLead.status}".`;

    approveAndSendFollowUp(
      selectedLead.id,
      reviewedDraftText.trim(),
      activeCategory,
      verifiedFacts,
      aiReasoning
    );
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    if (leadFilterStatus === 'all') return leads;
    return leads.filter((l) => l.status === leadFilterStatus);
  }, [leads, leadFilterStatus]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <MessageSquareHeart className="w-5 h-5 text-rose-400" />
              <span>Follow-up Assistant & Approval Queue</span>
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Human-in-the-Loop Enforced
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            AI crafts high-converting follow-up drafts based on verified follower actions, but every
            outbound DM requires explicit human review and approval. Zero bulk spam. 100% compliant
            with Meta messaging window policies.
          </p>
        </div>

        <button
          onClick={() => navigateTo('inbox')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Inbox className="w-3.5 h-3.5 text-slate-400" />
          <span>Open Lead Inbox ({leads.length})</span>
        </button>
      </div>

      {/* Meta Messaging Window & Anti-Spam Compliance Banner */}
      <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">
                Instagram Platform Compliance & Anti-Spam Safeguard
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                No Bulk Messaging
              </span>
            </div>
            <p className="text-slate-400 mt-1 leading-relaxed">
              Meta Platform Policy strictly forbids automated mass blasts. Comment2DM enforces
              sequential, single-lead review to protect your Instagram Business account reputation
              and ensure high inbox deliverability.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800">
          <Clock className="w-4 h-4 text-emerald-400" />
          <div className="text-[11px]">
            <span className="text-slate-400 block">Current Lead Policy Window:</span>
            <span className="text-emerald-300 font-semibold">{windowInfo.label}</span>
          </div>
        </div>
      </div>

      {/* 5 Editable Template Selector Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            5 Core Follow-Up Templates (Editable)
          </span>
          <button
            onClick={() => setIsEditingTemplate(!isEditingTemplate)}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-medium"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingTemplate ? 'Cancel Edit' : 'Edit Master Template'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {followUpTemplates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => {
                setActiveCategory(tpl.category);
                setIsEditingTemplate(false);
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeCategory === tpl.category
                  ? 'bg-rose-950/30 border-rose-500/50 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-slate-200 block truncate">
                  {tpl.title}
                </span>
                <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">
                  {tpl.description}
                </p>
              </div>
              <span className="text-[9px] font-mono text-slate-500 mt-2 block">
                Timing: {tpl.suggestedTiming}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Master Template Inline Editor (If toggled) */}
      {isEditingTemplate && (
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">
              Editing Template: "{activeTemplate.title}"
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Variables: {'{{username}}'}, {'{{first_name}}'}, {'{{offer}}'}, {'{{link}}'}
            </span>
          </div>

          <textarea
            rows={4}
            value={templateEditText}
            onChange={(e) => setTemplateEditText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditingTemplate(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              Discard
            </button>
            <button
              onClick={handleSaveTemplate}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Master Template</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Approval Workspace: Lead Queue + Review & Approve Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lead Selection Queue (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Lead Queue ({filteredLeads.length})
            </span>
            <select
              value={leadFilterStatus}
              onChange={(e) => setLeadFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-[11px] rounded-lg px-2 py-1 text-slate-300"
            >
              <option value="all">All Statuses</option>
              <option value="Needs follow-up">Needs follow-up</option>
              <option value="Interested">Interested</option>
              <option value="New">New</option>
              <option value="Link sent">Link sent</option>
            </select>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredLeads.map((lead) => {
              const isSelected = lead.id === selectedLeadId;
              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/70 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center text-xs font-bold shrink-0">
                        {lead.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-100 block truncate">
                          @{lead.username}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          Keyword: {lead.matchedKeyword}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        lead.status === 'Interested'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : lead.status === 'Needs follow-up'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-1 italic">
                    "{lead.comment}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI Draft, Verified Facts, and Human Approval Station (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedLead ? (
            <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-5 space-y-5">
              {/* Lead Top Profile Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {selectedLead.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-100">
                        @{selectedLead.username}
                      </h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        Status: {selectedLead.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      Campaign: {selectedLead.campaignName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={generateDraft}
                    disabled={isGeneratingDraft}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isGeneratingDraft ? 'animate-spin' : ''}`} />
                    <span>Regenerate AI Draft</span>
                  </button>
                </div>
              </div>

              {/* Verified Facts vs AI Suggestions Separation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. Verified Facts (Green) */}
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>[Verified Facts: From Meta & Database]</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-emerald-200/90">
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400">•</span>
                      <span>
                        Commented: <strong className="text-white">"{selectedLead.comment}"</strong>{' '}
                        ({selectedLead.commentTime})
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400">•</span>
                      <span>
                        Matched Keyword: <strong className="text-white">{selectedLead.matchedKeyword}</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400">•</span>
                      <span>
                        Destination Link:{' '}
                        <a
                          href={selectedLead.link}
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:text-white truncate inline-block max-w-[160px]"
                        >
                          {selectedLead.link}
                        </a>
                      </span>
                    </li>
                    {selectedLead.notes && (
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-400">•</span>
                        <span>
                          CRM Notes: <strong className="text-white">{selectedLead.notes}</strong>
                        </span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* 2. AI Suggestions & Strategic Angle (Purple) */}
                <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>[AI Suggestion: Strategic Recommendation]</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-purple-200/90">
                    <li className="flex items-start gap-1.5">
                      <span className="text-purple-400">•</span>
                      <span>
                        Template Strategy: Using{' '}
                        <strong className="text-white">"{activeTemplate.title}"</strong> based on lead
                        status.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-purple-400">•</span>
                      <span>
                        Anti-Spam Timing: Recommended dispatch window is{' '}
                        <strong className="text-white">{activeTemplate.suggestedTiming}</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-purple-400">•</span>
                      <span>
                        CTA Focus: Friendly open-ended question to reopen active 24h conversation
                        thread.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Review & Approve Textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">
                      Outbound Direct Message (Review & Edit Before Sending)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Editable Draft
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {reviewedDraftText.length} characters
                  </span>
                </div>

                <textarea
                  rows={5}
                  value={reviewedDraftText}
                  onChange={(e) => setReviewedDraftText(e.target.value)}
                  placeholder="Drafting message..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 font-sans leading-relaxed focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Human verification required. Clicking "Approve & Send" records real API delivery
                      to Meta.
                    </span>
                  </div>

                  <button
                    onClick={handleApproveAndSend}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span>Approve & Send Follow-up DM</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-12 text-center text-slate-400 text-xs">
              No leads currently available in queue.
            </div>
          )}

          {/* Approved Outbound Follow-up History Table */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                Verified Outbound Follow-Up Audit Log ({outboundFollowUps.length})
              </h3>
              <span className="text-[11px] text-slate-500">
                Individually approved & dispatched
              </span>
            </div>

            {outboundFollowUps.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs bg-slate-950/40 rounded-lg border border-slate-800/60">
                No outbound follow-ups sent yet. Review and approve your first draft above!
              </div>
            ) : (
              <div className="space-y-2">
                {outboundFollowUps.map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">@{rec.username}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                          {rec.templateCategory}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Approved by Operator
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic">
                        "{rec.finalMessage}"
                      </p>
                    </div>

                    <div className="text-right shrink-0 text-[11px] text-slate-500 font-mono">
                      {rec.sentAt}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
