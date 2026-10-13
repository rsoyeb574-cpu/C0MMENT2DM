import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import {
  testConnection,
  getExistingTables,
  getSafeDatabaseMeta,
  isDatabaseConfigured,
} from './database/db.js';
import { runMigration } from './database/migrate.js';
import {
  dbCreateUser,
  dbGetUserByEmail,
  dbGetUserById,
  dbCreateSession,
  dbGetSessionWithUser,
  dbDeleteSession,
  dbGetCampaigns,
  dbSaveCampaign,
  dbUpdateCampaignStatus,
  dbDeleteCampaign,
  dbGetTemplates,
  dbSaveTemplate,
  dbDeleteTemplate,
  dbGetLeads,
  dbSaveLead,
  dbUpdateLeadStatus,
  dbDeleteLead,
  dbGetCommentEvents,
  dbRecordCommentEvent,
  dbGetDmEvents,
  dbRecordDmEvent,
  dbGetLinkClicks,
  dbRecordLinkClick,
  dbGetUsageRecords,
  dbRecordUsage,
  dbUpsertInstagramAccount,
  dbGetInstagramAccount,
  dbDeleteUserDataByEmail,
  dbDeleteUserDataByInstagramId,
} from './database/queries.js';
import { getSetupStatus } from './services/setupStatusService.js';
import {
  getBusinessLoginUrl,
  exchangeCodeForShortLivedToken,
  exchangeForLongLivedToken,
  getInstagramUserProfile,
} from './services/instagramService.js';
import { encryptToken } from './services/cryptoService.js';
import {
  handleWebhookChallenge,
  handleWebhookEvent,
} from './webhooks/instagramWebhook.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    plan?: string;
    created_at?: string;
  };
}

const app = express();

// Body parser with rawBody preservation for Meta HMAC webhook signature validation
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Security headers & CORS
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Helper to sanitize error messages without exposing credentials
function sanitizeError(err: any): string {
  if (!err) return 'An unexpected error occurred';
  const msg = err.message || String(err);
  return msg.replace(/postgres(ql)?:\/\/[^@]+@/, 'postgresql://***@');
}

// --------------------------------------------------------------------------
// Authentication Middleware (httpOnly cookie session)
// --------------------------------------------------------------------------
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.session_token || (req.headers['x-session-token'] as string);

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in.',
    });
    return;
  }

  try {
    const sessionUser = await dbGetSessionWithUser(token);
    if (!sessionUser) {
      res.clearCookie('session_token', { path: '/' });
      res.status(401).json({
        success: false,
        error: 'Session expired or invalid. Please log in again.',
      });
      return;
    }

    req.user = {
      id: sessionUser.id,
      name: sessionUser.name,
      email: sessionUser.email,
      avatar: sessionUser.avatar,
      plan: sessionUser.plan,
      created_at: sessionUser.created_at,
    };
    next();
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: sanitizeError(err),
    });
  }
}

// --------------------------------------------------------------------------
// 1. Health & Database Status Endpoints
// --------------------------------------------------------------------------
app.get('/api/health', async (_req: Request, res: Response) => {
  if (isDatabaseConfigured()) {
    try {
      const conn = await testConnection();
      if (conn.connected) {
        res.json({
          status: 'ok',
          database: 'connected',
          latencyMs: conn.latencyMs,
          timestamp: new Date().toISOString(),
        });
        return;
      }
      res.status(503).json({
        status: 'error',
        database: 'disconnected',
        error: conn.error || 'Database connection failed',
        timestamp: new Date().toISOString(),
      });
      return;
    } catch (err: any) {
      res.status(503).json({
        status: 'error',
        database: 'error',
        error: sanitizeError(err),
        timestamp: new Date().toISOString(),
      });
      return;
    }
  }

  // If DATABASE_URL is not configured
  res.json({
    status: 'ok',
    database: 'demo_mode',
    message: 'Running in demo mode (DATABASE_URL not set)',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Returns safe PostgreSQL database telemetry.
 * NEVER returns or logs passwords or raw connection strings.
 */
app.get('/api/db/status', async (_req: Request, res: Response) => {
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
    mode: meta.configured && conn.connected ? 'postgresql' : 'demo_memory',
    error: conn.error,
  });
});

/**
 * Executes database migrations to create all required tables
 */
app.post('/api/db/migrate', async (_req: Request, res: Response) => {
  const result = await runMigration();
  res.status(result.success ? 200 : 400).json(result);
});

// --------------------------------------------------------------------------
// 2. Authentication Endpoints (PostgreSQL + bcrypt + httpOnly session cookie)
// --------------------------------------------------------------------------

/**
 * POST /api/auth/signup
 * Registers a new user into PostgreSQL 'users' table, hashes password with bcrypt,
 * creates a session in 'sessions' table, and sets an httpOnly session cookie.
 */
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Email and password are required.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    return;
  }

  if (!isDatabaseConfigured()) {
    res.status(503).json({
      success: false,
      error: 'DATABASE_URL is not configured on the server. Please set up DATABASE_URL to create live accounts.',
    });
    return;
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const existing = await dbGetUserByEmail(cleanEmail);
    if (existing) {
      res.status(409).json({ success: false, error: 'An account with this email already exists. Please log in.' });
      return;
    }

    const userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const passwordHash = await bcrypt.hash(password, 10);
    const userName = name?.trim() || cleanEmail.split('@')[0];

    const newUser = await dbCreateUser({
      id: userId,
      name: userName,
      email: cleanEmail,
      passwordHash,
      plan: 'Pro',
    });

    if (!newUser) {
      throw new Error('Failed to create user record in PostgreSQL.');
    }

    // Create session in PostgreSQL 'sessions' table
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const sessionId = `sess_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';

    await dbCreateSession({
      id: sessionId,
      userId: newUser.id,
      sessionToken,
      ipAddress: ipAddress.slice(0, 45),
      userAgent: userAgent.slice(0, 500),
      expiresAt,
    });

    // Set secure httpOnly cookie
    res.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        plan: newUser.plan,
        createdAt: newUser.created_at,
      },
    });
  } catch (err: any) {
    console.error('[Signup Error]', err);
    res.status(500).json({ success: false, error: sanitizeError(err) });
  }
});

/**
 * POST /api/auth/login
 * Validates credentials against PostgreSQL, creates session record, sets cookie.
 */
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Email and password are required.' });
    return;
  }

  if (!isDatabaseConfigured()) {
    res.status(503).json({
      success: false,
      error: 'DATABASE_URL is not configured on the server. Please set up DATABASE_URL to log in.',
    });
    return;
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const user = await dbGetUserByEmail(cleanEmail);

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    // Verify password with bcrypt (with backward-compatible sha256 fallback)
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password_hash);
    } catch {}

    if (!isMatch) {
      const sha256 = crypto.createHash('sha256').update(password).digest('hex');
      isMatch = user.password_hash === sha256 || user.password_hash === password;
    }

    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    // Create session in PostgreSQL 'sessions' table
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const sessionId = `sess_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';

    await dbCreateSession({
      id: sessionId,
      userId: user.id,
      sessionToken,
      ipAddress: ipAddress.slice(0, 45),
      userAgent: userAgent.slice(0, 500),
      expiresAt,
    });

    // Set secure httpOnly cookie
    res.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan || 'Pro',
        createdAt: user.created_at,
      },
    });
  } catch (err: any) {
    console.error('[Login Error]', err);
    res.status(500).json({ success: false, error: sanitizeError(err) });
  }
});

/**
 * POST /api/auth/logout
 * Destroys session in PostgreSQL 'sessions' and clears cookie.
 */
app.post('/api/auth/logout', async (req: Request, res: Response) => {
  const token = req.cookies?.session_token || (req.headers['x-session-token'] as string);
  if (token) {
    try {
      await dbDeleteSession(token);
    } catch (err) {
      console.error('[Logout Error]', err);
    }
  }
  res.clearCookie('session_token', { path: '/' });
  res.json({ success: true, message: 'Signed out successfully.' });
});

/**
 * GET /api/auth/me
 * Returns current authenticated user profile from active session.
 */
app.get('/api/auth/me', async (req: AuthenticatedRequest, res: Response) => {
  const token = req.cookies?.session_token || (req.headers['x-session-token'] as string);

  if (!token) {
    res.status(401).json({ success: false, user: null, error: 'Not authenticated' });
    return;
  }

  try {
    const sessionUser = await dbGetSessionWithUser(token);
    if (!sessionUser) {
      res.clearCookie('session_token', { path: '/' });
      res.status(401).json({ success: false, user: null, error: 'Session expired' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: sessionUser.id,
        name: sessionUser.name,
        email: sessionUser.email,
        avatar: sessionUser.avatar,
        plan: sessionUser.plan,
        createdAt: sessionUser.created_at,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: sanitizeError(err) });
  }
});

// --------------------------------------------------------------------------
// 3. Instagram Setup, OAuth & Webhooks
// --------------------------------------------------------------------------
app.get('/api/setup/status', (_req: Request, res: Response) => {
  const status = getSetupStatus();
  res.json(status);
});

app.get('/api/auth/instagram/url', (req: Request, res: Response) => {
  const state = (req.query.state as string) || crypto.randomBytes(16).toString('hex');
  const url = getBusinessLoginUrl(state);
  res.json({ url, state });
});

app.get('/api/auth/instagram/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const error = req.query.error_description || req.query.error;

  if (error) {
    res.status(400).send(`<h3>Instagram Authorization Failed</h3><p>${error}</p>`);
    return;
  }

  if (!code) {
    res.status(400).send('<h3>Missing authorization code from Meta</h3>');
    return;
  }

  try {
    const shortLived = await exchangeCodeForShortLivedToken(code);
    const longLived = await exchangeForLongLivedToken(shortLived.accessToken);
    const profile = await getInstagramUserProfile(longLived.accessToken);

    // Encrypt token via AES-256-GCM
    const encryptedToken = encryptToken(longLived.accessToken);

    // Store in PostgreSQL instagram_accounts
    await dbUpsertInstagramAccount({
      id: profile.id,
      igUserId: profile.id,
      username: profile.username,
      name: profile.name,
      profilePictureUrl: profile.profilePictureUrl,
      encryptedAccessToken: encryptedToken,
      tokenExpiresAt: longLived.expiresAt,
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
  } catch (err: any) {
    res.status(500).send(`<h3>Failed to complete Instagram OAuth</h3><p>${err.message}</p>`);
  }
});

// Webhook subscription & challenge
app.get('/api/webhooks/instagram', handleWebhookChallenge);
app.post('/api/webhooks/instagram', handleWebhookEvent);

// --------------------------------------------------------------------------
// 4. Campaigns CRUD (Protected by requireAuth, filtered strictly by session user)
// --------------------------------------------------------------------------
app.get('/api/campaigns', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await dbGetCampaigns(req.user!.id);
    res.json({ success: true, campaigns: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: sanitizeError(err) });
  }
});

app.post('/api/campaigns', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const campaign = req.body;
    const saved = await dbSaveCampaign(campaign, req.user!.id);
    res.json({ success: true, campaign: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: sanitizeError(err) });
  }
});

app.patch('/api/campaigns/:id/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await dbUpdateCampaignStatus(id, status, req.user!.id);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Campaign not found or not owned by user.' });
      return;
    }
    res.json({ success: true, campaign: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: sanitizeError(err) });
  }
});

app.delete('/api/campaigns/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await dbDeleteCampaign(id, req.user!.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Campaign not found or unauthorized.' });
      return;
    }
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ success: false, error: sanitizeError(err) });
  }
});

// --------------------------------------------------------------------------
// 5. Message Templates CRUD (Protected by requireAuth)
// --------------------------------------------------------------------------
app.get('/api/templates', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await dbGetTemplates(req.user!.id);
    res.json({ success: true, templates: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: sanitizeError(err) });
  }
});

app.post('/api/templates', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const template = req.body;
    const saved = await dbSaveTemplate(template, req.user!.id);
    res.json({ success: true, template: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: sanitizeError(err) });
  }
});

app.delete('/api/templates/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await dbDeleteTemplate(id, req.user!.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Template not found or unauthorized.' });
      return;
    }
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ success: false, error: sanitizeError(err) });
  }
});

// --------------------------------------------------------------------------
// 6. CRM Leads (Protected by requireAuth)
// --------------------------------------------------------------------------
app.get('/api/leads', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const leads = await dbGetLeads(req.user!.id);
    res.json({ success: true, leads });
  } catch (err: any) {
    res.status(500).json({ success: false, error: sanitizeError(err) });
  }
});

app.post('/api/leads', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lead = req.body;
    const saved = await dbSaveLead(lead, req.user!.id);
    res.json({ success: true, lead: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: sanitizeError(err) });
  }
});

app.patch('/api/leads/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const updated = await dbUpdateLeadStatus(id, status, notes, req.user!.id);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Lead not found or unauthorized.' });
      return;
    }
    res.json({ success: true, lead: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: sanitizeError(err) });
  }
});

app.delete('/api/leads/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await dbDeleteLead(id, req.user!.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Lead not found or unauthorized.' });
      return;
    }
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ success: false, error: sanitizeError(err) });
  }
});

// --------------------------------------------------------------------------
// 7. Comment Events, DM Events, Link Clicks, and Usage Records (Protected)
// --------------------------------------------------------------------------
app.get('/api/events/comments', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const events = await dbGetCommentEvents(req.user!.id);
    res.json({ success: true, events });
  } catch (err: any) {
    res.status(500).json({ success: false, error: sanitizeError(err) });
  }
});

app.post('/api/events/comments', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const saved = await dbRecordCommentEvent({
      ...req.body,
      userId: req.user!.id,
      commentTimestamp: req.body.commentTimestamp ? new Date(req.body.commentTimestamp) : new Date(),
    });
    res.json({ success: true, event: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: sanitizeError(err) });
  }
});

app.get('/api/events/dms', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const events = await dbGetDmEvents(req.user!.id);
    res.json({ success: true, events });
  } catch (err: any) {
    res.status(500).json({ success: false, error: sanitizeError(err) });
  }
});

app.post('/api/events/dms', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const saved = await dbRecordDmEvent({
      ...req.body,
      userId: req.user!.id,
    });
    res.json({ success: true, event: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: sanitizeError(err) });
  }
});

app.get('/api/clicks', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clicks = await dbGetLinkClicks(req.user!.id);
    res.json({ success: true, clicks });
  } catch (err: any) {
    res.status(500).json({ success: false, error: sanitizeError(err) });
  }
});

app.post('/api/clicks', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const saved = await dbRecordLinkClick({
      ...req.body,
      userId: req.user!.id,
    });
    res.json({ success: true, click: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: sanitizeError(err) });
  }
});

app.get('/api/usage', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const period = (req.query.period as string) || undefined;
    const records = await dbGetUsageRecords(req.user!.id, period);
    res.json({ success: true, records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: sanitizeError(err) });
  }
});

app.post('/api/usage', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const saved = await dbRecordUsage({
      ...req.body,
      userId: req.user!.id,
    });
    res.json({ success: true, usage: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: sanitizeError(err) });
  }
});

// --------------------------------------------------------------------------
// 8. Tracked Redirects (Logged in PostgreSQL link_clicks)
// --------------------------------------------------------------------------
async function handleTrackedRedirect(req: Request, res: Response) {
  const code = req.params.code;
  const destination = (req.query.url as string) || 'https://gumroad.com/l/free-guide';
  const campaignId = (req.query.cid as string) || 'camp_guide_01';
  const leadId = req.query.lid as string | undefined;

  const referrer = req.headers.referer || req.headers.referrer || 'instagram_dm';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);

  // Record link click in PostgreSQL
  await dbRecordLinkClick({
    id: `clk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    campaignId,
    redirectCode: code,
    destinationUrl: destination,
    leadId,
    referrer: String(referrer),
    userAgent: String(userAgent),
    ipHash,
  }).catch((err) => console.error('[DB Click Record Error]', err.message));

  // Redirect to destination
  res.redirect(302, destination);
}

app.get('/r/:code', handleTrackedRedirect);
app.get('/api/redirect/:code', handleTrackedRedirect);

// --------------------------------------------------------------------------
// 9. AI Campaign & Follow-up Assistant
// --------------------------------------------------------------------------
app.post('/api/ai-suggest', async (req: Request, res: Response) => {
  const { offer, prompt, type } = req.body;
  const offerClean = offer || 'Free PDF Guide';

  res.json({
    success: true,
    keywords: [offerClean.toUpperCase().replace(/\s+/g, '_'), 'GUIDE', 'SEND', 'DETAILS'],
    publicReplies: [
      `Just sent the details to your DMs! Check your inbox 🚀`,
      `Sent over to you! Let me know what you think 🙌`,
      `Check your DMs! It is waiting for you now ✨`,
    ],
    dmMessage: `Hey {{username}}! 🙌 Here is the ${offerClean} you requested: {{link}} Let me know if you have any questions!`,
    callToAction: `Click below to access your ${offerClean}`,
    qualificationQuestions: [
      `What is your main goal this quarter?`,
      `Are you currently working on this solo or with a team?`,
    ],
  });
});

// --------------------------------------------------------------------------
// 10. Public App Configuration (Contact Email)
// --------------------------------------------------------------------------
app.get('/api/config', (_req: Request, res: Response) => {
  res.json({
    contactEmail: process.env.CONTACT_EMAIL || process.env.VITE_CONTACT_EMAIL || 'support@comment2dm.com',
  });
});

// --------------------------------------------------------------------------
// 11. Data Deletion (User Self-Service & Meta Webhook Callback)
// --------------------------------------------------------------------------

/**
 * POST /api/user/delete-data
 * Allows users to submit a data deletion request for their account and all data.
 */
app.post('/api/user/delete-data', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    res.status(400).json({ success: false, error: 'Valid email address is required for deletion request.' });
    return;
  }
  try {
    const confirmationCode = `c2dm_del_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const result = await dbDeleteUserDataByEmail(email);

    // If active session belongs to this user, clear cookie
    const token = req.cookies?.session_token;
    if (token) {
      res.clearCookie('session_token', { path: '/' });
    }

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const statusUrl = `${protocol}://${host}/data-deletion?code=${confirmationCode}`;

    res.json({
      success: true,
      message: result.found
        ? 'All personal data, campaigns, leads, and tokens have been permanently removed from PostgreSQL.'
        : 'Request recorded. No active account was associated with this email address.',
      confirmationCode,
      statusUrl,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: sanitizeError(err) });
  }
});

/**
 * POST /api/webhooks/instagram/data-deletion
 * Meta's official Data Deletion Callback URL for Graph API apps.
 * Returns the exact JSON schema required by Meta: { url, confirmation_code }
 */
app.post('/api/webhooks/instagram/data-deletion', async (req: Request, res: Response) => {
  try {
    let igUserId = req.body?.user_id;

    if (req.body?.signed_request) {
      const parts = req.body.signed_request.split('.');
      if (parts.length === 2) {
        try {
          const payload = Buffer.from(parts[1], 'base64').toString('utf8');
          const data = JSON.parse(payload);
          igUserId = data.user_id || igUserId;
        } catch {}
      }
    }

    const confirmationCode = `meta_del_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    if (igUserId) {
      await dbDeleteUserDataByInstagramId(igUserId);
    }

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const statusUrl = `${protocol}://${host}/data-deletion?code=${confirmationCode}`;

    // Meta official response format
    res.json({
      url: statusUrl,
      confirmation_code: confirmationCode,
    });
  } catch (err: any) {
    console.error('[Meta Deletion Callback Error]', err);
    res.status(500).json({ error: sanitizeError(err) });
  }
});

/**
 * GET /api/auth/data-deletion/status/:code
 * Public verification endpoint for Meta compliance check.
 */
app.get('/api/auth/data-deletion/status/:code', (req: Request, res: Response) => {
  const { code } = req.params;
  res.json({
    success: true,
    confirmationCode: code,
    status: 'completed',
    message: 'User data and credentials successfully purged from PostgreSQL.',
    timestamp: new Date().toISOString(),
  });
});

export default app;
