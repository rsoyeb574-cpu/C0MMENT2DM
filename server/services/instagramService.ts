import { encryptToken, decryptToken } from './cryptoService.js';

export const INSTAGRAM_BUSINESS_SCOPES = [
  'instagram_business_basic',
  'instagram_business_manage_comments',
  'instagram_business_manage_messages',
] as const;

export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Set to track comments already replied to (prevents duplicate private replies per Instagram rules)
const repliedCommentIds = new Set<string>();

export interface InstagramCredentials {
  appId: string;
  appSecret: string;
  redirectUri: string;
  verifyToken: string;
}

export function getInstagramConfig(): InstagramCredentials {
  return {
    appId: process.env.INSTAGRAM_APP_ID || process.env.META_APP_ID || '',
    appSecret: process.env.INSTAGRAM_APP_SECRET || process.env.META_APP_SECRET || '',
    redirectUri:
      process.env.INSTAGRAM_REDIRECT_URI ||
      process.env.META_REDIRECT_URI ||
      'http://localhost:3000/api/auth/instagram/callback',
    verifyToken:
      process.env.INSTAGRAM_VERIFY_TOKEN ||
      process.env.META_VERIFY_TOKEN ||
      'comment2dm_instagram_verify_token_secure',
  };
}

export function isInstagramConfigured(): boolean {
  const cfg = getInstagramConfig();
  return Boolean(cfg.appId && cfg.appSecret);
}

/**
 * Builds the Business Login for Instagram authorization URL
 */
export function getBusinessLoginUrl(state?: string): string {
  const { appId, redirectUri } = getInstagramConfig();
  const scopeStr = INSTAGRAM_BUSINESS_SCOPES.join(',');

  const params = new URLSearchParams({
    enable_fb_login: '0',
    force_authentication: '1',
    client_id: appId || 'MOCK_APP_ID',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopeStr,
  });

  if (state) {
    params.set('state', state);
  }

  return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
}

/**
 * Exchanges the authorization code for a short-lived user access token
 */
export async function exchangeCodeForShortLivedToken(code: string): Promise<{
  accessToken: string;
  userId: string;
  permissions?: string[];
}> {
  const { appId, appSecret, redirectUri } = getInstagramConfig();

  if (!appId || !appSecret) {
    throw new Error('INSTAGRAM_APP_ID or INSTAGRAM_APP_SECRET is not configured in .env');
  }

  const body = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
    code,
  });

  const response = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to exchange code for Instagram token: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as { access_token: string; user_id: string; permissions?: string[] };
  return {
    accessToken: data.access_token,
    userId: String(data.user_id),
    permissions: data.permissions,
  };
}

/**
 * Exchanges a short-lived token for a 60-day long-lived access token
 */
export async function exchangeForLongLivedToken(shortLivedToken: string): Promise<{
  accessToken: string;
  tokenType: string;
  expiresIn: number; // 5184000 seconds = 60 days
  expiresAt: Date;
}> {
  const { appSecret } = getInstagramConfig();

  if (!appSecret) {
    throw new Error('INSTAGRAM_APP_SECRET is required to exchange for long-lived access token');
  }

  const url = new URL('https://graph.instagram.com/access_token');
  url.searchParams.set('grant_type', 'ig_exchange_token');
  url.searchParams.set('client_secret', appSecret);
  url.searchParams.set('access_token', shortLivedToken);

  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to exchange for long-lived token: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as { access_token: string; token_type: string; expires_in: number };
  const expiresAt = new Date(Date.now() + (data.expires_in || 5184000) * 1000);

  return {
    accessToken: data.access_token,
    tokenType: data.token_type || 'bearer',
    expiresIn: data.expires_in,
    expiresAt,
  };
}

/**
 * Refreshes an existing long-lived token before it expires
 */
export async function refreshLongLivedToken(longLivedToken: string): Promise<{
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: Date;
}> {
  const url = new URL('https://graph.instagram.com/refresh_access_token');
  url.searchParams.set('grant_type', 'ig_refresh_token');
  url.searchParams.set('access_token', longLivedToken);

  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to refresh Instagram long-lived token: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as { access_token: string; token_type: string; expires_in: number };
  const expiresAt = new Date(Date.now() + (data.expires_in || 5184000) * 1000);

  return {
    accessToken: data.access_token,
    tokenType: data.token_type || 'bearer',
    expiresIn: data.expires_in,
    expiresAt,
  };
}

/**
 * Fetches basic Instagram Business user profile
 */
export async function getInstagramUserProfile(accessToken: string): Promise<{
  id: string;
  username: string;
  name?: string;
  profilePictureUrl?: string;
}> {
  const url = new URL('https://graph.instagram.com/v21.0/me');
  url.searchParams.set('fields', 'id,username,name,profile_picture_url');
  url.searchParams.set('access_token', accessToken);

  const response = await fetch(url.toString());
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch Instagram profile: ${response.status} - ${errorText}`);
  }

  return (await response.json()) as {
    id: string;
    username: string;
    name?: string;
    profilePictureUrl?: string;
  };
}

export interface PrivateReplyParams {
  igUserId: string;
  commentId: string;
  messageText: string;
  commentTimestamp?: number | Date; // Date or unix ms/seconds of comment
  encryptedAccessToken?: string;
  rawAccessToken?: string;
  forceDemo?: boolean;
}

export interface PrivateReplyResult {
  success: boolean;
  mode: 'live' | 'demo';
  commentId: string;
  messageId?: string;
  recipientId?: string;
  error?: string;
  ruleViolated?: 'ONCE_PER_COMMENT' | 'EXPIRED_7_DAYS' | 'UNAUTHORIZED' | 'RATE_LIMITED';
  detail: string;
}

/**
 * Sends a Direct Message as a Private Reply via POST /<IG_USER_ID>/messages using the comment ID.
 *
 * Strict Instagram Business Rules enforced:
 * 1. Must use recipient: { comment_id }
 * 2. Sent exactly ONCE per comment ID
 * 3. Only allowed within 7 days of the comment creation timestamp
 */
export async function sendPrivateReply(params: PrivateReplyParams): Promise<PrivateReplyResult> {
  const {
    igUserId,
    commentId,
    messageText,
    commentTimestamp,
    encryptedAccessToken,
    rawAccessToken,
    forceDemo = false,
  } = params;

  if (!commentId) {
    return {
      success: false,
      mode: 'demo',
      commentId: '',
      error: 'Missing comment ID for private reply.',
      detail: 'Instagram Private Reply requires a valid comment_id.',
    };
  }

  // Rule 1 Enforcement: Check once per comment rule
  if (repliedCommentIds.has(commentId)) {
    return {
      success: false,
      mode: 'demo',
      commentId,
      ruleViolated: 'ONCE_PER_COMMENT',
      error: `Private reply already sent for comment ${commentId}.`,
      detail:
        'Instagram limits private replies to exactly once per comment ID. Secondary attempts are blocked.',
    };
  }

  // Rule 2 Enforcement: Check 7 days limit rule
  if (commentTimestamp) {
    const timestampMs =
      typeof commentTimestamp === 'number'
        ? commentTimestamp < 10000000000
          ? commentTimestamp * 1000 // Convert unix seconds to ms
          : commentTimestamp
        : new Date(commentTimestamp).getTime();

    const ageMs = Date.now() - timestampMs;

    if (ageMs > SEVEN_DAYS_MS) {
      const ageDays = (ageMs / (24 * 60 * 60 * 1000)).toFixed(1);
      return {
        success: false,
        mode: 'demo',
        commentId,
        ruleViolated: 'EXPIRED_7_DAYS',
        error: `Comment is ${ageDays} days old. Private reply window expired (limit is 7 days).`,
        detail:
          'Meta Graph API strictly prohibits private replies to comments older than 7 days.',
      };
    }
  }

  // Decide Live vs Demo Mode
  const isLive =
    !forceDemo &&
    isInstagramConfigured() &&
    (Boolean(rawAccessToken) || Boolean(encryptedAccessToken));

  if (!isLive) {
    // Record in replies set to enforce once-per-comment rule in demo mode too!
    repliedCommentIds.add(commentId);

    return {
      success: true,
      mode: 'demo',
      commentId,
      messageId: `demo_msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      detail: `DEMO MODE: Private reply simulated for comment ID ${commentId} via POST /${igUserId || '17841400012345678'}/messages`,
    };
  }

  // Live Mode: Decrypt token and call real Meta Graph API
  try {
    const token = rawAccessToken || (encryptedAccessToken ? decryptToken(encryptedAccessToken) : '');
    if (!token) {
      throw new Error('No valid decrypted Instagram access token available.');
    }

    const endpoint = `https://graph.instagram.com/v21.0/${igUserId}/messages`;
    const payload = {
      recipient: {
        comment_id: commentId,
      },
      message: {
        text: messageText,
      },
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = (await response.json()) as { message_id?: string; recipient_id?: string; error?: any };

    if (!response.ok || responseData.error) {
      const metaError = responseData.error?.message || response.statusText;
      const errorCode = responseData.error?.code;

      let ruleViolated: PrivateReplyResult['ruleViolated'];
      if (errorCode === 10 || errorCode === 190) ruleViolated = 'UNAUTHORIZED';
      if (errorCode === 4 || errorCode === 17) ruleViolated = 'RATE_LIMITED';

      return {
        success: false,
        mode: 'live',
        commentId,
        ruleViolated,
        error: `Meta Graph API error: ${metaError}`,
        detail: `POST /${igUserId}/messages returned HTTP ${response.status}: ${JSON.stringify(responseData.error)}`,
      };
    }

    // Mark comment as replied
    repliedCommentIds.add(commentId);

    return {
      success: true,
      mode: 'live',
      commentId,
      messageId: responseData.message_id,
      recipientId: responseData.recipient_id,
      detail: `Live private reply sent to comment ${commentId} via Instagram Messaging API.`,
    };
  } catch (err: any) {
    return {
      success: false,
      mode: 'live',
      commentId,
      error: err.message || 'Network error calling Instagram API',
      detail: err.stack || String(err),
    };
  }
}

/**
 * Resets the in-memory replied comments cache (used for testing and demo resets)
 */
export function resetRepliedCommentsCache(): void {
  repliedCommentIds.clear();
}
