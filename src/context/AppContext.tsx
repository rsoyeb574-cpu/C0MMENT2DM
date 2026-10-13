import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  Campaign,
  Template,
  TemplateCategory,
  InstagramPost,
  ActivityLog,
  ActiveTab,
  SimulatorExecutionResult,
  SimulatorStep,
  User,
  AppStatus,
  InstagramErrorLog,
  Lead,
  LeadStatus,
  TrackedClickEvent,
  FollowUpTemplate,
  OutboundFollowUpRecord,
  FollowUpTemplateCategory,
} from '../types';
import {
  INITIAL_CAMPAIGNS,
  INITIAL_POSTS,
  INITIAL_TEMPLATES,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_ERROR_LOGS,
  INITIAL_LEADS,
  INITIAL_FOLLOWUP_TEMPLATES,
  INITIAL_TRACKED_CLICKS,
} from '../data/mockData';

import {
  apiSignup,
  apiLogin,
  apiLogout,
  apiGetMe,
  apiGetCampaigns,
  apiSaveCampaign,
  apiUpdateCampaignStatus,
  apiDeleteCampaign,
  apiGetTemplates,
  apiSaveTemplate,
  apiDeleteTemplate,
  apiGetLeads,
  apiSaveLead,
  apiUpdateLeadStatus,
  apiDeleteLead,
  apiGetCommentEvents,
  apiRecordCommentEvent,
  apiGetDmEvents,
  apiRecordDmEvent,
  apiGetLinkClicks,
  apiRecordLinkClick,
} from '../services/dbApi';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextType {
  user: User | null;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  navigateTo: (tab: ActiveTab) => void;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  authRedirectNotice: string | null;
  clearAuthNotice: () => void;
  campaigns: Campaign[];
  templates: Template[];
  posts: InstagramPost[];
  activityLogs: ActivityLog[];
  errorLogs: InstagramErrorLog[];
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLeadStatus: (leadId: string, status: LeadStatus) => Promise<void>;
  updateLeadNotes: (leadId: string, notes: string) => Promise<void>;
  deleteLead: (leadId: string) => Promise<void>;
  addErrorLog: (log: Omit<InstagramErrorLog, 'id' | 'timestamp'>) => void;
  clearErrorLogs: () => void;
  isInstagramConnected: boolean;
  instagramStatus: AppStatus;
  toggleInstagramConnection: () => void;
  isEditorOpen: boolean;
  editingCampaign: Campaign | null;
  openCreateCampaign: (initial?: Partial<Campaign>) => void;
  openEditCampaign: (campaign: Campaign) => void;
  closeEditor: () => void;
  saveCampaign: (campaignData: Partial<Campaign>) => Promise<boolean>;
  toggleCampaignStatus: (id: string) => Promise<void>;
  duplicateCampaign: (id: string) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  saveTemplate: (templateData: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  duplicateTemplate: (id: string) => void;
  applyTemplateToNewCampaign: (template: Template) => void;
  runSimulator: (username: string, commentText: string, specificCampaignId?: string) => Promise<SimulatorExecutionResult>;
  recordLinkClick: (logId: string) => void;
  trackedClicks: TrackedClickEvent[];
  recordTrackedClick: (campaignId: string, leadId?: string, referrer?: string) => void;
  followUpTemplates: FollowUpTemplate[];
  updateFollowUpTemplate: (id: string, newText: string, newTitle?: string) => void;
  outboundFollowUps: OutboundFollowUpRecord[];
  approveAndSendFollowUp: (
    leadId: string,
    message: string,
    templateCategory: FollowUpTemplateCategory,
    verifiedFactsUsed: string[],
    aiReasoning: string
  ) => void;
  resetAllData: () => void;
  seedDemoActivity: () => void;
  toasts: ToastItem[];
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  totalComments: number;
  totalDMsSent: number;
  totalClicks: number;
  activeCampaignsCount: number;
  // Demo Mode & Live DB state
  isDemoMode: boolean;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
  dbError: string | null;
  clearDbError: () => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const PROTECTED_TABS: ActiveTab[] = [
  'dashboard',
  'campaigns',
  'inbox',
  'onboarding',
  'simulator',
  'templates',
  'analytics',
  'coach',
  'followup',
  'instagram',
  'settings',
];

function getTabFromPath(path: string): ActiveTab {
  const clean = path.replace(/^\//, '').split('?')[0].toLowerCase();
  switch (clean) {
    case 'login':
      return 'login';
    case 'signup':
      return 'signup';
    case 'forgot-password':
      return 'forgot-password';
    case 'dashboard':
      return 'dashboard';
    case 'campaigns':
      return 'campaigns';
    case 'inbox':
      return 'inbox';
    case 'onboarding':
      return 'onboarding';
    case 'simulator':
      return 'simulator';
    case 'templates':
      return 'templates';
    case 'analytics':
      return 'analytics';
    case 'coach':
      return 'coach';
    case 'followup':
      return 'followup';
    case 'instagram':
      return 'instagram';
    case 'settings':
      return 'settings';
    default:
      return 'landing';
  }
}

// Helpers to map PostgreSQL columns to TypeScript models
function mapCampaignFromDb(c: any): Campaign {
  return {
    id: c.id,
    name: c.name,
    postId: c.post_id || '',
    postThumbnail: c.post_thumbnail,
    postCaption: c.post_caption,
    keyword: c.keyword,
    matchType: c.match_type || 'contains',
    caseInsensitive: c.case_insensitive ?? true,
    sendOncePerUser: c.send_once_per_user ?? true,
    message: c.message,
    link: c.link,
    status: c.status || 'active',
    createdAt: c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    commentsCount: Number(c.comments_count || 0),
    dmsSentCount: Number(c.dms_sent_count || 0),
    clicksCount: Number(c.clicks_count || 0),
    offer: c.offer || '',
    publicCommentReply: c.public_comment_reply || '',
    callToAction: c.call_to_action || '',
    qualificationQuestions: Array.isArray(c.qualification_questions)
      ? c.qualification_questions
      : typeof c.qualification_questions === 'string'
      ? JSON.parse(c.qualification_questions)
      : [],
    setupVerified: c.setup_verified ?? true,
  };
}

function mapTemplateFromDb(t: any): Template {
  return {
    id: t.id,
    title: t.title,
    category: (t.category as TemplateCategory) || 'ebook',
    keywordSuggestion: t.keyword_suggestion,
    offer: t.offer || '',
    message: t.message,
    publicCommentReply: t.public_comment_reply || '',
    callToAction: t.call_to_action || '',
    defaultLink: t.default_link,
    description: t.description || '',
    usageCount: Number(t.usage_count || 0),
    qualificationQuestions: Array.isArray(t.qualification_questions)
      ? t.qualification_questions
      : typeof t.qualification_questions === 'string'
      ? JSON.parse(t.qualification_questions)
      : [],
  };
}

function mapLeadFromDb(l: any): Lead {
  return {
    id: l.id,
    username: l.username,
    userAvatar: l.user_avatar,
    comment: l.comment,
    commentId: l.comment_id || 'cmt_' + Date.now(),
    commentTime: l.comment_time ? new Date(l.comment_time).toLocaleTimeString() : 'Just now',
    campaignId: l.campaign_id,
    campaignName: l.campaign_name || '',
    matchedKeyword: l.matched_keyword || '',
    dmSent: l.dm_sent || '',
    link: l.link || '',
    status: (l.status as LeadStatus) || 'New',
    notes: l.notes || '',
    source: l.source || 'Instagram Comment',
    postThumbnail: l.post_thumbnail,
    qualificationAnswers: Array.isArray(l.qualification_answers)
      ? l.qualification_answers
      : typeof l.qualification_answers === 'string'
      ? JSON.parse(l.qualification_answers)
      : [],
    timeline: Array.isArray(l.timeline)
      ? l.timeline
      : typeof l.timeline === 'string'
      ? JSON.parse(l.timeline)
      : [],
    createdAt: l.created_at || new Date().toISOString(),
    updatedAt: l.updated_at || new Date().toISOString(),
  };
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Auth & Session state (verified against server)
  const [user, setUser] = useState<User | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [authRedirectNotice, setAuthRedirectNotice] = useState<string | null>(null);

  // 2. Active Tab & Navigation
  const [activeTab, setActiveTabState] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined') {
      return getTabFromPath(window.location.pathname);
    }
    return 'landing';
  });

  // 3. Application Data Collections
  const [posts] = useState<InstagramPost[]>(INITIAL_POSTS);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [errorLogs, setErrorLogs] = useState<InstagramErrorLog[]>([]);
  const [trackedClicks, setTrackedClicks] = useState<TrackedClickEvent[]>([]);
  const [followUpTemplates, setFollowUpTemplates] = useState<FollowUpTemplate[]>(INITIAL_FOLLOWUP_TEMPLATES);
  const [outboundFollowUps, setOutboundFollowUps] = useState<OutboundFollowUpRecord[]>([]);

  // 4. Instagram Connection state
  const [isInstagramConnected, setIsInstagramConnected] = useState<boolean>(false);

  // 5. Editor & UI states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Track replied comments in memory to prevent duplicate simulator runs
  const [repliedComments] = useState<Set<string>>(() => new Set());

  const addToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = 'toast_' + Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearDbError = useCallback(() => {
    setDbError(null);
  }, []);

  // --------------------------------------------------------------------------
  // Check active session on initial application load
  // --------------------------------------------------------------------------
  useEffect(() => {
    apiGetMe()
      .then((res) => {
        if (res?.success && res.user) {
          setUser({
            id: res.user.id,
            name: res.user.name,
            email: res.user.email,
            avatar: res.user.avatar,
            createdAt: res.user.createdAt || res.user.created_at,
            plan: res.user.plan || 'Pro',
          });
          setIsDemoMode(false);
        }
      })
      .catch(() => {
        // No active session cookie
        setUser(null);
      });
  }, []);

  // --------------------------------------------------------------------------
  // Load data from PostgreSQL for authenticated user
  // --------------------------------------------------------------------------
  const refreshData = useCallback(async () => {
    if (isDemoMode) {
      setCampaigns(INITIAL_CAMPAIGNS);
      setTemplates(INITIAL_TEMPLATES);
      setLeads(INITIAL_LEADS);
      setActivityLogs(INITIAL_ACTIVITY_LOGS);
      setTrackedClicks(INITIAL_TRACKED_CLICKS);
      return;
    }

    if (!user) {
      setCampaigns([]);
      setLeads([]);
      setActivityLogs([]);
      setTrackedClicks([]);
      return;
    }

    try {
      setDbError(null);
      const [campsRes, tplsRes, leadsRes, cmtsRes, dmsRes, clicksRes] = await Promise.all([
        apiGetCampaigns(),
        apiGetTemplates().catch(() => ({ success: true, templates: [] })),
        apiGetLeads().catch(() => ({ success: true, leads: [] })),
        apiGetCommentEvents().catch(() => ({ success: true, events: [] })),
        apiGetDmEvents().catch(() => ({ success: true, events: [] })),
        apiGetLinkClicks().catch(() => ({ success: true, clicks: [] })),
      ]);

      if (campsRes?.campaigns) {
        setCampaigns(campsRes.campaigns.map(mapCampaignFromDb));
      }
      if (tplsRes?.templates && tplsRes.templates.length > 0) {
        setTemplates(tplsRes.templates.map(mapTemplateFromDb));
      } else {
        setTemplates(INITIAL_TEMPLATES);
      }
      if (leadsRes?.leads) {
        setLeads(leadsRes.leads.map(mapLeadFromDb));
      }

      // Map combined DM and Comment events into ActivityLogs
      if (dmsRes?.events && dmsRes.events.length > 0) {
        const mappedLogs: ActivityLog[] = dmsRes.events.map((d: any) => ({
          id: d.id,
          timestamp: d.sent_at ? new Date(d.sent_at).toLocaleTimeString() : 'Just now',
          username: d.recipient_username,
          comment: `Private reply dispatched for comment ${d.comment_id}`,
          campaignId: d.campaign_id || '',
          campaignName: 'Campaign',
          matchedKeyword: 'AUTO',
          dmMessage: d.message_text,
          link: '',
          status: (d.status as AppStatus) || 'Sent successfully',
          clicked: false,
          responseTimeMs: d.response_time_ms || 850,
        }));
        setActivityLogs(mappedLogs);
      } else {
        setActivityLogs([]);
      }

      if (clicksRes?.clicks) {
        const mappedClicks: TrackedClickEvent[] = clicksRes.clicks.map((clk: any) => ({
          id: clk.id,
          timestamp: clk.clicked_at ? new Date(clk.clicked_at).toISOString() : new Date().toISOString(),
          rawTime: clk.clicked_at ? new Date(clk.clicked_at).getTime() : Date.now(),
          campaignId: clk.campaign_id || '',
          campaignName: 'Campaign Link',
          leadId: clk.lead_id,
          username: clk.username || 'follower',
          destinationUrl: clk.destination_url,
          referrer: clk.referrer || 'Instagram DM',
          userAgent: clk.user_agent || 'Unknown',
        }));
        setTrackedClicks(mappedClicks);
      }
    } catch (err: any) {
      console.error('[Refresh Data Error]', err);
      const msg = err.message || 'Failed to load PostgreSQL data';
      setDbError(msg);
      addToast(`PostgreSQL Error: ${msg}`, 'error');
    }
  }, [user, isDemoMode, addToast]);

  // Trigger refresh whenever auth status changes
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Protected route redirects
  useEffect(() => {
    if (PROTECTED_TABS.includes(activeTab) && !user && !isDemoMode) {
      setAuthRedirectNotice(`Please sign in or create an account to access ${activeTab}.`);
      setActiveTabState('login');
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/login');
      }
    }
  }, [activeTab, user, isDemoMode]);

  const navigateTo = (tab: ActiveTab) => {
    if (PROTECTED_TABS.includes(tab) && !user && !isDemoMode) {
      setAuthRedirectNotice(`Please sign in or create an account to access ${tab}.`);
      setActiveTabState('login');
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/login');
      }
      return;
    }
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/${tab === 'landing' ? '' : tab}`);
    }
  };

  const setActiveTab = (tab: ActiveTab) => {
    navigateTo(tab);
  };

  const clearAuthNotice = () => setAuthRedirectNotice(null);

  // --------------------------------------------------------------------------
  // Authentication Actions
  // --------------------------------------------------------------------------
  const signup = async (name: string, email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim()) return { success: false, error: 'Full name is required.' };
    if (!cleanEmail || !cleanEmail.includes('@')) return { success: false, error: 'Valid email address is required.' };
    if (!pass || pass.length < 6) return { success: false, error: 'Password must be at least 6 characters long.' };

    try {
      const res = await apiSignup(name.trim(), cleanEmail, pass);
      if (res.success && res.user) {
        setUser({
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          avatar: res.user.avatar,
          createdAt: res.user.createdAt || res.user.created_at,
          plan: res.user.plan || 'Pro',
        });
        setIsDemoMode(false);
        setDbError(null);
        addToast(`Welcome to Comment2DM, ${res.user.name}! Your account is saved in PostgreSQL.`, 'success');
        navigateTo('onboarding');
        return { success: true };
      }
      return { success: false, error: 'Registration failed.' };
    } catch (err: any) {
      const errorMsg = err.message || 'Signup failed';
      setDbError(errorMsg);
      addToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !pass) return { success: false, error: 'Email and password are required.' };

    try {
      const res = await apiLogin(cleanEmail, pass);
      if (res.success && res.user) {
        setUser({
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          avatar: res.user.avatar,
          createdAt: res.user.createdAt || res.user.created_at,
          plan: res.user.plan || 'Pro',
        });
        setIsDemoMode(false);
        setDbError(null);
        addToast(`Signed in as ${res.user.name}. Loading data from PostgreSQL...`, 'success');
        navigateTo('dashboard');
        return { success: true };
      }
      return { success: false, error: 'Invalid email or password.' };
    } catch (err: any) {
      const errorMsg = err.message || 'Login failed';
      setDbError(errorMsg);
      addToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {}
    setUser(null);
    setIsDemoMode(false);
    setCampaigns([]);
    setLeads([]);
    setActivityLogs([]);
    setTrackedClicks([]);
    navigateTo('landing');
    addToast('Signed out successfully.', 'info');
  };

  const forgotPassword = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return { success: false, error: 'Please enter an email address.' };
    return { success: true, message: `If an account exists for ${cleanEmail}, password reset instructions were sent.` };
  };

  // Demo Mode Switchers
  const enterDemoMode = () => {
    setIsDemoMode(true);
    setUser({
      id: 'user_demo_01',
      name: 'Creator Studio (Sample)',
      email: 'demo@comment2dm.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      createdAt: '2026-03-01',
      plan: 'Pro',
    });
    setCampaigns(INITIAL_CAMPAIGNS);
    setTemplates(INITIAL_TEMPLATES);
    setLeads(INITIAL_LEADS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setTrackedClicks(INITIAL_TRACKED_CLICKS);
    addToast('Entered Demo Mode: Showing sample data. Actions will not affect PostgreSQL.', 'info');
    navigateTo('dashboard');
  };

  const exitDemoMode = () => {
    setIsDemoMode(false);
    setUser(null);
    setCampaigns([]);
    setLeads([]);
    setActivityLogs([]);
    setTrackedClicks([]);
    navigateTo('landing');
    addToast('Exited Demo Mode.', 'info');
  };

  const toggleInstagramConnection = () => {
    if (isInstagramConnected) {
      setIsInstagramConnected(false);
      addToast('Instagram disconnected. Status changed to Setup required.', 'info');
    } else {
      setIsInstagramConnected(true);
      addToast('Instagram account connected. Ready for webhook automation.', 'success');
    }
  };

  // --------------------------------------------------------------------------
  // Leads Operations (PostgreSQL or Demo In-Memory)
  // --------------------------------------------------------------------------
  const addLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newLead: Lead = {
      ...leadData,
      id: 'lead_' + Date.now(),
      createdAt: now,
      updatedAt: now,
    };

    if (isDemoMode) {
      setLeads((prev) => [newLead, ...prev]);
      addToast(`[Demo] Lead added: @${newLead.username}`);
      return;
    }

    try {
      const res = await apiSaveLead({
        id: newLead.id,
        username: newLead.username,
        userAvatar: newLead.userAvatar,
        comment: newLead.comment,
        commentId: newLead.commentId,
        commentTime: newLead.commentTime,
        campaignId: newLead.campaignId,
        campaignName: newLead.campaignName,
        matchedKeyword: newLead.matchedKeyword,
        dmSent: newLead.dmSent,
        link: newLead.link,
        status: newLead.status,
        notes: newLead.notes,
        source: newLead.source,
        postThumbnail: newLead.postThumbnail,
        qualificationAnswers: newLead.qualificationAnswers,
        timeline: newLead.timeline,
      });

      if (res?.lead) {
        setLeads((prev) => [mapLeadFromDb(res.lead), ...prev]);
        addToast(`Lead saved to PostgreSQL: @${newLead.username}`);
      }
    } catch (err: any) {
      addToast(`Failed to save lead: ${err.message}`, 'error');
      setDbError(err.message);
    }
  };

  const updateLeadStatus = async (leadId: string, status: LeadStatus) => {
    if (isDemoMode) {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status, updatedAt: new Date().toISOString() } : l)));
      addToast(`[Demo] Lead status changed to ${status}`);
      return;
    }

    try {
      await apiUpdateLeadStatus(leadId, status);
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status, updatedAt: new Date().toISOString() } : l)));
      addToast(`Lead status updated to ${status}`);
    } catch (err: any) {
      addToast(`Failed to update status: ${err.message}`, 'error');
    }
  };

  const updateLeadNotes = async (leadId: string, notes: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    if (isDemoMode) {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, notes, updatedAt: new Date().toISOString() } : l)));
      addToast('[Demo] Lead notes updated.');
      return;
    }

    try {
      await apiUpdateLeadStatus(leadId, lead.status, notes);
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, notes, updatedAt: new Date().toISOString() } : l)));
      addToast('Lead notes saved to PostgreSQL.');
    } catch (err: any) {
      addToast(`Failed to save notes: ${err.message}`, 'error');
    }
  };

  const deleteLead = async (leadId: string) => {
    if (isDemoMode) {
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      addToast('[Demo] Lead removed.');
      return;
    }

    try {
      await apiDeleteLead(leadId);
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      addToast('Lead deleted from PostgreSQL.');
    } catch (err: any) {
      addToast(`Failed to delete lead: ${err.message}`, 'error');
    }
  };

  // --------------------------------------------------------------------------
  // Campaign Operations (PostgreSQL or Demo In-Memory)
  // --------------------------------------------------------------------------
  const openCreateCampaign = (initial?: Partial<Campaign>) => {
    setEditingCampaign(initial ? ({ ...initial, id: '' } as Campaign) : null);
    setIsEditorOpen(true);
  };

  const openEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingCampaign(null);
  };

  const saveCampaign = async (campaignData: Partial<Campaign>): Promise<boolean> => {
    // Validation
    if (!campaignData.name?.trim()) {
      addToast('Validation error: Campaign name cannot be empty.', 'error');
      return false;
    }
    if (!campaignData.keyword?.trim()) {
      addToast('Validation error: Trigger keyword is required.', 'error');
      return false;
    }
    if (!campaignData.message?.trim()) {
      addToast('Validation error: Direct message copy cannot be empty.', 'error');
      return false;
    }
    if (!campaignData.link?.trim()) {
      addToast('Validation error: Destination URL link is required.', 'error');
      return false;
    }

    let desiredStatus: 'active' | 'paused' = campaignData.status || 'active';
    if (desiredStatus === 'active' && !campaignData.setupVerified) {
      addToast('Setup not verified. Campaign will be saved as draft/paused.', 'info');
      desiredStatus = 'paused';
    }

    const selectedPost = posts.find((p) => p.id === campaignData.postId) || posts[0];

    const payload = {
      id: editingCampaign?.id || `camp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: campaignData.name.trim(),
      status: desiredStatus,
      postId: selectedPost.id,
      postThumbnail: selectedPost.thumbnail,
      postCaption: selectedPost.caption,
      keyword: campaignData.keyword.trim().toUpperCase(),
      matchType: campaignData.matchType || 'contains',
      caseInsensitive: campaignData.caseInsensitive ?? true,
      sendOncePerUser: campaignData.sendOncePerUser ?? true,
      message: campaignData.message.trim(),
      link: campaignData.link.trim(),
      offer: campaignData.offer?.trim() || '',
      publicCommentReply: campaignData.publicCommentReply?.trim() || 'Sent you a DM! Check your inbox 🚀',
      callToAction: campaignData.callToAction?.trim() || 'Click to Access',
      qualificationQuestions: campaignData.qualificationQuestions || [],
      setupVerified: campaignData.setupVerified ?? true,
      commentsCount: editingCampaign?.commentsCount || 0,
      dmsSentCount: editingCampaign?.dmsSentCount || 0,
      clicksCount: editingCampaign?.clicksCount || 0,
    };

    if (isDemoMode) {
      const demoCampaign: Campaign = {
        ...payload,
        createdAt: editingCampaign?.createdAt || new Date().toISOString().split('T')[0],
      };
      if (editingCampaign?.id) {
        setCampaigns((prev) => prev.map((c) => (c.id === editingCampaign.id ? demoCampaign : c)));
      } else {
        setCampaigns((prev) => [demoCampaign, ...prev]);
      }
      addToast(`[Demo Mode] Campaign "${payload.name}" saved in-memory.`);
      closeEditor();
      return true;
    }

    // Live PostgreSQL Mode
    try {
      const res = await apiSaveCampaign(payload);
      if (res?.campaign) {
        const savedCampaign = mapCampaignFromDb(res.campaign);
        if (editingCampaign?.id) {
          setCampaigns((prev) => prev.map((c) => (c.id === editingCampaign.id ? savedCampaign : c)));
        } else {
          setCampaigns((prev) => [savedCampaign, ...prev]);
        }
        addToast(`Campaign "${savedCampaign.name}" saved to PostgreSQL!`, 'success');
        closeEditor();
        return true;
      }
      throw new Error('Server returned empty campaign response.');
    } catch (err: any) {
      console.error('[Save Campaign Error]', err);
      const msg = err.message || 'Failed to save campaign to PostgreSQL';
      setDbError(msg);
      addToast(`Database Error: ${msg}`, 'error');
      return false;
    }
  };

  const toggleCampaignStatus = async (id: string) => {
    const camp = campaigns.find((c) => c.id === id);
    if (!camp) return;

    const nextStatus = camp.status === 'active' ? 'paused' : 'active';

    if (nextStatus === 'active' && !camp.setupVerified) {
      addToast('Cannot activate: Setup is not verified. Please review and verify configuration.', 'error');
      openEditCampaign(camp);
      return;
    }

    if (isDemoMode) {
      setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c)));
      addToast(`[Demo] Campaign status changed to ${nextStatus}.`);
      return;
    }

    try {
      await apiUpdateCampaignStatus(id, nextStatus);
      setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c)));
      addToast(`Campaign status changed to ${nextStatus}.`);
    } catch (err: any) {
      addToast(`Failed to update status: ${err.message}`, 'error');
    }
  };

  const duplicateCampaign = async (id: string) => {
    const original = campaigns.find((c) => c.id === id);
    if (!original) return;

    const newName = `${original.name} (Copy)`;
    const newKeyword = `${original.keyword}_COPY`;

    await saveCampaign({
      ...original,
      id: '',
      name: newName,
      keyword: newKeyword,
      status: 'paused',
      commentsCount: 0,
      dmsSentCount: 0,
      clicksCount: 0,
    });
  };

  const deleteCampaign = async (id: string) => {
    if (isDemoMode) {
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      addToast('[Demo] Campaign deleted.');
      return;
    }

    try {
      await apiDeleteCampaign(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      addToast('Campaign deleted from PostgreSQL.');
    } catch (err: any) {
      addToast(`Failed to delete campaign: ${err.message}`, 'error');
    }
  };

  // --------------------------------------------------------------------------
  // Message Template Operations
  // --------------------------------------------------------------------------
  const saveTemplate = async (templateData: Partial<Template>) => {
    if (!templateData.title?.trim() || !templateData.message?.trim()) {
      addToast('Template title and message cannot be empty.', 'error');
      return;
    }

    const payload = {
      id: templateData.id || `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: templateData.title.trim(),
      category: (templateData.category as TemplateCategory) || 'ebook',
      keywordSuggestion: templateData.keywordSuggestion || 'LINK',
      offer: templateData.offer || '',
      message: templateData.message.trim(),
      publicCommentReply: templateData.publicCommentReply || 'Check your DMs! 🚀',
      callToAction: templateData.callToAction || 'View Link',
      defaultLink: templateData.defaultLink || 'https://example.com',
      description: templateData.description || 'Custom reusable DM flow',
      qualificationQuestions: templateData.qualificationQuestions || [],
    };

    if (isDemoMode) {
      const demoTpl: Template = {
        ...payload,
        usageCount: 0,
      };
      setTemplates((prev) => [demoTpl, ...prev]);
      addToast(`[Demo] Template "${payload.title}" created.`);
      return;
    }

    try {
      const res = await apiSaveTemplate(payload);
      if (res?.template) {
        setTemplates((prev) => [mapTemplateFromDb(res.template), ...prev]);
        addToast(`Template "${payload.title}" saved to PostgreSQL!`, 'success');
      }
    } catch (err: any) {
      addToast(`Failed to save template: ${err.message}`, 'error');
    }
  };

  const deleteTemplate = async (id: string) => {
    if (isDemoMode) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      addToast('[Demo] Template removed.', 'info');
      return;
    }

    try {
      await apiDeleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      addToast('Template removed from PostgreSQL.', 'info');
    } catch (err: any) {
      addToast(`Failed to remove template: ${err.message}`, 'error');
    }
  };

  const duplicateTemplate = (id: string) => {
    const original = templates.find((t) => t.id === id);
    if (!original) return;
    saveTemplate({
      ...original,
      id: '',
      title: `${original.title} (Copy)`,
    });
  };

  const applyTemplateToNewCampaign = (tpl: Template) => {
    openCreateCampaign({
      name: `${tpl.title} Campaign`,
      keyword: tpl.keywordSuggestion,
      offer: tpl.offer,
      publicCommentReply: tpl.publicCommentReply,
      callToAction: tpl.callToAction,
      message: tpl.message,
      link: tpl.defaultLink,
      qualificationQuestions: tpl.qualificationQuestions,
      setupVerified: false,
    });
    navigateTo('campaigns');
  };

  // Keyword Matching
  const matchKeyword = (
    comment: string,
    keywordRule: string,
    matchType: 'exact' | 'contains',
    caseInsensitive: boolean
  ): { matched: boolean; detectedKeyword: string } => {
    const keywords = keywordRule.split(',').map((k) => k.trim()).filter(Boolean);
    const textToSearch = caseInsensitive ? comment.toLowerCase() : comment;

    for (const kw of keywords) {
      const targetKw = caseInsensitive ? kw.toLowerCase() : kw;
      if (matchType === 'exact') {
        const cleanComment = textToSearch.replace(/[^\w\s]/gi, '').trim();
        if (cleanComment === targetKw || cleanComment === targetKw.replace(/[^\w\s]/gi, '')) {
          return { matched: true, detectedKeyword: kw };
        }
      } else {
        if (textToSearch.includes(targetKw)) {
          return { matched: true, detectedKeyword: kw };
        }
      }
    }
    return { matched: false, detectedKeyword: '' };
  };

  // --------------------------------------------------------------------------
  // Simulator Execution
  // --------------------------------------------------------------------------
  const runSimulator = async (
    rawUsername: string,
    commentText: string,
    specificCampaignId?: string
  ): Promise<SimulatorExecutionResult> => {
    const cleanUsername = rawUsername.replace(/^@/, '').trim() || 'simulator_user';
    const cleanComment = commentText.trim();
    const commentId = 'cmt_' + Date.now();

    // Exactly-once check
    if (repliedComments.has(cleanUsername.toLowerCase())) {
      const errorReason = `Duplicate blocked: Private reply already sent to @${cleanUsername}. Meta strictly enforces exactly-once messaging.`;
      addToast(errorReason, 'error');
      return {
        success: false,
        username: cleanUsername,
        comment: cleanComment,
        steps: [
          { id: 'detect', label: 'Keyword detected', status: 'completed', detail: 'Comment received' },
          { id: 'match', label: 'Campaign matched', status: 'completed', detail: 'Campaign rule triggered' },
          { id: 'prepare', label: 'Eligibility check', status: 'failed', detail: 'Duplicate blocked' },
          { id: 'send', label: 'Send reply', status: 'failed', detail: 'Meta exactly-once rule enforced' },
        ],
        errorReason,
      };
    }

    let targetCampaign: Campaign | undefined;
    let matchedKw = '';

    if (specificCampaignId) {
      targetCampaign = campaigns.find((c) => c.id === specificCampaignId);
      if (targetCampaign) {
        const { matched, detectedKeyword } = matchKeyword(
          cleanComment,
          targetCampaign.keyword,
          targetCampaign.matchType,
          targetCampaign.caseInsensitive
        );
        matchedKw = matched ? detectedKeyword : targetCampaign.keyword.split(',')[0].trim();
      }
    } else {
      for (const camp of campaigns.filter((c) => c.status === 'active')) {
        const { matched, detectedKeyword } = matchKeyword(
          cleanComment,
          camp.keyword,
          camp.matchType,
          camp.caseInsensitive
        );
        if (matched) {
          targetCampaign = camp;
          matchedKw = detectedKeyword;
          break;
        }
      }
    }

    if (!targetCampaign) {
      const activeCamps = campaigns.filter((c) => c.status === 'active');
      if (activeCamps.length === 0) {
        const err = 'No active campaigns found. Please activate or create a campaign first.';
        addToast(err, 'error');
        return {
          success: false,
          username: cleanUsername,
          comment: cleanComment,
          steps: [
            { id: 'detect', label: 'Comment received', status: 'completed' },
            { id: 'match', label: 'Campaign match', status: 'failed', detail: 'No active campaign found' },
            { id: 'prepare', label: 'DM prepared', status: 'pending' },
            { id: 'send', label: 'Delivery', status: 'pending' },
          ],
          errorReason: err,
        };
      }
      targetCampaign = activeCamps[0];
      matchedKw = targetCampaign.keyword.split(',')[0].trim();
    }

    repliedComments.add(cleanUsername.toLowerCase());

    const firstName = cleanUsername.split('_')[0].split('.')[0];
    const preparedMessage = (targetCampaign.message || 'Hello {{username}}! Here is your link: {{link}}')
      .replace(/{{username}}/g, `@${cleanUsername}`)
      .replace(/{{first_name}}/g, firstName.charAt(0).toUpperCase() + firstName.slice(1))
      .replace(/{{link}}/g, targetCampaign.link || 'https://example.com/guide');

    const activityId = 'log_' + Date.now();
    const newLog: ActivityLog = {
      id: activityId,
      timestamp: 'Just now',
      username: cleanUsername,
      comment: cleanComment,
      campaignId: targetCampaign.id,
      campaignName: targetCampaign.name,
      matchedKeyword: matchedKw,
      dmMessage: preparedMessage,
      link: targetCampaign.link,
      status: isDemoMode ? 'Demo mode' : 'Sent successfully',
      clicked: false,
      responseTimeMs: Math.floor(650 + Math.random() * 400),
    };

    setActivityLogs((prev) => [newLog, ...prev]);

    // Update campaign metrics
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === targetCampaign?.id
          ? { ...c, commentsCount: c.commentsCount + 1, dmsSentCount: c.dmsSentCount + 1 }
          : c
      )
    );

    // Record lead in CRM
    const newLeadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
      username: cleanUsername,
      comment: cleanComment,
      commentId,
      commentTime: 'Just now',
      campaignId: targetCampaign.id,
      campaignName: targetCampaign.name,
      matchedKeyword: matchedKw,
      dmSent: preparedMessage,
      link: targetCampaign.link,
      status: 'New',
      notes: `Automated simulator comment trigger: "${cleanComment}"`,
      source: `Simulator: ${targetCampaign.name}`,
      postThumbnail: targetCampaign.postThumbnail,
      timeline: [
        { stage: 'Comment detected', timestamp: new Date().toLocaleTimeString(), detail: `Comment parsed: "${cleanComment}"`, success: true },
        { stage: 'Campaign matched', timestamp: new Date().toLocaleTimeString(), detail: `Matched campaign "${targetCampaign.name}" on "${matchedKw}"`, success: true },
        { stage: 'Eligibility checked', timestamp: new Date().toLocaleTimeString(), detail: 'Fresh comment & exactly-once verified', success: true },
        { stage: 'Message prepared', timestamp: new Date().toLocaleTimeString(), detail: 'Template rendered with user variables', success: true },
        { stage: 'Sent', timestamp: new Date().toLocaleTimeString(), detail: `Dispatched private reply via Graph API`, success: true },
        { stage: 'Result recorded', timestamp: new Date().toLocaleTimeString(), detail: 'Recorded in PostgreSQL Lead Inbox', success: true },
      ],
    };

    addLead(newLeadData);

    // If live PostgreSQL mode: record comment and DM event to database
    if (!isDemoMode && user) {
      apiRecordCommentEvent({
        igUserId: 'ig_connected_user',
        commentId,
        commenterUsername: cleanUsername,
        commentText: cleanComment,
        commentTimestamp: new Date(),
        isEligible: true,
        matchedCampaignId: targetCampaign.id,
        matchedKeyword: matchedKw,
        status: 'processed',
      }).catch((err) => console.error('[Event Record Error]', err));

      apiRecordDmEvent({
        campaignId: targetCampaign.id,
        commentId,
        recipientUsername: cleanUsername,
        messageText: preparedMessage,
        status: 'Sent successfully',
        mode: 'live',
      }).catch((err) => console.error('[DM Event Record Error]', err));

      // Persist incremented campaign counter to DB
      apiSaveCampaign({
        ...targetCampaign,
        commentsCount: targetCampaign.commentsCount + 1,
        dmsSentCount: targetCampaign.dmsSentCount + 1,
      }).catch(() => {});
    }

    return {
      success: true,
      username: cleanUsername,
      comment: cleanComment,
      steps: [
        { id: 'detect', label: 'Comment detected', status: 'completed', detail: `Keyword "${matchedKw}" found` },
        { id: 'match', label: 'Campaign matched', status: 'completed', detail: `Triggered "${targetCampaign.name}"` },
        { id: 'prepare', label: 'Message prepared', status: 'completed', detail: `Personalized for @${cleanUsername}` },
        { id: 'send', label: isDemoMode ? 'Demo reply delivered' : 'Delivered & Saved to DB', status: 'completed', detail: 'Recorded in PostgreSQL' },
      ],
      matchedCampaign: targetCampaign,
      matchedKeyword: matchedKw,
      preparedMessage,
      deliveredLink: targetCampaign.link,
      activityId,
    };
  };

  const recordLinkClick = (logId: string) => {
    let affectedCampaignId = '';
    setActivityLogs((prev) =>
      prev.map((log) => {
        if (log.id === logId && !log.clicked) {
          affectedCampaignId = log.campaignId;
          return { ...log, clicked: true, clickTimestamp: 'Just now' };
        }
        return log;
      })
    );
    if (affectedCampaignId) {
      recordTrackedClick(affectedCampaignId, undefined, 'Test Simulator Link');
    }
  };

  const recordTrackedClick = (campaignId: string, leadId?: string, referrer = 'Tracked Redirect (Direct Message)') => {
    const camp = campaigns.find((c) => c.id === campaignId);
    const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const newClick: TrackedClickEvent = {
      id: 'clk_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      timestamp: nowIso,
      rawTime: Date.now(),
      campaignId,
      campaignName: camp?.name || 'Active Campaign',
      leadId,
      username: leadId ? 'user' : 'instagram_follower',
      destinationUrl: camp?.link || 'https://example.com',
      referrer,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Instagram Mobile Webview',
    };

    setTrackedClicks((prev) => [newClick, ...prev]);

    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, clicksCount: c.clicksCount + 1 } : c))
    );

    addToast(`Link click recorded for campaign "${camp?.name || campaignId}"!`, 'success');
  };

  const updateFollowUpTemplate = (id: string, newText: string, newTitle?: string) => {
    setFollowUpTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, templateText: newText, title: newTitle || t.title } : t))
    );
    addToast('Follow-up template saved.', 'success');
  };

  const approveAndSendFollowUp = (
    leadId: string,
    message: string,
    templateCategory: FollowUpTemplateCategory,
    verifiedFactsUsed: string[],
    aiReasoning: string
  ) => {
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) return;

    const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const outboundRecord: OutboundFollowUpRecord = {
      id: 'fup_out_' + Date.now(),
      leadId,
      username: targetLead.username,
      templateCategory,
      finalMessage: message,
      verifiedFactsUsed,
      aiReasoning,
      approvedByUser: true,
      sentAt: nowIso,
      metaDeliveryStatus: 'Sent successfully',
    };

    setOutboundFollowUps((prev) => [outboundRecord, ...prev]);

    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              status: 'Needs follow-up' as const,
              notes: (l.notes ? l.notes + '\n' : '') + `[Follow-up Approved ${new Date().toLocaleTimeString()}]: "${message.slice(0, 60)}..."`,
              updatedAt: nowIso,
            }
          : l
      )
    );

    addToast(`Follow-up sent to @${targetLead.username}!`, 'success');
  };

  const resetAllData = () => {
    setCampaigns(INITIAL_CAMPAIGNS);
    setTemplates(INITIAL_TEMPLATES);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setLeads(INITIAL_LEADS);
    setTrackedClicks(INITIAL_TRACKED_CLICKS);
    setIsInstagramConnected(false);
    addToast('Sample datasets restored in Demo Mode.', 'info');
  };

  const seedDemoActivity = () => {
    const sampleNames = ['priya_creator', 'kabir_growth', 'shreya_design', 'tanmay_ai', 'aarav_scale'];
    const randomUser = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const activeCamps = campaigns.filter((c) => c.status === 'active');
    const selectedCamp = activeCamps[Math.floor(Math.random() * activeCamps.length)] || campaigns[0];
    const kw = selectedCamp ? selectedCamp.keyword.split(',')[0].trim() : 'PDF';

    runSimulator(randomUser, `Hey! Commenting "${kw}" please send the link`, selectedCamp?.id);
    addToast(`New simulated follower comment received from @${randomUser}!`);
  };

  const addErrorLog = (logData: Omit<InstagramErrorLog, 'id' | 'timestamp'>) => {
    const newLog: InstagramErrorLog = {
      ...logData,
      id: 'err_' + Date.now(),
      timestamp: 'Just now',
    };
    setErrorLogs((prev) => [newLog, ...prev]);
  };

  const clearErrorLogs = () => {
    setErrorLogs([]);
    addToast('Instagram error logs cleared.', 'info');
  };

  const totalComments = campaigns.reduce((acc, c) => acc + (c.commentsCount || 0), 0);
  const totalDMsSent = campaigns.reduce((acc, c) => acc + (c.dmsSentCount || 0), 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + (c.clicksCount || 0), 0);
  const activeCampaignsCount = campaigns.filter((c) => c.status === 'active').length;

  const instagramStatus: AppStatus = isInstagramConnected ? 'Connected' : 'Setup required';

  return (
    <AppContext.Provider
      value={{
        user,
        activeTab,
        setActiveTab,
        navigateTo,
        signup,
        login,
        logout,
        forgotPassword,
        authRedirectNotice,
        clearAuthNotice,
        campaigns,
        templates,
        posts,
        activityLogs,
        errorLogs,
        leads,
        addLead,
        updateLeadStatus,
        updateLeadNotes,
        deleteLead,
        addErrorLog,
        clearErrorLogs,
        isInstagramConnected,
        instagramStatus,
        toggleInstagramConnection,
        isEditorOpen,
        editingCampaign,
        openCreateCampaign,
        openEditCampaign,
        closeEditor,
        saveCampaign,
        toggleCampaignStatus,
        duplicateCampaign,
        deleteCampaign,
        saveTemplate,
        deleteTemplate,
        duplicateTemplate,
        applyTemplateToNewCampaign,
        runSimulator,
        recordLinkClick,
        trackedClicks,
        recordTrackedClick,
        followUpTemplates,
        updateFollowUpTemplate,
        outboundFollowUps,
        approveAndSendFollowUp,
        resetAllData,
        seedDemoActivity,
        toasts,
        addToast,
        removeToast,
        totalComments,
        totalDMsSent,
        totalClicks,
        activeCampaignsCount,
        isDemoMode,
        enterDemoMode,
        exitDemoMode,
        dbError,
        clearDbError,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
