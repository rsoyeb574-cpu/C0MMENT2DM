import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Campaign,
  Template,
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
} from '../types';
import {
  INITIAL_CAMPAIGNS,
  INITIAL_POSTS,
  INITIAL_TEMPLATES,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_ERROR_LOGS,
  INITIAL_LEADS,
} from '../data/mockData';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface StoredAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  createdAt: string;
  plan: 'Free' | 'Pro' | 'Business';
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
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLeadStatus: (leadId: string, status: LeadStatus) => void;
  updateLeadNotes: (leadId: string, notes: string) => void;
  deleteLead: (leadId: string) => void;
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
  saveCampaign: (campaignData: Partial<Campaign>) => boolean;
  toggleCampaignStatus: (id: string) => void;
  duplicateCampaign: (id: string) => void;
  deleteCampaign: (id: string) => void;
  saveTemplate: (templateData: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => void;
  applyTemplateToNewCampaign: (template: Template) => void;
  runSimulator: (username: string, commentText: string, specificCampaignId?: string) => Promise<SimulatorExecutionResult>;
  recordLinkClick: (logId: string) => void;
  resetAllData: () => void;
  seedDemoActivity: () => void;
  toasts: ToastItem[];
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  totalComments: number;
  totalDMsSent: number;
  totalClicks: number;
  activeCampaignsCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS_DB: 'comment2dm_users_db_v2',
  AUTH_USER: 'comment2dm_auth_user_v2',
  CAMPAIGNS: 'comment2dm_campaigns_v2',
  TEMPLATES: 'comment2dm_templates_v2',
  LOGS: 'comment2dm_logs_v2',
  ERRORS: 'comment2dm_errors_v2',
  LEADS: 'comment2dm_leads_v2',
  IG_CONNECTED: 'comment2dm_ig_connected_v2',
};

const DEFAULT_DEMO_ACCOUNT: StoredAccount = {
  id: 'user_demo_01',
  name: 'Creator Studio',
  email: 'demo@comment2dm.com',
  passwordHash: 'demo123456',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  createdAt: '2026-03-01',
  plan: 'Pro',
};

const PROTECTED_TABS: ActiveTab[] = [
  'dashboard',
  'campaigns',
  'inbox',
  'onboarding',
  'simulator',
  'templates',
  'analytics',
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
    case 'instagram':
      return 'instagram';
    case 'settings':
      return 'settings';
    default:
      return 'landing';
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Initial Users Database
  const [usersDb, setUsersDb] = useState<StoredAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS_DB);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [DEFAULT_DEMO_ACCOUNT];
  });

  // 2. Initial Auth User
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return null;
  });

  const [authRedirectNotice, setAuthRedirectNotice] = useState<string | null>(null);

  // 3. Tab & Routing state
  const [activeTab, setActiveTabState] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined') {
      const initialTab = getTabFromPath(window.location.pathname);
      if (PROTECTED_TABS.includes(initialTab)) {
        try {
          const authUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
          if (!authUser) {
            return 'login';
          }
        } catch {}
      }
      return initialTab;
    }
    return 'landing';
  });

  const [posts] = useState<InstagramPost[]>(INITIAL_POSTS);

  // User-isolated state loaders
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      const authUser = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.AUTH_USER) : null;
      const parsedUser = authUser ? JSON.parse(authUser) : null;
      const userId = parsedUser?.id || 'demo';
      const saved = localStorage.getItem(`${STORAGE_KEYS.CAMPAIGNS}_${userId}`);
      return saved ? JSON.parse(saved) : (userId === 'user_demo_01' || userId === 'demo' ? INITIAL_CAMPAIGNS : []);
    } catch {
      return INITIAL_CAMPAIGNS;
    }
  });

  const [templates, setTemplates] = useState<Template[]>(() => {
    try {
      const authUser = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.AUTH_USER) : null;
      const parsedUser = authUser ? JSON.parse(authUser) : null;
      const userId = parsedUser?.id || 'demo';
      const saved = localStorage.getItem(`${STORAGE_KEYS.TEMPLATES}_${userId}`);
      return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
    } catch {
      return INITIAL_TEMPLATES;
    }
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const authUser = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.AUTH_USER) : null;
      const parsedUser = authUser ? JSON.parse(authUser) : null;
      const userId = parsedUser?.id || 'demo';
      const saved = localStorage.getItem(`${STORAGE_KEYS.LOGS}_${userId}`);
      return saved ? JSON.parse(saved) : (userId === 'user_demo_01' || userId === 'demo' ? INITIAL_ACTIVITY_LOGS : []);
    } catch {
      return INITIAL_ACTIVITY_LOGS;
    }
  });

  const [errorLogs, setErrorLogs] = useState<InstagramErrorLog[]>(() => {
    try {
      const authUser = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.AUTH_USER) : null;
      const parsedUser = authUser ? JSON.parse(authUser) : null;
      const userId = parsedUser?.id || 'demo';
      const saved = localStorage.getItem(`${STORAGE_KEYS.ERRORS}_${userId}`);
      return saved ? JSON.parse(saved) : INITIAL_ERROR_LOGS;
    } catch {
      return INITIAL_ERROR_LOGS;
    }
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const authUser = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.AUTH_USER) : null;
      const parsedUser = authUser ? JSON.parse(authUser) : null;
      const userId = parsedUser?.id || 'demo';
      const saved = localStorage.getItem(`${STORAGE_KEYS.LEADS}_${userId}`);
      return saved ? JSON.parse(saved) : (userId === 'user_demo_01' || userId === 'demo' ? INITIAL_LEADS : []);
    } catch {
      return INITIAL_LEADS;
    }
  });

  const [isInstagramConnected, setIsInstagramConnected] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.IG_CONNECTED);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Track replied comment IDs in session to enforce Meta's exactly-once rule
  const [repliedComments] = useState<Set<string>>(() => new Set(['cmt_1001', 'cmt_1002', 'cmt_1003', 'cmt_1004', 'cmt_1005']));

  // Load user-isolated workspace when active user changes
  useEffect(() => {
    const userId = user?.id || 'demo';
    try {
      const savedCamps = localStorage.getItem(`${STORAGE_KEYS.CAMPAIGNS}_${userId}`);
      if (savedCamps) {
        setCampaigns(JSON.parse(savedCamps));
      } else {
        setCampaigns(userId === 'user_demo_01' || userId === 'demo' ? INITIAL_CAMPAIGNS : []);
      }
    } catch {}

    try {
      const savedTpls = localStorage.getItem(`${STORAGE_KEYS.TEMPLATES}_${userId}`);
      if (savedTpls) {
        setTemplates(JSON.parse(savedTpls));
      } else {
        setTemplates(INITIAL_TEMPLATES);
      }
    } catch {}

    try {
      const savedLogs = localStorage.getItem(`${STORAGE_KEYS.LOGS}_${userId}`);
      if (savedLogs) {
        setActivityLogs(JSON.parse(savedLogs));
      } else {
        setActivityLogs(userId === 'user_demo_01' || userId === 'demo' ? INITIAL_ACTIVITY_LOGS : []);
      }
    } catch {}

    try {
      const savedErrors = localStorage.getItem(`${STORAGE_KEYS.ERRORS}_${userId}`);
      if (savedErrors) {
        setErrorLogs(JSON.parse(savedErrors));
      } else {
        setErrorLogs(INITIAL_ERROR_LOGS);
      }
    } catch {}

    try {
      const savedLeads = localStorage.getItem(`${STORAGE_KEYS.LEADS}_${userId}`);
      if (savedLeads) {
        setLeads(JSON.parse(savedLeads));
      } else {
        setLeads(userId === 'user_demo_01' || userId === 'demo' ? INITIAL_LEADS : []);
      }
    } catch {}
  }, [user?.id]);

  // Persist Users DB & Auth User
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(usersDb));
    } catch {}
  }, [usersDb]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      }
    } catch {}
  }, [user]);

  // Persist user-isolated state
  useEffect(() => {
    const userId = user?.id || 'demo';
    try {
      localStorage.setItem(`${STORAGE_KEYS.CAMPAIGNS}_${userId}`, JSON.stringify(campaigns));
    } catch {}
  }, [campaigns, user?.id]);

  useEffect(() => {
    const userId = user?.id || 'demo';
    try {
      localStorage.setItem(`${STORAGE_KEYS.TEMPLATES}_${userId}`, JSON.stringify(templates));
    } catch {}
  }, [templates, user?.id]);

  useEffect(() => {
    const userId = user?.id || 'demo';
    try {
      localStorage.setItem(`${STORAGE_KEYS.LOGS}_${userId}`, JSON.stringify(activityLogs));
    } catch {}
  }, [activityLogs, user?.id]);

  useEffect(() => {
    const userId = user?.id || 'demo';
    try {
      localStorage.setItem(`${STORAGE_KEYS.ERRORS}_${userId}`, JSON.stringify(errorLogs));
    } catch {}
  }, [errorLogs, user?.id]);

  useEffect(() => {
    const userId = user?.id || 'demo';
    try {
      localStorage.setItem(`${STORAGE_KEYS.LEADS}_${userId}`, JSON.stringify(leads));
    } catch {}
  }, [leads, user?.id]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.IG_CONNECTED, JSON.stringify(isInstagramConnected));
    } catch {}
  }, [isInstagramConnected]);

  const instagramStatus: AppStatus = isInstagramConnected ? 'Connected' : 'Setup required';

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = 'toast_' + Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
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

  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      const url = tab === 'landing' ? '/' : `/${tab}`;
      window.history.pushState({}, '', url);
    }
  };

  const navigateTo = (tab: ActiveTab) => {
    if (PROTECTED_TABS.includes(tab) && !user) {
      setAuthRedirectNotice(`Please sign in to access ${tab.charAt(0).toUpperCase() + tab.slice(1)}.`);
      setActiveTab('login');
      return;
    }
    setActiveTab(tab);
  };

  const clearAuthNotice = () => setAuthRedirectNotice(null);

  // Authentication
  const signup = async (name: string, email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim()) return { success: false, error: 'Full name is required.' };
    if (!cleanEmail || !cleanEmail.includes('@')) return { success: false, error: 'Valid email address is required.' };
    if (!pass || pass.length < 6) return { success: false, error: 'Password must be at least 6 characters long.' };

    const existing = usersDb.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    const newAccount: StoredAccount = {
      id: 'user_' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      passwordHash: pass,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString().split('T')[0],
      plan: 'Free',
    };

    setUsersDb((prev) => [...prev, newAccount]);
    const loggedUser: User = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      avatar: newAccount.avatar,
      createdAt: newAccount.createdAt,
      plan: newAccount.plan,
    };
    setUser(loggedUser);
    addToast(`Welcome to Comment2DM, ${loggedUser.name}! Let's build your first campaign.`);
    setActiveTab('onboarding');
    return { success: true };
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !pass) return { success: false, error: 'Email and password are required.' };

    const matched = usersDb.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!matched) {
      return { success: false, error: 'No account found with this email. Please check spelling or sign up.' };
    }

    if (matched.passwordHash !== pass) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const loggedUser: User = {
      id: matched.id,
      name: matched.name,
      email: matched.email,
      avatar: matched.avatar,
      createdAt: matched.createdAt,
      plan: matched.plan,
    };
    setUser(loggedUser);
    addToast(`Signed in as ${loggedUser.name}.`);
    setActiveTab('dashboard');
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setActiveTab('landing');
    addToast('Signed out successfully.', 'info');
  };

  const forgotPassword = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const matched = usersDb.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!matched) {
      return { success: false, error: 'Email address not found.' };
    }
    return { success: true, message: `Password reset instructions sent to ${cleanEmail}.` };
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

  // Lead Inbox Operations
  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newLead: Lead = {
      ...leadData,
      id: 'lead_' + Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    setLeads((prev) => [newLead, ...prev]);
    addToast(`New lead added to Lead Inbox: @${newLead.username}`);
  };

  const updateLeadStatus = (leadId: string, status: LeadStatus) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status, updatedAt: now } : l))
    );
    addToast(`Lead status updated to ${status}.`);
  };

  const updateLeadNotes = (leadId: string, notes: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, notes, updatedAt: now } : l))
    );
    addToast('Lead notes saved.', 'info');
  };

  const deleteLead = (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    addToast('Lead removed from inbox.', 'info');
  };

  // Campaign Management
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

  const saveCampaign = (campaignData: Partial<Campaign>): boolean => {
    // Client-side validation
    if (!campaignData.name?.trim()) {
      addToast('Validation error: Campaign name cannot be empty.', 'error');
      return false;
    }
    if (!campaignData.keyword?.trim()) {
      addToast('Validation error: At least one trigger keyword is required.', 'error');
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

    // Never activate unless setup is verified
    let desiredStatus: 'active' | 'paused' = campaignData.status || 'active';
    if (desiredStatus === 'active' && !campaignData.setupVerified) {
      addToast('Setup not verified. Campaign saved as draft/paused until verified.', 'info');
      desiredStatus = 'paused';
    }

    if (editingCampaign?.id) {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === editingCampaign.id
            ? ({
                ...c,
                ...campaignData,
                status: desiredStatus,
              } as Campaign)
            : c
        )
      );
      addToast(`Campaign "${campaignData.name}" updated successfully.`);
    } else {
      const selectedPost = posts.find((p) => p.id === campaignData.postId) || posts[0];
      const newCampaign: Campaign = {
        id: 'camp_' + Date.now(),
        name: campaignData.name.trim(),
        postId: selectedPost.id,
        postThumbnail: selectedPost.thumbnail,
        postCaption: selectedPost.caption,
        keyword: campaignData.keyword.trim().toUpperCase(),
        matchType: campaignData.matchType || 'contains',
        caseInsensitive: campaignData.caseInsensitive ?? true,
        sendOncePerUser: campaignData.sendOncePerUser ?? true,
        offer: campaignData.offer?.trim() || '',
        publicCommentReply: campaignData.publicCommentReply?.trim() || 'Sent you a DM! Check your inbox 🚀',
        callToAction: campaignData.callToAction?.trim() || 'Click to Access',
        qualificationQuestions: campaignData.qualificationQuestions || [],
        setupVerified: campaignData.setupVerified ?? true,
        message: campaignData.message.trim(),
        link: campaignData.link.trim(),
        status: desiredStatus,
        createdAt: new Date().toISOString().split('T')[0],
        commentsCount: 0,
        dmsSentCount: 0,
        clicksCount: 0,
      };
      setCampaigns((prev) => [newCampaign, ...prev]);
      addToast(`Campaign "${newCampaign.name}" created!`);
    }

    closeEditor();
    return true;
  };

  const toggleCampaignStatus = (id: string) => {
    const camp = campaigns.find((c) => c.id === id);
    if (!camp) return;

    if (camp.status === 'paused') {
      // Check setup verification before activating
      if (!camp.setupVerified) {
        addToast('Cannot activate: Setup is not verified. Please review and verify configuration.', 'error');
        openEditCampaign(camp);
        return;
      }
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'active' } : c))
      );
      addToast(`Campaign "${camp.name}" is now Active.`);
    } else {
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'paused' } : c))
      );
      addToast(`Campaign "${camp.name}" is Paused.`, 'info');
    }
  };

  const duplicateCampaign = (id: string) => {
    const original = campaigns.find((c) => c.id === id);
    if (!original) return;

    const duplicated: Campaign = {
      ...original,
      id: 'camp_' + Date.now(),
      name: `${original.name} (Copy)`,
      status: 'paused',
      commentsCount: 0,
      dmsSentCount: 0,
      clicksCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCampaigns((prev) => [duplicated, ...prev]);
    addToast(`Duplicated campaign as "${duplicated.name}".`);
  };

  const deleteCampaign = (id: string) => {
    const toDelete = campaigns.find((c) => c.id === id);
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    addToast(`Deleted campaign "${toDelete?.name || id}".`, 'info');
  };

  // Template Management
  const saveTemplate = (templateData: Partial<Template>) => {
    if (templateData.id) {
      setTemplates((prev) =>
        prev.map((t) => (t.id === templateData.id ? ({ ...t, ...templateData } as Template) : t))
      );
      addToast(`Template updated.`);
    } else {
      const newTpl: Template = {
        id: 'tpl_' + Date.now(),
        title: templateData.title || 'Custom DM Template',
        category: templateData.category || 'ebook',
        keywordSuggestion: templateData.keywordSuggestion || 'LINK',
        offer: templateData.offer || '',
        publicCommentReply: templateData.publicCommentReply || 'Check your DMs! 🚀',
        callToAction: templateData.callToAction || 'View Link',
        message: templateData.message || 'Hey {{username}}! Here is your link: {{link}}',
        defaultLink: templateData.defaultLink || 'https://example.com',
        description: templateData.description || 'Custom reusable DM flow',
        usageCount: 0,
        qualificationQuestions: templateData.qualificationQuestions || [],
      };
      setTemplates((prev) => [newTpl, ...prev]);
      addToast(`New template "${newTpl.title}" created.`);
    }
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    addToast(`Template removed.`, 'info');
  };

  const duplicateTemplate = (id: string) => {
    const original = templates.find((t) => t.id === id);
    if (!original) return;
    const copy: Template = {
      ...original,
      id: 'tpl_' + Date.now(),
      title: `${original.title} (Copy)`,
      usageCount: 0,
    };
    setTemplates((prev) => [copy, ...prev]);
    addToast(`Template duplicated.`);
  };

  const applyTemplateToNewCampaign = (tpl: Template) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === tpl.id ? { ...t, usageCount: t.usageCount + 1 } : t))
    );
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

  // Keyword Matching Helper
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

  // Simulator Execution
  const runSimulator = async (
    rawUsername: string,
    commentText: string,
    specificCampaignId?: string
  ): Promise<SimulatorExecutionResult> => {
    const cleanUsername = rawUsername.replace(/^@/, '').trim() || 'demo_user';
    const cleanComment = commentText.trim();
    const commentId = 'cmt_' + Date.now();

    // Check duplicate prevention
    if (repliedComments.has(cleanUsername.toLowerCase())) {
      const errorReason = `Duplicate blocked: Private reply already sent to @${cleanUsername} for this campaign. Meta strictly enforces exactly-once messaging.`;
      addErrorLog({
        type: 'rule_violation',
        endpoint: 'POST /v21.0/messages',
        status: 'Failed',
        errorCode: 'META_RULE_ONCE_PER_COMMENT',
        commentId,
        reason: errorReason,
        payloadSummary: JSON.stringify({ recipient: { username: cleanUsername } }),
      });
      addToast(errorReason, 'error');

      return {
        success: false,
        username: cleanUsername,
        comment: cleanComment,
        steps: [
          { id: 'detect', label: 'Keyword detected', status: 'completed', detail: 'Comment received' },
          { id: 'match', label: 'Campaign matched', status: 'completed', detail: 'Campaign rule triggered' },
          { id: 'prepare', label: 'Eligibility check', status: 'failed', detail: 'Duplicate private reply blocked' },
          { id: 'send', label: 'Send reply', status: 'failed', detail: 'Meta exactly-once rule enforced' },
        ],
        errorReason,
      };
    }

    // Find matching campaign
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
        if (matched) {
          matchedKw = detectedKeyword;
        } else {
          matchedKw = targetCampaign.keyword.split(',')[0].trim();
        }
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

    // Handle unsupported trigger
    if (!targetCampaign) {
      const activeCamps = campaigns.filter((c) => c.status === 'active');
      if (activeCamps.length === 0) {
        const err = 'No active campaigns found. Please activate or verify a campaign first.';
        addErrorLog({
          type: 'api_call_failed',
          endpoint: 'POST /v21.0/messages',
          status: 'Needs attention',
          errorCode: 'NO_ACTIVE_CAMPAIGNS',
          reason: err,
        });
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
      .replace(/{{link}}/g, targetCampaign.link || 'https://gumroad.com/l/free-guide');

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
      status: isInstagramConnected ? 'Sent successfully' : 'Demo mode',
      clicked: false,
      responseTimeMs: Math.floor(650 + Math.random() * 400),
    };

    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === targetCampaign?.id) {
          return {
            ...c,
            commentsCount: c.commentsCount + 1,
            dmsSentCount: c.dmsSentCount + 1,
          };
        }
        return c;
      })
    );

    setActivityLogs((prev) => [newLog, ...prev]);

    // Record the lead in Lead Inbox with full 6-stage status timeline per comment
    const nowTime = new Date().toLocaleTimeString();
    const newLead: Lead = {
      id: 'lead_' + Date.now(),
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
      notes: `Automated trigger from comment: "${cleanComment}"`,
      source: `Simulator: ${targetCampaign.name}`,
      postThumbnail: targetCampaign.postThumbnail,
      timeline: [
        {
          stage: 'Comment detected',
          timestamp: nowTime,
          detail: `Comment parsed: "${cleanComment}"`,
          success: true,
        },
        {
          stage: 'Campaign matched',
          timestamp: nowTime,
          detail: `Matched campaign "${targetCampaign.name}" on keyword "${matchedKw}"`,
          success: true,
        },
        {
          stage: 'Eligibility checked',
          timestamp: nowTime,
          detail: 'Comment fresh (<7 days) and exactly-once rule checked',
          success: true,
        },
        {
          stage: 'Message prepared',
          timestamp: nowTime,
          detail: `Merged variables {{username}} and destination link`,
          success: true,
        },
        {
          stage: 'Sent',
          timestamp: nowTime,
          detail: `Dispatched private reply via Graph API: recipient.comment_id = ${commentId}`,
          success: true,
        },
        {
          stage: 'Result recorded',
          timestamp: nowTime,
          detail: 'Delivery recorded and added to Lead Inbox',
          success: true,
        },
      ],
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    setLeads((prev) => [newLead, ...prev]);

    return {
      success: true,
      username: cleanUsername,
      comment: cleanComment,
      steps: [
        { id: 'detect', label: 'Comment detected', status: 'completed', detail: `Keyword "${matchedKw}" parsed in comment` },
        { id: 'match', label: 'Campaign matched', status: 'completed', detail: `Rule matched: ${targetCampaign.name}` },
        { id: 'prepare', label: 'Eligibility checked & message prepared', status: 'completed', detail: `Personalized for @${cleanUsername}` },
        { id: 'send', label: isInstagramConnected ? 'Sent successfully' : 'Demo reply delivered', status: 'completed', detail: 'Delivered to direct inbox and recorded in Lead Inbox' },
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
          return {
            ...log,
            clicked: true,
            clickTimestamp: 'Just now',
          };
        }
        return log;
      })
    );

    if (affectedCampaignId) {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === affectedCampaignId ? { ...c, clicksCount: c.clicksCount + 1 } : c
        )
      );
      addToast('Simulated link click registered! Campaign CTR updated.', 'success');
    }
  };

  const resetAllData = () => {
    setCampaigns(INITIAL_CAMPAIGNS);
    setTemplates(INITIAL_TEMPLATES);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setErrorLogs(INITIAL_ERROR_LOGS);
    setLeads(INITIAL_LEADS);
    setIsInstagramConnected(false);
    try {
      const userId = user?.id || 'demo';
      localStorage.removeItem(`${STORAGE_KEYS.CAMPAIGNS}_${userId}`);
      localStorage.removeItem(`${STORAGE_KEYS.TEMPLATES}_${userId}`);
      localStorage.removeItem(`${STORAGE_KEYS.LOGS}_${userId}`);
      localStorage.removeItem(`${STORAGE_KEYS.ERRORS}_${userId}`);
      localStorage.removeItem(`${STORAGE_KEYS.LEADS}_${userId}`);
      localStorage.removeItem(STORAGE_KEYS.IG_CONNECTED);
    } catch {}
    addToast('Demo database restored to default sample state.', 'info');
  };

  const seedDemoActivity = () => {
    const sampleNames = ['priya_creator', 'kabir_growth', 'shreya_design', 'tanmay_ai', 'aarav_scale'];
    const randomUser = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const activeCamps = campaigns.filter((c) => c.status === 'active');
    const selectedCamp = activeCamps[Math.floor(Math.random() * activeCamps.length)] || campaigns[0];
    const kw = selectedCamp.keyword.split(',')[0].trim();

    runSimulator(randomUser, `Hey! Commenting "${kw}" please send the link`, selectedCamp.id);
    addToast(`New simulated follower comment received from @${randomUser}!`);
  };

  const totalComments = campaigns.reduce((acc, c) => acc + c.commentsCount, 0);
  const totalDMsSent = campaigns.reduce((acc, c) => acc + c.dmsSentCount, 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + c.clicksCount, 0);
  const activeCampaignsCount = campaigns.filter((c) => c.status === 'active').length;

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
        resetAllData,
        seedDemoActivity,
        toasts,
        addToast,
        removeToast,
        totalComments,
        totalDMsSent,
        totalClicks,
        activeCampaignsCount,
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
