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
} from '../types';
import {
  INITIAL_CAMPAIGNS,
  INITIAL_POSTS,
  INITIAL_TEMPLATES,
  INITIAL_ACTIVITY_LOGS,
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
  passwordHash: string; // simulated hash/password for demo store
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
  isInstagramConnected: boolean;
  toggleInstagramConnection: () => void;
  isEditorOpen: boolean;
  editingCampaign: Campaign | null;
  openCreateCampaign: (initial?: Partial<Campaign>) => void;
  openEditCampaign: (campaign: Campaign) => void;
  closeEditor: () => void;
  saveCampaign: (campaignData: Partial<Campaign>) => void;
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
  CAMPAIGNS: 'comment2dm_campaigns_v1',
  TEMPLATES: 'comment2dm_templates_v1',
  LOGS: 'comment2dm_logs_v1',
  IG_CONNECTED: 'comment2dm_ig_connected_v1',
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
  'simulator',
  'templates',
  'analytics',
  'instagram',
  'settings',
];

// Helper to parse path into ActiveTab
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
    // Default to null so user can experience landing page / login flow, or demo user if pre-logged
    return null;
  });

  const [authRedirectNotice, setAuthRedirectNotice] = useState<string | null>(null);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<ActiveTab | null>(null);

  // 3. Tab & Routing state
  const [activeTab, setActiveTabState] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined') {
      const initialTab = getTabFromPath(window.location.pathname);
      // Check if protected and unauthenticated
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

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
      return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
    } catch {
      return INITIAL_CAMPAIGNS;
    }
  });

  const [templates, setTemplates] = useState<Template[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
    } catch {
      return INITIAL_TEMPLATES;
    }
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
    } catch {
      return INITIAL_ACTIVITY_LOGS;
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

  // Persist Users DB & Auth User
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(usersDb));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [usersDb]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      }
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [user]);

  // Persist campaigns, templates, logs, instagram state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
    } catch {}
  }, [campaigns]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    } catch {}
  }, [templates]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLogs));
    } catch {}
  }, [activityLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.IG_CONNECTED, JSON.stringify(isInstagramConnected));
    } catch {}
  }, [isInstagramConnected]);

  // Listen to browser forward/back buttons
  useEffect(() => {
    const handlePopState = () => {
      const target = getTabFromPath(window.location.pathname);
      if (PROTECTED_TABS.includes(target) && !user) {
        setAuthRedirectNotice(`Please log in to access /${target}`);
        setActiveTabState('login');
      } else {
        setActiveTabState(target);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const clearAuthNotice = () => {
    setAuthRedirectNotice(null);
  };

  // Safe navigation with route guard and history update
  const navigateTo = (tab: ActiveTab) => {
    const isProtected = PROTECTED_TABS.includes(tab);

    if (isProtected && !user) {
      setAuthRedirectNotice(`Please log in to access your ${tab} dashboard.`);
      setRedirectAfterLogin(tab);
      setActiveTabState('login');
      try {
        window.history.pushState(null, '', '/login');
      } catch {}
      return;
    }

    setAuthRedirectNotice(null);
    setActiveTabState(tab);
    try {
      const urlPath = tab === 'landing' ? '/' : `/${tab}`;
      window.history.pushState(null, '', urlPath);
    } catch {}
  };

  // Backwards compatibility alias
  const setActiveTab = (tab: ActiveTab) => {
    navigateTo(tab);
  };

  // Auth Operations
  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Artificial small delay for realistic UX feedback
    await new Promise((r) => setTimeout(r, 450));

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing
    const exists = usersDb.some((u) => u.email.toLowerCase() === normalizedEmail);
    if (exists) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    const newUser: StoredAccount = {
      id: 'user_' + Date.now(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: password,
      createdAt: new Date().toISOString().split('T')[0],
      plan: 'Free',
    };

    setUsersDb((prev) => [...prev, newUser]);

    const authenticatedUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt,
      plan: newUser.plan,
    };

    setUser(authenticatedUser);
    addToast(`Welcome to Comment2DM, ${authenticatedUser.name}!`);

    // Redirect to requested tab or dashboard
    const target = redirectAfterLogin || 'dashboard';
    setRedirectAfterLogin(null);
    navigateTo(target);

    return { success: true };
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    await new Promise((r) => setTimeout(r, 400));

    const normalizedEmail = email.toLowerCase().trim();
    const account = usersDb.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.passwordHash === password
    );

    if (!account) {
      return { success: false, error: 'Invalid email or password. Check credentials or try demo login.' };
    }

    const authenticatedUser: User = {
      id: account.id,
      name: account.name,
      email: account.email,
      avatar: account.avatar,
      createdAt: account.createdAt,
      plan: account.plan,
    };

    setUser(authenticatedUser);
    addToast(`Welcome back, ${authenticatedUser.name}!`);

    const target = redirectAfterLogin || 'dashboard';
    setRedirectAfterLogin(null);
    navigateTo(target);

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    addToast('You have been logged out.');
    navigateTo('login');
  };

  const forgotPassword = async (
    email: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    await new Promise((r) => setTimeout(r, 350));
    const normalizedEmail = email.toLowerCase().trim();
    const account = usersDb.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!account) {
      return {
        success: false,
        error: 'No account registered with this email address.',
      };
    }

    return {
      success: true,
      message: `Reset link generated for ${account.email}. You can reset your password now.`,
    };
  };

  const toggleInstagramConnection = () => {
    setIsInstagramConnected((prev) => {
      const next = !prev;
      addToast(
        next
          ? 'Instagram connected (Mock Mode)! Webhook listener ready.'
          : 'Instagram disconnected from Comment2DM.',
        next ? 'success' : 'info'
      );
      return next;
    });
  };

  const openCreateCampaign = (initial?: Partial<Campaign>) => {
    // If not logged in, prompt login
    if (!user) {
      setAuthRedirectNotice('Please log in to create and manage campaigns.');
      navigateTo('login');
      return;
    }

    setEditingCampaign(
      initial
        ? {
            id: '',
            name: initial.name || 'New Lead Magnet Campaign',
            postId: initial.postId || posts[0].id,
            postThumbnail: initial.postThumbnail || posts[0].thumbnail,
            postCaption: initial.postCaption || posts[0].caption,
            keyword: initial.keyword || 'PDF',
            matchType: initial.matchType || 'contains',
            caseInsensitive: initial.caseInsensitive ?? true,
            sendOncePerUser: initial.sendOncePerUser ?? true,
            message:
              initial.message ||
              'Hey {{username}}! 🙌 Here is the link you requested:\n\n{{link}}\n\nLet me know if you have questions!',
            link: initial.link || 'https://yourwebsite.com/guide',
            status: 'active',
            createdAt: new Date().toISOString().split('T')[0],
            commentsCount: 0,
            dmsSentCount: 0,
            clicksCount: 0,
          }
        : null
    );
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

  const saveCampaign = (data: Partial<Campaign>) => {
    if (editingCampaign && editingCampaign.id) {
      setCampaigns((prev) =>
        prev.map((c) => (c.id === editingCampaign.id ? { ...c, ...data } : c))
      );
      addToast(`Campaign "${data.name || editingCampaign.name}" updated successfully!`);
    } else {
      const matchedPost = posts.find((p) => p.id === data.postId) || posts[0];
      const newCampaign: Campaign = {
        id: 'camp_' + Date.now(),
        name: data.name || 'New Campaign',
        postId: matchedPost.id,
        postThumbnail: matchedPost.thumbnail,
        postCaption: matchedPost.caption,
        keyword: data.keyword?.trim() || 'LINK',
        matchType: data.matchType || 'contains',
        caseInsensitive: data.caseInsensitive ?? true,
        sendOncePerUser: data.sendOncePerUser ?? true,
        message:
          data.message ||
          'Hey {{username}}! Here is your link: {{link}}\n\nHope this helps! 🚀',
        link: data.link || 'https://yourwebsite.com/resource',
        status: data.status || 'active',
        createdAt: new Date().toISOString().split('T')[0],
        commentsCount: 0,
        dmsSentCount: 0,
        clicksCount: 0,
      };
      setCampaigns((prev) => [newCampaign, ...prev]);
      addToast(`Campaign "${newCampaign.name}" launched successfully!`);
    }
    closeEditor();
  };

  const toggleCampaignStatus = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newStatus = c.status === 'active' ? 'paused' : 'active';
          addToast(
            `Campaign "${c.name}" is now ${newStatus === 'active' ? 'Active' : 'Paused'}.`,
            'info'
          );
          return { ...c, status: newStatus };
        }
        return c;
      })
    );
  };

  const duplicateCampaign = (id: string) => {
    const original = campaigns.find((c) => c.id === id);
    if (!original) return;
    const duplicated: Campaign = {
      ...original,
      id: 'camp_' + Date.now(),
      name: `${original.name} (Copy)`,
      status: 'active',
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
        category: templateData.category || 'custom',
        keywordSuggestion: templateData.keywordSuggestion || 'LINK',
        message: templateData.message || 'Hey {{username}}! Here is your link: {{link}}',
        defaultLink: templateData.defaultLink || 'https://example.com',
        description: templateData.description || 'Custom reusable DM flow',
        usageCount: 0,
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
      message: tpl.message,
      link: tpl.defaultLink,
    });
    navigateTo('campaigns');
  };

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

  const runSimulator = async (
    rawUsername: string,
    commentText: string,
    specificCampaignId?: string
  ): Promise<SimulatorExecutionResult> => {
    const cleanUsername = rawUsername.replace(/^@/, '').trim() || 'demo_user';
    const cleanComment = commentText.trim();

    const steps: SimulatorStep[] = [
      { id: 'detect', label: 'Keyword detected', status: 'pending' },
      { id: 'match', label: 'Campaign matched', status: 'pending' },
      { id: 'prepare', label: 'DM prepared', status: 'pending' },
      { id: 'send', label: 'Demo DM sent', status: 'pending' },
    ];

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

    if (!targetCampaign) {
      targetCampaign = campaigns.find((c) => c.status === 'active') || campaigns[0];
      matchedKw = targetCampaign?.keyword.split(',')[0].trim() || 'LINK';
    }

    const firstName = cleanUsername.split('_')[0].split('.')[0];
    const preparedMessage = (targetCampaign?.message || 'Hello {{username}}! Here is your link: {{link}}')
      .replace(/{{username}}/g, `@${cleanUsername}`)
      .replace(/{{first_name}}/g, firstName.charAt(0).toUpperCase() + firstName.slice(1))
      .replace(/{{link}}/g, targetCampaign?.link || 'https://gumroad.com/l/free-guide');

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
      status: 'delivered',
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

    return {
      success: true,
      username: cleanUsername,
      comment: cleanComment,
      steps: [
        { id: 'detect', label: 'Keyword detected', status: 'completed', detail: `Keyword "${matchedKw}" found in comment` },
        { id: 'match', label: 'Campaign matched', status: 'completed', detail: `Rule matched: ${targetCampaign.name}` },
        { id: 'prepare', label: 'DM prepared', status: 'completed', detail: `Personalized template for @${cleanUsername}` },
        { id: 'send', label: 'Demo DM sent', status: 'completed', detail: `Delivered to direct inbox (Simulated)` },
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
      addToast('Simulated Link Click registered! Campaign CTR updated.', 'success');
    }
  };

  const resetAllData = () => {
    setCampaigns(INITIAL_CAMPAIGNS);
    setTemplates(INITIAL_TEMPLATES);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setIsInstagramConnected(false);
    try {
      localStorage.removeItem(STORAGE_KEYS.CAMPAIGNS);
      localStorage.removeItem(STORAGE_KEYS.TEMPLATES);
      localStorage.removeItem(STORAGE_KEYS.LOGS);
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
        isInstagramConnected,
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
