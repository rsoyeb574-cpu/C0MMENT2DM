import { getInstagramConfig, isInstagramConfigured, INSTAGRAM_BUSINESS_SCOPES } from './instagramService.js';
import { testEncryptionHealth } from './cryptoService.js';

export interface SetupStatusResponse {
  mode: 'demo' | 'live';
  automationReady: boolean;
  instagramConnected: boolean;
  webhookConfigured: boolean;
  permissionsGranted: {
    instagram_business_basic: boolean;
    instagram_business_manage_comments: boolean;
    instagram_business_manage_messages: boolean;
  };
  tokenEncryption: {
    algorithm: 'AES-256-GCM';
    healthy: boolean;
    status: 'active' | 'error';
  };
  privateReplyRules: {
    endpoint: 'POST /<IG_USER_ID>/messages';
    target: 'recipient.comment_id';
    oncePerCommentEnforced: boolean;
    sevenDayLimitEnforced: boolean;
    maxAgeDays: number;
  };
  missingRequirements: string[];
}

export function getSetupStatus(): SetupStatusResponse {
  const config = getInstagramConfig();
  const isConfigured = isInstagramConfigured();
  const encryptionHealthy = testEncryptionHealth();

  const missing: string[] = [];

  if (!config.appId) {
    missing.push('INSTAGRAM_APP_ID is not configured in .env');
  }
  if (!config.appSecret) {
    missing.push('INSTAGRAM_APP_SECRET is not configured in .env');
  }
  if (!process.env.TOKEN_ENCRYPTION_KEY && !process.env.SESSION_SECRET) {
    missing.push('TOKEN_ENCRYPTION_KEY is required for AES-256-GCM token storage');
  }

  const automationReady = isConfigured && encryptionHealthy && missing.length === 0;

  return {
    mode: automationReady ? 'live' : 'demo',
    automationReady,
    instagramConnected: isConfigured,
    webhookConfigured: Boolean(config.verifyToken && config.appSecret),
    permissionsGranted: {
      instagram_business_basic: isConfigured,
      instagram_business_manage_comments: isConfigured,
      instagram_business_manage_messages: isConfigured,
    },
    tokenEncryption: {
      algorithm: 'AES-256-GCM',
      healthy: encryptionHealthy,
      status: encryptionHealthy ? 'active' : 'error',
    },
    privateReplyRules: {
      endpoint: 'POST /<IG_USER_ID>/messages',
      target: 'recipient.comment_id',
      oncePerCommentEnforced: true,
      sevenDayLimitEnforced: true,
      maxAgeDays: 7,
    },
    missingRequirements: missing,
  };
}
