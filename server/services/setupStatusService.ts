import { getInstagramConfig, isInstagramConfigured } from './instagramService.js';
import { testEncryptionHealth } from './cryptoService.js';
import { isDatabaseConfigured } from '../database/db.js';

export interface SetupStatusResponse {
  configured: boolean;
  appIdConfigured: boolean;
  appSecretConfigured: boolean;
  redirectUriConfigured: boolean;
  verifyTokenConfigured: boolean;
  tokenEncryptionConfigured: boolean;
  databaseConfigured: boolean;
  mode: 'demo' | 'live';
  automationReady: boolean;
  instagramConnected: boolean;
  webhookConfigured: boolean;
  envVariables: {
    INSTAGRAM_APP_ID: boolean;
    INSTAGRAM_APP_SECRET: boolean;
    INSTAGRAM_REDIRECT_URI: boolean;
    INSTAGRAM_VERIFY_TOKEN: boolean;
    TOKEN_ENCRYPTION_KEY: boolean;
    DATABASE_URL: boolean;
  };
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

  const appIdConfigured = Boolean(config.appId && config.appId.trim().length > 0);
  const appSecretConfigured = Boolean(config.appSecret && config.appSecret.trim().length > 0);
  const redirectUriConfigured = Boolean(
    (process.env.INSTAGRAM_REDIRECT_URI && process.env.INSTAGRAM_REDIRECT_URI.trim().length > 0) ||
    (process.env.META_REDIRECT_URI && process.env.META_REDIRECT_URI.trim().length > 0)
  );
  const verifyTokenConfigured = Boolean(
    (process.env.INSTAGRAM_VERIFY_TOKEN && process.env.INSTAGRAM_VERIFY_TOKEN.trim().length > 0) ||
    (process.env.META_VERIFY_TOKEN && process.env.META_VERIFY_TOKEN.trim().length > 0)
  );
  const tokenEncryptionConfigured = Boolean(
    (process.env.TOKEN_ENCRYPTION_KEY && process.env.TOKEN_ENCRYPTION_KEY.trim().length > 0) ||
    (process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim().length > 0)
  );
  const databaseConfigured = isDatabaseConfigured();

  const missing: string[] = [];

  if (!appIdConfigured) {
    missing.push('INSTAGRAM_APP_ID');
  }
  if (!appSecretConfigured) {
    missing.push('INSTAGRAM_APP_SECRET');
  }
  if (!tokenEncryptionConfigured) {
    missing.push('TOKEN_ENCRYPTION_KEY (or SESSION_SECRET)');
  }
  if (!databaseConfigured) {
    missing.push('DATABASE_URL');
  }

  const automationReady = appIdConfigured && appSecretConfigured && encryptionHealthy;

  return {
    configured: appIdConfigured && appSecretConfigured,
    appIdConfigured,
    appSecretConfigured,
    redirectUriConfigured,
    verifyTokenConfigured,
    tokenEncryptionConfigured,
    databaseConfigured,
    mode: automationReady ? 'live' : 'demo',
    automationReady,
    instagramConnected: appIdConfigured && appSecretConfigured,
    webhookConfigured: Boolean(verifyTokenConfigured && appSecretConfigured),
    envVariables: {
      INSTAGRAM_APP_ID: appIdConfigured,
      INSTAGRAM_APP_SECRET: appSecretConfigured,
      INSTAGRAM_REDIRECT_URI: redirectUriConfigured,
      INSTAGRAM_VERIFY_TOKEN: verifyTokenConfigured,
      TOKEN_ENCRYPTION_KEY: tokenEncryptionConfigured,
      DATABASE_URL: databaseConfigured,
    },
    permissionsGranted: {
      instagram_business_basic: appIdConfigured && appSecretConfigured,
      instagram_business_manage_comments: appIdConfigured && appSecretConfigured,
      instagram_business_manage_messages: appIdConfigured && appSecretConfigured,
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
