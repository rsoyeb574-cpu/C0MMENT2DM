import { query, isDatabaseConfigured } from './db';

// User Queries
export async function dbGetUserByEmail(email: string) {
  if (!isDatabaseConfigured()) return null;
  const res = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
  return res?.rows[0] || null;
}

export async function dbGetUserById(id: string) {
  if (!isDatabaseConfigured()) return null;
  const res = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
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
     RETURNING *`,
    [user.id, user.name, user.email, user.passwordHash, user.avatar || '', user.plan || 'Pro']
  );
  return res?.rows[0] || null;
}

// Instagram Accounts
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

export async function dbGetInstagramAccount(igUserId: string) {
  if (!isDatabaseConfigured()) return null;
  const res = await query(
    'SELECT * FROM instagram_accounts WHERE ig_user_id = $1 AND is_connected = TRUE LIMIT 1',
    [igUserId]
  );
  return res?.rows[0] || null;
}

// Campaigns
export async function dbGetCampaigns(userId?: string) {
  if (!isDatabaseConfigured()) return [];
  const res = userId
    ? await query('SELECT * FROM campaigns WHERE user_id = $1 OR user_id IS NULL ORDER BY created_at DESC', [userId])
    : await query('SELECT * FROM campaigns ORDER BY created_at DESC');
  return res?.rows || [];
}

export async function dbSaveCampaign(c: any, userId?: string) {
  if (!isDatabaseConfigured()) return null;
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
     RETURNING *`,
    [
      c.id,
      userId || c.userId || null,
      c.name,
      c.status || 'active',
      c.postId || '',
      c.postThumbnail || null,
      c.postCaption || null,
      c.keyword,
      c.matchType || 'contains',
      c.caseInsensitive !== false,
      c.sendOncePerUser !== false,
      c.message,
      c.link,
      c.trackedRedirectCode || c.id,
      c.offer || null,
      c.publicCommentReply || null,
      c.callToAction || null,
      JSON.stringify(c.qualificationQuestions || []),
      c.setupVerified !== false,
      c.commentsCount || 0,
      c.dmsSentCount || 0,
      c.clicksCount || 0,
    ]
  );
  return res?.rows[0] || null;
}

export async function dbDeleteCampaign(id: string) {
  if (!isDatabaseConfigured()) return false;
  await query('DELETE FROM campaigns WHERE id = $1', [id]);
  return true;
}

// Message Templates
export async function dbGetTemplates(userId?: string) {
  if (!isDatabaseConfigured()) return [];
  const res = userId
    ? await query('SELECT * FROM message_templates WHERE user_id = $1 OR is_system = TRUE ORDER BY created_at DESC', [userId])
    : await query('SELECT * FROM message_templates ORDER BY created_at DESC');
  return res?.rows || [];
}

export async function dbSaveTemplate(t: any, userId?: string) {
  if (!isDatabaseConfigured()) return null;
  const res = await query(
    `INSERT INTO message_templates (
       id, user_id, title, category, keyword_suggestion, offer, message,
       public_comment_reply, call_to_action, default_link, description,
       usage_count, qualification_questions, is_system, updated_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP)
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
     RETURNING *`,
    [
      t.id,
      userId || null,
      t.title,
      t.category,
      t.keywordSuggestion || t.keyword_suggestion,
      t.offer || null,
      t.message,
      t.publicCommentReply || null,
      t.callToAction || null,
      t.defaultLink || t.default_link,
      t.description || '',
      t.usageCount || 0,
      JSON.stringify(t.qualificationQuestions || []),
      Boolean(t.isSystem),
    ]
  );
  return res?.rows[0] || null;
}

// Comment Events
export async function dbRecordCommentEvent(event: {
  id: string;
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
  const res = await query(
    `INSERT INTO comment_events (
       id, user_id, ig_user_id, comment_id, post_id, commenter_username,
       commenter_id, comment_text, comment_timestamp, is_eligible,
       matched_campaign_id, matched_keyword, status, skip_reason, raw_payload
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     ON CONFLICT (comment_id) DO NOTHING
     RETURNING *`,
    [
      event.id,
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

// DM Events
export async function dbRecordDmEvent(dm: {
  id: string;
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
  const res = await query(
    `INSERT INTO dm_events (
       id, user_id, campaign_id, comment_event_id, comment_id,
       recipient_username, message_text, message_id, status, mode,
       rule_violated, meta_response, error_detail, response_time_ms
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING *`,
    [
      dm.id,
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

// Link Clicks
export async function dbRecordLinkClick(click: {
  id: string;
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
  const res = await query(
    `INSERT INTO link_clicks (
       id, user_id, campaign_id, redirect_code, destination_url,
       lead_id, username, referrer, user_agent, ip_hash
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      click.id,
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

// Usage Records
export async function dbRecordUsage(record: {
  id: string;
  userId: string;
  metric: string;
  quantity?: number;
  periodMonth: string;
  metadata?: any;
}) {
  if (!isDatabaseConfigured()) return null;
  const res = await query(
    `INSERT INTO usage_records (id, user_id, metric, quantity, period_month, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      record.id,
      record.userId,
      record.metric,
      record.quantity || 1,
      record.periodMonth,
      JSON.stringify(record.metadata || {}),
    ]
  );
  return res?.rows[0] || null;
}

// Leads (CRM)
export async function dbGetLeads(userId?: string) {
  if (!isDatabaseConfigured()) return [];
  const res = userId
    ? await query('SELECT * FROM leads WHERE user_id = $1 ORDER BY created_at DESC', [userId])
    : await query('SELECT * FROM leads ORDER BY created_at DESC');
  return res?.rows || [];
}

export async function dbSaveLead(lead: any, userId?: string) {
  if (!isDatabaseConfigured()) return null;
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
     RETURNING *`,
    [
      lead.id,
      userId || null,
      lead.username,
      lead.userAvatar || null,
      lead.comment,
      lead.commentId || null,
      lead.commentTime ? new Date(lead.commentTime) : null,
      lead.campaignId || null,
      lead.campaignName || null,
      lead.matchedKeyword || null,
      lead.dmSent || null,
      lead.link || null,
      lead.status || 'New',
      lead.notes || '',
      lead.source || 'Instagram Comment',
      lead.postThumbnail || null,
      JSON.stringify(lead.qualificationAnswers || []),
      JSON.stringify(lead.timeline || []),
    ]
  );
  return res?.rows[0] || null;
}

export async function dbUpdateLeadStatus(id: string, status: string, notes?: string) {
  if (!isDatabaseConfigured()) return false;
  if (notes !== undefined) {
    await query('UPDATE leads SET status = $1, notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3', [status, notes, id]);
  } else {
    await query('UPDATE leads SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [status, id]);
  }
  return true;
}

export async function dbDeleteLead(id: string) {
  if (!isDatabaseConfigured()) return false;
  await query('DELETE FROM leads WHERE id = $1', [id]);
  return true;
}
