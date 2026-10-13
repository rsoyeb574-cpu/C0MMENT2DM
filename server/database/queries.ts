import { query, isDatabaseConfigured } from './db.js';

// ============================================================================
// 1. Users & Authentication
// ============================================================================

export async function dbGetUserByEmail(email: string) {
  if (!isDatabaseConfigured()) return null;
  const res = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1', [email]);
  return res?.rows[0] || null;
}

export async function dbGetUserById(id: string) {
  if (!isDatabaseConfigured()) return null;
  const res = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
  return res?.rows[0] || null;
}

export async function dbCreateUser(user: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  plan?: string;
}) {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not configured. Cannot save user.');
  }
  const res = await query(
    `INSERT INTO users (id, name, email, password_hash, avatar, plan, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING id, name, email, avatar, plan, created_at, updated_at`,
    [
      user.id,
      user.name,
      user.email.toLowerCase().trim(),
      user.passwordHash,
      user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      user.plan || 'Pro',
    ]
  );
  return res?.rows[0] || null;
}

export async function dbUpsertUser(user: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  plan?: string;
}) {
  if (!isDatabaseConfigured()) return null;
  const res = await query(
    `INSERT INTO users (id, name, email, password_hash, avatar, plan, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
     ON CONFLICT (email) DO UPDATE 
     SET name = EXCLUDED.name, 
         password_hash = EXCLUDED.password_hash,
         avatar = EXCLUDED.avatar,
         plan = EXCLUDED.plan,
         updated_at = CURRENT_TIMESTAMP
     RETURNING id, name, email, avatar, plan, created_at, updated_at`,
    [user.id, user.name, user.email.toLowerCase().trim(), user.passwordHash, user.avatar || '', user.plan || 'Pro']
  );
  return res?.rows[0] || null;
}

// ============================================================================
// 2. Sessions (Secure httpOnly Cookie Authentication)
// ============================================================================

export async function dbCreateSession(session: {
  id: string;
  userId: string;
  sessionToken: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
}) {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not configured. Cannot create session.');
  }
  const res = await query(
    `INSERT INTO sessions (id, user_id, session_token, ip_address, user_agent, expires_at, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING *`,
    [
      session.id,
      session.userId,
      session.sessionToken,
      session.ipAddress || null,
      session.userAgent || null,
      session.expiresAt,
    ]
  );
  return res?.rows[0] || null;
}

export async function dbGetSessionWithUser(sessionToken: string) {
  if (!isDatabaseConfigured()) return null;
  const res = await query(
    `SELECT 
       s.id AS session_id,
       s.session_token,
       s.expires_at,
       u.id AS id,
       u.name AS name,
       u.email AS email,
       u.avatar AS avatar,
       u.plan AS plan,
       u.created_at AS created_at
     FROM sessions s
     INNER JOIN users u ON s.user_id = u.id
     WHERE s.session_token = $1 AND s.expires_at > CURRENT_TIMESTAMP
     LIMIT 1`,
    [sessionToken]
  );
  return res?.rows[0] || null;
}

export async function dbDeleteSession(sessionToken: string) {
  if (!isDatabaseConfigured()) return false;
  await query('DELETE FROM sessions WHERE session_token = $1', [sessionToken]);
  return true;
}

export async function dbDeleteExpiredSessions() {
  if (!isDatabaseConfigured()) return;
  await query('DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP');
}

// ============================================================================
// 3. Instagram Connected Accounts
// ============================================================================

export async function dbUpsertInstagramAccount(account: {
  id: string;
  userId?: string;
  igUserId: string;
  username: string;
  name?: string;
  profilePictureUrl?: string;
  encryptedAccessToken?: string;
  tokenExpiresAt?: Date;
  scopes?: string[];
}) {
  if (!isDatabaseConfigured()) return null;
  const res = await query(
    `INSERT INTO instagram_accounts (
       id, user_id, ig_user_id, username, name, profile_picture_url, 
       encrypted_access_token, token_expires_at, scopes, is_connected, updated_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO UPDATE 
     SET username = EXCLUDED.username,
         name = EXCLUDED.name,
         profile_picture_url = EXCLUDED.profile_picture_url,
         encrypted_access_token = EXCLUDED.encrypted_access_token,
         token_expires_at = EXCLUDED.token_expires_at,
         scopes = EXCLUDED.scopes,
         is_connected = TRUE,
         updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [
      account.id,
      account.userId || null,
      account.igUserId,
      account.username,
      account.name || null,
      account.profilePictureUrl || null,
      account.encryptedAccessToken || null,
      account.tokenExpiresAt || null,
      account.scopes || ['instagram_business_basic', 'instagram_business_manage_comments', 'instagram_business_manage_messages'],
    ]
  );
  return res?.rows[0] || null;
}

export async function dbGetInstagramAccount(userId: string) {
  if (!isDatabaseConfigured()) return null;
  const res = await query(
    'SELECT * FROM instagram_accounts WHERE user_id = $1 AND is_connected = TRUE LIMIT 1',
    [userId]
  );
  return res?.rows[0] || null;
}

export async function dbGetInstagramAccountByIgId(igUserId: string) {
  if (!isDatabaseConfigured()) return null;
  const res = await query(
    'SELECT * FROM instagram_accounts WHERE ig_user_id = $1 AND is_connected = TRUE LIMIT 1',
    [igUserId]
  );
  return res?.rows[0] || null;
}

// ============================================================================
// 4. Campaigns CRUD (Filtered by authenticated user)
// ============================================================================

export async function dbGetCampaigns(userId: string) {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not configured.');
  }
  const res = await query(
    'SELECT * FROM campaigns WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return res?.rows || [];
}

export async function dbSaveCampaign(c: any, userId: string) {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not configured. Cannot save campaign.');
  }

  const campaignId = c.id || `camp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const redirectCode = c.trackedRedirectCode || c.tracked_redirect_code || campaignId;

  const res = await query(
    `INSERT INTO campaigns (
       id, user_id, name, status, post_id, post_thumbnail, post_caption,
       keyword, match_type, case_insensitive, send_once_per_user, message,
       link, tracked_redirect_code, offer, public_comment_reply, call_to_action,
       qualification_questions, setup_verified, comments_count, dms_sent_count, clicks_count, updated_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7,
       $8, $9, $10, $11, $12,
       $13, $14, $15, $16, $17,
       $18, $19, $20, $21, $22, CURRENT_TIMESTAMP
     )
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       status = EXCLUDED.status,
       post_id = EXCLUDED.post_id,
       post_thumbnail = EXCLUDED.post_thumbnail,
       post_caption = EXCLUDED.post_caption,
       keyword = EXCLUDED.keyword,
       match_type = EXCLUDED.match_type,
       case_insensitive = EXCLUDED.case_insensitive,
       send_once_per_user = EXCLUDED.send_once_per_user,
       message = EXCLUDED.message,
       link = EXCLUDED.link,
       tracked_redirect_code = EXCLUDED.tracked_redirect_code,
       offer = EXCLUDED.offer,
       public_comment_reply = EXCLUDED.public_comment_reply,
       call_to_action = EXCLUDED.call_to_action,
       qualification_questions = EXCLUDED.qualification_questions,
       setup_verified = EXCLUDED.setup_verified,
       comments_count = EXCLUDED.comments_count,
       dms_sent_count = EXCLUDED.dms_sent_count,
       clicks_count = EXCLUDED.clicks_count,
       updated_at = CURRENT_TIMESTAMP
     WHERE campaigns.user_id = $2
     RETURNING *`,
    [
      campaignId,
      userId,
      c.name,
      c.status || 'active',
      c.postId || c.post_id || '',
      c.postThumbnail || c.post_thumbnail || null,
      c.postCaption || c.post_caption || null,
      c.keyword,
      c.matchType || c.match_type || 'contains',
      c.caseInsensitive !== false && c.case_insensitive !== false,
      c.sendOncePerUser !== false && c.send_once_per_user !== false,
      c.message,
      c.link,
      redirectCode,
      c.offer || null,
      c.publicCommentReply || c.public_comment_reply || null,
      c.callToAction || c.call_to_action || null,
      JSON.stringify(c.qualificationQuestions || c.qualification_questions || []),
      c.setupVerified !== false && c.setup_verified !== false,
      c.commentsCount || c.comments_count || 0,
      c.dmsSentCount || c.dms_sent_count || 0,
      c.clicksCount || c.clicks_count || 0,
    ]
  );
  return res?.rows[0] || null;
}

export async function dbUpdateCampaignStatus(id: string, status: string, userId: string) {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not configured.');
  }
  const res = await query(
    'UPDATE campaigns SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
    [status, id, userId]
  );
  return res?.rows[0] || null;
}

export async function dbDeleteCampaign(id: string, userId: string) {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not configured.');
  }
  const res = await query('DELETE FROM campaigns WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
  return Boolean(res && res.rowCount && res.rowCount > 0);
}

// ============================================================================
// 5. Message Templates CRUD (User-isolated + System defaults)
// ============================================================================

export async function dbGetTemplates(userId: string) {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not configured.');
  }
  const res = await query(
    'SELECT * FROM message_templates WHERE user_id = $1 OR is_system = TRUE ORDER BY created_at DESC',
    [userId]
  );
  return res?.rows || [];
}

export async function dbSaveTemplate(t: any, userId: string) {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not configured.');
  }
  const templateId = t.id || `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const res = await query(
    `INSERT INTO message_templates (
       id, user_id, title, category, keyword_suggestion, offer, message,
       public_comment_reply, call_to_action, default_link, description,
       usage_count, qualification_questions, is_system, updated_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, FALSE, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO UPDATE SET
       title = EXCLUDED.title,
       category = EXCLUDED.category,
       keyword_suggestion = EXCLUDED.keyword_suggestion,
       offer = EXCLUDED.offer,
       message = EXCLUDED.message,
       public_comment_reply = EXCLUDED.public_comment_reply,
       call_to_action = EXCLUDED.call_to_action,
       default_link = EXCLUDED.default_link,
       description = EXCLUDED.description,
       usage_count = EXCLUDED.usage_count,
       qualification_questions = EXCLUDED.qualification_questions,
       updated_at = CURRENT_TIMESTAMP
     WHERE message_templates.user_id = $2
     RETURNING *`,
    [
      templateId,
      userId,
      t.title,
      t.category || 'Lead Magnet',
      t.keywordSuggestion || t.keyword_suggestion || 'GUIDE',
      t.offer || null,
      t.message,
      t.publicCommentReply || t.public_comment_reply || null,
      t.callToAction || t.call_to_action || null,
      t.defaultLink || t.default_link || 'https://example.com',
      t.description || '',
      t.usageCount || t.usage_count || 0,
      JSON.stringify(t.qualificationQuestions || t.qualification_questions || []),
    ]
  );
  return res?.rows[0] || null;
}

export async function dbDeleteTemplate(id: string, userId: string) {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not configured.');
  }
  const res = await query('DELETE FROM message_templates WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
  return Boolean(res && res.rowCount && res.rowCount > 0);
}

// ============================================================================
// 6. CRM Leads (User-isolated)
// ============================================================================

export async function dbGetLeads(userId: string) {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not configured.');
  }
  const res = await query('SELECT * FROM leads WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return res?.rows || [];
}

export async function dbSaveLead(lead: any, userId: string) {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not configured.');
  }
  const leadId = lead.id || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const res = await query(
    `INSERT INTO leads (
       id, user_id, username, user_avatar, comment, comment_id, comment_time,
       campaign_id, campaign_name, matched_keyword, dm_sent, link, status,
       notes, source, post_thumbnail, qualification_answers, timeline, updated_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO UPDATE SET
       status = EXCLUDED.status,
       notes = EXCLUDED.notes,
       qualification_answers = EXCLUDED.qualification_answers,
       timeline = EXCLUDED.timeline,
       updated_at = CURRENT_TIMESTAMP
     WHERE leads.user_id = $2
     RETURNING *`,
    [
      leadId,
      userId,
      lead.username,
      lead.userAvatar || lead.user_avatar || null,
      lead.comment,
      lead.commentId || lead.comment_id || null,
      lead.commentTime || lead.comment_time ? new Date(lead.commentTime || lead.comment_time) : new Date(),
      lead.campaignId || lead.campaign_id || null,
      lead.campaignName || lead.campaign_name || null,
      lead.matchedKeyword || lead.matched_keyword || null,
      lead.dmSent || lead.dm_sent || null,
      lead.link || null,
      lead.status || 'New',
      lead.notes || '',
      lead.source || 'Instagram Comment',
      lead.postThumbnail || lead.post_thumbnail || null,
      JSON.stringify(lead.qualificationAnswers || lead.qualification_answers || []),
      JSON.stringify(lead.timeline || []),
    ]
  );
  return res?.rows[0] || null;
}

export async function dbUpdateLeadStatus(id: string, status: string, notes: string | undefined, userId: string) {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not configured.');
  }
  let res;
  if (notes !== undefined) {
    res = await query(
      'UPDATE leads SET status = $1, notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4 RETURNING *',
      [status, notes, id, userId]
    );
  } else {
    res = await query(
      'UPDATE leads SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
      [status, id, userId]
    );
  }
  return res?.rows[0] || null;
}

export async function dbDeleteLead(id: string, userId: string) {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not configured.');
  }
  const res = await query('DELETE FROM leads WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
  return Boolean(res && res.rowCount && res.rowCount > 0);
}

// ============================================================================
// 7. Comment Events & DM Events (User-isolated)
// ============================================================================

export async function dbGetCommentEvents(userId: string, limit = 100) {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not configured.');
  }
  const res = await query(
    'SELECT * FROM comment_events WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
    [userId, limit]
  );
  return res?.rows || [];
}

export async function dbRecordCommentEvent(event: {
  id?: string;
  userId?: string;
  igUserId: string;
  commentId: string;
  postId?: string;
  commenterUsername: string;
  commenterId?: string;
  commentText: string;
  commentTimestamp: Date;
  isEligible: boolean;
  matchedCampaignId?: string;
  matchedKeyword?: string;
  status: string;
  skipReason?: string;
  rawPayload?: any;
}) {
  if (!isDatabaseConfigured()) return null;
  const eventId = event.id || `cmt_evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const res = await query(
    `INSERT INTO comment_events (
       id, user_id, ig_user_id, comment_id, post_id, commenter_username,
       commenter_id, comment_text, comment_timestamp, is_eligible,
       matched_campaign_id, matched_keyword, status, skip_reason, raw_payload
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     ON CONFLICT (comment_id) DO UPDATE SET
       status = EXCLUDED.status,
       skip_reason = EXCLUDED.skip_reason
     RETURNING *`,
    [
      eventId,
      event.userId || null,
      event.igUserId,
      event.commentId,
      event.postId || null,
      event.commenterUsername,
      event.commenterId || null,
      event.commentText,
      event.commentTimestamp,
      event.isEligible,
      event.matchedCampaignId || null,
      event.matchedKeyword || null,
      event.status,
      event.skipReason || null,
      JSON.stringify(event.rawPayload || {}),
    ]
  );
  return res?.rows[0] || null;
}

export async function dbGetDmEvents(userId: string, limit = 100) {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not configured.');
  }
  const res = await query(
    'SELECT * FROM dm_events WHERE user_id = $1 ORDER BY sent_at DESC LIMIT $2',
    [userId, limit]
  );
  return res?.rows || [];
}

export async function dbRecordDmEvent(dm: {
  id?: string;
  userId?: string;
  campaignId?: string;
  commentEventId?: string;
  commentId: string;
  recipientUsername: string;
  messageText: string;
  messageId?: string;
  status: string;
  mode: 'live' | 'demo';
  ruleViolated?: string;
  metaResponse?: any;
  errorDetail?: string;
  responseTimeMs?: number;
}) {
  if (!isDatabaseConfigured()) return null;
  const dmId = dm.id || `dm_evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const res = await query(
    `INSERT INTO dm_events (
       id, user_id, campaign_id, comment_event_id, comment_id,
       recipient_username, message_text, message_id, status, mode,
       rule_violated, meta_response, error_detail, response_time_ms
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING *`,
    [
      dmId,
      dm.userId || null,
      dm.campaignId || null,
      dm.commentEventId || null,
      dm.commentId,
      dm.recipientUsername,
      dm.messageText,
      dm.messageId || null,
      dm.status,
      dm.mode,
      dm.ruleViolated || null,
      JSON.stringify(dm.metaResponse || {}),
      dm.errorDetail || null,
      dm.responseTimeMs || 850,
    ]
  );
  return res?.rows[0] || null;
}

// ============================================================================
// 8. Link Clicks (User-isolated)
// ============================================================================

export async function dbGetLinkClicks(userId: string, limit = 100) {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not configured.');
  }
  const res = await query(
    'SELECT * FROM link_clicks WHERE user_id = $1 ORDER BY clicked_at DESC LIMIT $2',
    [userId, limit]
  );
  return res?.rows || [];
}

export async function dbRecordLinkClick(click: {
  id?: string;
  userId?: string;
  campaignId?: string;
  redirectCode: string;
  destinationUrl: string;
  leadId?: string;
  username?: string;
  referrer?: string;
  userAgent?: string;
  ipHash?: string;
}) {
  if (!isDatabaseConfigured()) return null;
  const clickId = click.id || `clk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const res = await query(
    `INSERT INTO link_clicks (
       id, user_id, campaign_id, redirect_code, destination_url,
       lead_id, username, referrer, user_agent, ip_hash
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      clickId,
      click.userId || null,
      click.campaignId || null,
      click.redirectCode,
      click.destinationUrl,
      click.leadId || null,
      click.username || null,
      click.referrer || null,
      click.userAgent || null,
      click.ipHash || null,
    ]
  );
  return res?.rows[0] || null;
}

// ============================================================================
// 9. Usage Records (User-isolated)
// ============================================================================

export async function dbGetUsageRecords(userId: string, periodMonth?: string) {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not configured.');
  }
  const month = periodMonth || new Date().toISOString().substring(0, 7);
  const res = await query(
    'SELECT * FROM usage_records WHERE user_id = $1 AND period_month = $2 ORDER BY recorded_at DESC',
    [userId, month]
  );
  return res?.rows || [];
}

export async function dbRecordUsage(record: {
  id?: string;
  userId: string;
  metric: string;
  quantity?: number;
  periodMonth?: string;
  metadata?: any;
}) {
  if (!isDatabaseConfigured()) return null;
  const usageId = record.id || `usg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const month = record.periodMonth || new Date().toISOString().substring(0, 7);
  const res = await query(
    `INSERT INTO usage_records (id, user_id, metric, quantity, period_month, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      usageId,
      record.userId,
      record.metric,
      record.quantity || 1,
      month,
      JSON.stringify(record.metadata || {}),
    ]
  );
  return res?.rows[0] || null;
}

// ============================================================================
// 10. Data Deletion (Meta Webhook & User Self-Service GDPR/CCPA Compliance)
// ============================================================================

export async function dbDeleteUserDataByEmail(email: string) {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not configured.');
  }
  const cleanEmail = email.toLowerCase().trim();
  const user = await dbGetUserByEmail(cleanEmail);
  if (!user) {
    return { found: false, deletedCount: 0 };
  }
  const userId = user.id;
  await query('DELETE FROM message_templates WHERE user_id = $1', [userId]);
  await query('DELETE FROM comment_events WHERE user_id = $1', [userId]);
  await query('DELETE FROM dm_events WHERE user_id = $1', [userId]);
  await query('DELETE FROM link_clicks WHERE user_id = $1', [userId]);
  await query('DELETE FROM instagram_accounts WHERE user_id = $1', [userId]);
  await query('DELETE FROM users WHERE id = $1', [userId]);
  return { found: true, userId, deletedCount: 1 };
}

export async function dbDeleteUserDataByInstagramId(igUserId: string) {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not configured.');
  }
  const accountRes = await query('SELECT * FROM instagram_accounts WHERE ig_user_id = $1 LIMIT 1', [igUserId]);
  const account = accountRes?.rows[0];
  if (account && account.user_id) {
    const userRes = await dbGetUserById(account.user_id);
    if (userRes && userRes.email) {
      return await dbDeleteUserDataByEmail(userRes.email);
    }
  }
  await query('DELETE FROM comment_events WHERE ig_user_id = $1', [igUserId]);
  await query('DELETE FROM instagram_accounts WHERE ig_user_id = $1', [igUserId]);
  return { found: true, deletedCount: 1 };
}

