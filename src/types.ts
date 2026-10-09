export type MatchType = 'exact' | 'contains';

export interface InstagramPost {
  id: string;
  type: 'reel' | 'post' | 'carousel';
  caption: string;
  thumbnail: string;
  likes: number;
  comments: number;
  date: string;
  shortcode: string;
}

export interface Campaign {
  id: string;
  name: string;
  postId: string;
  postThumbnail?: string;
  postCaption?: string;
  keyword: string; // e.g. "PDF" or "GUIDE, PDF, EBOOK"
  matchType: MatchType;
  caseInsensitive: boolean;
  sendOncePerUser: boolean;
  message: string; // supports {{username}}, {{link}}, {{first_name}}
  link: string;
  status: 'active' | 'paused';
  createdAt: string;
  commentsCount: number;
  dmsSentCount: number;
  clicksCount: number;
}

export interface Template {
  id: string;
  title: string;
  category: 'pdf' | 'course' | 'affiliate' | 'coupon' | 'whatsapp' | 'youtube' | 'custom';
  keywordSuggestion: string;
  message: string;
  defaultLink: string;
  description: string;
  usageCount: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  username: string;
  comment: string;
  campaignId: string;
  campaignName: string;
  matchedKeyword: string;
  dmMessage: string;
  link: string;
  status: 'delivered' | 'skipped_duplicate' | 'no_keyword_match';
  clicked: boolean;
  clickTimestamp?: string;
  responseTimeMs: number;
}

export interface SimulatorStep {
  id: 'detect' | 'match' | 'prepare' | 'send';
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  detail?: string;
}

export interface SimulatorExecutionResult {
  success: boolean;
  username: string;
  comment: string;
  steps: SimulatorStep[];
  matchedCampaign?: Campaign;
  matchedKeyword?: string;
  preparedMessage?: string;
  deliveredLink?: string;
  activityId?: string;
  errorReason?: string;
}

export type ActiveTab = 'landing' | 'dashboard' | 'campaigns' | 'simulator' | 'templates' | 'instagram' | 'settings';
