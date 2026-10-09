import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Campaign,
  Template,
  InstagramPost,
  ActivityLog,
  ActiveTab,
  SimulatorExecutionResult,
  SimulatorStep,
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

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
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
  CAMPAIGNS: 'comment2dm_campaigns_v1',
  TEMPLATES: 'comment2dm_templates_v1',
  LOGS: 'comment2dm_logs_v1',
  IG_CONNECTED: 'comment2dm_ig_connected_v1',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('landing');
  const [posts] = useState<InstagramPost[]>(INITIAL_POSTS);

  // Initialize from localStorage or fallback to initial mock data
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

  // Persist state updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [campaigns]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [templates]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLogs));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [activityLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.IG_CONNECTED, JSON.stringify(isInstagramConnected));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [isInstagramConnected]);

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
      // Update existing
      setCampaigns((prev) =>
        prev.map((c) => (c.id === editingCampaign.id ? { ...c, ...data } : c))
      );
      addToast(`Campaign "${data.name || editingCampaign.name}" updated successfully!`);
    } else {
      // Create new
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
        prev.map((t) => (t.id === templateData.id ? { ...t, ...templateData } as Template : t))
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
    // Update usage count
    setTemplates((prev) =>
      prev.map((t) => (t.id === tpl.id ? { ...t, usageCount: t.usageCount + 1 } : t))
    );
    openCreateCampaign({
      name: `${tpl.title} Campaign`,
      keyword: tpl.keywordSuggestion,
      message: tpl.message,
      link: tpl.defaultLink,
    });
    setActiveTab('campaigns');
  };

  // Matching helper function
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
        // Strip punctuation like !?., and compare words or trimmed text
        const cleanComment = textToSearch.replace(/[^\w\s]/gi, '').trim();
        if (cleanComment === targetKw || cleanComment === targetKw.replace(/[^\w\s]/gi, '')) {
          return { matched: true, detectedKeyword: kw };
        }
      } else {
        // contains
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

    // Find candidate campaign
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
          // Fallback: check if any keyword matches
          matchedKw = targetCampaign.keyword.split(',')[0].trim();
        }
      }
    } else {
      // Find first active campaign that matches
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
      // If none found, pick the first active one or first campaign as demonstration
      targetCampaign = campaigns.find((c) => c.status === 'active') || campaigns[0];
      matchedKw = targetCampaign?.keyword.split(',')[0].trim() || 'LINK';
    }

    // Prepare message
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

    // Update campaign counts
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

    // Add activity log
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
    } catch (e) {
      console.warn(e);
    }
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

  // Aggregated metrics
  const totalComments = campaigns.reduce((acc, c) => acc + c.commentsCount, 0);
  const totalDMsSent = campaigns.reduce((acc, c) => acc + c.dmsSentCount, 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + c.clicksCount, 0);
  const activeCampaignsCount = campaigns.filter((c) => c.status === 'active').length;

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
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
