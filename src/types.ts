export type MatchType = 'exact' | 'contains';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  plan?: 'Free' | 'Pro' | 'Business';
}

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

  // Smart Campaign Builder extensions
  offer?: string;
  publicCommentReply?: string;
  callToAction?: string;
  qualificationQuestions?: string[];
  setupVerified?: boolean;
}

export type TemplateCategory =
  | 'ebook'
  | 'course'
  | 'launch'
  | 'pricing'
  | 'discount'
  | 'booking'
  | 'webinar'
  | 'service'
  | 'affiliate'
  | 'pdf'
  | 'coupon'
  | 'whatsapp'
  | 'youtube'
  | 'custom';

export interface Template {
  id: string;
  title: string;
  category: TemplateCategory;
  keywordSuggestion: string;
  offer?: string;
  message: string;
  publicCommentReply?: string;
  callToAction?: string;
  defaultLink: string;
  description: string;
  usageCount: number;
  qualificationQuestions?: string[];
}

export type AppStatus =
  | 'Demo mode'
  | 'Setup required'
  | 'Connected'
  | 'Waiting for authorization'
  | 'Processing'
  | 'Sent successfully'
  | 'Failed'
  | 'Needs attention';

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
  status: AppStatus;
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

export type ActiveTab =
  | 'landing'
  | 'dashboard'
  | 'campaigns'
  | 'inbox'
  | 'onboarding'
  | 'simulator'
  | 'templates'
  | 'analytics'
  | 'coach'
  | 'followup'
  | 'instagram'
  | 'settings'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'privacy'
  | 'terms'
  | 'data-deletion';

export interface InstagramErrorLog {
  id: string;
  timestamp: string;
  type: 'webhook_rejected' | 'api_call_failed' | 'rule_violation' | 'auth_error';
  endpoint: string;
  status: 'Failed' | 'Needs attention';
  errorCode: string;
  commentId?: string;
  reason: string;
  payloadSummary?: string;
}

// Lead Inbox Interfaces
export type LeadStatus =
  | 'New'
  | 'Interested'
  | 'Needs follow-up'
  | 'Link sent'
  | 'Converted'
  | 'Not interested';

export type LeadTimelineStage =
  | 'Comment detected'
  | 'Campaign matched'
  | 'Eligibility checked'
  | 'Message prepared'
  | 'Sent'
  | 'Result recorded';

export interface LeadTimelineEvent {
  stage: LeadTimelineStage;
  timestamp: string;
  detail: string;
  success: boolean;
}

export interface Lead {
  id: string;
  username: string;
  userAvatar?: string;
  comment: string;
  commentId: string;
  commentTime: string;
  campaignId: string;
  campaignName: string;
  matchedKeyword: string;
  dmSent: string;
  link: string;
  status: LeadStatus;
  notes: string;
  source: string;
  postThumbnail?: string;
  qualificationAnswers?: Array<{ question: string; answer: string }>;
  timeline: LeadTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

// AI Suggestion Result
export interface AISuggestionResult {
  keywords: string[];
  publicReplies: string[];
  dmMessage: string;
  callToAction: string;
  qualificationQuestions: string[];
}

// Tracked Link Redirect Click Event
export interface TrackedClickEvent {
  id: string;
  timestamp: string;
  rawTime: number;
  campaignId: string;
  campaignName: string;
  leadId?: string;
  username?: string;
  destinationUrl: string;
  referrer: string;
  userAgent?: string;
}

// Metric Reliability Labeling
export type MetricReliability = 'Measured' | 'Estimated' | 'Unavailable';

// Follow-up Assistant Types
export type FollowUpTemplateCategory =
  | 'need_details'
  | 'faq'
  | 'offer_link'
  | 'consultation'
  | 'reengage';

export interface FollowUpTemplate {
  id: string;
  title: string;
  category: FollowUpTemplateCategory;
  description: string;
  templateText: string;
  suggestedTiming: string;
}

export type MessagingWindowStatus =
  | 'active_24h'
  | 'active_7d_reply'
  | 'outside_window';

export interface OutboundFollowUpRecord {
  id: string;
  leadId: string;
  username: string;
  templateCategory: FollowUpTemplateCategory;
  finalMessage: string;
  verifiedFactsUsed: string[];
  aiReasoning: string;
  approvedByUser: boolean;
  sentAt: string;
  metaDeliveryStatus: 'Sent successfully' | 'Pending delivery' | 'Failed';
}

// Campaign Coach Types
export type CoachQuestionId =
  | 'best_campaign'
  | 'best_keywords'
  | 'lead_dropoff'
  | 'what_to_test_next';

