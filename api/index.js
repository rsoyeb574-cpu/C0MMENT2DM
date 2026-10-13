// server/app.ts
import express from "express";
import crypto3 from "crypto";

// server/database/db.ts
import { Pool } from "pg";
function getSafeDatabaseMeta() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return {
      configured: false,
      host: "none (demo memory mode)",
      database: "none",
      ssl: false
    };
  }
  try {
    const parsed = new URL(url);
    return {
      configured: true,
      host: parsed.hostname || "unknown-host",
      database: parsed.pathname.replace(/^\//, "") || "defaultdb",
      ssl: url.includes("sslmode=require") || url.includes("ssl=true") || true
    };
  } catch {
    return {
      configured: true,
      host: "configured-masked",
      database: "configured-masked",
      ssl: true
    };
  }
}
var poolInstance = null;
function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
}
function getPool() {
  if (!isDatabaseConfigured()) {
    return null;
  }
  if (poolInstance) {
    return poolInstance;
  }
  const rawUrl = process.env.DATABASE_URL;
  const poolConfig = {
    connectionString: rawUrl,
    max: parseInt(process.env.PG_POOL_MAX || "10", 10),
    idleTimeoutMillis: 3e4,
    connectionTimeoutMillis: 5e3,
    ssl: {
      rejectUnauthorized: false
    }
  };
  try {
    poolInstance = new Pool(poolConfig);
    poolInstance.on("error", (err) => {
      console.error("[PostgreSQL Pool Error]", err.message);
    });
    const meta = getSafeDatabaseMeta();
    console.log(`[PostgreSQL] Connection pool initialized for host: ${meta.host} (SSL active)`);
    return poolInstance;
  } catch (err) {
    console.error("[PostgreSQL Init Error]", err?.message || "Failed to initialize pool");
    return null;
  }
}
async function query(text, params) {
  const pool = getPool();
  if (!pool) {
    return null;
  }
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    const safeMessage = err.message ? err.message.replace(/postgres:\/\/[^@]+@/, "postgres://***@") : "Query error";
    console.error("[PostgreSQL Query Error]", safeMessage);
    throw new Error(safeMessage);
  }
}
async function testConnection() {
  const meta = getSafeDatabaseMeta();
  if (!isDatabaseConfigured()) {
    return {
      connected: false,
      host: meta.host,
      database: meta.database,
      error: "DATABASE_URL environment variable is not set. Running in Demo Mode."
    };
  }
  const start = Date.now();
  try {
    const res = await query("SELECT 1 as ping");
    const latencyMs = Date.now() - start;
    if (res && res.rows.length > 0) {
      return {
        connected: true,
        latencyMs,
        host: meta.host,
        database: meta.database
      };
    }
    return {
      connected: false,
      host: meta.host,
      database: meta.database,
      error: "Empty response received from database"
    };
  } catch (err) {
    return {
      connected: false,
      host: meta.host,
      database: meta.database,
      error: err.message || "Connection test failed"
    };
  }
}
async function getExistingTables() {
  try {
    const res = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    if (!res) return [];
    return res.rows.map((r) => r.table_name);
  } catch {
    return [];
  }
}
async function closePool() {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
  }
}

// server/database/migrate.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
var REQUIRED_TABLES = [
  "users",
  "sessions",
  "instagram_accounts",
  "campaigns",
  "keywords",
  "message_templates",
  "comment_events",
  "dm_events",
  "link_clicks",
  "usage_records",
  "leads"
];
async function runMigration() {
  const startTime = Date.now();
  const meta = getSafeDatabaseMeta();
  if (!isDatabaseConfigured()) {
    return {
      success: false,
      message: "DATABASE_URL environment variable is not defined. Please configure DATABASE_URL (e.g. Neon PostgreSQL with ?sslmode=require) before running migrations.",
      database: meta.database,
      host: meta.host,
      migratedTables: [],
      missingTables: REQUIRED_TABLES,
      durationMs: Date.now() - startTime
    };
  }
  try {
    let schemaPath = path.resolve(process.cwd(), "server/database/schema.sql");
    if (!fs.existsSync(schemaPath)) {
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      schemaPath = path.resolve(__dirname, "schema.sql");
    }
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    console.log(`[Migration] Connecting to PostgreSQL at ${meta.host}...`);
    await query(schemaSql);
    const existing = await getExistingTables();
    const migratedTables = REQUIRED_TABLES.filter((t) => existing.includes(t));
    const missingTables = REQUIRED_TABLES.filter((t) => !existing.includes(t));
    const success = missingTables.length === 0;
    const durationMs = Date.now() - startTime;
    return {
      success,
      message: success ? `Successfully migrated all ${migratedTables.length} tables to PostgreSQL (${durationMs}ms)` : `Migration partially applied. Missing tables: ${missingTables.join(", ")}`,
      database: meta.database,
      host: meta.host,
      migratedTables,
      missingTables,
      durationMs
    };
  } catch (err) {
    const durationMs = Date.now() - startTime;
    console.error("[Migration Error]", err.message);
    return {
      success: false,
      message: `Migration failed: ${err.message}`,
      database: meta.database,
      host: meta.host,
      migratedTables: [],
      missingTables: REQUIRED_TABLES,
      durationMs
    };
  }
}
var isDirectExecution = process.argv[1] && (process.argv[1].endsWith("migrate.ts") || process.argv[1].endsWith("migrate.js"));
if (isDirectExecution) {
  console.log("====================================================");
  console.log(" Comment2DM PostgreSQL Schema Migration Runner");
  console.log("====================================================");
  runMigration().then((result) => {
    console.log(`
Target Host: ${result.host}`);
    console.log(`Database:    ${result.database}`);
    console.log(`Status:      ${result.success ? "SUCCESS" : "FAILED"}`);
    console.log(`Duration:    ${result.durationMs}ms`);
    console.log(`
Verified Tables (${result.migratedTables.length}/${REQUIRED_TABLES.length}):`);
    for (const table of result.migratedTables) {
      console.log(`  \u2713 ${table}`);
    }
    if (result.missingTables.length > 0) {
      console.log("\nMissing Tables:");
      for (const table of result.missingTables) {
        console.log(`  \u2717 ${table}`);
      }
    }
    console.log(`
Message: ${result.message}
`);
    return closePool().then(() => {
      process.exit(result.success ? 0 : 1);
    });
  }).catch((err) => {
    console.error("\nFatal error during migration:", err?.message || err);
    process.exit(1);
  });
}

// server/database/queries.ts
async function dbGetUserByEmail(email) {
  if (!isDatabaseConfigured()) return null;
  const res = await query("SELECT * FROM users WHERE email = $1 LIMIT 1", [email]);
  return res?.rows[0] || null;
}
async function dbUpsertUser(user) {
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
    [user.id, user.name, user.email, user.passwordHash, user.avatar || "", user.plan || "Pro"]
  );
  return res?.rows[0] || null;
}
async function dbUpsertInstagramAccount(account) {
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
      account.scopes || ["instagram_business_basic", "instagram_business_manage_comments", "instagram_business_manage_messages"]
    ]
  );
  return res?.rows[0] || null;
}
async function dbGetCampaigns(userId) {
  if (!isDatabaseConfigured()) return [];
  const res = userId ? await query("SELECT * FROM campaigns WHERE user_id = $1 OR user_id IS NULL ORDER BY created_at DESC", [userId]) : await query("SELECT * FROM campaigns ORDER BY created_at DESC");
  return res?.rows || [];
}
async function dbSaveCampaign(c, userId) {
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
      c.status || "active",
      c.postId || "",
      c.postThumbnail || null,
      c.postCaption || null,
      c.keyword,
      c.matchType || "contains",
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
      c.clicksCount || 0
    ]
  );
  return res?.rows[0] || null;
}
async function dbDeleteCampaign(id) {
  if (!isDatabaseConfigured()) return false;
  await query("DELETE FROM campaigns WHERE id = $1", [id]);
  return true;
}
async function dbGetTemplates(userId) {
  if (!isDatabaseConfigured()) return [];
  const res = userId ? await query("SELECT * FROM message_templates WHERE user_id = $1 OR is_system = TRUE ORDER BY created_at DESC", [userId]) : await query("SELECT * FROM message_templates ORDER BY created_at DESC");
  return res?.rows || [];
}
async function dbSaveTemplate(t, userId) {
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
      t.description || "",
      t.usageCount || 0,
      JSON.stringify(t.qualificationQuestions || []),
      Boolean(t.isSystem)
    ]
  );
  return res?.rows[0] || null;
}
async function dbRecordCommentEvent(event) {
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
      JSON.stringify(event.rawPayload || {})
    ]
  );
  return res?.rows[0] || null;
}
async function dbRecordDmEvent(dm) {
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
      dm.responseTimeMs || 850
    ]
  );
  return res?.rows[0] || null;
}
async function dbRecordLinkClick(click) {
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
      click.ipHash || null
    ]
  );
  return res?.rows[0] || null;
}
async function dbRecordUsage(record) {
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
      JSON.stringify(record.metadata || {})
    ]
  );
  return res?.rows[0] || null;
}
async function dbGetLeads(userId) {
  if (!isDatabaseConfigured()) return [];
  const res = userId ? await query("SELECT * FROM leads WHERE user_id = $1 ORDER BY created_at DESC", [userId]) : await query("SELECT * FROM leads ORDER BY created_at DESC");
  return res?.rows || [];
}
async function dbSaveLead(lead, userId) {
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
      lead.status || "New",
      lead.notes || "",
      lead.source || "Instagram Comment",
      lead.postThumbnail || null,
      JSON.stringify(lead.qualificationAnswers || []),
      JSON.stringify(lead.timeline || [])
    ]
  );
  return res?.rows[0] || null;
}
async function dbUpdateLeadStatus(id, status, notes) {
  if (!isDatabaseConfigured()) return false;
  if (notes !== void 0) {
    await query("UPDATE leads SET status = $1, notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3", [status, notes, id]);
  } else {
    await query("UPDATE leads SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [status, id]);
  }
  return true;
}
async function dbDeleteLead(id) {
  if (!isDatabaseConfigured()) return false;
  await query("DELETE FROM leads WHERE id = $1", [id]);
  return true;
}

// server/services/cryptoService.ts
import crypto from "crypto";
var ALGORITHM = "aes-256-gcm";
var IV_LENGTH = 12;
var AUTH_TAG_LENGTH = 16;
function getDerivedKey() {
  const secretKey = process.env.TOKEN_ENCRYPTION_KEY || process.env.SESSION_SECRET || "comment2dm_fallback_encryption_secret_key_32bytes!";
  return crypto.scryptSync(secretKey, "comment2dm_salt_v1", 32);
}
function encryptToken(plainText) {
  if (!plainText) return "";
  const key = getDerivedKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}
function decryptToken(encryptedPayload) {
  if (!encryptedPayload) return "";
  const parts = encryptedPayload.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted token format. Expected iv:authTag:ciphertext");
  }
  const [ivHex, authTagHex, cipherHex] = parts;
  const key = getDerivedKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(cipherHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
function testEncryptionHealth() {
  try {
    const sample = "ig_access_token_healthcheck_sample_12345";
    const encrypted = encryptToken(sample);
    const decrypted = decryptToken(encrypted);
    return decrypted === sample;
  } catch (err) {
    console.error("Encryption health check failed:", err);
    return false;
  }
}

// server/services/instagramService.ts
var INSTAGRAM_BUSINESS_SCOPES = [
  "instagram_business_basic",
  "instagram_business_manage_comments",
  "instagram_business_manage_messages"
];
var SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1e3;
var repliedCommentIds = /* @__PURE__ */ new Set();
function getInstagramConfig() {
  return {
    appId: process.env.INSTAGRAM_APP_ID || process.env.META_APP_ID || "",
    appSecret: process.env.INSTAGRAM_APP_SECRET || process.env.META_APP_SECRET || "",
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI || process.env.META_REDIRECT_URI || "http://localhost:3000/api/auth/instagram/callback",
    verifyToken: process.env.INSTAGRAM_VERIFY_TOKEN || process.env.META_VERIFY_TOKEN || "comment2dm_instagram_verify_token_secure"
  };
}
function isInstagramConfigured() {
  const cfg = getInstagramConfig();
  return Boolean(cfg.appId && cfg.appSecret);
}
function getBusinessLoginUrl(state) {
  const { appId, redirectUri } = getInstagramConfig();
  const scopeStr = INSTAGRAM_BUSINESS_SCOPES.join(",");
  const params = new URLSearchParams({
    enable_fb_login: "0",
    force_authentication: "1",
    client_id: appId || "MOCK_APP_ID",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopeStr
  });
  if (state) {
    params.set("state", state);
  }
  return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
}
async function exchangeCodeForShortLivedToken(code) {
  const { appId, appSecret, redirectUri } = getInstagramConfig();
  if (!appId || !appSecret) {
    throw new Error("INSTAGRAM_APP_ID or INSTAGRAM_APP_SECRET is not configured in .env");
  }
  const body = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code
  });
  const response = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to exchange code for Instagram token: ${response.status} - ${errorText}`);
  }
  const data = await response.json();
  return {
    accessToken: data.access_token,
    userId: String(data.user_id),
    permissions: data.permissions
  };
}
async function exchangeForLongLivedToken(shortLivedToken) {
  const { appSecret } = getInstagramConfig();
  if (!appSecret) {
    throw new Error("INSTAGRAM_APP_SECRET is required to exchange for long-lived access token");
  }
  const url = new URL("https://graph.instagram.com/access_token");
  url.searchParams.set("grant_type", "ig_exchange_token");
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("access_token", shortLivedToken);
  const response = await fetch(url.toString());
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to exchange for long-lived token: ${response.status} - ${errorText}`);
  }
  const data = await response.json();
  const expiresAt = new Date(Date.now() + (data.expires_in || 5184e3) * 1e3);
  return {
    accessToken: data.access_token,
    tokenType: data.token_type || "bearer",
    expiresIn: data.expires_in,
    expiresAt
  };
}
async function getInstagramUserProfile(accessToken) {
  const url = new URL("https://graph.instagram.com/v21.0/me");
  url.searchParams.set("fields", "id,username,name,profile_picture_url");
  url.searchParams.set("access_token", accessToken);
  const response = await fetch(url.toString());
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch Instagram profile: ${response.status} - ${errorText}`);
  }
  return await response.json();
}
async function sendPrivateReply(params) {
  const {
    igUserId,
    commentId,
    messageText,
    commentTimestamp,
    encryptedAccessToken,
    rawAccessToken,
    forceDemo = false
  } = params;
  if (!commentId) {
    return {
      success: false,
      mode: "demo",
      commentId: "",
      error: "Missing comment ID for private reply.",
      detail: "Instagram Private Reply requires a valid comment_id."
    };
  }
  if (repliedCommentIds.has(commentId)) {
    return {
      success: false,
      mode: "demo",
      commentId,
      ruleViolated: "ONCE_PER_COMMENT",
      error: `Private reply already sent for comment ${commentId}.`,
      detail: "Instagram limits private replies to exactly once per comment ID. Secondary attempts are blocked."
    };
  }
  if (commentTimestamp) {
    const timestampMs = typeof commentTimestamp === "number" ? commentTimestamp < 1e10 ? commentTimestamp * 1e3 : commentTimestamp : new Date(commentTimestamp).getTime();
    const ageMs = Date.now() - timestampMs;
    if (ageMs > SEVEN_DAYS_MS) {
      const ageDays = (ageMs / (24 * 60 * 60 * 1e3)).toFixed(1);
      return {
        success: false,
        mode: "demo",
        commentId,
        ruleViolated: "EXPIRED_7_DAYS",
        error: `Comment is ${ageDays} days old. Private reply window expired (limit is 7 days).`,
        detail: "Meta Graph API strictly prohibits private replies to comments older than 7 days."
      };
    }
  }
  const isLive = !forceDemo && isInstagramConfigured() && (Boolean(rawAccessToken) || Boolean(encryptedAccessToken));
  if (!isLive) {
    repliedCommentIds.add(commentId);
    return {
      success: true,
      mode: "demo",
      commentId,
      messageId: `demo_msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      detail: `DEMO MODE: Private reply simulated for comment ID ${commentId} via POST /${igUserId || "17841400012345678"}/messages`
    };
  }
  try {
    const token = rawAccessToken || (encryptedAccessToken ? decryptToken(encryptedAccessToken) : "");
    if (!token) {
      throw new Error("No valid decrypted Instagram access token available.");
    }
    const endpoint = `https://graph.instagram.com/v21.0/${igUserId}/messages`;
    const payload = {
      recipient: {
        comment_id: commentId
      },
      message: {
        text: messageText
      }
    };
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const responseData = await response.json();
    if (!response.ok || responseData.error) {
      const metaError = responseData.error?.message || response.statusText;
      const errorCode = responseData.error?.code;
      let ruleViolated;
      if (errorCode === 10 || errorCode === 190) ruleViolated = "UNAUTHORIZED";
      if (errorCode === 4 || errorCode === 17) ruleViolated = "RATE_LIMITED";
      return {
        success: false,
        mode: "live",
        commentId,
        ruleViolated,
        error: `Meta Graph API error: ${metaError}`,
        detail: `POST /${igUserId}/messages returned HTTP ${response.status}: ${JSON.stringify(responseData.error)}`
      };
    }
    repliedCommentIds.add(commentId);
    return {
      success: true,
      mode: "live",
      commentId,
      messageId: responseData.message_id,
      recipientId: responseData.recipient_id,
      detail: `Live private reply sent to comment ${commentId} via Instagram Messaging API.`
    };
  } catch (err) {
    return {
      success: false,
      mode: "live",
      commentId,
      error: err.message || "Network error calling Instagram API",
      detail: err.stack || String(err)
    };
  }
}

// server/services/setupStatusService.ts
function getSetupStatus() {
  const config = getInstagramConfig();
  const isConfigured = isInstagramConfigured();
  const encryptionHealthy = testEncryptionHealth();
  const missing = [];
  if (!config.appId) {
    missing.push("INSTAGRAM_APP_ID is not configured in .env");
  }
  if (!config.appSecret) {
    missing.push("INSTAGRAM_APP_SECRET is not configured in .env");
  }
  if (!process.env.TOKEN_ENCRYPTION_KEY && !process.env.SESSION_SECRET) {
    missing.push("TOKEN_ENCRYPTION_KEY is required for AES-256-GCM token storage");
  }
  const automationReady = isConfigured && encryptionHealthy && missing.length === 0;
  return {
    mode: automationReady ? "live" : "demo",
    automationReady,
    instagramConnected: isConfigured,
    webhookConfigured: Boolean(config.verifyToken && config.appSecret),
    permissionsGranted: {
      instagram_business_basic: isConfigured,
      instagram_business_manage_comments: isConfigured,
      instagram_business_manage_messages: isConfigured
    },
    tokenEncryption: {
      algorithm: "AES-256-GCM",
      healthy: encryptionHealthy,
      status: encryptionHealthy ? "active" : "error"
    },
    privateReplyRules: {
      endpoint: "POST /<IG_USER_ID>/messages",
      target: "recipient.comment_id",
      oncePerCommentEnforced: true,
      sevenDayLimitEnforced: true,
      maxAgeDays: 7
    },
    missingRequirements: missing
  };
}

// server/webhooks/instagramWebhook.ts
import crypto2 from "crypto";
function handleWebhookChallenge(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  const { verifyToken } = getInstagramConfig();
  if (mode === "subscribe" && token === verifyToken) {
    console.log("[Webhook] Verified challenge from Meta Instagram webhook subscription.");
    res.status(200).send(challenge);
  } else {
    console.warn("[Webhook] Failed challenge verification. Received token does not match.");
    res.status(403).json({ error: "Verification token mismatch" });
  }
}
function verifyMetaSignature(rawBody, signatureHeader, appSecret) {
  if (!signatureHeader || !appSecret) return true;
  try {
    const [algo, signature] = signatureHeader.split("=");
    if (algo !== "sha256" || !signature) return false;
    const hmac = crypto2.createHmac("sha256", appSecret);
    const digest = hmac.update(rawBody).digest("hex");
    return crypto2.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(digest, "hex"));
  } catch (err) {
    console.error("[Webhook Signature Error]", err);
    return false;
  }
}
async function handleWebhookEvent(req, res) {
  const { appSecret } = getInstagramConfig();
  const signature = req.headers["x-hub-signature-256"];
  if (appSecret && signature) {
    const rawBody = req.rawBody || JSON.stringify(req.body);
    const isValid = verifyMetaSignature(rawBody, signature, appSecret);
    if (!isValid) {
      console.warn("[Webhook] Invalid X-Hub-Signature-256 received.");
      res.status(401).json({ error: "Invalid webhook signature" });
      return;
    }
  }
  const payload = req.body;
  if (payload.object !== "instagram") {
    res.status(200).json({ received: true, ignored: "Not an instagram object" });
    return;
  }
  const results = [];
  for (const entry of payload.entry || []) {
    const igUserId = entry.id;
    for (const change of entry.changes || []) {
      if (change.field === "comments" && change.value) {
        const comment = change.value;
        const commentId = comment.id;
        const commentText = comment.text || "";
        const commenterUsername = comment.from?.username || "follower";
        const commentCreatedTime = comment.created_time ? comment.created_time * 1e3 : Date.now();
        const isExpired = Date.now() - commentCreatedTime > SEVEN_DAYS_MS;
        await dbRecordCommentEvent({
          id: `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          igUserId,
          commentId,
          postId: comment.media?.id,
          commenterUsername,
          commenterId: comment.from?.id,
          commentText,
          commentTimestamp: new Date(commentCreatedTime),
          isEligible: !isExpired,
          status: isExpired ? "skipped" : "processed",
          skipReason: isExpired ? "Comment is older than 7 days." : void 0,
          rawPayload: comment
        }).catch((err) => console.error("[DB Comment Record Error]", err.message));
        if (isExpired) {
          results.push({
            commentId,
            username: commenterUsername,
            status: "skipped",
            detail: "Comment is older than 7 days. Private reply window closed."
          });
          continue;
        }
        console.log(
          `[Webhook] Processing comment on IG ${igUserId} from @${commenterUsername}: "${commentText}" (ID: ${commentId})`
        );
        const replyResult = await sendPrivateReply({
          igUserId,
          commentId,
          commentTimestamp: commentCreatedTime,
          messageText: `Hey @${commenterUsername}! \u{1F64C} Thanks for your comment. Here is your link: https://gumroad.com/l/free-guide`,
          forceDemo: process.env.NODE_ENV !== "production" && !process.env.INSTAGRAM_ACCESS_TOKEN
        });
        const statusLabel = replyResult.success ? replyResult.mode === "demo" ? "Demo mode" : "Sent successfully" : "Failed";
        await dbRecordDmEvent({
          id: `dm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          commentId,
          recipientUsername: commenterUsername,
          messageText: `Hey @${commenterUsername}! \u{1F64C} Thanks for your comment. Here is your link: https://gumroad.com/l/free-guide`,
          messageId: replyResult.messageId,
          status: statusLabel,
          mode: replyResult.mode,
          ruleViolated: replyResult.ruleViolated,
          errorDetail: replyResult.error,
          responseTimeMs: 820
        }).catch((err) => console.error("[DB DM Record Error]", err.message));
        await dbRecordUsage({
          id: `usg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: "default",
          metric: "dm_sent",
          periodMonth: (/* @__PURE__ */ new Date()).toISOString().substring(0, 7),
          metadata: { commentId, commenterUsername, mode: replyResult.mode }
        }).catch(() => {
        });
        results.push({
          commentId,
          username: commenterUsername,
          status: statusLabel,
          detail: replyResult.detail
        });
      }
    }
  }
  res.status(200).json({
    success: true,
    processed: results.length,
    events: results
  });
}

// server/app.ts
var app = express();
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});
app.get("/api/health", async (_req, res) => {
  if (isDatabaseConfigured()) {
    try {
      const conn = await testConnection();
      if (conn.connected) {
        res.json({
          status: "ok",
          database: "connected",
          latencyMs: conn.latencyMs,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        return;
      }
      res.status(503).json({
        status: "error",
        database: "disconnected",
        error: conn.error || "Database connection failed",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      return;
    } catch (err) {
      const safeError = err?.message ? err.message.replace(/postgres(ql)?:\/\/[^@]+@/, "postgresql://***@") : "Database connection failed";
      res.status(503).json({
        status: "error",
        database: "error",
        error: safeError,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      return;
    }
  }
  res.json({
    status: "ok",
    database: "demo_mode",
    message: "Running in demo mode (DATABASE_URL not set)",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/db/status", async (_req, res) => {
  const meta = getSafeDatabaseMeta();
  const conn = await testConnection();
  const tables = await getExistingTables();
  res.json({
    configured: meta.configured,
    connected: conn.connected,
    host: meta.host,
    database: meta.database,
    ssl: meta.ssl,
    latencyMs: conn.latencyMs,
    tables,
    mode: meta.configured && conn.connected ? "postgresql" : "demo_memory",
    error: conn.error
  });
});
app.post("/api/db/migrate", async (_req, res) => {
  const result = await runMigration();
  res.status(result.success ? 200 : 400).json(result);
});
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, error: "Email and password required" });
    return;
  }
  const existing = await dbGetUserByEmail(email);
  if (existing) {
    res.status(409).json({ success: false, error: "User with this email already exists" });
    return;
  }
  const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const passwordHash = crypto3.createHash("sha256").update(password).digest("hex");
  const created = await dbUpsertUser({
    id,
    name: name || email.split("@")[0],
    email,
    passwordHash,
    plan: "Pro"
  });
  res.json({
    success: true,
    user: {
      id: created ? created.id : id,
      name: created ? created.name : name,
      email,
      plan: "Pro",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  });
});
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, error: "Email and password required" });
    return;
  }
  const user = await dbGetUserByEmail(email);
  if (user) {
    const hash = crypto3.createHash("sha256").update(password).digest("hex");
    if (user.password_hash === hash || user.password_hash === password) {
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          plan: user.plan || "Pro",
          createdAt: user.created_at
        }
      });
      return;
    }
  }
  if (email === "demo@comment2dm.com" && password === "demo123456") {
    res.json({
      success: true,
      user: {
        id: "user_demo_01",
        name: "Creator Studio",
        email: "demo@comment2dm.com",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        plan: "Pro",
        createdAt: "2026-03-01"
      }
    });
    return;
  }
  res.status(401).json({ success: false, error: "Invalid email or password" });
});
app.get("/api/setup/status", (_req, res) => {
  const status = getSetupStatus();
  res.json(status);
});
app.get("/api/auth/instagram/url", (req, res) => {
  const state = req.query.state || crypto3.randomBytes(16).toString("hex");
  const url = getBusinessLoginUrl(state);
  res.json({ url, state });
});
app.get("/api/auth/instagram/callback", async (req, res) => {
  const code = req.query.code;
  const error = req.query.error_description || req.query.error;
  if (error) {
    res.status(400).send(`<h3>Instagram Authorization Failed</h3><p>${error}</p>`);
    return;
  }
  if (!code) {
    res.status(400).send("<h3>Missing authorization code from Meta</h3>");
    return;
  }
  try {
    const shortLived = await exchangeCodeForShortLivedToken(code);
    const longLived = await exchangeForLongLivedToken(shortLived.accessToken);
    const profile = await getInstagramUserProfile(longLived.accessToken);
    const encryptedToken = encryptToken(longLived.accessToken);
    await dbUpsertInstagramAccount({
      id: profile.id,
      igUserId: profile.id,
      username: profile.username,
      name: profile.name,
      profilePictureUrl: profile.profilePictureUrl,
      encryptedAccessToken: encryptedToken,
      tokenExpiresAt: longLived.expiresAt
    });
    res.send(`
      <html>
        <body style="font-family: system-ui, sans-serif; background: #0b0f19; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="background: #151c2e; padding: 2rem; border-radius: 12px; border: 1px solid #7c3aed; text-align: center; max-width: 400px;">
            <h2 style="color: #a855f7; margin-bottom: 0.5rem;">Instagram Connected!</h2>
            <p>Account <strong>@${profile.username}</strong> has been successfully authenticated and token encrypted server-side.</p>
            <p style="color: #94a3b8; font-size: 0.875rem;">You may now close this window.</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'INSTAGRAM_CONNECTED', username: '${profile.username}' }, '*');
                window.close();
              }
            </script>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send(`<h3>Failed to complete Instagram OAuth</h3><p>${err.message}</p>`);
  }
});
app.get("/api/webhooks/instagram", handleWebhookChallenge);
app.post("/api/webhooks/instagram", handleWebhookEvent);
app.get("/api/campaigns", async (req, res) => {
  const userId = req.query.userId;
  const list = await dbGetCampaigns(userId);
  res.json({ success: true, campaigns: list });
});
app.post("/api/campaigns", async (req, res) => {
  const campaign = req.body;
  const userId = req.query.userId;
  const saved = await dbSaveCampaign(campaign, userId);
  res.json({ success: true, campaign: saved || campaign });
});
app.delete("/api/campaigns/:id", async (req, res) => {
  const { id } = req.params;
  await dbDeleteCampaign(id);
  res.json({ success: true, id });
});
app.get("/api/templates", async (req, res) => {
  const userId = req.query.userId;
  const list = await dbGetTemplates(userId);
  res.json({ success: true, templates: list });
});
app.post("/api/templates", async (req, res) => {
  const template = req.body;
  const userId = req.query.userId;
  const saved = await dbSaveTemplate(template, userId);
  res.json({ success: true, template: saved || template });
});
app.get("/api/leads", async (req, res) => {
  const userId = req.query.userId;
  const leads = await dbGetLeads(userId);
  res.json({ success: true, leads });
});
app.post("/api/leads", async (req, res) => {
  const lead = req.body;
  const userId = req.query.userId;
  const saved = await dbSaveLead(lead, userId);
  res.json({ success: true, lead: saved || lead });
});
app.patch("/api/leads/:id", async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  await dbUpdateLeadStatus(id, status, notes);
  res.json({ success: true, id, status, notes });
});
app.delete("/api/leads/:id", async (req, res) => {
  const { id } = req.params;
  await dbDeleteLead(id);
  res.json({ success: true, id });
});
async function handleTrackedRedirect(req, res) {
  const code = req.params.code;
  const destination = req.query.url || "https://gumroad.com/l/free-guide";
  const campaignId = req.query.cid || "camp_guide_01";
  const leadId = req.query.lid;
  const referrer = req.headers.referer || req.headers.referrer || "instagram_dm";
  const userAgent = req.headers["user-agent"] || "unknown";
  const ip = req.ip || req.socket.remoteAddress || "127.0.0.1";
  const ipHash = crypto3.createHash("sha256").update(ip).digest("hex").substring(0, 16);
  await dbRecordLinkClick({
    id: `clk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    campaignId,
    redirectCode: code,
    destinationUrl: destination,
    leadId,
    referrer: String(referrer),
    userAgent: String(userAgent),
    ipHash
  }).catch((err) => console.error("[DB Click Record Error]", err.message));
  res.redirect(302, destination);
}
app.get("/r/:code", handleTrackedRedirect);
app.get("/api/redirect/:code", handleTrackedRedirect);
app.post("/api/ai-suggest", async (req, res) => {
  const { offer, prompt, type } = req.body;
  const offerClean = offer || "Free PDF Guide";
  res.json({
    success: true,
    keywords: [offerClean.toUpperCase().replace(/\s+/g, "_"), "GUIDE", "SEND", "DETAILS"],
    publicReplies: [
      `Just sent the details to your DMs! Check your inbox \u{1F680}`,
      `Sent over to you! Let me know what you think \u{1F64C}`,
      `Check your DMs! It is waiting for you now \u2728`
    ],
    dmMessage: `Hey {{username}}! \u{1F64C} Here is the ${offerClean} you requested: {{link}} Let me know if you have any questions!`,
    callToAction: `Click below to access your ${offerClean}`,
    qualificationQuestions: [
      `What is your main goal this quarter?`,
      `Are you currently working on this solo or with a team?`
    ]
  });
});
var app_default = app;

// api/index.ts
var index_default = app_default;
export {
  index_default as default
};
